import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMyAttendance(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['attendance', employeeId],
    enabled: !!employeeId,
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId!)
        .gte('attendance_date', startOfMonth.toISOString().split('T')[0])
        .order('attendance_date');
      if (error) throw error;
      return data;
    },
  });
}

export function useMyLeaveBalance(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['leave_balance', employeeId],
    enabled: !!employeeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('employee_id', employeeId!)
        .eq('year', new Date().getFullYear())
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMyScore(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['monthly_score', employeeId],
    enabled: !!employeeId,
    queryFn: async () => {
      const now = new Date();
      const { data, error } = await supabase
        .from('monthly_scores')
        .select('*')
        .eq('employee_id', employeeId!)
        .eq('month', now.getMonth() + 1)
        .eq('year', now.getFullYear())
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMyShift(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['today_shift', employeeId],
    enabled: !!employeeId,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('employee_id', employeeId!)
        .eq('shift_date', today)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useAllEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('emp_code');
      if (error) throw error;
      return data;
    },
  });
}

export function useTodayAttendanceAll() {
  return useQuery({
    queryKey: ['today_attendance_all'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance')
        .select('*, employees(name, emp_code, department)')
        .eq('attendance_date', today);
      if (error) throw error;
      return data;
    },
  });
}

export function useWeekShifts(weekStart: string) {
  return useQuery({
    queryKey: ['week_shifts', weekStart],
    queryFn: async () => {
      const end = new Date(weekStart);
      end.setDate(end.getDate() + 6);
      const { data, error } = await supabase
        .from('shifts')
        .select('*, employees(name, emp_code, department)')
        .gte('shift_date', weekStart)
        .lte('shift_date', end.toISOString().split('T')[0])
        .order('shift_date');
      if (error) throw error;
      return data;
    },
  });
}

export function useTeamAttendance(department: string | undefined) {
  return useQuery({
    queryKey: ['team_attendance', department],
    enabled: !!department,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data: employees } = await supabase
        .from('employees')
        .select('id, name, name_hi, emp_code, department')
        .eq('department', department!)
        .eq('is_active', true);

      if (!employees) return [];

      const empIds = employees.map(e => e.id);
      const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('attendance_date', today)
        .in('employee_id', empIds);

      return employees.map(emp => {
        const att = attendance?.find(a => a.employee_id === emp.id);
        return {
          ...emp,
          status: att?.status || null,
          checkInTime: att?.check_in_time || null,
        };
      });
    },
  });
}

export function useAllScores() {
  return useQuery({
    queryKey: ['all_scores'],
    queryFn: async () => {
      const now = new Date();
      const { data, error } = await supabase
        .from('monthly_scores')
        .select('*, employees(name, emp_code, department)')
        .eq('month', now.getMonth() + 1)
        .eq('year', now.getFullYear())
        .order('composite_score', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAllLeaveBalances() {
  return useQuery({
    queryKey: ['all_leave_balances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*, employees(name, emp_code)')
        .eq('year', new Date().getFullYear());
      if (error) throw error;
      return data;
    },
  });
}

export function useSalaryMaster() {
  return useQuery({
    queryKey: ['salary_master'],
    queryFn: async () => {
      const now = new Date();
      const { data, error } = await supabase
        .from('salary_master')
        .select('*, employees(name, emp_code, category, department)')
        .eq('month', now.getMonth() + 1)
        .eq('year', now.getFullYear());
      if (error) throw error;
      return data;
    },
  });
}

export function useTodayCasualWorkers() {
  return useQuery({
    queryKey: ['casual_workers_today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('casual_workers')
        .select('*')
        .eq('work_date', today)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
