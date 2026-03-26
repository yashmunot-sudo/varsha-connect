
-- maintenance_observations table
CREATE TABLE public.maintenance_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  machine_area TEXT NOT NULL,
  observation_text TEXT NOT NULL,
  reason_text TEXT NOT NULL,
  photo_url TEXT,
  urgency TEXT NOT NULL DEFAULT 'Can wait',
  status TEXT NOT NULL DEFAULT 'Reported',
  points_awarded INTEGER NOT NULL DEFAULT 15,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_by UUID REFERENCES public.employees(id),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.maintenance_observations ENABLE ROW LEVEL SECURITY;

-- Workers can insert their own observations
CREATE POLICY "Workers insert own observations"
  ON public.maintenance_observations FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = public.get_my_employee_id());

-- Workers read own, management reads all
CREATE POLICY "Read observations"
  ON public.maintenance_observations FOR SELECT
  TO authenticated
  USING (
    employee_id = public.get_my_employee_id()
    OR public.get_my_role() IN ('supervisor', 'manager', 'hr_admin', 'owner')
  );

-- HR/Manager can update observations (status changes)
CREATE POLICY "Management update observations"
  ON public.maintenance_observations FOR UPDATE
  TO authenticated
  USING (public.get_my_role() IN ('hr_admin', 'manager', 'owner'));

-- Storage bucket for maintenance photos
INSERT INTO storage.buckets (id, name, public) VALUES ('maintenance-photos', 'maintenance-photos', true);

-- Allow authenticated users to upload to maintenance-photos
CREATE POLICY "Authenticated upload maintenance photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'maintenance-photos');

-- Allow public read of maintenance photos
CREATE POLICY "Public read maintenance photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'maintenance-photos');
