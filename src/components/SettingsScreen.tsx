import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Globe, LogOut, Bell, Shield, HelpCircle, ChevronRight, Smartphone } from 'lucide-react';

const SettingsScreen: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const { logout } = useAuth();

  const items = [
    {
      icon: Globe,
      label: lang === 'hi' ? 'भाषा / Language' : 'Language / भाषा',
      sub: lang === 'hi' ? 'हिंदी' : 'English',
      action: () => setLang(lang === 'hi' ? 'en' : 'hi'),
      color: 'bg-info/10',
      iconColor: 'text-info',
    },
    {
      icon: Bell,
      label: lang === 'hi' ? 'सूचनाएं' : 'Notifications',
      sub: lang === 'hi' ? 'चालू' : 'Enabled',
      color: 'bg-warning/10',
      iconColor: 'text-warning',
    },
    {
      icon: Smartphone,
      label: lang === 'hi' ? 'ऐप इनस्टॉल करें' : 'Install App',
      sub: lang === 'hi' ? 'होम स्क्रीन पर जोड़ें' : 'Add to Home Screen',
      color: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      icon: Shield,
      label: lang === 'hi' ? 'गोपनीयता' : 'Privacy',
      sub: lang === 'hi' ? 'डेटा सुरक्षा' : 'Data protection',
      color: 'bg-success/10',
      iconColor: 'text-success',
    },
    {
      icon: HelpCircle,
      label: lang === 'hi' ? 'सहायता' : 'Help & Support',
      sub: lang === 'hi' ? 'HR से संपर्क करें' : 'Contact HR',
      color: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold text-foreground">
        {lang === 'hi' ? 'सेटिंग्स' : 'Settings'}
      </h2>

      <div className="bg-card rounded-2xl border border-border card-shadow divide-y divide-border">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors"
          >
            <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center`}>
              <item.icon className={`w-4.5 h-4.5 ${item.iconColor}`} />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold text-foreground">{item.label}</div>
              <div className="text-[10px] text-muted-foreground">{item.sub}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <button
        onClick={logout}
        className="w-full py-3.5 rounded-2xl border-2 border-destructive/30 text-destructive font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-destructive/5 transition-colors active:scale-[0.98]"
      >
        <LogOut className="w-4 h-4" />
        {lang === 'hi' ? 'लॉगआउट / Logout' : 'Logout / लॉगआउट'}
      </button>

      <div className="text-center text-[10px] text-muted-foreground/60 mt-4">
        Varsha Forgings Plant Ops v1.0 · 2026
      </div>
    </div>
  );
};

export default SettingsScreen;
