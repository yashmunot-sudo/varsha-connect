import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/lib/constants';
import { User, Phone, Building2, Briefcase, Hash, MapPin, Calendar, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProfileScreenProps {
  lang: string;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ lang }) => {
  const { user } = useAuth();

  const { data: emp } = useQuery({
    queryKey: ['employee_profile', user?.employeeId],
    enabled: !!user?.employeeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', user!.employeeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (!user) return null;

  const roleInfo = USER_ROLES[user.role];
  const fields = [
    { icon: Hash, label: lang === 'hi' ? 'कर्मचारी कोड' : 'Employee Code', value: emp?.emp_code || user.empCode },
    { icon: Phone, label: lang === 'hi' ? 'फ़ोन' : 'Phone', value: emp?.phone || user.phone },
    { icon: Building2, label: lang === 'hi' ? 'विभाग' : 'Department', value: emp?.department || user.department },
    { icon: Briefcase, label: lang === 'hi' ? 'पदनाम' : 'Designation', value: emp?.designation || '-' },
    { icon: Shield, label: lang === 'hi' ? 'भूमिका' : 'Role', value: lang === 'hi' ? roleInfo.label_hi : roleInfo.label_en },
    { icon: Calendar, label: lang === 'hi' ? 'ज्वाइनिंग तारीख' : 'Date of Joining', value: emp?.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString('en-IN') : '-' },
    { icon: MapPin, label: lang === 'hi' ? 'पता' : 'Address', value: emp?.address || '-' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/15 p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-display text-xl font-extrabold text-foreground">
          {lang === 'hi' && emp?.name_hi ? emp.name_hi : (emp?.name || user.name)}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {emp?.emp_code || user.empCode} · {emp?.category || user.category}
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border card-shadow divide-y divide-border">
        {fields.map((f, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <f.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.label}</div>
              <div className="text-sm font-medium text-foreground truncate">{f.value}</div>
            </div>
          </div>
        ))}
      </div>

      {emp?.blood_group && (
        <div className="bg-danger/5 rounded-2xl border border-danger/15 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
            <span className="text-lg font-bold text-danger">🩸</span>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {lang === 'hi' ? 'रक्त समूह' : 'Blood Group'}
            </div>
            <div className="text-lg font-bold text-danger">{emp.blood_group}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;
