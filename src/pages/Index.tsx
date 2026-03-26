import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './LoginPage';
import WorkerHome from './WorkerHome';
import SupervisorHome from './SupervisorHome';
import ManagerHome from './ManagerHome';
import HRAdminHome from './HRAdminHome';
import OwnerHome from './OwnerHome';
import PlantHeadHome from './PlantHeadHome';
import SecurityGuardHome from './SecurityGuardHome';
import MissingDataBanner from '@/components/MissingDataBanner';
import vflLogo from '@/assets/vfl-logo.jpeg';

const Index: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-border mx-auto mb-4">
            <img src={vflLogo} alt="VFL" className="w-full h-full object-contain" />
          </div>
          <div className="text-sm font-bold text-foreground mb-1">Varsha Forgings</div>
          <div className="flex items-center gap-1.5 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderHome = () => {
    switch (user.role) {
      case 'worker': return <WorkerHome />;
      case 'supervisor': return <SupervisorHome />;
      case 'manager': return <ManagerHome />;
      case 'hr_admin': return <HRAdminHome />;
      case 'owner': return <OwnerHome />;
      case 'plant_head': return <PlantHeadHome />;
      case 'security_guard': return <SecurityGuardHome />;
      default: return <WorkerHome />;
    }
  };

  return (
    <>
      <MissingDataBanner />
      {renderHome()}
    </>
  );
};

export default Index;
