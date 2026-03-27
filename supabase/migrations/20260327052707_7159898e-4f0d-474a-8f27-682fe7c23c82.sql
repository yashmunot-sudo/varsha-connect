
CREATE TABLE public.shift_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supervisor_id UUID NOT NULL REFERENCES public.employees(id),
  shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift_type TEXT NOT NULL DEFAULT 'general',
  observations TEXT,
  issues_reported TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shift_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supervisors insert own reports"
ON public.shift_reports FOR INSERT TO authenticated
WITH CHECK (supervisor_id = get_my_employee_id());

CREATE POLICY "Read shift reports"
ON public.shift_reports FOR SELECT TO authenticated
USING (
  supervisor_id = get_my_employee_id()
  OR get_my_role() IN ('hr_admin', 'owner', 'plant_head', 'manager')
);
