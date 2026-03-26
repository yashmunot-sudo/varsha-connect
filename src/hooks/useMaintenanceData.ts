import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMyTodayObservations(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['my_observations_today', employeeId],
    enabled: !!employeeId,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('maintenance_observations')
        .select('*')
        .eq('employee_id', employeeId!)
        .gte('submitted_at', `${today}T00:00:00`)
        .lte('submitted_at', `${today}T23:59:59`);
      if (error) throw error;
      return data;
    },
  });
}

export function useAllMaintenanceObservations() {
  return useQuery({
    queryKey: ['all_maintenance_observations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_observations')
        .select('*, employees(name, emp_code, department)')
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
