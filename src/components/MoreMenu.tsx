import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { User, Bell, Award, Settings, ChevronRight, FileText, Users, ClipboardList, Wrench } from 'lucide-react';
import ProfileScreen from './ProfileScreen';
import NotificationsPanel from './NotificationsPanel';
import SettingsScreen from './SettingsScreen';
import LeaderboardPanel from './LeaderboardPanel';
import PayslipScreen from './PayslipScreen';
import EmployeeRecordsScreen from './EmployeeRecordsScreen';
import TaskDelegationScreen from './TaskDelegationScreen';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { UserRole } from '@/lib/constants';

interface MoreMenuProps {
  role: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  badges?: Record<string, number>;
}

const MoreMenu: React.FC<MoreMenuProps> = ({ role, activeTab, onTabChange, badges }) => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [subTab, setSubTab] = useState<string>('menu');

  const isManager = ['manager', 'hr_admin', 'owner', 'plant_head', 'supervisor'].includes(role);
  const isHR = role === 'hr_admin';
  const isOwnerOrHR = role === 'owner' || role === 'hr_admin';

  const items: { id: string; icon: React.ElementType; label_hi: string; label_en: string; sub_hi: string; sub_en: string; show: boolean }[] = [
    { id: 'profile', icon: User, label_hi: 'मेरी प्रोफ़ाइल', label_en: 'My Profile', sub_hi: 'व्यक्तिगत जानकारी', sub_en: 'Personal info', show: true },
    { id: 'notifications', icon: Bell, label_hi: 'सूचनाएं', label_en: 'Notifications', sub_hi: 'अपडेट देखें', sub_en: 'View updates', show: true },
    { id: 'payslip', icon: FileText, label_hi: 'पेस्लिप', label_en: 'Payslip', sub_hi: 'वेतन पर्ची देखें', sub_en: 'View salary slip', show: true },
    { id: 'tasks', icon: ClipboardList, label_hi: 'कार्य', label_en: 'Tasks', sub_hi: 'कार्य प्रबंधन', sub_en: 'Task management', show: true },
    { id: 'leaderboard', icon: Award, label_hi: 'EoTM लीडरबोर्ड', label_en: 'Leaderboard', sub_hi: 'रैंकिंग देखें', sub_en: 'View rankings', show: true },
    { id: 'employee_records', icon: Users, label_hi: 'कर्मचारी रिकॉर्ड', label_en: 'Employee Records', sub_hi: 'कर्मचारी प्रबंधन', sub_en: 'Manage employees', show: isOwnerOrHR },
    { id: 'settings', icon: Settings, label_hi: 'सेटिंग्स', label_en: 'Settings', sub_hi: 'भाषा, सहायता', sub_en: 'Language, help', show: true },
  ];

  const visibleItems = items.filter(i => i.show);

  const renderContent = () => {
    switch (subTab) {
      case 'profile': return <ProfileScreen lang={lang} />;
      case 'notifications': return <NotificationsPanel lang={lang} employeeId={user?.employeeId} />;
      case 'leaderboard': return <LeaderboardPanel lang={lang} currentEmployeeId={user?.employeeId} />;
      case 'payslip': return <PayslipScreen lang={lang} employeeId={user?.employeeId} isHR={isHR} />;
      case 'tasks': return <TaskDelegationScreen lang={lang} />;
      case 'employee_records': return <EmployeeRecordsScreen lang={lang} isOwner={role === 'owner'} />;
      case 'settings': return <SettingsScreen />;
      default: return null;
    }
  };

  if (subTab !== 'menu') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4">
          <button onClick={() => setSubTab('menu')} className="text-sm text-primary font-medium mb-3">
            ← {lang === 'hi' ? 'वापस' : 'Back'}
          </button>
          {renderContent()}
        </div>
        <BottomNav role={role} activeTab={activeTab} onTabChange={onTabChange} badges={badges} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="px-4 py-4 space-y-2">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">
          {lang === 'hi' ? 'और विकल्प / More' : 'More / और विकल्प'}
        </h2>
        {visibleItems.map(item => (
          <button
            key={item.id}
            onClick={() => setSubTab(item.id)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card card-shadow hover:bg-muted/50 transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <item.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold text-foreground">
                {lang === 'hi' ? `${item.label_hi} / ${item.label_en}` : `${item.label_en} / ${item.label_hi}`}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {lang === 'hi' ? `${item.sub_hi} / ${item.sub_en}` : `${item.sub_en} / ${item.sub_hi}`}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>
      <BottomNav role={role} activeTab={activeTab} onTabChange={onTabChange} badges={badges} />
    </div>
  );
};

export default MoreMenu;
