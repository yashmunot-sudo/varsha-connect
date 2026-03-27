
DROP POLICY IF EXISTS "Authenticated insert shift reports" ON public.shift_reports;
DROP POLICY IF EXISTS "Authenticated read shift reports" ON public.shift_reports;
DROP POLICY IF EXISTS "Read shift reports" ON public.shift_reports;
DROP POLICY IF EXISTS "Supervisors insert own reports" ON public.shift_reports;

CREATE POLICY "shift_reports_insert" ON public.shift_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "shift_reports_select" ON public.shift_reports FOR SELECT TO anon, authenticated USING (true);
