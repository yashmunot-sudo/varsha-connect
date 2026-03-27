
DROP POLICY IF EXISTS "Read shift reports" ON public.shift_reports;
DROP POLICY IF EXISTS "Supervisors insert own reports" ON public.shift_reports;

CREATE POLICY "Authenticated insert shift reports"
  ON public.shift_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated read shift reports"
  ON public.shift_reports FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);
