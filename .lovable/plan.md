
Below is the complete, self-contained prompt to paste into a fresh Lovable project. Copy everything between the `===` markers as your first message in the new project. Nothing is omitted — every role, table, feature, and business rule from this codebase is included.

Because Lovable's built-in stack is React + Vite + Tailwind + Lovable Cloud (Supabase), the "mobile app" is built as a **PWA first, then wrapped with Capacitor** for real iOS/Android builds. This is the standard Lovable mobile path.

---

## Master Prompt (paste this into the new project)

```
===============================================================
BUILD: "Varsha Connect" — Bilingual (Hindi/English) mobile ERP+HRMS
for Varsha Forgings, a forging plant in Aurangabad, India (~313 employees).

STACK (do not change):
- React 18 + Vite + TypeScript + Tailwind + shadcn/ui
- Lovable Cloud (Supabase) for DB, auth, storage, edge functions
- Capacitor wrapper for iOS/Android (appId: app.lovable.varshaconnect,
  appName: varsha-connect). PWA manifest + installable first,
  Capacitor added at the end.
- Mobile-first design, max width 480px, bottom nav, safe-area insets,
  large tap targets (min 56px), no desktop layouts.

DESIGN SYSTEM:
- Semantic tokens in index.css only. No hardcoded colors in components.
- Primary: forge-orange hsl(30 90% 50%); success green, danger red,
  info blue, muted grey, all as HSL tokens with dark-mode variants.
- Font: Inter for English, Noto Sans Devanagari for Hindi.
- Every user-facing string uses <BilingualText hindi="..." english="..." />
  or the useLanguage() hook. Never hardcode English-only text.
- Language toggle persisted per user (default: Hindi for WORKER category,
  English for STAFF/CONSULTANT).

AUTH & ROLES:
- Supabase Auth via phone OTP (+91). Employee records linked by phone.
- Seven roles as a Postgres enum app_role: worker, supervisor, manager,
  hr_admin, owner, plant_head, security_guard.
- Roles live in a SEPARATE public.user_roles table (never on profiles).
  Use SECURITY DEFINER function has_role(uuid, app_role) inside all RLS.
- Also create get_my_role() and get_my_employee_id() SECURITY DEFINER
  helpers. Handle new-user trigger links auth.users -> employees by phone
  and inserts user_roles row.
- Demo login buttons on LoginPage for each role — look up employee by
  role, sign out first, wait 500ms, then set local demo user. Never
  freeze between role switches.
- UI LABEL RULE: role "worker" is ALWAYS displayed as "Member" (English)
  / "सदस्य" (Hindi). Database value stays "worker".

DATABASE (create all tables in one migration set, each with GRANTs +
RLS + policies; timestamps + update triggers on all):

1.  employees (57 cols): emp_code (VFL4xxxx workers, VFL1xxxx staff,
    CONxxxx consultants), name, name_hi, phone, auth_user_id, role,
    department, category (WORKER/STAFF/CONSULTANT), dob, doj, doc
    (date of confirmation), probation_months, is_active, aadhaar,
    pan, uan, esi_number, bank_acc, ifsc, address, emergency_contact,
    photo_url, blood_group, marital_status, gender, education,
    designation, reporting_to, shift_pattern, weekly_off_day,
    basic_salary, hra, special_allowance, conveyance, medical,
    other_earnings, base_gross, pf_applicable, esi_applicable,
    pt_applicable, mlwf_applicable, is_supervisor_of, etc.
2.  user_roles (user_id, role, unique together)
3.  attendance (22 cols): employee_id, date, shift_type, check_in_time,
    check_out_time, check_in_lat/lng, check_out_lat/lng, status
    (P/H/LC/EC/OT/A/L/WO/HO), late_minutes, ot_hours, is_comp_off_earned,
    approved_by, notes, source (self/supervisor/system).
4.  attendance_checkpoints — GPS pings during shift.
5.  attendance_regularisation — worker request + supervisor approval.
6.  attendance_warnings — auto-generated when 3+ absences/month, etc.
7.  casual_workers: supervisor_id, department, shift_date, shift_type,
    unskilled_count, skilled_count, operator_count. Unique
    (supervisor_id, shift_date, shift_type). One row per shift.
8.  comp_off_balance: earned_date, expiry_date (+90d), is_used,
    is_expired, used_on_date.
9.  leave_requests: type (CL/SL/PL/CO/LOP), from_date, to_date, half_day,
    reason, status, approved_by. CO type consumes comp_off_balance FIFO.
10. leave_balances: cl, sl, pl, co_available. Yearly reset job.
11. advance_requests: amount, reason, status, approved_by, deducted_from.
12. salary_advances: linked to advance_request, monthly deduction schedule.
13. salary_master: monthly snapshot per employee, used for payslip.
14. incentive_config + incentive_payments: production-based bonuses.
15. daily_checklist_log: worker daily 5-item safety/quality checklist.
16. daily_eod_confirmations: supervisor confirms team EOD.
17. shift_reports: supervisor_id, shift_date, shift_type, observations,
    issues_reported, submitted_at.
18. maintenance_observations: photo_url (supabase storage bucket
    "maintenance-photos" public), area, description, priority,
    acknowledged_by, action_taken. Feeds Observation Score.
19. preventive_maintenance_tasks: recurring schedule, next_due_date.
20. production_entries: shift, part_no, qty_produced, qty_rejected,
    operator_id, machine_id.
21. tasks: task_delegation between roles, status, due_date, escalation.
22. email_tasks: parsed inbox items (Gmail integration stub).
23. gmail_inbox_owners: which HR/Manager maps to which inbox.
24. data_collection_tasks + data_collection_submissions: custom forms.
25. document_uploads: employee docs (Aadhaar/PAN/etc).
26. notifications: in-app push queue.
27. fraud_flags: geofence bypass, duplicate check-ins, etc.
28. holidays / public_holidays: date, name, is_national, is_local,
    applicable_departments. Auto-marks attendance HO.
29. shifts: master shift definitions.
30. plant_config: geofence lat 19.8383935925407, lng 75.23638998304483,
    radius 200m; work hours; grace minutes.
31. part_master (SKU catalog), purchase_requisitions, purchase_orders,
    goods_receipt_notes, inward_invoices, three_way_match (PO vs GRN
    vs Invoice; approved=Release Payment, mismatch=Exception).
32. mrm_reviews: Management Review Meeting minutes.
33. monthly_scores: attendance/performance/observations composite,
    role-weighted, recalculated nightly.
34. role_kpis, role_kras: HR-configurable per role.
35. override_log: audit trail of manual attendance edits.
36. qr_tokens: rotating QR for security-guard check-in verification.
37. vehicle_log: security-guard inward/outward vehicle log.
38. employee_contracts, employee_sync_log.

RLS: every table enabled. GRANT SELECT/INSERT/UPDATE/DELETE to
authenticated; GRANT ALL to service_role. Only fully public tables get
anon SELECT. Policies use has_role() / get_my_employee_id(). Never
compare roles via client-side storage.

CORE BUSINESS LOGIC:
- Geofence: PLANT_GEOFENCE {lat, lng, radius 200m}. Check-in/out require
  location within radius; outside creates a fraud_flag but still records.
- Shifts: GENERAL 09-18, FIRST 07-15:30, SECOND 15:30-00, THIRD 00-07,
  DAY 07-19, NIGHT 19-07.
- Attendance codes with colors: P green, H amber (Half Day), LC yellow
  (Late), EC orange (Early Out), OT blue, A red, L purple, WO grey, HO cyan.
- Scoring: PRESENT_ON_TIME +10, LATE<30 +5, LATE>30 +2, ABSENT -5,
  APPROVED_LEAVE 0, PERFECT_MONTH +50, MAINTENANCE_OBS +15, ACTIONED +25.
  Weights: attendance 0.40, performance 0.40, observations 0.20.
  Composite by role: Member=own; Supervisor=own*0.6+team*0.4;
  Manager=own*0.5+sup*0.3+worker*0.2.
- Comp-Off: OT on Sunday/holiday → supervisor toggles Comp-Off Earned →
  90-day expiry. Edge function expire-comp-off runs daily.
- Probation: 3 or 6 months; notify HR 7 days before doc; daily reminders
  after due date until confirmed.
- Payslip (Indian industrial format, 26-day payable month):
  Gross Earned = sum(earning components) * days_payable/26.
  OT = basic/26/8 * 2 * ot_hours.
  Deductions: PF = 12% of basic capped 1800; ESIC = 0.75% of gross if
  esi_number present; PT ₹200; MLWF ₹25.
  Net Pay displayed in words (Rupees ...).
  Export CSV for Zoho Books.
- PF Challan (HR): month picker, filter employees with UAN, columns
  Emp Code / Name / UAN / EPF Wages / EPS Wages / EPF Contrib (12% of
  EPF wages) / EPS Contrib (8.33% of EPS wages, cap 1250) / Diff, totals,
  CSV export.
- ESIC Challan (HR): month picker, employees with esi_number, columns
  Emp Code / Name / ESI No / Gross Wages / Employee ESIC (0.75%) /
  Employer ESIC (3.25%) / Total (4%), totals, CSV export.

ROLE HOME SCREENS (each mobile page, bottom nav 4-5 tabs, TopBar with
logo + language toggle + notifications bell):

MemberHome (worker):
- Big I Have Arrived / I Am Done buttons with geofence check.
- Today status card, attendance calendar (color-dotted).
- Leave & advance apply forms.
- Payslip viewer, comp-off balance, daily checklist, notifications,
  profile, settings, safety tips.

SupervisorHome:
- Team attendance list (SupervisorAttendanceRow with status toggle,
  comp-off toggle, OT hours input).
- Casual Worker Count tab: three +/- steppers (Unskilled/Skilled/
  Operator), dept & shift auto-filled read-only, submit once per shift,
  editable.
- Shift Report submit (observations, issues, submitted_at).
- Regularisation approvals, task delegation, EOD confirmation,
  leaderboard, notifications.

ManagerHome:
- KPI cards, supervisor leaderboard, three-way-match tab, email tasks
  tab, MRM review tab, task delegation, notifications.

HRAdminHome:
- Employee records CRUD, add-employee form, probation tab, holiday master,
  min-wages compliance, regularisation approvals, payroll section with
  Payslip / PF Challan / ESIC Challan / Leave Encashment tabs, purchase
  requisition tab, notifications.

OwnerHome:
- Plant-wide KPI dashboard, monthly composite score leaderboard across
  roles, MRM review, notifications.

PlantHeadHome:
- Same as owner plus three-way-match, ranking widgets, GRN screen,
  part-master screen.

SecurityGuardHome:
- Vehicle log inward/outward form, QR-token attendance verification,
  casual-worker count for GATE department.

EDGE FUNCTIONS (supabase/functions, verify_jwt handled per Lovable):
- expire-comp-off (daily): flag comp_off_balance rows past expiry.
- check-attendance-warnings (daily): create attendance_warnings.
- escalate-leaves (hourly): auto-escalate pending leaves past SLA.
- escalate-tasks (hourly): auto-escalate overdue tasks.
- recalculate-scores (nightly): rebuild monthly_scores.

PWA + MOBILE:
- manifest.json, icons, theme color, standalone display.
- Register a guarded service worker ONLY in production (skip in Lovable
  preview / iframe / dev).
- After base app works, add Capacitor with:
    npm i @capacitor/core @capacitor/ios @capacitor/android
    npm i -D @capacitor/cli
    npx cap init varsha-connect app.lovable.varshaconnect
  capacitor.config with server.url pointing to sandbox preview for hot
  reload during dev.

DEMO PHONES (seed data): Worker 8888516837, Supervisor 7719012879,
Manager 9922725811, HR 7972068310, Owner 9823080707, PlantHead
9823395533, Security fallback owner phone.

DELIVERY ORDER (do NOT skip a step):
1. Design tokens + BilingualText + LanguageContext + AuthContext.
2. Migration set 1: employees, user_roles, has_role, handle_new_user
   trigger, plant_config, shifts, holidays.
3. LoginPage with phone OTP + demo role buttons.
4. Migration set 2: attendance stack + geofence + fraud_flags +
   comp_off_balance + leave_requests + leave_balances.
5. MemberHome complete.
6. Migration set 3: casual_workers + shift_reports + tasks +
   maintenance_observations + preventive_maintenance_tasks +
   production_entries.
7. SupervisorHome complete (includes CasualWorkerCount with +/- steppers,
   ShiftReport submit).
8. Migration set 4: salary_master + incentive_config + incentive_payments
   + advance_requests + salary_advances.
9. HRAdminHome with Payslip/PF/ESIC/LeaveEncashment tabs, ProbationTab,
   HolidayMaster, MinWagesCompliance.
10. Migration set 5: part_master + purchase_requisitions + purchase_orders
    + goods_receipt_notes + inward_invoices + three_way_match +
    mrm_reviews + email_tasks + gmail_inbox_owners.
11. ManagerHome, PlantHeadHome, OwnerHome.
12. Migration set 6: qr_tokens + vehicle_log + data_collection_*.
13. SecurityGuardHome.
14. Edge functions.
15. PWA manifest + service worker.
16. Capacitor wrap.

RULES ENFORCED EVERY TURN:
- Deploy after each task; verify build clean.
- Never store roles on profile/users table.
- Never bypass RLS with client checks.
- Never hardcode colors; use semantic tokens.
- Every new public table: CREATE → GRANT → ENABLE RLS → CREATE POLICY,
  in that order, in the same migration.
- Every user-facing string bilingual.
- All tap targets ≥56px, mobile viewport only.
- After demo login, sign out first + 500ms delay before setting user.
- shift_reports and casual_workers policies must allow the authenticated
  role (anon reads only where explicitly needed).

Begin with step 1. After each numbered step, stop and confirm the
migration was approved before moving on.
===============================================================
```

## What you get vs. what changes

- Same functionality, same 40+ tables, same 7 roles, same bilingual UX, same scoring/payroll/compliance rules.
- Fresh design token pass and clean migrations (no accumulated fixes).
- PWA-first, then Capacitor-wrapped so you get real iOS/Android builds from the App Store / Play Store.

## Before you paste it into the new project

Tell me if any of these should change and I'll bake them into the prompt before you copy it:

1. Keep bilingual Hindi/English exactly as is, or English-only?
2. Keep phone-OTP auth, or switch to email/password for the rebuild?
3. Do you want me to include the demo phone numbers in the prompt (so demo login keeps working) or leave them out for security?
4. Any features from the current app to drop in the rebuild (e.g., Gmail email-tasks, three-way-match, MRM) — smaller scope = faster and cheaper build.

Answer those four and I'll produce a final locked prompt you can paste with zero edits.
