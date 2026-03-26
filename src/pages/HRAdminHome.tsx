import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { Calendar, Users, BarChart3, Send, ChevronRight, ChevronLeft, Download, Edit3 } from 'lucide-react';
import { SHIFT_LIST } from '@/lib/constants';
import { useAllEmployees, useTodayAttendanceAll, useWeekShifts, useSalaryMaster } from '@/hooks/useEmployeeData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const HRAdminHome: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const { data: employees } = useAllEmployees();
  const { data: todayAttendance } = useTodayAttendanceAll();

  const presentCount = todayAttendance?.filter(a => a.status === 'P' || a.status === 'LC' || a.status === 'OT').length || 0;
  const absentCount = todayAttendance?.filter(a => a.status === 'A').length || 0;
  const lateCount = todayAttendance?.filter(a => a.status === 'LC').length || 0;
  const leaveCount = todayAttendance?.filter(a => a.status === 'L').length || 0;
  const totalEmp = employees?.length || 0;

  if (activeTab === 'shifts') {
    return <ShiftPlanner lang={lang} user={user} activeTab={activeTab} setActiveTab={setActiveTab} />;
  }

  if (activeTab === 'attendance') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">
              {lang === 'hi' ? 'दैनिक उपस्थिति मास्टर' : 'Daily Attendance Master'}
            </h2>
            <button className="text-xs text-primary font-mono flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-success/10 border border-success/30 rounded-lg p-2">
              <div className="font-display text-lg font-bold text-success">{presentCount}</div>
              <div className="text-[9px] text-muted-foreground">Present</div>
            </div>
            <div className="bg-danger/10 border border-danger/30 rounded-lg p-2">
              <div className="font-display text-lg font-bold text-danger">{absentCount}</div>
              <div className="text-[9px] text-muted-foreground">Absent</div>
            </div>
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-2">
              <div className="font-display text-lg font-bold text-warning">{lateCount}</div>
              <div className="text-[9px] text-muted-foreground">Late</div>
            </div>
            <div className="bg-info/10 border border-info/30 rounded-lg p-2">
              <div className="font-display text-lg font-bold text-info">{leaveCount}</div>
              <div className="text-[9px] text-muted-foreground">Leave</div>
            </div>
          </div>
          <div className="space-y-2">
            {todayAttendance?.map((att: any) => (
              <div key={att.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  att.status === 'P' ? 'bg-success/20 text-success' :
                  att.status === 'A' ? 'bg-danger/20 text-danger' :
                  'bg-warning/20 text-warning'
                }`}>{att.status}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{att.employees?.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{att.employees?.emp_code} · {att.employees?.department}</div>
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                </div>
                <button className="p-1 hover:bg-secondary rounded">
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
            {(!todayAttendance || todayAttendance.length === 0) && (
              <div className="text-center text-sm text-muted-foreground py-8">
                {lang === 'hi' ? 'आज कोई उपस्थिति रिकॉर्ड नहीं' : 'No attendance records today'}
              </div>
            )}
          </div>
        </div>
        <BottomNav role="hr_admin" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'payroll') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold">
            {lang === 'hi' ? 'पेरोल पूर्वावलोकन' : 'Payroll Preview'}
          </h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="font-mono text-[10px] text-primary tracking-wider uppercase mb-2">
              {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }).toUpperCase()}
            </div>
            <div className="font-display text-3xl font-extrabold">₹{((totalEmp * 25000) / 100000).toFixed(1)}L</div>
            <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'कुल अनुमानित पेरोल' : 'Total Estimated Payroll'}</div>
          </div>
          {[
            { cat: 'Staff (VFL1xxx)', count: employees?.filter(e => e.category === 'STAFF').length || 0 },
            { cat: 'Workers (VFL4xxx)', count: employees?.filter(e => e.category === 'WORKER').length || 0 },
            { cat: 'Consultants (CONxx)', count: employees?.filter(e => e.category === 'CONSULTANT').length || 0 },
          ].map((c, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{c.cat}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{c.count} employees</div>
              </div>
            </div>
          ))}
          <button className="w-full py-3 rounded-xl border border-primary text-primary font-display font-bold text-sm touch-target flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            {lang === 'hi' ? 'Google Sheets में निर्यात' : 'Export to Google Sheets'}
          </button>
        </div>
        <BottomNav role="hr_admin" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Home
  const attPct = totalEmp > 0 ? Math.round((presentCount / totalEmp) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="px-4 py-4 space-y-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="font-mono text-[10px] text-primary tracking-[0.2em] uppercase mb-3">
            {lang === 'hi' ? 'HR डैशबोर्ड' : 'HR DASHBOARD'}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="font-display text-2xl font-extrabold text-foreground">{totalEmp}</div>
              <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'कुल कर्मचारी' : 'Total Employees'}</div>
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold text-success">{attPct}%</div>
              <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'आज हाज़िरी' : "Today's Att."}</div>
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold text-warning">{absentCount}</div>
              <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'अनुपस्थित' : 'Absent'}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={() => setActiveTab('shifts')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold flex-1 text-left">{lang === 'hi' ? 'शिफ्ट प्लानर' : 'Shift Planner'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setActiveTab('attendance')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <Users className="w-5 h-5 text-info" />
            <span className="text-sm font-semibold flex-1 text-left">{lang === 'hi' ? 'दैनिक उपस्थिति' : 'Daily Attendance'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setActiveTab('payroll')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <BarChart3 className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold flex-1 text-left">{lang === 'hi' ? 'पेरोल पूर्वावलोकन' : 'Payroll Preview'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <BottomNav role="hr_admin" activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

// Shift Planner Component
const ShiftPlanner: React.FC<{ lang: string; user: any; activeTab: string; setActiveTab: (t: string) => void }> = ({ lang, user, activeTab, setActiveTab }) => {
  const queryClient = useQueryClient();
  const [publishing, setPublishing] = useState(false);

  // Calculate current week start (Monday)
  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return monday.toISOString().split('T')[0];
  };

  const [weekStart, setWeekStart] = useState(getWeekStart);
  const { data: employees } = useAllEmployees();
  const { data: weekShifts } = useWeekShifts(weekStart);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const shiftOptions = ['first', 'second', 'third', 'general', 'day', 'night', 'OFF'] as const;
  const shiftLabels: Record<string, string> = { first: 'S1', second: 'S2', third: 'S3', general: 'G', day: 'D', night: 'N', OFF: 'OFF' };
  const shiftColors: Record<string, string> = {
    first: 'bg-info/20 text-info', second: 'bg-warning/20 text-warning', third: 'bg-[hsl(var(--leave-purple))]/20 text-[hsl(var(--leave-purple))]',
    general: 'bg-success/20 text-success', day: 'bg-primary/20 text-primary', night: 'bg-muted text-muted-foreground', OFF: 'bg-muted/50 text-muted-foreground',
  };

  // Workers/supervisors only
  const shiftEmployees = useMemo(() =>
    employees?.filter(e => e.role === 'worker' || e.role === 'supervisor') || [],
    [employees]
  );

  // Build local shift state from DB data
  const [localShifts, setLocalShifts] = useState<Record<string, Record<string, string>>>({});

  // Initialize from DB
  React.useEffect(() => {
    if (!shiftEmployees.length) return;
    const init: Record<string, Record<string, string>> = {};
    shiftEmployees.forEach(e => {
      init[e.id] = {};
      days.forEach((_, di) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + di);
        const dateStr = date.toISOString().split('T')[0];
        const existing = weekShifts?.find((s: any) => s.employee_id === e.id && s.shift_date === dateStr);
        init[e.id][String(di)] = existing ? existing.shift_type : (di === 6 ? 'OFF' : 'general');
      });
    });
    setLocalShifts(init);
  }, [shiftEmployees, weekShifts, weekStart]);

  const cycleShift = (empId: string, dayIdx: string) => {
    setLocalShifts(prev => {
      const current = prev[empId]?.[dayIdx] || 'general';
      const idx = shiftOptions.indexOf(current as any);
      const next = shiftOptions[(idx + 1) % shiftOptions.length];
      return { ...prev, [empId]: { ...prev[empId], [dayIdx]: next } };
    });
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const upserts: any[] = [];
      Object.entries(localShifts).forEach(([empId, dayShifts]) => {
        Object.entries(dayShifts).forEach(([dayIdx, shiftType]) => {
          if (shiftType === 'OFF') return;
          const date = new Date(weekStart);
          date.setDate(date.getDate() + Number(dayIdx));
          upserts.push({
            employee_id: empId,
            shift_date: date.toISOString().split('T')[0],
            shift_type: shiftType,
            published: true,
            published_at: new Date().toISOString(),
            published_by: user?.employeeId,
          });
        });
      });

      // Delete existing shifts for this week first, then insert
      const endDate = new Date(weekStart);
      endDate.setDate(endDate.getDate() + 6);

      for (const u of upserts) {
        await supabase.from('shifts').upsert(u, { onConflict: 'employee_id,shift_date' });
      }

      toast.success(lang === 'hi' ? 'शिफ्ट प्रकाशित हो गई' : 'Shifts published');
      queryClient.invalidateQueries({ queryKey: ['week_shifts'] });
    } catch (err) {
      toast.error('Failed to publish shifts');
    }
    setPublishing(false);
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekLabel = `${new Date(weekStart).getDate()} ${new Date(weekStart).toLocaleDateString('en', { month: 'short' })} – ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('en', { month: 'short' })}`;

  const navigateWeek = (dir: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dir * 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{lang === 'hi' ? 'शिफ्ट प्लानर' : 'Shift Planner'}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => navigateWeek(-1)} className="p-1 hover:bg-secondary rounded"><ChevronLeft className="w-4 h-4" /></button>
            <span className="font-mono text-xs text-muted-foreground">{weekLabel}</span>
            <button onClick={() => navigateWeek(1)} className="p-1 hover:bg-secondary rounded"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { code: 'first', label: '07:00' }, { code: 'second', label: '15:30' }, { code: 'third', label: '00:00' },
            { code: 'general', label: '09:00' }, { code: 'day', label: 'Day' }, { code: 'night', label: 'Night' },
          ].map(s => (
            <span key={s.code} className={`font-mono text-[9px] px-2 py-0.5 rounded ${shiftColors[s.code]}`}>
              {shiftLabels[s.code]}={s.label}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <div className="min-w-[500px]">
            <div className="grid grid-cols-8 gap-1 mb-1">
              <div className="text-[10px] font-mono text-muted-foreground p-1">Employee</div>
              {days.map(d => (
                <div key={d} className="text-[10px] font-mono text-muted-foreground text-center p-1">{d}</div>
              ))}
            </div>
            {shiftEmployees.map(emp => (
              <div key={emp.id} className="grid grid-cols-8 gap-1 mb-1">
                <div className="text-[10px] p-1 truncate">
                  <div className="font-medium text-foreground">{emp.name.split(' ')[0]}</div>
                  <div className="font-mono text-muted-foreground">{emp.emp_code}</div>
                </div>
                {days.map((_, di) => {
                  const shift = localShifts[emp.id]?.[String(di)] || 'general';
                  return (
                    <button
                      key={di}
                      onClick={() => cycleShift(emp.id, String(di))}
                      className={`text-[10px] font-mono font-bold rounded p-1.5 text-center transition-colors ${shiftColors[shift] || 'bg-muted'}`}
                    >
                      {shiftLabels[shift] || shift}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handlePublish}
          disabled={publishing}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base touch-target flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
          {publishing ? (lang === 'hi' ? 'प्रकाशित हो रहा...' : 'Publishing...') : (lang === 'hi' ? 'शिफ्ट प्रकाशित करें' : 'Publish Shifts')}
        </button>
        <p className="text-center text-[10px] text-muted-foreground font-mono">
          {lang === 'hi' ? 'सभी कर्मचारियों को सूचना भेजी जाएगी' : 'All employees will be notified'}
        </p>
      </div>
      <BottomNav role="hr_admin" activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default HRAdminHome;
