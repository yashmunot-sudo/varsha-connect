import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Globe, LogOut } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';

const TopBar: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleInfo = USER_ROLES[user.role];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{roleInfo.icon}</span>
          <div>
            <div className="font-display text-sm font-bold leading-tight text-foreground">
              {lang === 'hi' ? 'वर्षा फोर्जिंग्स' : 'Varsha Forgings'}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
              {user.empCode} · {lang === 'hi' ? roleInfo.label_hi : roleInfo.label_en}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-mono text-muted-foreground border border-border hover:bg-secondary transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'hi' ? 'EN' : 'हि'}
          </button>
          <button
            onClick={logout}
            className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
