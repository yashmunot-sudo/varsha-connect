
-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('worker', 'supervisor', 'manager', 'hr_admin', 'owner');

-- Enum for attendance status
CREATE TYPE public.attendance_status AS ENUM ('P', 'H', 'LC', 'EC', 'OT', 'A', 'L', 'WO', 'HO');

-- Enum for shift type
CREATE TYPE public.shift_type AS ENUM ('general', 'first', 'second', 'third', 'day', 'night');

-- Enum for employee category
CREATE TYPE public.employee_category AS ENUM ('WORKER', 'STAFF', 'CONSULTANT');

-- Employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  emp_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_hi TEXT,
  phone TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'General',
  category employee_category NOT NULL DEFAULT 'WORKER',
  role app_role NOT NULL DEFAULT 'worker',
  base_salary NUMERIC(10,2) DEFAULT 0,
  hra NUMERIC(10,2) DEFAULT 0,
  conveyance NUMERIC(10,2) DEFAULT 0,
  medical NUMERIC(10,2) DEFAULT 0,
  special_allowance NUMERIC(10,2) DEFAULT 0,
  pf_deduction NUMERIC(10,2) DEFAULT 0,
  esic_deduction NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shift assignments table
CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_type shift_type NOT NULL DEFAULT 'general',
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES public.employees(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, shift_date)
);

-- Attendance records
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift_type shift_type,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  check_in_lat DOUBLE PRECISION,
  check_in_lng DOUBLE PRECISION,
  check_out_lat DOUBLE PRECISION,
  check_out_lng DOUBLE PRECISION,
  is_inside_geofence BOOLEAN DEFAULT false,
  status attendance_status NOT NULL DEFAULT 'A',
  manual_override BOOLEAN NOT NULL DEFAULT false,
  override_by UUID REFERENCES public.employees(id),
  override_reason TEXT,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, attendance_date)
);

-- Leave balances
CREATE TABLE public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  earned_leave NUMERIC(4,1) NOT NULL DEFAULT 0,
  casual_leave NUMERIC(4,1) NOT NULL DEFAULT 0,
  sick_leave NUMERIC(4,1) NOT NULL DEFAULT 0,
  el_used NUMERIC(4,1) NOT NULL DEFAULT 0,
  cl_used NUMERIC(4,1) NOT NULL DEFAULT 0,
  sl_used NUMERIC(4,1) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, year)
);

-- Monthly scores
CREATE TABLE public.monthly_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  attendance_score NUMERIC(5,2) DEFAULT 0,
  performance_score NUMERIC(5,2) DEFAULT 0,
  observation_score NUMERIC(5,2) DEFAULT 0,
  composite_score NUMERIC(5,2) DEFAULT 0,
  eotm_rank INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

-- Casual workers
CREATE TABLE public.casual_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  id_number TEXT,
  logged_by UUID NOT NULL REFERENCES public.employees(id),
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Salary master (monthly payroll snapshot)
CREATE TABLE public.salary_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  days_present INTEGER DEFAULT 0,
  days_absent INTEGER DEFAULT 0,
  overtime_hours NUMERIC(5,1) DEFAULT 0,
  gross_salary NUMERIC(10,2) DEFAULT 0,
  total_deductions NUMERIC(10,2) DEFAULT 0,
  net_salary NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

-- User roles table for RLS (security definer pattern)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casual_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: get employee_id for current auth user
CREATE OR REPLACE FUNCTION public.get_my_employee_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.employees
  WHERE auth_user_id = auth.uid()
  LIMIT 1
$$;

-- Helper: get role for current auth user
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.employees
  WHERE auth_user_id = auth.uid()
  LIMIT 1
$$;

-- ====== RLS POLICIES ======

-- EMPLOYEES: everyone authenticated can read, only HR/owner can write
CREATE POLICY "Authenticated users can read employees"
  ON public.employees FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "HR and Owner can insert employees"
  ON public.employees FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('hr_admin', 'owner'));

CREATE POLICY "HR and Owner can update employees"
  ON public.employees FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('hr_admin', 'owner'));

-- SHIFTS: everyone reads their own or HR/manager/supervisor reads all
CREATE POLICY "Employees read own shifts"
  ON public.shifts FOR SELECT TO authenticated
  USING (
    employee_id = public.get_my_employee_id()
    OR public.get_my_role() IN ('hr_admin', 'owner', 'manager', 'supervisor')
  );

CREATE POLICY "HR can manage shifts"
  ON public.shifts FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() = 'hr_admin');

CREATE POLICY "HR can update shifts"
  ON public.shifts FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'hr_admin');

CREATE POLICY "HR can delete shifts"
  ON public.shifts FOR DELETE TO authenticated
  USING (public.get_my_role() = 'hr_admin');

-- ATTENDANCE: workers insert own, managers/HR read all
CREATE POLICY "Read own or management reads all attendance"
  ON public.attendance FOR SELECT TO authenticated
  USING (
    employee_id = public.get_my_employee_id()
    OR public.get_my_role() IN ('hr_admin', 'owner', 'manager', 'supervisor')
  );

CREATE POLICY "Workers insert own attendance"
  ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (employee_id = public.get_my_employee_id());

CREATE POLICY "HR can update attendance"
  ON public.attendance FOR UPDATE TO authenticated
  USING (
    employee_id = public.get_my_employee_id()
    OR public.get_my_role() IN ('hr_admin')
  );

-- LEAVE BALANCES
CREATE POLICY "Read own or HR reads all leave balances"
  ON public.leave_balances FOR SELECT TO authenticated
  USING (
    employee_id = public.get_my_employee_id()
    OR public.get_my_role() IN ('hr_admin', 'owner', 'manager')
  );

CREATE POLICY "HR can manage leave balances"
  ON public.leave_balances FOR ALL TO authenticated
  USING (public.get_my_role() = 'hr_admin');

-- MONTHLY SCORES
CREATE POLICY "Read own or management reads all scores"
  ON public.monthly_scores FOR SELECT TO authenticated
  USING (
    employee_id = public.get_my_employee_id()
    OR public.get_my_role() IN ('hr_admin', 'owner', 'manager')
  );

CREATE POLICY "HR can manage scores"
  ON public.monthly_scores FOR ALL TO authenticated
  USING (public.get_my_role() = 'hr_admin');

-- CASUAL WORKERS
CREATE POLICY "Supervisors and HR can read casual workers"
  ON public.casual_workers FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('supervisor', 'hr_admin', 'owner', 'manager'));

CREATE POLICY "Supervisors can insert casual workers"
  ON public.casual_workers FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('supervisor', 'hr_admin'));

-- SALARY MASTER
CREATE POLICY "Read own or HR/owner reads all salary"
  ON public.salary_master FOR SELECT TO authenticated
  USING (
    employee_id = public.get_my_employee_id()
    OR public.get_my_role() IN ('hr_admin', 'owner')
  );

CREATE POLICY "HR can manage salary"
  ON public.salary_master FOR ALL TO authenticated
  USING (public.get_my_role() = 'hr_admin');

-- USER ROLES
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Trigger to auto-create employee link on signup (for phone auth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _emp_id UUID;
  _role app_role;
BEGIN
  -- Find employee by phone
  SELECT id, role INTO _emp_id, _role
  FROM public.employees
  WHERE phone = NEW.phone
  LIMIT 1;

  IF _emp_id IS NOT NULL THEN
    -- Link auth user to employee
    UPDATE public.employees SET auth_user_id = NEW.id WHERE id = _emp_id;
    -- Create user_role entry
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Index for phone lookups
CREATE INDEX idx_employees_phone ON public.employees(phone);
CREATE INDEX idx_employees_auth_user_id ON public.employees(auth_user_id);
CREATE INDEX idx_attendance_employee_date ON public.attendance(employee_id, attendance_date);
CREATE INDEX idx_shifts_employee_date ON public.shifts(employee_id, shift_date);
