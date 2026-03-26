// Plant geofence coordinates
export const PLANT_GEOFENCE = {
  lat: 19.8383935925407,
  lng: 75.23638998304483,
  radiusMeters: 200,
};

// Shift definitions
export const SHIFTS = {
  GENERAL: { id: 'general', start: '09:00', end: '18:00', label_en: 'General Shift', label_hi: 'जनरल शिफ्ट' },
  FIRST: { id: 'first', start: '07:00', end: '15:30', label_en: 'First Shift', label_hi: 'पहली शिफ्ट' },
  SECOND: { id: 'second', start: '15:30', end: '00:00', label_en: 'Second Shift', label_hi: 'दूसरी शिफ्ट' },
  THIRD: { id: 'third', start: '00:00', end: '07:00', label_en: 'Third Shift', label_hi: 'तीसरी शिफ्ट' },
  DAY: { id: 'day', start: '07:00', end: '19:00', label_en: 'Day Shift', label_hi: 'दिन की शिफ्ट' },
  NIGHT: { id: 'night', start: '19:00', end: '07:00', label_en: 'Night Shift', label_hi: 'रात की शिफ्ट' },
} as const;

export const SHIFT_LIST = Object.values(SHIFTS);

// Attendance status codes
export const ATTENDANCE_STATUS = {
  P: { code: 'P', label_en: 'Present', label_hi: 'उपस्थित', color: '#22c55e' },
  H: { code: 'H', label_en: 'Half Day', label_hi: 'आधा दिन', color: '#f59e0b' },
  LC: { code: 'LC', label_en: 'Late Check-in', label_hi: 'देर से आना', color: '#eab308' },
  EC: { code: 'EC', label_en: 'Early Checkout', label_hi: 'जल्दी जाना', color: '#f97316' },
  OT: { code: 'OT', label_en: 'Overtime', label_hi: 'ओवरटाइम', color: '#3b82f6' },
  A: { code: 'A', label_en: 'Absent', label_hi: 'अनुपस्थित', color: '#ef4444' },
  L: { code: 'L', label_en: 'Leave', label_hi: 'छुट्टी', color: '#8b5cf6' },
  WO: { code: 'WO', label_en: 'Week Off', label_hi: 'साप्ताहिक छुट्टी', color: '#6b7280' },
  HO: { code: 'HO', label_en: 'Holiday', label_hi: 'अवकाश', color: '#06b6d4' },
} as const;

// Scoring system
export const SCORING = {
  PRESENT_ON_TIME: 10,
  LATE_UNDER_30: 5,
  LATE_OVER_30: 2,
  ABSENT_UNANNOUNCED: -5,
  APPROVED_LEAVE: 0,
  PERFECT_MONTH_BONUS: 50,
  MAINTENANCE_OBSERVATION: 15,
  OBSERVATION_ACTIONED: 25,
};

// Score weights for monthly composite
export const SCORE_WEIGHTS = {
  attendance: 0.40,
  performance: 0.40,
  observations: 0.20,
};

// Employee categories
export const EMPLOYEE_CATEGORIES = {
  WORKER: { prefix: 'VFL4', label_en: 'Worker', label_hi: 'कर्मचारी' },
  STAFF: { prefix: 'VFL1', label_en: 'Staff', label_hi: 'स्टाफ' },
  CONSULTANT: { prefix: 'CON', label_en: 'Consultant', label_hi: 'सलाहकार' },
} as const;

// User roles
export type UserRole = 'worker' | 'supervisor' | 'manager' | 'hr_admin' | 'owner' | 'plant_head' | 'security_guard';

export const USER_ROLES: Record<UserRole, { label_en: string; label_hi: string; icon: string }> = {
  worker: { label_en: 'Worker', label_hi: 'कर्मचारी', icon: '👷' },
  supervisor: { label_en: 'Supervisor', label_hi: 'सुपरवाइज़र', icon: '🦺' },
  manager: { label_en: 'Manager', label_hi: 'मैनेजर', icon: '💼' },
  hr_admin: { label_en: 'HR Admin', label_hi: 'HR एडमिन', icon: '📋' },
  owner: { label_en: 'Owner', label_hi: 'मालिक', icon: '🏭' },
  plant_head: { label_en: 'Plant Head', label_hi: 'प्लांट हेड', icon: '🏗️' },
  security_guard: { label_en: 'Security', label_hi: 'सुरक्षा', icon: '🛡️' },
};
