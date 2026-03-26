import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/lib/constants';

interface AuthUser {
  id: string;
  phone: string;
  empCode: string;
  name: string;
  role: UserRole;
  department: string;
  category: string;
  language: 'hi' | 'en';
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  setDemoUser: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  setDemoUser: () => {},
});

// Demo users for each role
const DEMO_USERS: Record<UserRole, AuthUser> = {
  worker: {
    id: 'demo-worker',
    phone: '+919876543210',
    empCode: 'VFL4002',
    name: 'कैलाश धीवर',
    role: 'worker',
    department: 'Cutting Shop',
    category: 'WORKER',
    language: 'hi',
  },
  supervisor: {
    id: 'demo-supervisor',
    phone: '+919876543211',
    empCode: 'VFL4050',
    name: 'Rajesh Kumar',
    role: 'supervisor',
    department: 'Die Shop',
    category: 'WORKER',
    language: 'en',
  },
  manager: {
    id: 'demo-manager',
    phone: '+919876543212',
    empCode: 'VFL1064',
    name: 'Balasaheb Todmal',
    role: 'manager',
    department: 'Heat Treatment',
    category: 'STAFF',
    language: 'en',
  },
  hr_admin: {
    id: 'demo-hr',
    phone: '+919876543213',
    empCode: 'VFL1001',
    name: 'Priya Sharma',
    role: 'hr_admin',
    department: 'HR',
    category: 'STAFF',
    language: 'en',
  },
  owner: {
    id: 'demo-owner',
    phone: '+919876543214',
    empCode: 'VFL0001',
    name: 'Varsha Forgings',
    role: 'owner',
    department: 'Management',
    category: 'STAFF',
    language: 'en',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('vfl-user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, otp: string) => {
    // For now, demo login — will integrate with Supabase OTP
    await new Promise(r => setTimeout(r, 1000));
    const demoUser = DEMO_USERS.worker;
    setUser(demoUser);
    localStorage.setItem('vfl-user', JSON.stringify(demoUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vfl-user');
  };

  const setDemoUser = (role: UserRole) => {
    const u = DEMO_USERS[role];
    setUser(u);
    localStorage.setItem('vfl-user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
