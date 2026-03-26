import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { UserRole, USER_ROLES } from '@/lib/constants';
import { Phone, Shield, Globe, ChevronRight } from 'lucide-react';
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with logo */}
      <div className="relative overflow-hidden">
        <div className="relative px-6 pt-12 pb-8 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-8">
            <span className="text-[10px] text-muted-foreground tracking-[0.25em] uppercase">Plant Ops · 2026</span>
            <button
              onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground border border-border hover:bg-muted transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'hi' ? 'English' : 'हिंदी'}
            </button>
          </div>
          <img src={vflLogo} alt="Varsha Forgings" className="w-24 h-24 rounded-2xl object-contain mb-4" />
          <h1 className="font-display text-2xl font-extrabold text-foreground text-center leading-tight mb-1">
            {lang === 'hi' ? 'वर्षा फोर्जिंग्स' : 'Varsha Forgings'}
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            {lang === 'hi'
              ? 'हाज़िरी · प्रदर्शन · शिफ्ट · पेरोल'
              : 'Attendance · Performance · Shifts · Payroll'}
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6">
        {step === 'demo' && (
          <>
            <button
              onClick={() => setStep('phone')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card card-shadow hover:bg-muted transition-colors"
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

            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] text-primary font-semibold tracking-[0.2em] uppercase">
                  {lang === 'hi' ? 'डेमो रोल चुनें' : 'Select Demo Role'}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-2">
                {(Object.entries(USER_ROLES) as [UserRole, typeof USER_ROLES[UserRole]][]).map(([role, info]) => (
                  <button
                    key={role}
                    onClick={() => handleDemoLogin(role)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card card-shadow hover:border-primary/50 hover:bg-muted transition-all group"
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
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
            <button onClick={() => setStep('demo')} className="text-sm text-muted-foreground hover:text-foreground">
              ← {lang === 'hi' ? 'वापस' : 'Back'}
            </button>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {lang === 'hi' ? 'फ़ोन नंबर' : 'Phone Number'}
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 rounded-xl border border-border bg-muted text-sm text-muted-foreground">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <button
              onClick={handleSendOTP}
              disabled={phone.length < 10 || loading}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base disabled:opacity-50 transition-all touch-target hover:brightness-110"
            >
              {loading ? (lang === 'hi' ? 'भेज रहे हैं...' : 'Sending...') : (lang === 'hi' ? 'OTP भेजें' : 'Send OTP')}
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
              className="w-full rounded-xl border border-border bg-card px-4 py-4 text-2xl text-center text-foreground tracking-[0.5em] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleVerifyOTP}
              disabled={otp.length < 4 || loading}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base disabled:opacity-50 transition-all touch-target hover:brightness-110"
            >
              {loading ? (lang === 'hi' ? 'सत्यापित हो रहा है...' : 'Verifying...') : (lang === 'hi' ? 'OTP सत्यापित करें' : 'Verify OTP')}
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-border">
        <p className="text-center text-[10px] text-muted-foreground tracking-wider">
          VARSHA FORGINGS PVT LTD · AURANGABAD
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
