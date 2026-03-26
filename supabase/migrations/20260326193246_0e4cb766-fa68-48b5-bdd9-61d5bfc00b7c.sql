
-- Create leave_requests table
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('EL', 'CL', 'SL')),
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.employees(id),
  reviewed_at TIMESTAMPTZ
);

-- Create advance_requests table
CREATE TABLE public.advance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  amount_requested INTEGER NOT NULL,
  reason TEXT,
  repayment_months INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.employees(id),
  reviewed_at TIMESTAMPTZ
);

-- Create salary_advances table
CREATE TABLE public.salary_advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  opening_balance INTEGER NOT NULL DEFAULT 0,
  amount_sanctioned INTEGER NOT NULL DEFAULT 0,
  amount_deducted INTEGER NOT NULL DEFAULT 0,
  closing_balance INTEGER NOT NULL DEFAULT 0,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  entered_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_advances ENABLE ROW LEVEL SECURITY;

-- leave_requests RLS: workers insert own, managers/hr can read all and update
CREATE POLICY "Workers insert own leave requests" ON public.leave_requests FOR INSERT TO authenticated WITH CHECK (employee_id = get_my_employee_id());
CREATE POLICY "Read own or management reads all leave requests" ON public.leave_requests FOR SELECT TO authenticated USING (employee_id = get_my_employee_id() OR get_my_role() IN ('manager', 'hr_admin', 'owner'));
CREATE POLICY "Manager/HR can update leave requests" ON public.leave_requests FOR UPDATE TO authenticated USING (get_my_role() IN ('manager', 'hr_admin', 'owner'));

-- advance_requests RLS: workers insert own, managers/hr can read all and update
CREATE POLICY "Workers insert own advance requests" ON public.advance_requests FOR INSERT TO authenticated WITH CHECK (employee_id = get_my_employee_id());
CREATE POLICY "Read own or management reads all advance requests" ON public.advance_requests FOR SELECT TO authenticated USING (employee_id = get_my_employee_id() OR get_my_role() IN ('manager', 'hr_admin', 'owner'));
CREATE POLICY "Manager/HR can update advance requests" ON public.advance_requests FOR UPDATE TO authenticated USING (get_my_role() IN ('manager', 'hr_admin', 'owner'));

-- salary_advances RLS: workers read own, HR manages all
CREATE POLICY "Read own salary advances" ON public.salary_advances FOR SELECT TO authenticated USING (employee_id = get_my_employee_id() OR get_my_role() IN ('hr_admin', 'owner'));
CREATE POLICY "HR can manage salary advances" ON public.salary_advances FOR ALL TO authenticated USING (get_my_role() = 'hr_admin');
