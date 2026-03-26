export type Language = 'hi' | 'en';

const translations = {
  // Common
  app_name: { hi: 'वर्षा फोर्जिंग्स', en: 'Varsha Forgings' },
  loading: { hi: 'लोड हो रहा है...', en: 'Loading...' },
  save: { hi: 'सेव करें', en: 'Save' },
  cancel: { hi: 'रद्द करें', en: 'Cancel' },
  submit: { hi: 'जमा करें', en: 'Submit' },
  back: { hi: 'वापस', en: 'Back' },
  close: { hi: 'बंद करें', en: 'Close' },
  yes: { hi: 'हाँ', en: 'Yes' },
  no: { hi: 'नहीं', en: 'No' },
  today: { hi: 'आज', en: 'Today' },
  
  // Login
  login_title: { hi: 'लॉगिन', en: 'Login' },
  phone_number: { hi: 'फ़ोन नंबर', en: 'Phone Number' },
  enter_phone: { hi: 'अपना फ़ोन नंबर डालें', en: 'Enter your phone number' },
  send_otp: { hi: 'OTP भेजें', en: 'Send OTP' },
  enter_otp: { hi: 'OTP डालें', en: 'Enter OTP' },
  verify_otp: { hi: 'OTP सत्यापित करें', en: 'Verify OTP' },
  otp_sent: { hi: 'OTP भेजा गया', en: 'OTP Sent' },
  
  // Worker
  i_have_arrived: { hi: 'मैं पहुँच गया', en: 'I Have Arrived' },
  i_am_done: { hi: 'मैंने काम पूरा किया', en: 'I Am Done' },
  check_in: { hi: 'चेक इन', en: 'Check In' },
  check_out: { hi: 'चेक आउट', en: 'Check Out' },
  present: { hi: 'उपस्थित', en: 'Present' },
  absent: { hi: 'अनुपस्थित', en: 'Absent' },
  late: { hi: 'देर से', en: 'Late' },
  half_day: { hi: 'आधा दिन', en: 'Half Day' },
  on_leave: { hi: 'छुट्टी पर', en: 'On Leave' },
  overtime: { hi: 'ओवरटाइम', en: 'Overtime' },
  
  // Dashboard
  todays_status: { hi: 'आज की स्थिति', en: "Today's Status" },
  attendance_calendar: { hi: 'उपस्थिति कैलेंडर', en: 'Attendance Calendar' },
  leave_balance: { hi: 'छुट्टी शेष', en: 'Leave Balance' },
  earned_leave: { hi: 'अर्जित छुट्टी', en: 'Earned Leave' },
  casual_leave: { hi: 'आकस्मिक छुट्टी', en: 'Casual Leave' },
  sick_leave: { hi: 'बीमारी छुट्टी', en: 'Sick Leave' },
  performance_score: { hi: 'प्रदर्शन स्कोर', en: 'Performance Score' },
  eotm_rank: { hi: 'EoTM रैंक', en: 'EoTM Rank' },
  my_score: { hi: 'मेरा स्कोर', en: 'My Score' },
  apply_leave: { hi: 'छुट्टी के लिए आवेदन', en: 'Apply Leave' },
  apply_advance: { hi: 'अग्रिम के लिए आवेदन', en: 'Apply Advance' },
  
  // Shift types
  general_shift: { hi: 'जनरल शिफ्ट', en: 'General Shift' },
  first_shift: { hi: 'पहली शिफ्ट', en: 'First Shift' },
  second_shift: { hi: 'दूसरी शिफ्ट', en: 'Second Shift' },
  third_shift: { hi: 'तीसरी शिफ्ट', en: 'Third Shift' },
  day_shift: { hi: 'दिन की शिफ्ट', en: 'Day Shift' },
  night_shift: { hi: 'रात की शिफ्ट', en: 'Night Shift' },
  
  // Supervisor
  my_team: { hi: 'मेरी टीम', en: 'My Team' },
  team_attendance: { hi: 'टीम उपस्थिति', en: 'Team Attendance' },
  log_casual_workers: { hi: 'कैज़ुअल वर्कर लॉग', en: 'Log Casual Workers' },
  shift_report: { hi: 'शिफ्ट रिपोर्ट', en: 'Shift Report' },
  fill_report: { hi: 'रिपोर्ट भरें', en: 'Fill Report' },
  
  // Manager
  department_overview: { hi: 'विभाग अवलोकन', en: 'Department Overview' },
  approve_leaves: { hi: 'छुट्टी स्वीकृत करें', en: 'Approve Leaves' },
  approve_advances: { hi: 'अग्रिम स्वीकृत करें', en: 'Approve Advances' },
  kpi_view: { hi: 'KPI दृश्य', en: 'KPI View' },
  eotm_nominations: { hi: 'EoTM नामांकन', en: 'EoTM Nominations' },
  
  // HR
  shift_planner: { hi: 'शिफ्ट प्लानर', en: 'Shift Planner' },
  daily_attendance: { hi: 'दैनिक उपस्थिति', en: 'Daily Attendance' },
  payroll_preview: { hi: 'पेरोल पूर्वावलोकन', en: 'Payroll Preview' },
  export_sheets: { hi: 'शीट्स में निर्यात', en: 'Export to Sheets' },
  publish_shifts: { hi: 'शिफ्ट प्रकाशित करें', en: 'Publish Shifts' },
  manual_override: { hi: 'मैन्युअल ओवरराइड', en: 'Manual Override' },
  employee_master: { hi: 'कर्मचारी मास्टर', en: 'Employee Master' },
  
  // Owner
  morning_dashboard: { hi: 'सुबह का डैशबोर्ड', en: 'Morning Dashboard' },
  workforce_cost: { hi: 'कार्यबल लागत', en: 'Workforce Cost' },
  attendance_health: { hi: 'उपस्थिति स्वास्थ्य', en: 'Attendance Health' },
  satisfaction_score: { hi: 'संतुष्टि स्कोर', en: 'Satisfaction Score' },
  needs_attention: { hi: 'ध्यान देने की ज़रूरत', en: 'Needs Attention' },
  this_month: { hi: 'इस महीने', en: 'This Month' },
  
  // Maintenance
  maintenance_observation: { hi: 'रखरखाव अवलोकन', en: 'Maintenance Observation' },
  add_observation: { hi: 'अवलोकन जोड़ें', en: 'Add Observation' },
  take_photo: { hi: 'फोटो लें', en: 'Take Photo' },
  earn_points: { hi: 'अंक कमाएँ', en: 'Earn Points' },
  
  // Status codes  
  status_p: { hi: 'उ', en: 'P' },
  status_a: { hi: 'अ', en: 'A' },
  status_h: { hi: 'आ', en: 'H' },
  status_lc: { hi: 'दे', en: 'LC' },
  status_ec: { hi: 'जल', en: 'EC' },
  status_ot: { hi: 'ओटी', en: 'OT' },
  
  // Geofence
  checking_location: { hi: 'स्थान जांच रहे हैं...', en: 'Checking location...' },
  inside_geofence: { hi: '✓ आप प्लांट में हैं', en: '✓ You are at the plant' },
  outside_geofence: { hi: '✗ आप प्लांट से बाहर हैं', en: '✗ You are outside the plant' },
  location_error: { hi: 'स्थान त्रुटि', en: 'Location Error' },
  enable_location: { hi: 'कृपया स्थान सेवाएं चालू करें', en: 'Please enable location services' },
  
  // Navigation
  home: { hi: 'होम', en: 'Home' },
  attendance: { hi: 'उपस्थिति', en: 'Attendance' },
  performance: { hi: 'प्रदर्शन', en: 'Performance' },
  leaves: { hi: 'छुट्टियाँ', en: 'Leaves' },
  more: { hi: 'और', en: 'More' },
  profile: { hi: 'प्रोफ़ाइल', en: 'Profile' },
  logout: { hi: 'लॉगआउट', en: 'Logout' },
  
  // Days
  mon: { hi: 'सो', en: 'Mon' },
  tue: { hi: 'मं', en: 'Tue' },
  wed: { hi: 'बु', en: 'Wed' },
  thu: { hi: 'गु', en: 'Thu' },
  fri: { hi: 'शु', en: 'Fri' },
  sat: { hi: 'श', en: 'Sat' },
  sun: { hi: 'र', en: 'Sun' },
  
  // Points
  points: { hi: 'अंक', en: 'Points' },
  bonus_points: { hi: 'बोनस अंक', en: 'Bonus Points' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
  return translations[key]?.[lang] || translations[key]?.['en'] || key;
}

export function detectLanguage(): Language {
  const browserLang = navigator.language?.toLowerCase();
  if (browserLang?.startsWith('hi')) return 'hi';
  return 'hi'; // default Hindi for workers
}

export default translations;
