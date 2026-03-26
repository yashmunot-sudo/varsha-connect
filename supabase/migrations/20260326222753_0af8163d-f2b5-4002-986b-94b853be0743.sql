
-- Add all missing columns to employees table
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS designation TEXT,
  ADD COLUMN IF NOT EXISTS date_of_joining DATE,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS ifsc TEXT,
  ADD COLUMN IF NOT EXISTS account_no TEXT,
  ADD COLUMN IF NOT EXISTS uan TEXT,
  ADD COLUMN IF NOT EXISTS pan TEXT,
  ADD COLUMN IF NOT EXISTS esi_no TEXT,
  ADD COLUMN IF NOT EXISTS aadhar TEXT,
  ADD COLUMN IF NOT EXISTS blood_group TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
  ADD COLUMN IF NOT EXISTS office_email TEXT,
  ADD COLUMN IF NOT EXISTS personal_email TEXT,
  ADD COLUMN IF NOT EXISTS ctc_annual INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gross_monthly NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'hi',
  ADD COLUMN IF NOT EXISTS fcm_token TEXT,
  ADD COLUMN IF NOT EXISTS reporting_manager_emp_code TEXT,
  ADD COLUMN IF NOT EXISTS reporting_manager_name TEXT,
  ADD COLUMN IF NOT EXISTS salary_type TEXT DEFAULT 'STAFF',
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS washing NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS education NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS heat_allow NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vda NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS production_allow NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prof_development NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS communication NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS uniform NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS missing_data JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS late_reason TEXT,
  ADD COLUMN IF NOT EXISTS late_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overtime_hours NUMERIC(5,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_unannounced_absence BOOLEAN DEFAULT false;

ALTER TABLE public.leave_requests
  ADD COLUMN IF NOT EXISTS current_approver_id UUID,
  ADD COLUMN IF NOT EXISTS approval_level INTEGER DEFAULT 1;

ALTER TABLE public.maintenance_observations DROP COLUMN IF EXISTS photo_url;

CREATE TABLE IF NOT EXISTS public.plant_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.plant_config ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.preventive_maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, description TEXT, department TEXT NOT NULL,
  assigned_to_id UUID REFERENCES public.employees(id),
  frequency TEXT NOT NULL DEFAULT 'Weekly',
  day_of_week TEXT, due_date DATE, status TEXT NOT NULL DEFAULT 'Pending',
  completed_by UUID REFERENCES public.employees(id), completed_at TIMESTAMPTZ,
  escalation_level INTEGER DEFAULT 0, last_reminded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, description TEXT,
  created_by UUID NOT NULL REFERENCES public.employees(id),
  assigned_to UUID NOT NULL REFERENCES public.employees(id),
  priority TEXT NOT NULL DEFAULT 'Normal',
  due_date DATE, due_time TIME, repeat_frequency TEXT DEFAULT 'Once',
  status TEXT NOT NULL DEFAULT 'Assigned',
  acknowledged_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
  completion_note TEXT, escalation_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  title TEXT NOT NULL, body TEXT NOT NULL, type TEXT,
  read BOOLEAN DEFAULT false, action_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_checklist_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  date DATE NOT NULL, items_completed JSONB,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, date)
);

CREATE TABLE IF NOT EXISTS public.data_collection_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, description TEXT, department TEXT NOT NULL,
  assigned_to_id UUID REFERENCES public.employees(id),
  entry_time TIME, frequency TEXT DEFAULT 'Daily',
  fields_schema JSONB, last_submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_collection_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.data_collection_tasks(id),
  submitted_by UUID NOT NULL REFERENCES public.employees(id),
  submitted_at TIMESTAMPTZ DEFAULT now(), data JSONB, shift TEXT
);

CREATE TABLE IF NOT EXISTS public.attendance_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  warning_type TEXT NOT NULL DEFAULT 'Late',
  warning_number INTEGER NOT NULL DEFAULT 1, reason TEXT,
  issued_by UUID REFERENCES public.employees(id),
  approved_by UUID REFERENCES public.employees(id),
  requires_owner_approval BOOLEAN DEFAULT false,
  owner_approved BOOLEAN DEFAULT false,
  issued_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_by_employee BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.employee_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  employment_type TEXT DEFAULT 'Permanent',
  date_of_joining DATE, confirmation_date DATE, grade TEXT,
  current_ctc INTEGER DEFAULT 0, last_increment_date DATE,
  last_increment_pct NUMERIC(5,2), next_review_date DATE,
  notice_period_days INTEGER DEFAULT 30,
  pf_applicable BOOLEAN DEFAULT true, esi_applicable BOOLEAN DEFAULT false,
  bonus_applicable BOOLEAN DEFAULT true, gratuity_applicable BOOLEAN DEFAULT true,
  notes TEXT, created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_updated_by UUID REFERENCES public.employees(id)
);

CREATE TABLE IF NOT EXISTS public.attendance_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  attendance_date DATE NOT NULL,
  checkpoint_1_time TIMESTAMPTZ,
  checkpoint_1_gps_lat NUMERIC, checkpoint_1_gps_lng NUMERIC,
  checkpoint_1_qr_valid BOOLEAN DEFAULT false,
  checkpoint_1_mock_location BOOLEAN DEFAULT false,
  checkpoint_2_time TIMESTAMPTZ,
  checkpoint_2_confirmed_by UUID REFERENCES public.employees(id),
  checkpoint_3_time TIMESTAMPTZ,
  checkpoint_3_confirmed_by UUID REFERENCES public.employees(id),
  all_confirmed BOOLEAN DEFAULT false,
  mismatch_detected BOOLEAN DEFAULT false,
  mismatch_type TEXT,
  UNIQUE(employee_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS public.fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  flag_date DATE NOT NULL DEFAULT CURRENT_DATE,
  flag_type TEXT NOT NULL, flag_detail TEXT,
  auto_detected BOOLEAN DEFAULT true,
  reviewed_by UUID REFERENCES public.employees(id),
  reviewed_at TIMESTAMPTZ, action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.part_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_number TEXT UNIQUE NOT NULL,
  part_name TEXT NOT NULL,
  cycle_time_seconds INTEGER NOT NULL,
  machine_type TEXT NOT NULL,
  department TEXT, customer TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.production_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  part_id UUID REFERENCES public.part_master(id),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift TEXT, hour_slot INTEGER,
  pieces_actual INTEGER NOT NULL DEFAULT 0,
  pieces_expected INTEGER NOT NULL DEFAULT 0,
  entry_time TIMESTAMPTZ DEFAULT now(),
  supervisor_verified BOOLEAN DEFAULT false,
  supervisor_id UUID REFERENCES public.employees(id),
  shift_total_actual INTEGER, shift_total_expected INTEGER,
  performance_pct NUMERIC(7,2),
  incentive_amount INTEGER DEFAULT 0,
  flagged_for_review BOOLEAN DEFAULT false, flag_reason TEXT
);

CREATE TABLE IF NOT EXISTS public.incentive_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  month INTEGER NOT NULL, year INTEGER NOT NULL,
  total_shifts INTEGER DEFAULT 0,
  total_pieces_actual INTEGER DEFAULT 0,
  total_pieces_expected INTEGER DEFAULT 0,
  avg_performance_pct NUMERIC(7,2),
  incentive_amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES public.employees(id),
  approved_at TIMESTAMPTZ,
  UNIQUE(employee_id, month, year)
);

CREATE TABLE IF NOT EXISTS public.incentive_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_name TEXT NOT NULL,
  min_pct NUMERIC(7,2), max_pct NUMERIC(7,2),
  amount_per_shift INTEGER NOT NULL,
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.qr_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL, valid_date DATE NOT NULL,
  shift_type TEXT,
  valid_from TIMESTAMPTZ NOT NULL, valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mrm_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_month INTEGER NOT NULL, review_year INTEGER NOT NULL,
  department TEXT NOT NULL,
  dept_head_id UUID REFERENCES public.employees(id),
  plan_vs_actual_pct NUMERIC(5,2) DEFAULT 0,
  key_wins TEXT, key_issues TEXT, actions_taken TEXT,
  pending_actions JSONB DEFAULT '[]'::jsonb,
  submitted_by UUID REFERENCES public.employees(id), submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.employees(id), reviewed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'Pending',
  UNIQUE(review_month, review_year, department)
);

CREATE TABLE IF NOT EXISTS public.override_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL, record_id UUID NOT NULL,
  field_changed TEXT NOT NULL, old_value TEXT, new_value TEXT,
  changed_by UUID REFERENCES public.employees(id), reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_kras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL, kra_number INTEGER NOT NULL,
  kra_title TEXT NOT NULL, kra_title_hi TEXT NOT NULL,
  description TEXT, weight_pct INTEGER DEFAULT 33,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, kra_number)
);

CREATE TABLE IF NOT EXISTS public.role_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL, kra_number INTEGER NOT NULL,
  kpi_title TEXT NOT NULL, kpi_title_hi TEXT NOT NULL,
  target_value TEXT NOT NULL, target_operator TEXT DEFAULT '>=',
  unit TEXT, measurement_frequency TEXT DEFAULT 'Monthly',
  points_on_achieve INTEGER DEFAULT 10, points_on_miss INTEGER DEFAULT -5,
  is_blocker BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicle_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE, shift TEXT NOT NULL,
  vehicle_number TEXT NOT NULL, driver_name TEXT,
  time_in TIMESTAMPTZ NOT NULL DEFAULT now(), time_out TIMESTAMPTZ,
  purpose TEXT NOT NULL, material_description TEXT, vendor_name TEXT,
  delivery_type TEXT DEFAULT 'Inward', po_reference TEXT,
  grn_id UUID, logged_by UUID REFERENCES public.employees(id),
  security_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goods_receipt_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_number TEXT UNIQUE NOT NULL, grn_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vehicle_log_id UUID REFERENCES public.vehicle_log(id),
  po_number TEXT, vendor_name TEXT NOT NULL,
  material_description TEXT NOT NULL,
  quantity_received NUMERIC(10,3) NOT NULL, unit TEXT DEFAULT 'kg',
  condition TEXT DEFAULT 'Good', challan_number TEXT, challan_doc_url TEXT,
  qc_status TEXT DEFAULT 'Pending',
  qc_approved_by UUID REFERENCES public.employees(id), qc_approved_at TIMESTAMPTZ,
  qc_notes TEXT, received_by UUID REFERENCES public.employees(id),
  department TEXT, status TEXT DEFAULT 'Open',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchase_requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_number TEXT UNIQUE NOT NULL, pr_date DATE NOT NULL DEFAULT CURRENT_DATE,
  raised_by UUID REFERENCES public.employees(id), department TEXT NOT NULL,
  item_description TEXT NOT NULL, quantity NUMERIC(10,3) NOT NULL,
  unit TEXT DEFAULT 'kg', required_by DATE, urgency TEXT DEFAULT 'Normal',
  approved_by UUID REFERENCES public.employees(id), approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'Pending', po_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT UNIQUE NOT NULL, po_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pr_id UUID REFERENCES public.purchase_requisitions(id),
  vendor_name TEXT NOT NULL, item_description TEXT NOT NULL,
  quantity NUMERIC(10,3) NOT NULL, unit TEXT DEFAULT 'kg',
  unit_price NUMERIC(10,2) NOT NULL, total_amount NUMERIC(12,2) NOT NULL,
  expected_delivery DATE, created_by UUID REFERENCES public.employees(id),
  status TEXT DEFAULT 'Open', created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inward_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL, invoice_date DATE NOT NULL,
  vendor_name TEXT NOT NULL, po_number TEXT,
  grn_id UUID REFERENCES public.goods_receipt_notes(id),
  invoice_amount NUMERIC(12,2) NOT NULL,
  invoice_quantity NUMERIC(10,3), unit TEXT DEFAULT 'kg',
  invoice_doc_url TEXT,
  scanned_by UUID REFERENCES public.employees(id), scanned_at TIMESTAMPTZ DEFAULT now(),
  entered_by UUID REFERENCES public.employees(id), entered_at TIMESTAMPTZ,
  match_status TEXT DEFAULT 'Pending', created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.three_way_match (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID REFERENCES public.purchase_orders(id),
  grn_id UUID REFERENCES public.goods_receipt_notes(id),
  invoice_id UUID REFERENCES public.inward_invoices(id),
  po_price NUMERIC(10,2), invoice_price NUMERIC(10,2),
  price_match BOOLEAN DEFAULT false, price_variance_pct NUMERIC(7,2) DEFAULT 0,
  po_quantity NUMERIC(10,3), grn_quantity NUMERIC(10,3),
  invoice_quantity NUMERIC(10,3), quantity_match BOOLEAN DEFAULT false,
  qc_approved BOOLEAN DEFAULT false, overall_status TEXT DEFAULT 'Pending',
  matched_by UUID REFERENCES public.employees(id), matched_at TIMESTAMPTZ,
  exception_reason TEXT,
  exception_escalated_to UUID REFERENCES public.employees(id),
  payment_released BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type TEXT NOT NULL, doc_reference TEXT, doc_url TEXT NOT NULL,
  drive_folder_url TEXT, uploaded_by UUID REFERENCES public.employees(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(), verified BOOLEAN DEFAULT false,
  linked_to_grn UUID REFERENCES public.goods_receipt_notes(id),
  linked_to_invoice UUID REFERENCES public.inward_invoices(id), notes TEXT
);

CREATE TABLE IF NOT EXISTS public.daily_eod_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  role TEXT NOT NULL, confirmed_at TIMESTAMPTZ DEFAULT now(),
  items_confirmed JSONB NOT NULL, system_check_result JSONB,
  discrepancies_found JSONB DEFAULT '[]'::jsonb,
  override_reason TEXT, is_complete BOOLEAN DEFAULT false,
  UNIQUE(employee_id, confirmation_date)
);

CREATE TABLE IF NOT EXISTS public.email_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gmail_message_id TEXT UNIQUE, from_address TEXT NOT NULL,
  from_name TEXT, subject TEXT NOT NULL, body_preview TEXT,
  received_at TIMESTAMPTZ NOT NULL, inbox_email TEXT NOT NULL,
  assigned_to UUID REFERENCES public.employees(id),
  urgency TEXT DEFAULT 'Normal', category TEXT DEFAULT 'General',
  status TEXT DEFAULT 'Unread', replied_at TIMESTAMPTZ,
  reply_deadline TIMESTAMPTZ,
  escalated_to UUID REFERENCES public.employees(id),
  escalated_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gmail_inbox_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inbox_email TEXT UNIQUE NOT NULL, inbox_label TEXT NOT NULL,
  assigned_to UUID REFERENCES public.employees(id),
  reply_deadline_hours INTEGER DEFAULT 4, urgency_keywords TEXT[],
  is_customer_facing BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.preventive_maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checklist_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_collection_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_collection_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incentive_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incentive_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mrm_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.override_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_kras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipt_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inward_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.three_way_match ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_eod_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_inbox_owners ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN CREATE POLICY "All read plant_config" ON public.plant_config FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "HR manages plant_config" ON public.plant_config FOR ALL TO authenticated USING (get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "All read maint tasks" ON public.preventive_maintenance_tasks FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Assignee updates maint" ON public.preventive_maintenance_tasks FOR UPDATE TO authenticated USING (assigned_to_id = get_my_employee_id() OR get_my_role() IN ('hr_admin','manager','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Read tasks" ON public.tasks FOR SELECT TO authenticated USING (assigned_to = get_my_employee_id() OR created_by = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head','manager')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Create tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (get_my_role() IN ('manager','hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Update tasks" ON public.tasks FOR UPDATE TO authenticated USING (assigned_to = get_my_employee_id() OR created_by = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Read own notifs" ON public.notifications FOR SELECT TO authenticated USING (employee_id = get_my_employee_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Insert notifs" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Update notifs" ON public.notifications FOR UPDATE TO authenticated USING (employee_id = get_my_employee_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Own checklist" ON public.daily_checklist_log FOR ALL TO authenticated USING (employee_id = get_my_employee_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Read data tasks" ON public.data_collection_tasks FOR SELECT TO authenticated USING (assigned_to_id = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head','manager')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Submit data" ON public.data_collection_submissions FOR INSERT TO authenticated WITH CHECK (submitted_by = get_my_employee_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Read submissions" ON public.data_collection_submissions FOR SELECT TO authenticated USING (submitted_by = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head','manager')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Read warnings" ON public.attendance_warnings FOR SELECT TO authenticated USING (employee_id = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head','manager','supervisor')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "HR warnings" ON public.attendance_warnings FOR ALL TO authenticated USING (get_my_role() IN ('hr_admin','owner','plant_head','manager')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Read contracts" ON public.employee_contracts FOR SELECT TO authenticated USING (get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "HR contracts" ON public.employee_contracts FOR ALL TO authenticated USING (get_my_role() IN ('hr_admin','owner')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Own checkpoints" ON public.attendance_checkpoints FOR SELECT TO authenticated USING (employee_id = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head','manager','supervisor')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Insert checkpoints" ON public.attendance_checkpoints FOR INSERT TO authenticated WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Read fraud flags" ON public.fraud_flags FOR SELECT TO authenticated USING (employee_id = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head','manager')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Insert fraud flags" ON public.fraud_flags FOR INSERT TO authenticated WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "HR updates fraud flags" ON public.fraud_flags FOR UPDATE TO authenticated USING (get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "All read part_master" ON public.part_master FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "HR manages parts" ON public.part_master FOR ALL TO authenticated USING (get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Own production entries" ON public.production_entries FOR SELECT TO authenticated USING (employee_id = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head','manager','supervisor')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Insert own entries" ON public.production_entries FOR INSERT TO authenticated WITH CHECK (employee_id = get_my_employee_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Supervisor validates entries" ON public.production_entries FOR UPDATE TO authenticated USING (get_my_role() IN ('supervisor','manager','hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Own incentives" ON public.incentive_payments FOR SELECT TO authenticated USING (employee_id = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head','manager')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "HR manages incentives" ON public.incentive_payments FOR ALL TO authenticated USING (get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "All read incentive_config" ON public.incentive_config FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "All read qr_tokens" ON public.qr_tokens FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "HR manages qr_tokens" ON public.qr_tokens FOR ALL TO authenticated USING (get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Read mrm_reviews" ON public.mrm_reviews FOR SELECT TO authenticated USING (get_my_role() IN ('manager','hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Manage mrm_reviews" ON public.mrm_reviews FOR ALL TO authenticated USING (get_my_role() IN ('manager','hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Read override_log" ON public.override_log FOR SELECT TO authenticated USING (get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Insert override_log" ON public.override_log FOR INSERT TO authenticated WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "All read kras" ON public.role_kras FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "All read kpis" ON public.role_kpis FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "HR manages kras" ON public.role_kras FOR ALL TO authenticated USING (get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "HR manages kpis" ON public.role_kpis FOR ALL TO authenticated USING (get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Security logs vehicles" ON public.vehicle_log FOR INSERT TO authenticated WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Read vehicle log" ON public.vehicle_log FOR SELECT TO authenticated USING (get_my_role() IN ('hr_admin','owner','plant_head','manager','supervisor') OR logged_by = get_my_employee_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Update vehicle log" ON public.vehicle_log FOR UPDATE TO authenticated USING (logged_by = get_my_employee_id() OR get_my_role() IN ('hr_admin','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Manage GRN" ON public.goods_receipt_notes FOR ALL TO authenticated USING (received_by = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head','manager')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Manage PRs" ON public.purchase_requisitions FOR ALL TO authenticated USING (raised_by = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head','manager')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Purchase manages POs" ON public.purchase_orders FOR ALL TO authenticated USING (created_by = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head','manager')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Accounts manages invoices" ON public.inward_invoices FOR ALL TO authenticated USING (entered_by = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head','manager')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "DME manages match" ON public.three_way_match FOR ALL TO authenticated USING (matched_by = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head','manager')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Upload documents" ON public.document_uploads FOR INSERT TO authenticated WITH CHECK (uploaded_by = get_my_employee_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Read documents" ON public.document_uploads FOR SELECT TO authenticated USING (get_my_role() IN ('hr_admin','owner','plant_head','manager','supervisor') OR uploaded_by = get_my_employee_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Own EOD confirmations" ON public.daily_eod_confirmations FOR ALL TO authenticated USING (employee_id = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Read own emails" ON public.email_tasks FOR SELECT TO authenticated USING (assigned_to = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head','manager')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Update own emails" ON public.email_tasks FOR UPDATE TO authenticated USING (assigned_to = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Insert emails" ON public.email_tasks FOR INSERT TO authenticated WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Read inbox owners" ON public.gmail_inbox_owners FOR SELECT TO authenticated USING (get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "HR manages inbox owners" ON public.gmail_inbox_owners FOR ALL TO authenticated USING (get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Update leave approval RLS
DROP POLICY IF EXISTS "Manager/HR can update leave requests" ON public.leave_requests;
DO $$ BEGIN CREATE POLICY "Supervisor and above approve leave" ON public.leave_requests FOR UPDATE TO authenticated USING (get_my_role() IN ('supervisor','manager','hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DROP POLICY IF EXISTS "Manager/HR can update advance requests" ON public.advance_requests;
DO $$ BEGIN CREATE POLICY "Manager and above approve advances" ON public.advance_requests FOR UPDATE TO authenticated USING (get_my_role() IN ('manager','hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Workers insert own scores" ON public.monthly_scores FOR INSERT TO authenticated WITH CHECK (employee_id = get_my_employee_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Workers update own scores" ON public.monthly_scores FOR UPDATE TO authenticated USING (employee_id = get_my_employee_id() OR get_my_role() IN ('hr_admin','owner','plant_head')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed plant config
INSERT INTO public.plant_config (key,value) VALUES
  ('plant_lat','19.8383935925407'),('plant_lng','75.23638998304483'),
  ('geofence_radius_meters','100'),('plant_name','Varsha Forgings Pvt Ltd'),
  ('plant_city','Aurangabad, Maharashtra'),
  ('shift_general_start','09:00'),('shift_general_end','18:00'),
  ('shift_first_start','07:00'),('shift_first_end','15:30'),
  ('shift_second_start','15:30'),('shift_second_end','00:00'),
  ('shift_third_start','00:00'),('shift_third_end','07:00'),
  ('shift_day_start','07:00'),('shift_day_end','19:00'),
  ('shift_night_start','19:00'),('shift_night_end','07:00'),
  ('employee_pf_rate','0.12'),('employee_esi_rate','0.0075'),
  ('employer_pf_rate','0.1301'),('employer_esi_rate','0.0325'),
  ('pt_amount','200'),('mlwf_amount','25'),
  ('late_grace_minutes','30'),('eotm_max_observations_per_day','3'),
  ('observation_points_per_submission','15'),
  ('absent_unannounced_point_deduction','5'),
  ('perfect_month_attendance_bonus','50'),
  ('daily_qr_token','INIT'),('qr_token_date','2026-01-01'),
  ('min_shift_coverage_pct','70'),('advance_warning_pct','30'),('advance_max_pct','50')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.incentive_config (band_name, min_pct, max_pct, amount_per_shift) VALUES
  ('Band A - Good', 90, 99.99, 50),
  ('Band B - Target', 100, 109.99, 100),
  ('Band C - Excellent', 110, 999, 150)
ON CONFLICT DO NOTHING;
