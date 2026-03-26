import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { MapPin, Clock, Camera, Star, Calendar, Award, FileText, Banknote, ChevronRight, CheckCircle2, XCircle, Loader2, X, Wrench, Upload, User, Settings } from 'lucide-react';
import NotificationsPanel from '@/components/NotificationsPanel';
import ProfileScreen from '@/components/ProfileScreen';
import SettingsScreen from '@/components/SettingsScreen';
import DailyChecklist from '@/components/DailyChecklist';
import { getCurrentPosition, isInsideGeofence } from '@/lib/geofence';
import { useMyAttendance, useMyLeaveBalance, useMyScore, useMyShift } from '@/hooks/useEmployeeData';
import { useMyAdvanceBalance } from '@/hooks/useRequestData';
import { useMyTodayObservations } from '@/hooks/useMaintenanceData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SHIFTS } from '@/lib/constants';

const WorkerHome: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('home');
  const [checkingIn, setCheckingIn] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [moreSubTab, setMoreSubTab] = useState<'menu' | 'profile' | 'notifications' | 'settings'>('menu');

  const { data: attendanceRecords } = useMyAttendance(user?.employeeId);
  const { data: leaveBalance } = useMyLeaveBalance(user?.employeeId);
  const { data: score } = useMyScore(user?.employeeId);
  const { data: todayShift } = useMyShift(user?.employeeId);
  const { data: advanceData } = useMyAdvanceBalance(user?.employeeId);
  const { data: todayObservations } = useMyTodayObservations(user?.employeeId);
  const todayObsCount = todayObservations?.length || 0;

  const today = new Date().toISOString().split('T')[0];
  const todayAtt = attendanceRecords?.find(a => a.attendance_date === today);
  const checkedIn = todayAtt?.check_in_time && !todayAtt?.check_out_time;
  const checkedOut = todayAtt?.check_out_time;

  const shiftInfo = todayShift?.shift_type
    ? SHIFTS[todayShift.shift_type.toUpperCase() as keyof typeof SHIFTS]
    : null;

  const handleCheckIn = async () => {
    if (!user?.employeeId) return;
    setCheckingIn(true);
    setLocationError('');
    try {
      const position = await getCurrentPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const inside = isInsideGeofence(lat, lng);

      if (!inside) {
        setLocationError(lang === 'hi' ? '✗ आप प्लांट से बाहर हैं' : '✗ You are outside the plant area');
        setCheckingIn(false);
        return;
      }

      const { error } = await supabase.from('attendance').upsert({
        employee_id: user.employeeId,
        attendance_date: today,
        check_in_time: new Date().toISOString(),
        check_in_lat: lat,
        check_in_lng: lng,
        is_inside_geofence: inside,
        shift_type: todayShift?.shift_type || 'general',
        status: 'P' as any,
        points_earned: 10,
      }, { onConflict: 'employee_id,attendance_date' });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(lang === 'hi' ? '✓ उपस्थित दर्ज हुई' : '✓ Attendance recorded');
        queryClient.invalidateQueries({ queryKey: ['attendance'] });
      }
    } catch (err) {
      setLocationError(lang === 'hi' ? 'कृपया स्थान सेवाएं चालू करें' : 'Please enable location services');
    }
    setCheckingIn(false);
  };

  const handleCheckOut = async () => {
    if (!user?.employeeId) return;
    try {
      const position = await getCurrentPosition();
      const { error } = await supabase.from('attendance').update({
        check_out_time: new Date().toISOString(),
        check_out_lat: position.coords.latitude,
        check_out_lng: position.coords.longitude,
      }).eq('employee_id', user.employeeId).eq('attendance_date', today);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(lang === 'hi' ? '✓ चेक-आउट हो गया' : '✓ Checked out');
        queryClient.invalidateQueries({ queryKey: ['attendance'] });
      }
    } catch {
      await supabase.from('attendance').update({
        check_out_time: new Date().toISOString(),
      }).eq('employee_id', user.employeeId).eq('attendance_date', today);
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    }
  };

  const el = leaveBalance ? Number(leaveBalance.earned_leave) - Number(leaveBalance.el_used) : 0;
  const cl = leaveBalance ? Number(leaveBalance.casual_leave) - Number(leaveBalance.cl_used) : 0;
  const sl = leaveBalance ? Number(leaveBalance.sick_leave) - Number(leaveBalance.sl_used) : 0;
  const compositeScore = score ? Math.round(Number(score.composite_score)) : 0;
  const eotmRank = score?.eotm_rank || '-';

  const presentCount = attendanceRecords?.filter(a => a.status === 'P' || a.status === 'LC').length || 0;
  const absentCount = attendanceRecords?.filter(a => a.status === 'A').length || 0;
  const lateCount = attendanceRecords?.filter(a => a.status === 'LC').length || 0;
  const totalDays = attendanceRecords?.length || 1;
  const attendancePct = Math.round((presentCount / Math.max(totalDays, 1)) * 100);

  const closingBalance = advanceData?.closing_balance ?? 0;

  if (activeTab === 'attendance') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'उपस्थिति कैलेंडर' : 'Attendance Calendar'}
          </h2>
          <AttendanceCalendar lang={lang} records={attendanceRecords || []} />
          <div className="grid grid-cols-3 gap-2">
            <StatCard label={lang === 'hi' ? 'उपस्थित' : 'Present'} value={String(presentCount)} color="text-success" bg="bg-success/10" />
            <StatCard label={lang === 'hi' ? 'अनुपस्थित' : 'Absent'} value={String(absentCount)} color="text-danger" bg="bg-danger/10" />
            <StatCard label={lang === 'hi' ? 'देर से' : 'Late'} value={String(lateCount)} color="text-warning" bg="bg-warning/10" />
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
          <h2 className="font-display text-lg font-bold text-foreground">{lang === 'hi' ? 'मेरा स्कोर' : 'My Score'}</h2>
          <div className="bg-gradient-to-br from-primary/10 to-warning/5 rounded-2xl border border-primary/15 p-6 text-center">
            <div className="font-display text-5xl font-extrabold text-primary mb-2">{compositeScore}</div>
            <div className="text-xs text-muted-foreground tracking-wider uppercase">
              {lang === 'hi' ? 'इस महीने का स्कोर' : 'This Month Score'}
            </div>
          </div>
          <div className="space-y-3">
            <ScoreRow label={lang === 'hi' ? 'उपस्थिति (40%)' : 'Attendance (40%)'} value={Math.round(Number(score?.attendance_score || 0))} max={100} color="bg-success" />
            <ScoreRow label={lang === 'hi' ? 'प्रदर्शन (40%)' : 'Performance (40%)'} value={Math.round(Number(score?.performance_score || 0))} max={100} color="bg-info" />
            <ScoreRow label={lang === 'hi' ? 'अवलोकन (20%)' : 'Observations (20%)'} value={Math.round(Number(score?.observation_score || 0))} max={100} color="bg-primary" />
          </div>
          <div className="bg-gradient-to-r from-warning/10 to-warning/5 rounded-2xl border border-warning/20 p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-warning/15 flex items-center justify-center">
              <Award className="w-6 h-6 text-warning" />
            </div>
            <div>
              <div className="font-display text-sm font-bold text-foreground">EoTM {lang === 'hi' ? 'रैंक' : 'Rank'}: #{eotmRank}</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'टॉप 5 में हैं! बढ़िया!' : 'Keep going!'}</div>
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
          <h2 className="font-display text-lg font-bold text-foreground">{lang === 'hi' ? 'छुट्टी और अग्रिम' : 'Leave & Advance'}</h2>
          {/* Leave Balance Card */}
          <div className="bg-card rounded-xl border border-border card-shadow p-4">
            <div className="text-xs text-muted-foreground tracking-wider uppercase mb-3">
              {lang === 'hi' ? 'छुट्टी शेष' : 'Leave Balance'}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <div className="font-display text-2xl font-bold text-info">{el}</div>
                <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'अर्जित' : 'EL'}</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-warning">{cl}</div>
                <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'आकस्मिक' : 'CL'}</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-danger">{sl}</div>
                <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'बीमारी' : 'SL'}</div>
              </div>
            </div>
            <button
              onClick={() => setShowLeaveForm(true)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target"
            >
              {lang === 'hi' ? 'छुट्टी के लिए आवेदन / Apply for Leave' : 'Apply for Leave / छुट्टी के लिए आवेदन'}
            </button>
          </div>

          {/* Salary Advance Card */}
          <div className="bg-card rounded-xl border border-border card-shadow p-4">
            <div className="text-xs text-muted-foreground tracking-wider uppercase mb-2">
              {lang === 'hi' ? 'बकाया अग्रिम' : 'Outstanding Advance'}
            </div>
            <div className="font-display text-2xl font-bold text-foreground mb-4">₹{closingBalance}</div>
            <button
              onClick={() => setShowAdvanceForm(true)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target"
            >
              {lang === 'hi' ? 'अग्रिम के लिए आवेदन / Apply for Advance' : 'Apply for Advance / अग्रिम के लिए आवेदन'}
            </button>
          </div>
        </div>
        <BottomNav role="worker" activeTab={activeTab} onTabChange={setActiveTab} />

        {showLeaveForm && <LeaveApplicationForm lang={lang} employeeId={user?.employeeId} onClose={() => setShowLeaveForm(false)} />}
        {showAdvanceForm && <AdvanceApplicationForm lang={lang} employeeId={user?.employeeId} onClose={() => setShowAdvanceForm(false)} />}
      </div>
    );
  }

  if (activeTab === 'more') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-3">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">{lang === 'hi' ? 'और विकल्प' : 'More Options'}</h2>
          <QuickAction icon={Star} label={lang === 'hi' ? 'EoTM लीडरबोर्ड' : 'EoTM Leaderboard'} sub={lang === 'hi' ? 'रैंकिंग देखें' : 'View rankings'} />
          <QuickAction icon={Banknote} label={lang === 'hi' ? 'मेरा वेतन' : 'My Pay'} sub={lang === 'hi' ? 'वेतन अनुमान' : 'Salary estimate'} />
          <QuickAction icon={Camera} label={lang === 'hi' ? 'रखरखाव अवलोकन' : 'Maintenance Obs.'} sub={lang === 'hi' ? '+15 अंक' : '+15 points'} />
        </div>
        <BottomNav role="worker" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Home tab
  const checkInTimeStr = todayAtt?.check_in_time
    ? new Date(todayAtt.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="px-4 py-4 space-y-4">
        {/* Greeting */}
        <div>
          <div className="text-xs text-primary font-semibold tracking-[0.15em] uppercase mb-1">
            {(() => { const h = new Date().getHours(); return h < 12 ? (lang === 'hi' ? 'सुप्रभात' : 'Good Morning') : h < 17 ? (lang === 'hi' ? 'नमस्ते' : 'Good Afternoon') : (lang === 'hi' ? 'शुभ संध्या' : 'Good Evening'); })()}, {user?.nameHi || user?.name?.split(' ')[0]}
          </div>
        </div>

        {/* Today's shift info */}
        <div className="bg-gradient-to-r from-primary/8 to-info/5 rounded-2xl border border-primary/15 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-primary tracking-[0.15em] uppercase font-semibold">
              {lang === 'hi' ? 'आज की शिफ्ट' : "TODAY'S SHIFT"}
            </span>
          </div>
          <div className="font-display text-lg font-bold text-foreground">
            {shiftInfo
              ? `${lang === 'hi' ? shiftInfo.label_hi : shiftInfo.label_en} · ${shiftInfo.start} – ${shiftInfo.end}`
              : (lang === 'hi' ? 'कोई शिफ्ट निर्धारित नहीं' : 'No shift assigned')}
          </div>
        </div>

        {/* Check-in / Check-out button */}
        {checkedOut ? (
          <div className="bg-muted border border-border rounded-xl p-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">{lang === 'hi' ? 'आज का दिन पूरा' : "Today's shift complete"}</div>
          </div>
        ) : !checkedIn ? (
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="w-full py-8 rounded-2xl bg-primary text-primary-foreground font-display font-extrabold text-xl transition-all touch-target-xl shadow-lg shadow-primary/25 active:scale-[0.97] disabled:opacity-70"
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
            <div className="bg-success/10 border border-success/30 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
              <div>
                <div className="font-display text-sm font-bold text-success">
                  {lang === 'hi' ? '✓ उपस्थित' : '✓ Present'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lang === 'hi' ? `चेक-इन: ${checkInTimeStr}` : `Checked in: ${checkInTimeStr}`}
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckOut}
              className="w-full py-6 rounded-xl bg-destructive text-destructive-foreground font-display font-extrabold text-lg transition-all touch-target-xl glow-danger active:scale-95"
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
          <div className="bg-card rounded-xl border border-border card-shadow p-4">
            <div className="text-[10px] text-muted-foreground tracking-wider uppercase mb-1">
              {lang === 'hi' ? 'हाज़िरी' : 'Attendance'}
            </div>
            <div className="font-display text-2xl font-extrabold text-success">{attendancePct}%</div>
          </div>
          <div className="bg-card rounded-xl border border-border card-shadow p-4">
            <div className="text-[10px] text-muted-foreground tracking-wider uppercase mb-1">
              {lang === 'hi' ? 'स्कोर' : 'Score'}
            </div>
            <div className="font-display text-2xl font-extrabold text-primary">{compositeScore}</div>
          </div>
        </div>

        {/* Leave Balance Card */}
        <div className="bg-card rounded-xl border border-border card-shadow p-4">
          <div className="text-[10px] text-muted-foreground tracking-wider uppercase mb-3">
            {lang === 'hi' ? 'छुट्टी शेष' : 'Leave Balance'}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="font-display text-xl font-bold text-info">{el}</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'अर्जित' : 'EL'}</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-warning">{cl}</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'आकस्मिक' : 'CL'}</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-danger">{sl}</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'बीमारी' : 'SL'}</div>
            </div>
          </div>
          <button
            onClick={() => setShowLeaveForm(true)}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target"
          >
            {lang === 'hi' ? 'छुट्टी के लिए आवेदन / Apply for Leave' : 'Apply for Leave / छुट्टी के लिए आवेदन'}
          </button>
        </div>

        {/* Salary Advance Card */}
        <div className="bg-card rounded-xl border border-border card-shadow p-4">
          <div className="text-[10px] text-muted-foreground tracking-wider uppercase mb-2">
            {lang === 'hi' ? 'बकाया अग्रिम / Outstanding Advance' : 'Outstanding Advance / बकाया अग्रिम'}
          </div>
          <div className="font-display text-2xl font-bold text-foreground mb-4">₹{closingBalance}</div>
          <button
            onClick={() => setShowAdvanceForm(true)}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target"
          >
            {lang === 'hi' ? 'अग्रिम के लिए आवेदन / Apply for Advance' : 'Apply for Advance / अग्रिम के लिए आवेदन'}
          </button>
        </div>

        {/* Maintenance Observation Card */}
        <div className="bg-card rounded-xl border border-border card-shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-primary" />
            <div className="text-xs font-semibold text-foreground">
              {lang === 'hi' ? 'रखरखाव अवलोकन' : 'Preventive Maintenance'}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {lang === 'hi'
              ? 'क्या आपने आज कोई रखरखाव समस्या देखी? रिपोर्ट करें और 15 अंक कमाएं'
              : 'Did you notice something that needs maintenance today? Report it and earn 15 points toward Employee of the Month'}
          </p>
          {todayObsCount >= 3 ? (
            <div className="text-center text-xs text-warning font-semibold py-2">
              {lang === 'hi' ? 'आज की सीमा पूरी — कल वापस आएं' : "Today's limit reached — come back tomorrow"}
            </div>
          ) : (
            <button
              onClick={() => setShowMaintenanceForm(true)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target"
            >
              {lang === 'hi' ? 'रखरखाव रिपोर्ट करें / Report Maintenance' : 'Report Maintenance / रखरखाव रिपोर्ट करें'}
            </button>
          )}
          {todayObsCount > 0 && (
            <div className="text-xs text-success mt-2 text-center font-semibold">
              {lang === 'hi' ? `आज ${todayObsCount} रिपोर्ट · ${todayObsCount * 15} अंक अर्जित` : `${todayObsCount} report(s) today · ${todayObsCount * 15} points earned`}
            </div>
          )}
        </div>

        {/* EoTM rank */}
        <div className="bg-card rounded-xl border border-border card-shadow p-4 flex items-center gap-3">
          <Award className="w-7 h-7 text-warning" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">EoTM {lang === 'hi' ? 'रैंक' : 'Rank'}</div>
            <div className="text-xs text-muted-foreground">#{eotmRank} {lang === 'hi' ? 'इस महीने' : 'this month'}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <BottomNav role="worker" activeTab={activeTab} onTabChange={setActiveTab} />

      {showLeaveForm && <LeaveApplicationForm lang={lang} employeeId={user?.employeeId} onClose={() => setShowLeaveForm(false)} />}
      {showAdvanceForm && <AdvanceApplicationForm lang={lang} employeeId={user?.employeeId} onClose={() => setShowAdvanceForm(false)} />}
      {showMaintenanceForm && <MaintenanceObservationForm lang={lang} employeeId={user?.employeeId} onClose={() => setShowMaintenanceForm(false)} />}
    </div>
  );
};

// Leave Application Form Modal
const LeaveApplicationForm: React.FC<{ lang: string; employeeId?: string; onClose: () => void }> = ({ lang, employeeId, onClose }) => {
  const [leaveType, setLeaveType] = useState('EL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!employeeId || !fromDate || !toDate) return;
    setSubmitting(true);
    const { error } = await supabase.from('leave_requests').insert({
      employee_id: employeeId,
      leave_type: leaveType,
      from_date: fromDate,
      to_date: toDate,
      reason: reason || null,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === 'hi' ? 'आवेदन भेज दिया गया / Application Submitted' : 'Application Submitted / आवेदन भेज दिया गया');
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center">
      <div className="bg-card w-full max-w-lg rounded-t-2xl border-t border-border p-6 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'छुट्टी आवेदन' : 'Leave Application'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'छुट्टी प्रकार' : 'Leave Type'}</label>
          <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="EL">{lang === 'hi' ? 'अर्जित छुट्टी (EL)' : 'Earned Leave (EL)'}</option>
            <option value="CL">{lang === 'hi' ? 'आकस्मिक छुट्टी (CL)' : 'Casual Leave (CL)'}</option>
            <option value="SL">{lang === 'hi' ? 'बीमारी छुट्टी (SL)' : 'Sick Leave (SL)'}</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'से' : 'From'}</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'तक' : 'To'}</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'कारण (वैकल्पिक)' : 'Reason (optional)'}</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || !fromDate || !toDate}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base touch-target disabled:opacity-50"
        >
          {submitting ? '...' : (lang === 'hi' ? 'आवेदन भेजें' : 'Submit Application')}
        </button>
      </div>
    </div>
  );
};

// Advance Application Form Modal
const AdvanceApplicationForm: React.FC<{ lang: string; employeeId?: string; onClose: () => void }> = ({ lang, employeeId, onClose }) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [repaymentMonths, setRepaymentMonths] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!employeeId || !amount) return;
    setSubmitting(true);
    const { error } = await supabase.from('advance_requests').insert({
      employee_id: employeeId,
      amount_requested: parseInt(amount),
      reason: reason || null,
      repayment_months: repaymentMonths,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === 'hi' ? 'आवेदन भेज दिया गया / Application Submitted' : 'Application Submitted / आवेदन भेज दिया गया');
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center">
      <div className="bg-card w-full max-w-lg rounded-t-2xl border-t border-border p-6 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'अग्रिम आवेदन' : 'Advance Application'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'राशि (₹)' : 'Amount (₹)'}</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="5000" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'कारण' : 'Reason'}</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'चुकौती अवधि' : 'Repayment Period'}</label>
          <select value={repaymentMonths} onChange={e => setRepaymentMonths(Number(e.target.value))} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value={1}>1 {lang === 'hi' ? 'महीना' : 'month'}</option>
            <option value={2}>2 {lang === 'hi' ? 'महीने' : 'months'}</option>
            <option value={3}>3 {lang === 'hi' ? 'महीने' : 'months'}</option>
            <option value={6}>6 {lang === 'hi' ? 'महीने' : 'months'}</option>
          </select>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || !amount}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base touch-target disabled:opacity-50"
        >
          {submitting ? '...' : (lang === 'hi' ? 'आवेदन भेजें' : 'Submit Application')}
        </button>
      </div>
    </div>
  );
};

// Sub-components
const StatCard: React.FC<{ label: string; value: string; color: string; bg?: string }> = ({ label, value, color, bg }) => (
  <div className={`rounded-2xl border border-border card-shadow p-3 text-center ${bg || 'bg-card'}`}>
    <div className={`font-display text-xl font-bold ${color}`}>{value}</div>
    <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
  </div>
);

const ScoreRow: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => (
  <div className="bg-card rounded-2xl border border-border card-shadow p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
  </div>
);

const LeaveCard: React.FC<{ type: string; balance: number; total: number; color: string }> = ({ type, balance, total, color }) => (
  <div className="bg-card rounded-xl border border-border card-shadow p-4 text-center">
    <div className="font-display text-2xl font-bold text-foreground">{balance}</div>
    <div className="text-[10px] text-muted-foreground">/ {total}</div>
    <div className={`h-1 rounded-full mt-2 ${color} opacity-60`} style={{ width: `${(balance / total) * 100}%`, margin: '0 auto' }} />
    <div className="text-xs text-muted-foreground mt-1">{type}</div>
  </div>
);

const QuickAction: React.FC<{ icon: React.ElementType; label: string; sub: string }> = ({ icon: Icon, label, sub }) => (
  <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card card-shadow hover:bg-muted transition-colors">
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1 text-left">
      <div className="text-sm font-semibold text-foreground">{label}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
    <ChevronRight className="w-4 h-4 text-muted-foreground" />
  </button>
);

const AttendanceCalendar: React.FC<{ lang: string; records: any[] }> = ({ lang, records }) => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const statusColors: Record<string, string> = {
    P: 'bg-success text-primary-foreground', A: 'bg-danger text-primary-foreground', L: 'bg-[hsl(var(--leave-purple))] text-primary-foreground',
    LC: 'bg-warning text-primary-foreground', WO: 'bg-muted text-muted-foreground', H: 'bg-warning text-primary-foreground', EC: 'bg-warning text-primary-foreground',
    OT: 'bg-info text-primary-foreground', HO: 'bg-muted text-muted-foreground',
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = records.find(r => r.attendance_date === dateStr);
    return { day, status: record?.status || null };
  });

  return (
    <div className="bg-card rounded-xl border border-border card-shadow p-4">
      <div className="grid grid-cols-7 gap-1.5">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <div key={d} className="text-center text-[10px] text-muted-foreground py-1">{d}</div>
        ))}
        {Array.from({ length: offset }).map((_, i) => <div key={`off-${i}`} />)}
        {days.map(({ day, status }) => (
          <div
            key={day}
            className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${
              status ? (statusColors[status] || 'bg-muted text-muted-foreground') : 'bg-muted/30 text-foreground'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};


// Maintenance Observation Form Modal
const MaintenanceObservationForm: React.FC<{ lang: string; employeeId?: string; onClose: () => void }> = ({ lang, employeeId, onClose }) => {
  const queryClient = useQueryClient();
  const [machineArea, setMachineArea] = useState('');
  const [observationText, setObservationText] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [urgency, setUrgency] = useState('Can wait');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!employeeId || !machineArea || !observationText || !reasonText) return;
    setSubmitting(true);
    let photoUrl: string | null = null;

    if (photoFile) {
      const ext = photoFile.name.split('.').pop();
      const path = `${employeeId}/${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('maintenance-photos')
        .upload(path, photoFile);
      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('maintenance-photos').getPublicUrl(uploadData.path);
        photoUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from('maintenance_observations').insert({
      employee_id: employeeId,
      machine_area: machineArea,
      observation_text: observationText,
      reason_text: reasonText,
      photo_url: photoUrl,
      urgency,
      points_awarded: 15,
    } as any);

    if (error) {
      toast.error(error.message);
    } else {
      // Update monthly observation score
      const now = new Date();
      const { data: existingScore } = await supabase
        .from('monthly_scores')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('month', now.getMonth() + 1)
        .eq('year', now.getFullYear())
        .maybeSingle();

      if (existingScore) {
        await supabase.from('monthly_scores').update({
          observation_score: Number(existingScore.observation_score || 0) + 15,
          composite_score: Number(existingScore.composite_score || 0) + (15 * 0.20),
        }).eq('id', existingScore.id);
      } else {
        await supabase.from('monthly_scores').insert({
          employee_id: employeeId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          observation_score: 15,
          composite_score: 15 * 0.20,
        } as any);
      }

      toast.success(
        lang === 'hi'
          ? 'शाबाश! आपने 15 अंक कमाए — यह आपके EoTM स्कोर में जुड़ गया'
          : 'Well done! You earned 15 points — added to your EoTM score'
      );
      queryClient.invalidateQueries({ queryKey: ['my_observations_today'] });
      queryClient.invalidateQueries({ queryKey: ['monthly_score'] });
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center">
      <div className="bg-card w-full max-w-lg rounded-t-2xl border-t border-border p-6 space-y-4 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'रखरखाव रिपोर्ट' : 'Maintenance Report'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'मशीन या क्षेत्र' : 'Machine or Area'}</label>
          <input type="text" value={machineArea} onChange={e => setMachineArea(e.target.value)} placeholder={lang === 'hi' ? 'जैसे: कटिंग मशीन 3' : 'e.g. Cutting Machine 3'} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'आपने क्या देखा?' : 'What did you observe?'}</label>
          <input type="text" value={observationText} onChange={e => setObservationText(e.target.value)} placeholder={lang === 'hi' ? 'जैसे: असामान्य आवाज, तेल रिसाव' : 'e.g. unusual noise, oil leak'} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'यह ध्यान क्यों देना ज़रूरी है?' : 'Why does this need attention?'}</label>
          <input type="text" value={reasonText} onChange={e => setReasonText(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'फोटो (वैकल्पिक)' : 'Photo (optional)'}</label>
          <label className="flex items-center gap-2 w-full rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground cursor-pointer hover:bg-muted transition-colors">
            <Upload className="w-4 h-4" />
            {photoFile ? photoFile.name : (lang === 'hi' ? 'फोटो चुनें' : 'Choose photo')}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'तात्कालिकता' : 'Urgency'}</label>
          <select value={urgency} onChange={e => setUrgency(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="Can wait">{lang === 'hi' ? 'इंतज़ार कर सकते हैं' : 'Can wait'}</option>
            <option value="Needs attention soon">{lang === 'hi' ? 'जल्द ध्यान चाहिए' : 'Needs attention soon'}</option>
            <option value="Urgent">{lang === 'hi' ? 'तुरंत' : 'Urgent'}</option>
          </select>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || !machineArea || !observationText || !reasonText}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base touch-target disabled:opacity-50"
        >
          {submitting ? '...' : (lang === 'hi' ? 'रिपोर्ट भेजें' : 'Submit Report')}
        </button>
      </div>
    </div>
  );
};

export default WorkerHome;
