import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'



const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }



serve(async (req) => {

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })



  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)



  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()



  const { data: overdueLeaves } = await supabase

    .from('leave_requests')

    .select('id, current_approver_id, employee_id, leave_type, from_date, to_date')

    .eq('status', 'Pending')

    .lte('applied_at', cutoff)



  let escalated = 0



  for (const leave of (overdueLeaves || [])) {

    if (!leave.current_approver_id) continue



    const { data: currentApprover } = await supabase

      .from('employees')

      .select('reporting_manager_emp_code, role')

      .eq('id', leave.current_approver_id)

      .maybeSingle()



    if (!currentApprover) continue



    let nextApproverId = null



    if (currentApprover.role === 'manager') {

      const { data: ph } = await supabase.from('employees').select('id').eq('role', 'plant_head').limit(1).maybeSingle()

      nextApproverId = ph?.id || null

    } else if (currentApprover.reporting_manager_emp_code) {

      const { data: next } = await supabase.from('employees').select('id').eq('emp_code', currentApprover.reporting_manager_emp_code).maybeSingle()

      nextApproverId = next?.id || null

    }



    if (!nextApproverId) continue



    await supabase.from('leave_requests').update({ current_approver_id: nextApproverId }).eq('id', leave.id)

    await supabase.from('notifications').insert({

      employee_id: nextApproverId,

      title: 'Leave Request Escalated',

      body: `A ${leave.leave_type} leave request from ${leave.from_date} to ${leave.to_date} has been auto-escalated to you after 48 hours.`,

      type: 'leave_escalation'

    })



    escalated++

  }



  return new Response(JSON.stringify({ success: true, escalated }), {

    headers: { ...corsHeaders, 'Content-Type': 'application/json' }

  })

})