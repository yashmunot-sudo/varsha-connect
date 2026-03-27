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

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name, emp_code, reporting_manager_emp_code, role")
    .eq("is_active", true);

  let warningsIssued = 0;

  for (const emp of employees || []) {
    const { count } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("employee_id", emp.id)
      .eq("status", "LC")
      .gte("attendance_date", startDate)
      .lte("attendance_date", endDate);

    const lcCount = count || 0;
    if (lcCount < 4) continue;

    const warningNum = lcCount >= 5 ? 5 : 4;
    const { data: existing } = await supabase
      .from("attendance_warnings")
      .select("id")
      .eq("employee_id", emp.id)
      .eq("warning_number", warningNum)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();

    if (existing) continue;

    let managerId = null;
    if (emp.reporting_manager_emp_code) {
      const { data: mgr } = await supabase
        .from("employees")
        .select("id")
        .eq("emp_code", emp.reporting_manager_emp_code)
        .maybeSingle();
      managerId = mgr?.id || null;
    }

    const requiresOwner = ["manager", "hr_admin", "plant_head", "owner"].includes(emp.role);

    await supabase.from("attendance_warnings").insert({
      employee_id: emp.id,
      warning_number: warningNum,
      warning_type: warningNum === 5 ? "Final Warning" : "Late",
      reason: `${lcCount} late check-ins this month`,
      issued_by: managerId,
      auto_generated: true,
      requires_owner_approval: requiresOwner,
      month,
      year,
    });

    warningsIssued++;

    if (managerId) {
      await supabase.from("notifications").insert({
        employee_id: managerId,
        title: warningNum === 5 ? "Final Warning — Action Required" : "Attendance Warning",
        body: `${emp.name} (${emp.emp_code}) — ${lcCount} late check-ins this month. Tap to confirm warning.`,
        type: "attendance_warning",
      });
    }

    if (warningNum === 5) {
      const { data: hrAdmins } = await supabase.from("employees").select("id").eq("role", "hr_admin");
      for (const hr of hrAdmins || []) {
        await supabase.from("notifications").insert({
          employee_id: hr.id,
          title: "Final Warning Issued",
          body: `${emp.name} (${emp.emp_code}) — 5th late check-in. Immediate action required.`,
          type: "attendance_warning_final",
        });
      }
    }
  }

  return new Response(JSON.stringify({ success: true, warningsIssued }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
