CREATE POLICY "Supervisor updates checkpoints"
ON public.attendance_checkpoints
FOR UPDATE
TO authenticated
USING (
  get_my_role() = ANY (ARRAY['supervisor'::app_role, 'manager'::app_role, 'hr_admin'::app_role, 'owner'::app_role, 'plant_head'::app_role, 'security_guard'::app_role])
);