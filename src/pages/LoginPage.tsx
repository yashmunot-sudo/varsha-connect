import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { UserRole, USER_ROLES } from '@/lib/constants';
import { Phone, Shield, Globe, ChevronRight } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, setDemoUser } = useAuth();
  const { lang, setLang } = useLanguage();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'demo'>('demo');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setStep('otp');
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 4) return;
    setLoading(true);
    await login(phone, otp);
    setLoading(false);
  };

  const handleDemoLogin = (role: UserRole) => {
    setDemoUser(role);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative px-6 pt-12 pb-8">
          <div className="flex items-center justify-between mb-8">
            <span className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase">Plant Ops · 2026</span>
            <button
              onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono text-muted-foreground border border-border hover:bg-secondary transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'hi' ? 'English' : 'हिंदी'}
            </button>
          </div>
          <h1 className="font-display text-3xl font-extrabold leading-none mb-2">
            <span className="text-muted-foreground">{lang === 'hi' ? 'एक ऐप।' : 'One App.'}</span><br />
            <span className="text-gradient-fire">{lang === 'hi' ? 'वर्षा फोर्जिंग्स' : 'Varsha Forgings'}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            {lang === 'hi'
              ? 'हाज़िरी · प्रदर्शन · शिफ्ट · पेरोल'
              : 'Attendance · Performance · Shifts · Payroll'}
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6">
        {step === 'demo' && (
          <>
            {/* Phone login option */}
            <button
              onClick={() => setStep('phone')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold text-foreground">
                  {lang === 'hi' ? 'फ़ोन OTP से लॉगिन' : 'Login with Phone OTP'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lang === 'hi' ? 'अपना रजिस्टर्ड नंबर डालें' : 'Enter your registered number'}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Demo role selector */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] text-primary tracking-[0.2em] uppercase">
                  {lang === 'hi' ? 'डेमो रोल चुनें' : 'Select Demo Role'}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-2">
                {(Object.entries(USER_ROLES) as [UserRole, typeof USER_ROLES[UserRole]][]).map(([role, info]) => (
                  <button
                    key={role}
                    onClick={() => handleDemoLogin(role)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-secondary transition-all group"
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {lang === 'hi' ? info.label_hi : info.label_en}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                        {role.replace('_', ' ')}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 'phone' && (
          <div className="space-y-4">
            <button onClick={() => setStep('demo')} className="text-sm text-muted-foreground hover:text-foreground">
              ← {lang === 'hi' ? 'वापस' : 'Back'}
            </button>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {lang === 'hi' ? 'फ़ोन नंबर' : 'Phone Number'}
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 rounded-lg border border-border bg-muted text-sm font-mono text-muted-foreground">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-lg font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <button
              onClick={handleSendOTP}
              disabled={phone.length < 10 || loading}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base disabled:opacity-50 transition-all touch-target hover:brightness-110"
            >
              {loading
                ? (lang === 'hi' ? 'भेज रहे हैं...' : 'Sending...')
                : (lang === 'hi' ? 'OTP भेजें' : 'Send OTP')}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <button onClick={() => setStep('phone')} className="text-sm text-muted-foreground hover:text-foreground">
              ← {lang === 'hi' ? 'वापस' : 'Back'}
            </button>
            <div className="text-center py-4">
              <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {lang === 'hi' ? `+91 ${phone} पर OTP भेजा गया` : `OTP sent to +91 ${phone}`}
              </p>
            </div>
            <input
              type="tel"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="● ● ● ● ● ●"
              className="w-full rounded-lg border border-border bg-card px-4 py-4 text-2xl font-mono text-center text-foreground tracking-[0.5em] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleVerifyOTP}
              disabled={otp.length < 4 || loading}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base disabled:opacity-50 transition-all touch-target hover:brightness-110"
            >
              {loading
                ? (lang === 'hi' ? 'सत्यापित हो रहा है...' : 'Verifying...')
                : (lang === 'hi' ? 'OTP सत्यापित करें' : 'Verify OTP')}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-center font-mono text-[10px] text-muted-foreground tracking-wider">
          VARSHA FORGINGS PVT LTD · AURANGABAD
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
