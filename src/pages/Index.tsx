import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './LoginPage';
import WorkerHome from './WorkerHome';
import SupervisorHome from './SupervisorHome';
import ManagerHome from './ManagerHome';
import HRAdminHome from './HRAdminHome';
import OwnerHome from './OwnerHome';

const Index: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-2xl font-extrabold text-gradient-fire mb-2">VFL</div>
          <div className="font-mono text-[10px] text-muted-foreground tracking-[0.3em] uppercase">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  switch (user.role) {
    case 'worker':
      return <WorkerHome />;
    case 'supervisor':
      return <SupervisorHome />;
    case 'manager':
      return <ManagerHome />;
    case 'hr_admin':
      return <HRAdminHome />;
    case 'owner':
      return <OwnerHome />;
    default:
      return <WorkerHome />;
  }
};

export default Index;
