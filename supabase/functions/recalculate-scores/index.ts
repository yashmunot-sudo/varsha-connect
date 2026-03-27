import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    // Get working days (exclude Sundays)
    const daysInMonth = new Date(year, month, 0).getDate()
    let workingDays = 0
    for (let d = 1; d <= daysInMonth; d++) {
      if (new Date(year, month - 1, d).getDay() !== 0) workingDays++
    }

    // Get all active employees
    const { data: employees } = await supabase.from('employees').select('id, role, department').eq('is_active', true)
    if (!employees) throw new Error('No employees found')

    const scores: Record<string, { attendance: number; performance: number; observation: number; composite: number }> = {}

    for (const emp of employees) {
      // Attendance score
      const { data: attendance } = await supabase.from('attendance').select('status, late_minutes')
        .eq('employee_id', emp.id).gte('attendance_date', startDate).lte('attendance_date', endDate)

      const present = attendance?.filter(a => a.status === 'P').length || 0
      const late = attendance?.filter(a => a.status === 'LC').length || 0
      const ot = attendance?.filter(a => a.status === 'OT').length || 0
      const effectivePresent = present + ot + (late * 0.5)
      let attScore = workingDays > 0 ? (effectivePresent / workingDays) * 100 : 0

      // Perfect month bonus
      if (present + ot >= workingDays && late === 0) attScore = Math.min(attScore + 50, 150)

      // Observation score
      const { data: observations } = await supabase.from('maintenance_observations').select('id')
        .eq('employee_id', emp.id)
        .gte('submitted_at', startDate)
        .lte('submitted_at', endDate + 'T23:59:59')
      const obsScore = Math.min((observations?.length || 0) * 15, 45)

      // Performance score (start at 60, +5 per completed checklist)
      const { data: checklists } = await supabase.from('daily_checklist_log').select('id')
        .eq('employee_id', emp.id)
        .gte('date', startDate).lte('date', endDate)
      const perfScore = 60 + (checklists?.length || 0) * 5

      // Composite based on role
      let composite = 0
      if (emp.role === 'worker') {
        composite = (attScore * 0.40) + (perfScore * 0.40) + (obsScore * 0.20)
      } else {
        // Store raw for now, will adjust for supervisor/manager after
        composite = (attScore * 0.40) + (perfScore * 0.40) + (obsScore * 0.20)
      }

      scores[emp.id] = { attendance: Math.round(attScore), performance: Math.min(perfScore, 100), observation: obsScore, composite: Math.round(composite) }
    }

    // Supervisor composite = own * 0.6 + team avg * 0.4
    const supervisors = employees.filter(e => e.role === 'supervisor')
    for (const sup of supervisors) {
      const teamWorkers = employees.filter(e => e.role === 'worker' && e.department === sup.department)
      const teamAvg = teamWorkers.length > 0
        ? teamWorkers.reduce((s, w) => s + (scores[w.id]?.composite || 0), 0) / teamWorkers.length
        : 0
      const own = scores[sup.id]?.composite || 0
      scores[sup.id].composite = Math.round(own * 0.60 + teamAvg * 0.40)
    }

    // Manager composite = own * 0.5 + sup avg * 0.3 + worker avg * 0.2
    const managers = employees.filter(e => e.role === 'manager')
    for (const mgr of managers) {
      const deptSups = employees.filter(e => e.role === 'supervisor' && e.department === mgr.department)
      const deptWorkers = employees.filter(e => e.role === 'worker' && e.department === mgr.department)
      const supAvg = deptSups.length > 0 ? deptSups.reduce((s, e) => s + (scores[e.id]?.composite || 0), 0) / deptSups.length : 0
      const wrkAvg = deptWorkers.length > 0 ? deptWorkers.reduce((s, e) => s + (scores[e.id]?.composite || 0), 0) / deptWorkers.length : 0
      const own = scores[mgr.id]?.composite || 0
      scores[mgr.id].composite = Math.round(own * 0.50 + supAvg * 0.30 + wrkAvg * 0.20)
    }

    // Rank all by composite desc
    const ranked = Object.entries(scores).sort((a, b) => b[1].composite - a[1].composite)

    // Upsert to monthly_scores
    for (let i = 0; i < ranked.length; i++) {
      const [empId, s] = ranked[i]
      await supabase.from('monthly_scores').upsert({
        employee_id: empId,
        month,
        year,
        attendance_score: s.attendance,
        performance_score: s.performance,
        observation_score: s.observation,
        composite_score: s.composite,
        eotm_rank: i + 1,
      }, { onConflict: 'employee_id,month,year' })
    }

    return new Response(JSON.stringify({ success: true, processed: ranked.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
