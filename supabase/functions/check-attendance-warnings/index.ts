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

    // Get all active employees
    const { data: employees } = await supabase.from('employees').select('id, name, emp_code, reporting_manager_emp_code')
      .eq('is_active', true)

    if (!employees) throw new Error('No employees')

    let warningsIssued = 0

    for (const emp of employees) {
      // Count LC this month
      const { count } = await supabase.from('attendance').select('*', { count: 'exact', head: true })
        .eq('employee_id', emp.id).eq('status', 'LC')
        .gte('attendance_date', startDate).lte('attendance_date', endDate)

      const lcCount = count || 0

      if (lcCount >= 4) {
        // Check if warning already issued this month
        const { data: existingWarning } = await supabase.from('attendance_warnings').select('id')
          .eq('employee_id', emp.id)
          .eq('warning_number', lcCount >= 5 ? 5 : 4)
          .gte('issued_at', startDate)
          .maybeSingle()

        if (existingWarning) continue

        const warningNumber = lcCount >= 5 ? 5 : 4
        const warningType = warningNumber === 5 ? 'Final Warning' : 'Late'

        // Get reporting manager id
        let managerId: string | null = null
        if (emp.reporting_manager_emp_code) {
          const { data: mgr } = await supabase.from('employees').select('id')
            .eq('emp_code', emp.reporting_manager_emp_code).maybeSingle()
          managerId = mgr?.id || null
        }

        // Insert warning
        const { error } = await supabase.from('attendance_warnings').insert({
          employee_id: emp.id,
          warning_number: warningNumber,
          warning_type: warningType,
          reason: `${lcCount} late check-ins this month`,
          issued_by: managerId,
        })

        if (!error) {
          warningsIssued++

          // Notify reporting manager
          if (managerId) {
            await supabase.from('notifications').insert({
              employee_id: managerId,
              title: warningNumber === 5 ? 'Final Warning Issued' : 'Attendance Warning',
              body: `${emp.name} (${emp.emp_code}) has ${lcCount} late check-ins. Please confirm warning.`,
              type: 'attendance_warning',
            })
          }

          // For final warning, also notify HR admin
          if (warningNumber === 5) {
            const { data: hrAdmins } = await supabase.from('employees').select('id')
              .eq('role', 'hr_admin' as any)
            for (const hr of (hrAdmins || [])) {
              await supabase.from('notifications').insert({
                employee_id: hr.id,
                title: 'Final Attendance Warning',
                body: `${emp.name} (${emp.emp_code}) — 5th LC this month. Requires immediate action.`,
                type: 'attendance_warning_final',
              })
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, warningsIssued }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
