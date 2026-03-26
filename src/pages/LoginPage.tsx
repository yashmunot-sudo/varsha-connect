import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { UserRole, USER_ROLES } from '@/lib/constants';
import { Phone, Shield, Globe, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import vflLogo from '@/assets/vfl-logo.jpeg';

const LoginPage: React.FC = () => {
  const { sendOTP, verifyOTP, setDemoUser } = useAuth();
  const { lang, setLang } = useLanguage();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'demo'>('demo');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    const { error } = await sendOTP(phone);
    if (error) {
      toast.error(error);
    } else {
      setStep('otp');
      toast.success(lang === 'hi' ? 'OTP भेजा गया' : 'OTP sent');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 4) return;
    setLoading(true);
    const { error } = await verifyOTP(phone, otp);
    if (error) {
      toast.error(error);
    }
    setLoading(false);
  };

  const handleDemoLogin = (role: UserRole) => {
    setDemoUser(role);
  };

  const roleColors: Record<UserRole, string> = {
    worker: 'from-primary/15 to-primary/5 border-primary/20',
    supervisor: 'from-warning/15 to-warning/5 border-warning/20',
    manager: 'from-info/15 to-info/5 border-info/20',
    hr_admin: 'from-success/15 to-success/5 border-success/20',
    owner: 'from-primary/20 to-warning/10 border-primary/20',
    plant_head: 'from-info/20 to-primary/10 border-info/20',
    security_guard: 'from-muted/15 to-muted/5 border-muted/20',
  };

  const roleIconBg: Record<UserRole, string> = {
    worker: 'bg-primary/15',
    supervisor: 'bg-warning/15',
    manager: 'bg-info/15',
    hr_admin: 'bg-success/15',
    owner: 'bg-primary/15',
    plant_head: 'bg-info/15',
    security_guard: 'bg-muted/15',
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero header with warm gradient */}
      <div className="relative bg-gradient-to-b from-primary/8 via-primary/4 to-background">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-warning/5 blur-2xl" />
        </div>
        <div className="relative px-6 pt-12 pb-8 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-10">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary/60" />
              <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-medium">Plant Ops · 2026</span>
            </div>
            <button
              onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground bg-card/80 border border-border/60 hover:bg-card shadow-sm backdrop-blur-sm transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'hi' ? 'English' : 'हिंदी'}
            </button>
          </div>
          <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg border-2 border-card bg-card mb-5">
            <img src={vflLogo} alt="Varsha Forgings" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-foreground text-center leading-tight mb-1.5">
            {lang === 'hi' ? 'वर्षा फोर्जिंग्स' : 'Varsha Forgings'}
          </h1>
          <p className="text-xs text-muted-foreground text-center tracking-wide">
            {lang === 'hi'
              ? 'हाज़िरी · प्रदर्शन · शिफ्ट · पेरोल'
              : 'Attendance · Performance · Shifts · Payroll'}
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 py-5 space-y-5">
        {step === 'demo' && (
          <>
            <button
              onClick={() => setStep('phone')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:from-primary/15 hover:to-primary/10 transition-all shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-foreground">
                  {lang === 'hi' ? 'फ़ोन OTP से लॉगिन' : 'Login with Phone OTP'}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {lang === 'hi' ? 'अपना रजिस्टर्ड नंबर डालें' : 'Enter your registered number'}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-primary/60" />
            </button>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] text-primary font-semibold tracking-[0.2em] uppercase">
                  {lang === 'hi' ? 'डेमो रोल चुनें' : 'Quick Demo Access'}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-2">
                {(Object.entries(USER_ROLES) as [UserRole, typeof USER_ROLES[UserRole]][]).map(([role, info]) => (
                  <button
                    key={role}
                    onClick={() => handleDemoLogin(role)}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-2xl bg-gradient-to-r ${roleColors[role]} border transition-all group hover:shadow-sm active:scale-[0.98]`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${roleIconBg[role]} flex items-center justify-center`}>
                      <span className="text-xl">{info.icon}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {lang === 'hi' ? info.label_hi : info.label_en}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
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
            <button onClick={() => setStep('demo')} className="text-sm text-primary font-medium hover:text-primary/80">
              ← {lang === 'hi' ? 'वापस' : 'Back'}
            </button>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {lang === 'hi' ? 'फ़ोन नंबर' : 'Phone Number'}
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3.5 rounded-xl border border-border bg-muted text-sm text-muted-foreground font-mono">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-3.5 text-lg text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                />
              </div>
            </div>
            <button
              onClick={handleSendOTP}
              disabled={phone.length < 10 || loading}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base disabled:opacity-50 transition-all touch-target hover:brightness-110 shadow-md shadow-primary/20 active:scale-[0.98]"
            >
              {loading ? (lang === 'hi' ? 'भेज रहे हैं...' : 'Sending...') : (lang === 'hi' ? 'OTP भेजें' : 'Send OTP')}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <button onClick={() => setStep('phone')} className="text-sm text-primary font-medium hover:text-primary/80">
              ← {lang === 'hi' ? 'वापस' : 'Back'}
            </button>
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
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
              className="w-full rounded-xl border border-border bg-card px-4 py-4 text-2xl text-center text-foreground font-mono tracking-[0.5em] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            <button
              onClick={handleVerifyOTP}
              disabled={otp.length < 4 || loading}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base disabled:opacity-50 transition-all touch-target hover:brightness-110 shadow-md shadow-primary/20 active:scale-[0.98]"
            >
              {loading ? (lang === 'hi' ? 'सत्यापित हो रहा है...' : 'Verifying...') : (lang === 'hi' ? 'OTP सत्यापित करें' : 'Verify OTP')}
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-border/60">
        <p className="text-center text-[10px] text-muted-foreground/70 tracking-[0.15em] font-medium">
          VARSHA FORGINGS PVT LTD · AURANGABAD
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
