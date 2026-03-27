
-- Add payment_status to goods_receipt_notes
ALTER TABLE public.goods_receipt_notes ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';

-- Task 7: public_holidays table
CREATE TABLE IF NOT EXISTS public.public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_date DATE NOT NULL UNIQUE,
  holiday_name TEXT NOT NULL,
  holiday_name_hi TEXT,
  year INTEGER NOT NULL,
  is_national BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.employees(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_holidays_select" ON public.public_holidays;
DROP POLICY IF EXISTS "public_holidays_manage" ON public.public_holidays;
CREATE POLICY "public_holidays_select" ON public.public_holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "public_holidays_manage" ON public.public_holidays FOR ALL TO authenticated USING (get_my_role() IN ('hr_admin', 'owner', 'plant_head')) WITH CHECK (get_my_role() IN ('hr_admin', 'owner', 'plant_head'));

-- Task 8: comp_off_balance table
CREATE TABLE IF NOT EXISTS public.comp_off_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  earned_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  is_expired BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.comp_off_balance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comp_off_select" ON public.comp_off_balance;
DROP POLICY IF EXISTS "comp_off_insert" ON public.comp_off_balance;
DROP POLICY IF EXISTS "comp_off_update" ON public.comp_off_balance;
CREATE POLICY "comp_off_select" ON public.comp_off_balance FOR SELECT TO authenticated USING (employee_id = get_my_employee_id() OR get_my_role() IN ('hr_admin', 'owner', 'supervisor', 'manager', 'plant_head'));
CREATE POLICY "comp_off_insert" ON public.comp_off_balance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "comp_off_update" ON public.comp_off_balance FOR UPDATE TO authenticated USING (true);

-- Task 10: attendance_regularisation table
CREATE TABLE IF NOT EXISTS public.attendance_regularisation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  attendance_date DATE NOT NULL,
  requested_status TEXT NOT NULL,
  reason TEXT,
  shift_type TEXT,
  status TEXT DEFAULT 'Pending',
  reviewed_by UUID REFERENCES public.employees(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.attendance_regularisation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reg_select" ON public.attendance_regularisation;
DROP POLICY IF EXISTS "reg_insert" ON public.attendance_regularisation;
DROP POLICY IF EXISTS "reg_update" ON public.attendance_regularisation;
CREATE POLICY "reg_select" ON public.attendance_regularisation FOR SELECT TO authenticated USING (employee_id = get_my_employee_id() OR get_my_role() IN ('hr_admin', 'owner', 'supervisor', 'manager', 'plant_head'));
CREATE POLICY "reg_insert" ON public.attendance_regularisation FOR INSERT TO authenticated WITH CHECK (employee_id = get_my_employee_id());
CREATE POLICY "reg_update" ON public.attendance_regularisation FOR UPDATE TO authenticated USING (get_my_role() IN ('hr_admin', 'owner', 'supervisor', 'manager', 'plant_head'));

-- Task 6: Add probation columns to employees
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS probation_status TEXT DEFAULT 'not_applicable';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS confirmation_date DATE;

-- Task 9: Add encashed_days to leave_balances
ALTER TABLE public.leave_balances ADD COLUMN IF NOT EXISTS encashed_days INTEGER DEFAULT 0;

-- Task 11: Add skill_level to employees for min wages
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS skill_level TEXT DEFAULT 'unskilled';

-- Add missing columns to three_way_match if needed
ALTER TABLE public.three_way_match ADD COLUMN IF NOT EXISTS matched_by UUID REFERENCES public.employees(id);
ALTER TABLE public.three_way_match ADD COLUMN IF NOT EXISTS matched_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.three_way_match ADD COLUMN IF NOT EXISTS po_price NUMERIC DEFAULT 0;
ALTER TABLE public.three_way_match ADD COLUMN IF NOT EXISTS invoice_price NUMERIC DEFAULT 0;
ALTER TABLE public.three_way_match ADD COLUMN IF NOT EXISTS grn_qty NUMERIC DEFAULT 0;
ALTER TABLE public.three_way_match ADD COLUMN IF NOT EXISTS invoice_qty NUMERIC DEFAULT 0;
ALTER TABLE public.three_way_match ADD COLUMN IF NOT EXISTS overall_status TEXT DEFAULT 'Pending';
