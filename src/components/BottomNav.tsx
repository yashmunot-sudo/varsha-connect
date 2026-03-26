import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Home, Calendar, BarChart3, FileText, Menu, Users, Settings, ClipboardList, TrendingUp, ShoppingCart, Mail } from 'lucide-react';
import { UserRole } from '@/lib/constants';

interface BottomNavProps {
  role: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  badges?: Record<string, number>;
}

const roleNavItems: Record<UserRole, { id: string; icon: React.ElementType; label_hi: string; label_en: string }[]> = {
  worker: [
    { id: 'home', icon: Home, label_hi: 'होम', label_en: 'Home' },
    { id: 'attendance', icon: Calendar, label_hi: 'हाज़िरी', label_en: 'Attendance' },
    { id: 'score', icon: BarChart3, label_hi: 'स्कोर', label_en: 'Score' },
    { id: 'leaves', icon: FileText, label_hi: 'छुट्टी', label_en: 'Leave' },
    { id: 'more', icon: Menu, label_hi: 'और', label_en: 'More' },
  ],
  supervisor: [
    { id: 'home', icon: Home, label_hi: 'होम', label_en: 'Home' },
    { id: 'team', icon: Users, label_hi: 'टीम', label_en: 'Team' },
    { id: 'casual', icon: ClipboardList, label_hi: 'कैज़ुअल', label_en: 'Casual' },
    { id: 'report', icon: FileText, label_hi: 'रिपोर्ट', label_en: 'Report' },
    { id: 'more', icon: Menu, label_hi: 'और', label_en: 'More' },
  ],
  manager: [
    { id: 'home', icon: Home, label_hi: 'होम', label_en: 'Home' },
    { id: 'attendance', icon: Calendar, label_hi: 'हाज़िरी', label_en: 'Attendance' },
    { id: 'kpi', icon: TrendingUp, label_hi: 'KPI', label_en: 'KPI' },
    { id: 'approvals', icon: FileText, label_hi: 'स्वीकृति', label_en: 'Approvals' },
    { id: 'more', icon: Menu, label_hi: 'और', label_en: 'More' },
  ],
  hr_admin: [
    { id: 'home', icon: Home, label_hi: 'होम', label_en: 'Home' },
    { id: 'shifts', icon: Calendar, label_hi: 'शिफ्ट', label_en: 'Shifts' },
    { id: 'attendance', icon: Users, label_hi: 'हाज़िरी', label_en: 'Attendance' },
    { id: 'payroll', icon: BarChart3, label_hi: 'पेरोल', label_en: 'Payroll' },
    { id: 'settings', icon: Settings, label_hi: 'सेटिंग', label_en: 'Settings' },
  ],
  owner: [
    { id: 'home', icon: Home, label_hi: 'होम', label_en: 'Home' },
    { id: 'costs', icon: BarChart3, label_hi: 'लागत', label_en: 'Costs' },
    { id: 'people', icon: Users, label_hi: 'लोग', label_en: 'People' },
    { id: 'more', icon: Menu, label_hi: 'और', label_en: 'More' },
  ],
  plant_head: [
    { id: 'home', icon: Home, label_hi: 'होम', label_en: 'Home' },
    { id: 'departments', icon: Users, label_hi: 'विभाग', label_en: 'Depts' },
    { id: 'tasks', icon: ClipboardList, label_hi: 'कार्य', label_en: 'Tasks' },
    { id: 'approvals', icon: FileText, label_hi: 'स्वीकृति', label_en: 'Approvals' },
    { id: 'more', icon: Menu, label_hi: 'और', label_en: 'More' },
  ],
  security_guard: [
    { id: 'home', icon: Home, label_hi: 'होम', label_en: 'Home' },
    { id: 'vehicles', icon: ClipboardList, label_hi: 'वाहन', label_en: 'Vehicles' },
    { id: 'more', icon: Menu, label_hi: 'और', label_en: 'More' },
  ],
};

const BottomNav: React.FC<BottomNavProps> = ({ role, activeTab, onTabChange, badges = {} }) => {
  const { lang } = useLanguage();
  const items = roleNavItems[role] || roleNavItems.worker;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-card/98 backdrop-blur-md safe-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = badges[item.id];
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all touch-target ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                {badge && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-destructive text-destructive-foreground text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {lang === 'hi' ? item.label_hi : item.label_en}
              </span>
              {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
