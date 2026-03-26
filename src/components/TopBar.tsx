import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Globe, LogOut, Bell } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';
import { useUnreadCount } from '@/components/NotificationsPanel';
import vflLogo from '@/assets/vfl-logo.jpeg';

const TopBar: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const { user, logout } = useAuth();
  const { data: unread } = useUnreadCount(user?.employeeId);

  if (!user) return null;

  const roleInfo = USER_ROLES[user.role];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-card/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-border/60 shadow-sm bg-card">
            <img src={vflLogo} alt="Varsha Forgings" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight text-muted-foreground">
              Varsha Forgings
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-primary font-semibold">{user.empCode}</span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-muted-foreground">{lang === 'hi' ? roleInfo.label_hi : roleInfo.label_en}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="relative rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors">
            <Bell className="w-4 h-4" />
            {unread && unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          <button
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] text-muted-foreground border border-border/60 hover:bg-muted transition-colors font-medium"
          >
            <Globe className="w-3 h-3" />
            {lang === 'hi' ? 'EN' : 'हि'}
          </button>
          <button
            onClick={logout}
            className="rounded-full p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
