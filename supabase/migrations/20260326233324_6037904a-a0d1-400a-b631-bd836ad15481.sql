
-- Fix: drop existing conflicting policies and recreate cleanly
DROP POLICY IF EXISTS "Create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Read own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Update tasks" ON public.tasks;

CREATE POLICY "Read own tasks" ON public.tasks FOR SELECT TO authenticated
  USING (assigned_to = get_my_employee_id() OR created_by = get_my_employee_id()
    OR get_my_role() IN ('hr_admin', 'owner', 'plant_head'));

CREATE POLICY "Create tasks" ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('manager', 'hr_admin', 'owner', 'plant_head', 'supervisor'));

CREATE POLICY "Update tasks" ON public.tasks FOR UPDATE TO authenticated
  USING (assigned_to = get_my_employee_id() OR created_by = get_my_employee_id()
    OR get_my_role() IN ('hr_admin', 'owner', 'plant_head'));
