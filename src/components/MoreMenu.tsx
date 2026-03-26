import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { User, Bell, Award, Settings, ChevronRight, Shield } from 'lucide-react';
import ProfileScreen from './ProfileScreen';
import NotificationsPanel from './NotificationsPanel';
import SettingsScreen from './SettingsScreen';
import LeaderboardPanel from './LeaderboardPanel';
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
  const [subTab, setSubTab] = useState<'menu' | 'profile' | 'notifications' | 'leaderboard' | 'settings'>('menu');

  const items = [
    { id: 'profile' as const, icon: User, label_hi: 'मेरी प्रोफ़ाइल', label_en: 'My Profile', sub_hi: 'व्यक्तिगत जानकारी', sub_en: 'Personal info' },
    { id: 'notifications' as const, icon: Bell, label_hi: 'सूचनाएं', label_en: 'Notifications', sub_hi: 'अपडेट देखें', sub_en: 'View updates' },
    { id: 'leaderboard' as const, icon: Award, label_hi: 'EoTM लीडरबोर्ड', label_en: 'Leaderboard', sub_hi: 'रैंकिंग देखें', sub_en: 'View rankings' },
    { id: 'settings' as const, icon: Settings, label_hi: 'सेटिंग्स', label_en: 'Settings', sub_hi: 'भाषा, सहायता', sub_en: 'Language, help' },
  ];

  const renderContent = () => {
    switch (subTab) {
      case 'profile': return <ProfileScreen lang={lang} />;
      case 'notifications': return <NotificationsPanel lang={lang} employeeId={user?.employeeId} />;
      case 'leaderboard': return <LeaderboardPanel lang={lang} currentEmployeeId={user?.employeeId} />;
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
          {lang === 'hi' ? 'और विकल्प' : 'More Options'}
        </h2>
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => setSubTab(item.id)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card card-shadow hover:bg-muted/50 transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <item.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold text-foreground">{lang === 'hi' ? item.label_hi : item.label_en}</div>
              <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? item.sub_hi : item.sub_en}</div>
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
