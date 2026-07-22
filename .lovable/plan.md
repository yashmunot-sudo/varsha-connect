
Here is the complete workflow and step-by-step setup guide to accompany the master prompt from the previous plan. Use this as your operating manual when rebuilding Varsha Connect in a fresh Lovable project.

## Part A — End-to-end workflow

```text
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 0  Prepare                                               │
│  • Create new Lovable project (blank)                           │
│  • Enable Lovable Cloud (Cloud tab → Enable)                    │
│  • Paste the Master Prompt from previous plan as msg #1         │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│  PHASE 1  Foundation (design + auth shell)                      │
│  1. Design tokens in index.css + tailwind.config.ts             │
│  2. BilingualText, LanguageContext (hi/en), AuthContext         │
│  3. Migration set 1: employees, user_roles, app_role enum,      │
│     has_role(), get_my_role(), get_my_employee_id(),            │
│     handle_new_user trigger, plant_config, shifts, holidays     │
│  4. LoginPage: phone OTP + 7 demo role buttons                  │
│  → Verify: each demo role loads its (empty) home screen         │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│  PHASE 2  Attendance + Leave (Member)                           │
│  5. Migration set 2: attendance, attendance_checkpoints,        │
│     attendance_regularisation, attendance_warnings,             │
│     fraud_flags, comp_off_balance, leave_requests,              │
│     leave_balances, advance_requests, salary_advances           │
│  6. MemberHome: arrive/leave with geofence, calendar,           │
│     leave form, advance form, payslip viewer, checklist         │
│  → Verify: check-in works inside/outside geofence               │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│  PHASE 3  Supervisor floor tools                                │
│  7. Migration set 3: casual_workers, shift_reports, tasks,      │
│     maintenance_observations, preventive_maintenance_tasks,     │
│     production_entries, daily_eod_confirmations,                │
│     daily_checklist_log                                         │
│  8. SupervisorHome: team attendance slider rows,                │
│     CasualWorkerCount (+/- steppers), ShiftReport,              │
│     Regularisation approvals, Task delegation, EOD              │
│  → Verify: fraud detection triggers after 8 confirms/60s        │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│  PHASE 4  Payroll + HR                                          │
│  9. Migration set 4: salary_master, incentive_config,           │
│     incentive_payments, document_uploads, employee_contracts    │
│ 10. HRAdminHome: employee CRUD, ProbationTab, HolidayMaster,    │
│     MinWagesCompliance, Payslip / PF / ESIC / Leave             │
│     Encashment tabs, RegularisationApprovals                    │
│  → Verify: payslip math (26-day, PF cap 1800, net in words)     │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│  PHASE 5  Procurement + Management                              │
│ 11. Migration set 5: part_master, purchase_requisitions,        │
│     purchase_orders, goods_receipt_notes, inward_invoices,      │
│     three_way_match, mrm_reviews, email_tasks,                  │
│     gmail_inbox_owners, monthly_scores, role_kpis, role_kras    │
│ 12. ManagerHome, PlantHeadHome, OwnerHome                       │
│  → Verify: three-way match flags Exception on mismatch          │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│  PHASE 6  Gate + Security                                       │
│ 13. Migration set 6: qr_tokens, vehicle_log,                    │
│     data_collection_tasks, data_collection_submissions,         │
│     notifications, override_log, employee_sync_log              │
│ 14. SecurityGuardHome: vehicle inward/outward, QR verify,       │
│     casual-worker count for GATE                                │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│  PHASE 7  Automation (Edge Functions, all scheduled via cron)   │
│ 15. expire-comp-off        daily 00:15                          │
│     check-attendance-warns daily 23:30                          │
│     recalculate-scores     nightly 01:00                        │
│     escalate-leaves        hourly                               │
│     escalate-tasks         hourly                               │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│  PHASE 8  Mobile packaging                                      │
│ 16. PWA: manifest.json, icons, guarded service worker           │
│ 17. Publish to production URL                                   │
│ 18. Capacitor wrap (export to GitHub, cap add ios/android)      │
│ 19. Submit to Play Store / App Store                            │
└─────────────────────────────────────────────────────────────────┘
```

## Part B — Detailed setup (do this yourself, one time)

### B1. Create the new Lovable project

1. Go to lovable.dev → New Project → Blank React starter.
2. Name it `varsha-connect`.
3. Open the Cloud tab → **Enable Cloud** (this provisions Supabase).
4. In the chat, paste the **Master Prompt** from the previous plan as your first message.
5. When the AI proposes Migration Set 1, click **Approve** in the migration dialog. Repeat for every migration set (there are 6).

### B2. Seed the employee data (one-time)

After Migration Set 1 is approved:

1. Prepare a CSV of your 313 employees with columns: `emp_code, name, name_hi, phone, role, department, category, dob, doj, basic_salary, hra, special_allowance, uan, esi_number, pf_applicable, esi_applicable, is_active`.
2. Ask the agent: *"Import this CSV into the employees table"* and paste the CSV content or upload the file.
3. Ask the agent to run `handle_new_user` linkage for any employees already in `auth.users`.
4. Verify with: *"Show me a count of employees by role."*

### B3. Configure phone-OTP (real SMS)

Lovable Cloud does not send SMS by default. Two options:

**Option 1 — Twilio (recommended for India)**
1. Create a Twilio account, buy an Indian long-code or DLT-registered sender.
2. Copy Account SID, Auth Token, and Message Service SID.
3. Ask the agent: *"Configure Supabase phone auth with Twilio and store the credentials as secrets."* The agent will call `add_secret` for `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGE_SERVICE_SID` and update auth settings via `configure_auth`.

**Option 2 — MSG91 (cheaper in India)**
1. Ask the agent: *"Switch phone-OTP to MSG91 via a Supabase auth hook edge function."*

Demo role buttons keep working regardless — they never call the SMS provider.

### B4. Turn on Google sign-in (for staff/owner)

1. Go to https://console.cloud.google.com → OAuth consent screen → create Web credentials.
2. Authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback` (the agent will give you the exact URL).
3. Ask the agent: *"Enable Google sign-in with these client id/secret."* It uses `configure_social_auth`.

### B5. Set up cron for the 5 edge functions

Ask the agent: *"Schedule the 5 edge functions using pg_cron"*. Approve the migration. Confirm with `SELECT * FROM cron.job;`.

### B6. Storage bucket

The `maintenance-photos` bucket is created automatically. Verify it is public read, authenticated write. If not, ask the agent to fix its policies.

### B7. Publish + custom domain

1. Click **Publish** in Lovable → note the `.lovable.app` URL.
2. Test all 7 demo logins on your phone browser.
3. In Publish Settings, add your custom domain (e.g. `app.varshaforgings.com`) and follow DNS instructions.

### B8. Install on phone (PWA route — fastest)

- Android Chrome: three-dot menu → **Install app**.
- iPhone Safari: Share → **Add to Home Screen**.
- The app icon, splash, and standalone display come from `manifest.json`.

### B9. Native Capacitor build (App Store / Play Store)

Only do this once PWA is stable. Requires a Mac for iOS.

```bash
# On your local machine
git clone <your-github-mirror-of-the-lovable-project>
cd varsha-connect
npm install
npx cap add android
npx cap add ios          # Mac only
npm run build
npx cap sync
npx cap open android     # or: npx cap open ios
```

- Android: build a signed AAB in Android Studio → upload to Play Console.
- iOS: archive in Xcode → upload via Transporter to App Store Connect.

### B10. Ongoing operations

| Situation | Ask the agent |
|---|---|
| Add a new role | "Add app_role value `quality_inspector` and a QualityHome page." |
| New public holiday | "Insert Diwali 2026 into public_holidays for all departments." |
| Payslip PDF export | "Add a Print/PDF button to PayslipScreen." |
| Push notifications | "Set up Firebase Cloud Messaging with a messaging service worker." |
| Reset comp-off | "Show me any comp_off_balance rows where expiry_date < today AND is_expired=false." |

## Part C — Verification checklist per phase

Before moving to the next phase, confirm:

- **P1**: All 7 demo buttons load their empty home screens without freeze.
- **P2**: Check-in outside geofence writes a `fraud_flags` row. Calendar shows color dots.
- **P3**: Casual worker count row is unique per (supervisor, date, shift). Shift report inserts successfully.
- **P4**: Payslip Net Pay in words matches ₹ amount. PF cap of ₹1800 respected.
- **P5**: Three-way match Exception status triggers Purchase notification.
- **P6**: Vehicle log EOD blocks if any inward vehicle is missing a GRN.
- **P7**: `cron.job` shows 5 jobs. Manually invoke each once via the agent to confirm no errors.
- **P8**: PWA installs to home screen. Capacitor build runs on a real device.

## Part D — Common pitfalls (already burned in previous project)

1. **`is_active = false` employees** break demo login silently — always seed with `true`.
2. **Missing GRANTs** on new public tables return 401 even with RLS off. Every `CREATE TABLE` MUST be followed by `GRANT ... TO authenticated` in the same migration.
3. **`onAuthStateChange` clearing demo user** during role switch → use `isDemoLoginRef` + 500 ms delay + explicit `signOut()` first.
4. **Service worker in Lovable preview** = white screens on refresh. Register only when `import.meta.env.PROD` AND hostname is not a preview domain.
5. **Hardcoded colors** in JSX break dark mode. Use only semantic tokens.
6. **`auth.users` foreign keys** are forbidden. Reference `employees.auth_user_id` instead.

---

This workflow plus the master prompt from the previous plan is everything you need. Say the word and I'll bundle both into a single downloadable `.md` file you can keep alongside the new project.
