import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { MapPin, Clock, Camera, Star, Calendar, Award, FileText, Banknote, ChevronRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getCurrentPosition, isInsideGeofence } from '@/lib/geofence';

const WorkerHome: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [checkInTime, setCheckInTime] = useState('');

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setLocationError('');
    try {
      const position = await getCurrentPosition();
      const inside = isInsideGeofence(position.coords.latitude, position.coords.longitude);
      if (inside) {
        setCheckedIn(true);
        setCheckInTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      } else {
        setLocationError(lang === 'hi' ? '✗ आप प्लांट से बाहर हैं' : '✗ You are outside the plant area');
      }
    } catch (err) {
      setLocationError(lang === 'hi' ? 'कृपया स्थान सेवाएं चालू करें' : 'Please enable location services');
    }
    setCheckingIn(false);
  };

  const handleCheckOut = () => {
    setCheckedIn(false);
    setCheckInTime('');
  };

  // Mock data
  const leaveBalance = { el: 12, cl: 5, sl: 7 };
  const score = 85;
  const eotmRank = 3;
  const attendancePct = 96;

  if (activeTab === 'attendance') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold">
            {lang === 'hi' ? 'उपस्थिति कैलेंडर' : 'Attendance Calendar'}
          </h2>
          <AttendanceCalendar lang={lang} />
          <div className="grid grid-cols-3 gap-2">
            <StatCard label={lang === 'hi' ? 'उपस्थित' : 'Present'} value="24" color="text-success" />
            <StatCard label={lang === 'hi' ? 'अनुपस्थित' : 'Absent'} value="1" color="text-danger" />
            <StatCard label={lang === 'hi' ? 'देर से' : 'Late'} value="2" color="text-warning" />
          </div>
        </div>
        <BottomNav role="worker" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'score') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold">
            {lang === 'hi' ? 'मेरा स्कोर' : 'My Score'}
          </h2>
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <div className="font-display text-5xl font-extrabold text-primary mb-2">{score}</div>
            <div className="font-mono text-xs text-muted-foreground tracking-wider uppercase">
              {lang === 'hi' ? 'इस महीने का स्कोर' : 'This Month Score'}
            </div>
          </div>
          <div className="space-y-3">
            <ScoreRow label={lang === 'hi' ? 'उपस्थिति (40%)' : 'Attendance (40%)'} value={92} max={100} color="bg-success" />
            <ScoreRow label={lang === 'hi' ? 'प्रदर्शन (40%)' : 'Performance (40%)'} value={78} max={100} color="bg-info" />
            <ScoreRow label={lang === 'hi' ? 'अवलोकन (20%)' : 'Observations (20%)'} value={85} max={100} color="bg-primary" />
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <Award className="w-8 h-8 text-warning" />
            <div>
              <div className="font-display text-sm font-bold">
                EoTM {lang === 'hi' ? 'रैंक' : 'Rank'}: #{eotmRank}
              </div>
              <div className="text-xs text-muted-foreground">
                {lang === 'hi' ? 'टॉप 5 में हैं! बढ़िया!' : 'In Top 5! Great work!'}
              </div>
            </div>
          </div>
        </div>
        <BottomNav role="worker" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'leaves') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold">
            {lang === 'hi' ? 'छुट्टी शेष' : 'Leave Balance'}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <LeaveCard type={lang === 'hi' ? 'अर्जित' : 'EL'} balance={leaveBalance.el} total={20} color="bg-info" />
            <LeaveCard type={lang === 'hi' ? 'आकस्मिक' : 'CL'} balance={leaveBalance.cl} total={7} color="bg-warning" />
            <LeaveCard type={lang === 'hi' ? 'बीमारी' : 'SL'} balance={leaveBalance.sl} total={7} color="bg-danger" />
          </div>
          <QuickAction
            icon={FileText}
            label={lang === 'hi' ? 'छुट्टी के लिए आवेदन' : 'Apply Leave'}
            sub={lang === 'hi' ? 'Google Form खुलेगा' : 'Opens Google Form'}
          />
          <QuickAction
            icon={Banknote}
            label={lang === 'hi' ? 'अग्रिम के लिए आवेदन' : 'Apply Advance'}
            sub={lang === 'hi' ? 'Google Form खुलेगा' : 'Opens Google Form'}
          />
        </div>
        <BottomNav role="worker" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'more') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-3">
          <h2 className="font-display text-lg font-bold mb-4">
            {lang === 'hi' ? 'और विकल्प' : 'More Options'}
          </h2>
          <QuickAction icon={Star} label={lang === 'hi' ? 'EoTM लीडरबोर्ड' : 'EoTM Leaderboard'} sub={lang === 'hi' ? 'रैंकिंग देखें' : 'View rankings'} />
          <QuickAction icon={Banknote} label={lang === 'hi' ? 'मेरा वेतन' : 'My Pay'} sub={lang === 'hi' ? 'वेतन अनुमान' : 'Salary estimate'} />
          <QuickAction icon={Camera} label={lang === 'hi' ? 'रखरखाव अवलोकन' : 'Maintenance Obs.'} sub={lang === 'hi' ? '+15 अंक' : '+15 points'} />
        </div>
        <BottomNav role="worker" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Home tab
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="px-4 py-4 space-y-4">
        {/* Today's shift info */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-mono text-[10px] text-primary tracking-[0.2em] uppercase">
              {lang === 'hi' ? 'आज की शिफ्ट' : "TODAY'S SHIFT"}
            </span>
          </div>
          <div className="font-display text-lg font-bold">
            {lang === 'hi' ? 'पहली शिफ्ट' : 'First Shift'} · 07:00 – 15:30
          </div>
        </div>

        {/* Check-in / Check-out button */}
        {!checkedIn ? (
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="w-full py-8 rounded-2xl bg-accent text-accent-foreground font-display font-extrabold text-xl transition-all touch-target-xl animate-pulse-glow active:scale-95 disabled:animate-none disabled:opacity-70"
          >
            {checkingIn ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                {lang === 'hi' ? 'स्थान जांच...' : 'Checking location...'}
              </span>
            ) : (
              <span className="flex flex-col items-center gap-1">
                <MapPin className="w-8 h-8 mb-1" />
                <span>{lang === 'hi' ? 'मैं पहुँच गया' : 'I Have Arrived'}</span>
                <span className="text-sm font-normal opacity-80">
                  {lang === 'hi' ? 'I Have Arrived' : 'मैं पहुँच गया'}
                </span>
              </span>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0" />
              <div>
                <div className="font-display text-sm font-bold text-accent">
                  {lang === 'hi' ? '✓ उपस्थित' : '✓ Present'}
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {lang === 'hi' ? `चेक-इन: ${checkInTime}` : `Checked in: ${checkInTime}`}
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckOut}
              className="w-full py-6 rounded-2xl bg-destructive text-destructive-foreground font-display font-extrabold text-lg transition-all touch-target-xl animate-pulse-danger active:scale-95"
            >
              <span className="flex flex-col items-center gap-1">
                <span>{lang === 'hi' ? 'मैंने काम पूरा किया' : 'I Am Done'}</span>
                <span className="text-sm font-normal opacity-80">
                  {lang === 'hi' ? 'I Am Done' : 'मैंने काम पूरा किया'}
                </span>
              </span>
            </button>
          </div>
        )}

        {locationError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <span className="text-sm text-destructive">{locationError}</span>
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-1">
              {lang === 'hi' ? 'हाज़िरी' : 'Attendance'}
            </div>
            <div className="font-display text-2xl font-extrabold text-accent">{attendancePct}%</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-1">
              {lang === 'hi' ? 'स्कोर' : 'Score'}
            </div>
            <div className="font-display text-2xl font-extrabold text-primary">{score}</div>
          </div>
        </div>

        {/* Leave balance */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-3">
            {lang === 'hi' ? 'छुट्टी शेष' : 'Leave Balance'}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-display text-xl font-bold text-info">{leaveBalance.el}</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'अर्जित' : 'EL'}</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-warning">{leaveBalance.cl}</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'आकस्मिक' : 'CL'}</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-danger">{leaveBalance.sl}</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'बीमारी' : 'SL'}</div>
            </div>
          </div>
        </div>

        {/* EoTM rank */}
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <Award className="w-7 h-7 text-warning" />
          <div className="flex-1">
            <div className="text-sm font-semibold">EoTM {lang === 'hi' ? 'रैंक' : 'Rank'}</div>
            <div className="text-xs text-muted-foreground">
              #{eotmRank} {lang === 'hi' ? 'इस महीने' : 'this month'}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <BottomNav role="worker" activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

// Sub-components
const StatCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="bg-card rounded-xl border border-border p-3 text-center">
    <div className={`font-display text-xl font-bold ${color}`}>{value}</div>
    <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
  </div>
);

const ScoreRow: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => (
  <div className="bg-card rounded-xl border border-border p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-bold">{value}</span>
    </div>
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
  </div>
);

const LeaveCard: React.FC<{ type: string; balance: number; total: number; color: string }> = ({ type, balance, total, color }) => (
  <div className="bg-card rounded-xl border border-border p-4 text-center">
    <div className="font-display text-2xl font-bold">{balance}</div>
    <div className="text-[10px] text-muted-foreground">/ {total}</div>
    <div className={`h-1 rounded-full mt-2 ${color} opacity-60`} style={{ width: `${(balance / total) * 100}%`, margin: '0 auto' }} />
    <div className="text-xs text-muted-foreground mt-1">{type}</div>
  </div>
);

const QuickAction: React.FC<{ icon: React.ElementType; label: string; sub: string }> = ({ icon: Icon, label, sub }) => (
  <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1 text-left">
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
    <ChevronRight className="w-4 h-4 text-muted-foreground" />
  </button>
);

const AttendanceCalendar: React.FC<{ lang: string }> = ({ lang }) => {
  const days = Array.from({ length: 30 }, (_, i) => {
    const statuses = ['P', 'P', 'P', 'P', 'P', 'WO', 'P', 'L', 'P', 'P', 'P', 'P', 'WO', 'P', 'P', 'P', 'LC', 'P', 'P', 'WO', 'P', 'P', 'P', 'P', 'A', 'P', 'WO', 'P', 'P', 'P'];
    return { day: i + 1, status: statuses[i] };
  });

  const statusColors: Record<string, string> = {
    P: 'bg-success',
    A: 'bg-danger',
    L: 'bg-[hsl(var(--leave-purple))]',
    LC: 'bg-warning',
    WO: 'bg-muted',
    H: 'bg-warning',
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="grid grid-cols-7 gap-1.5">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <div key={d} className="text-center text-[10px] font-mono text-muted-foreground py-1">{d}</div>
        ))}
        {/* offset for month start */}
        <div />
        {days.map(({ day, status }) => (
          <div
            key={day}
            className={`aspect-square rounded-md flex items-center justify-center text-xs font-mono ${
              statusColors[status] || 'bg-muted'
            } ${status === 'P' || status === 'LC' ? 'text-primary-foreground' : status === 'A' ? 'text-destructive-foreground' : 'text-foreground'}`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerHome;
