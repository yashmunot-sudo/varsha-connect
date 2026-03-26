import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMyAdvanceBalance(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['advance_balance', employeeId],
    enabled: !!employeeId,
    queryFn: async () => {
      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const { data, error } = await supabase
        .from('salary_advances')
        .select('*')
        .eq('employee_id', employeeId!)
        .eq('year', now.getFullYear())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function usePendingLeaveRequests() {
  return useQuery({
    queryKey: ['pending_leave_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*, employees(name, emp_code, department)')
        .eq('status', 'Pending')
        .order('applied_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function usePendingAdvanceRequests() {
  return useQuery({
    queryKey: ['pending_advance_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advance_requests')
        .select('*, employees(name, emp_code, department)')
        .eq('status', 'Pending')
        .order('applied_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAllSalaryAdvances() {
  return useQuery({
    queryKey: ['all_salary_advances'],
    queryFn: async () => {
      const now = new Date();
      const { data, error } = await supabase
        .from('salary_advances')
        .select('*, employees(name, emp_code)')
        .eq('year', now.getFullYear())
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
