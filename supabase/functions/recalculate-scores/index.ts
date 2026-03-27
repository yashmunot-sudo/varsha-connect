import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  // Working days (exclude Sundays)
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (new Date(year, month - 1, d).getDay() !== 0) workingDays++;
  }

  const { data: employees } = await supabase.from("employees").select("id, role, department").eq("is_active", true);

  if (!employees) return new Response(JSON.stringify({ error: "No employees" }), { status: 500 });

  const scores: Record<string, any> = {};

  for (const emp of employees) {
    const { data: att } = await supabase
      .from("attendance")
      .select("status, overtime_hours")
      .eq("employee_id", emp.id)
      .gte("attendance_date", startDate)
      .lte("attendance_date", endDate);

    const present = att?.filter((a) => a.status === "P").length || 0;
    const late = att?.filter((a) => a.status === "LC").length || 0;
    const ot = att?.filter((a) => a.status === "OT").length || 0;
    const effective = present + ot + late * 0.5;
    let attScore = workingDays > 0 ? (effective / workingDays) * 100 : 0;
    if (present + ot >= workingDays && late === 0) attScore = Math.min(attScore + 50, 150);

    const { count: obsCount } = await supabase
      .from("maintenance_observations")
      .select("*", { count: "exact", head: true })
      .eq("employee_id", emp.id)
      .not("acknowledged_at", "is", null)
      .gte("submitted_at", startDate + "T00:00:00")
      .lte("submitted_at", endDate + "T23:59:59");
    const obsScore = Math.min((obsCount || 0) * 15, 45);

    const { count: checklistCount } = await supabase
      .from("daily_checklist_log")
      .select("*", { count: "exact", head: true })
      .eq("employee_id", emp.id)
      .gte("date", startDate)
      .lte("date", endDate);
    const perfScore = Math.min(60 + (checklistCount || 0) * 5, 100);

    const composite = attScore * 0.4 + perfScore * 0.4 + obsScore * 0.2;
    scores[emp.id] = {
      attendance: Math.round(attScore),
      performance: Math.round(perfScore),
      observation: Math.round(obsScore),
      composite: Math.round(composite),
      role: emp.role,
      department: emp.department,
    };
  }

  // Supervisor: own * 0.60 + team avg * 0.40
  for (const emp of employees.filter((e) => e.role === "supervisor")) {
    const teamWorkers = employees.filter((e) => e.role === "worker" && e.department === emp.department);
    const teamAvg =
      teamWorkers.length > 0
        ? teamWorkers.reduce((s, w) => s + (scores[w.id]?.composite || 0), 0) / teamWorkers.length
        : 0;
    scores[emp.id].composite = Math.round((scores[emp.id].composite || 0) * 0.6 + teamAvg * 0.4);
  }

  // Manager: own * 0.50 + sup avg * 0.30 + worker avg * 0.20
  for (const emp of employees.filter((e) => e.role === "manager")) {
    const sups = employees.filter((e) => e.role === "supervisor" && e.department === emp.department);
    const workers = employees.filter((e) => e.role === "worker" && e.department === emp.department);
    const supAvg = sups.length > 0 ? sups.reduce((s, e) => s + (scores[e.id]?.composite || 0), 0) / sups.length : 0;
    const wrkAvg =
      workers.length > 0 ? workers.reduce((s, e) => s + (scores[e.id]?.composite || 0), 0) / workers.length : 0;
    scores[emp.id].composite = Math.round((scores[emp.id].composite || 0) * 0.5 + supAvg * 0.3 + wrkAvg * 0.2);
  }

  // Rank and upsert
  const ranked = Object.entries(scores).sort((a, b) => b[1].composite - a[1].composite);

  for (let i = 0; i < ranked.length; i++) {
    const [empId, s] = ranked[i];
    await supabase.from("monthly_scores").upsert(
      {
        employee_id: empId,
        month,
        year,
        attendance_score: s.attendance,
        performance_score: s.performance,
        observation_score: s.observation,
        composite_score: s.composite,
        eotm_rank: i + 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "employee_id,month,year" },
    );
  }

  return new Response(JSON.stringify({ success: true, processed: ranked.length, month, year }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
