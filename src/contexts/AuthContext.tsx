import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/constants';
import type { Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  phone: string;
  empCode: string;
  name: string;
  nameHi?: string;
  role: UserRole;
  department: string;
  category: string;
  employeeId: string;
  language: 'hi' | 'en';
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  sendOTP: (phone: string) => Promise<{ error?: string }>;
  verifyOTP: (phone: string, otp: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  setDemoUser: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  sendOTP: async () => ({}),
  verifyOTP: async () => ({}),
  logout: async () => {},
  setDemoUser: () => {},
});

// Demo users for quick testing without real OTP
const DEMO_PHONES: Record<UserRole, string> = {
  worker: '8888516837',
  supervisor: '7719012879',
  manager: '9922725811',
  hr_admin: '7972068310',
  owner: '9823080707',
  plant_head: '9823395533',
  security_guard: '9823080707', // fallback to owner since no security_guard role exists
};

async function fetchEmployeeByPhone(phone: string): Promise<AuthUser | null> {
  const formatted = phone.startsWith('+91') ? phone : `+91${phone}`;
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('phone', formatted)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.auth_user_id || data.id,
    phone: data.phone,
    empCode: data.emp_code,
    name: data.name,
    nameHi: data.name_hi || undefined,
    role: data.role as UserRole,
    department: data.department,
    category: data.category,
    employeeId: data.id,
    language: data.category === 'WORKER' ? 'hi' : 'en',
  };
}

async function fetchEmployeeByAuthId(authUserId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('auth_user_id', authUserId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: authUserId,
    phone: data.phone,
    empCode: data.emp_code,
    name: data.name,
    nameHi: data.name_hi || undefined,
    role: data.role as UserRole,
    department: data.department,
    category: data.category,
    employeeId: data.id,
    language: data.category === 'WORKER' ? 'hi' : 'en',
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const emp = await fetchEmployeeByAuthId(session.user.id);
        if (emp) {
          setUser(emp);
          localStorage.setItem('vfl-user', JSON.stringify(emp));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('vfl-user');
      }
    });

    // Check existing session or local demo user
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const emp = await fetchEmployeeByAuthId(session.user.id);
        if (emp) {
          setUser(emp);
          localStorage.setItem('vfl-user', JSON.stringify(emp));
        }
      } else {
        // Check for demo user in localStorage
        const saved = localStorage.getItem('vfl-user');
        if (saved) {
          try { setUser(JSON.parse(saved)); } catch {}
        }
      }
      setIsLoading(false);
    };
    init();

    return () => subscription.unsubscribe();
  }, []);

  const sendOTP = async (phone: string): Promise<{ error?: string }> => {
    const formatted = phone.startsWith('+91') ? phone : `+91${phone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    if (error) return { error: error.message };
    return {};
  };

  const verifyOTP = async (phone: string, otp: string): Promise<{ error?: string }> => {
    const formatted = phone.startsWith('+91') ? phone : `+91${phone}`;
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: 'sms',
    });
    if (error) return { error: error.message };

    // After verification, employee link happens via trigger
    // But we also need to fetch the employee record
    if (data.user) {
      const emp = await fetchEmployeeByPhone(formatted);
      if (emp) {
        // Update the auth_user_id link if not already set
        await supabase
          .from('employees')
          .update({ auth_user_id: data.user.id })
          .eq('phone', formatted)
          .is('auth_user_id', null);

        setUser({ ...emp, id: data.user.id });
        localStorage.setItem('vfl-user', JSON.stringify({ ...emp, id: data.user.id }));
      } else {
        return { error: 'Employee not found. Contact HR.' };
      }
    }
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('vfl-user');
  };

  const setDemoUser = async (role: UserRole) => {
    const phone = DEMO_PHONES[role];
    const emp = await fetchEmployeeByPhone(phone);
    if (emp) {
      setUser(emp);
      localStorage.setItem('vfl-user', JSON.stringify(emp));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, sendOTP, verifyOTP, logout, setDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
