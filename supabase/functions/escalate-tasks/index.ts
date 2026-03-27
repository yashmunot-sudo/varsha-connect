import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'



const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }



serve(async (req) => {

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const today = new Date().toISOString().split('T')[0]

  const { data: unacknowledged } = await supabase.from('tasks').select('id, title, assigned_by, assigned_to').eq('status', 'Assigned').lte('created_at', cutoff24h)

  for (const task of (unacknowledged || [])) {

    if (task.assigned_by) {

      await supabase.from('notifications').insert({ employee_id: task.assigned_by, title: 'Task Not Acknowledged', body: task.title + ' has not been acknowledged after 24 hours.', type: 'task_escalation' })

    }

  }

  const { data: overdueTasks } = await supabase.from('tasks').select('id, title, assigned_by, assigned_to, escalation_level').not('status', 'eq', 'Done').not('status', 'eq', 'Cancelled').lt('due_date', today)

  const { data: plantHead } = await supabase.from('employees').select('id').eq('role', 'plant_head').limit(1).maybeSingle()

  const { data: owner } = await supabase.from('employees').select('id').eq('emp_code', 'VFL1001').maybeSingle()

  for (const task of (overdueTasks || [])) {

    const newLevel = (task.escalation_level || 0) + 1

    await supabase.from('tasks').update({ escalation_level: newLevel }).eq('id', task.id)

    if (task.assigned_by) { await supabase.from('notifications').insert({ employee_id: task.assigned_by, title: 'Task Overdue', body: task.title + ' is past its due date. Escalation level: ' + newLevel, type: 'task_overdue' }) }

    if (newLevel >= 3) {

      if (plantHead) await supabase.from('notifications').insert({ employee_id: plantHead.id, title: 'Critical Task Overdue', body: task.title + ' escalation level ' + newLevel + '. Immediate attention needed.', type: 'task_critical' })

      if (owner) await supabase.from('notifications').insert({ employee_id: owner.id, title: 'Critical Task Overdue', body: task.title + ' escalation level ' + newLevel + '. Immediate attention needed.', type: 'task_critical' })

    }

  }

  return new Response(JSON.stringify({ success: true, unacknowledged: unacknowledged?.length, overdue: overdueTasks?.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

})
