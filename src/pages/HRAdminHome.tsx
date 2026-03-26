import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { Calendar, Users, BarChart3, Send, ChevronRight, ChevronLeft, Download, Edit3, Check } from 'lucide-react';
import { SHIFT_LIST } from '@/lib/constants';

const HRAdminHome: React.FC = () => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');

  if (activeTab === 'shifts') {
    return <ShiftPlanner lang={lang} activeTab={activeTab} setActiveTab={setActiveTab} />;
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
              <div className="font-display text-lg font-bold text-success">38</div>
              <div className="text-[9px] text-muted-foreground">Present</div>
            </div>
            <div className="bg-danger/10 border border-danger/30 rounded-lg p-2">
              <div className="font-display text-lg font-bold text-danger">4</div>
              <div className="text-[9px] text-muted-foreground">Absent</div>
            </div>
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-2">
              <div className="font-display text-lg font-bold text-warning">3</div>
              <div className="text-[9px] text-muted-foreground">Late</div>
            </div>
            <div className="bg-info/10 border border-info/30 rounded-lg p-2">
              <div className="font-display text-lg font-bold text-info">2</div>
              <div className="text-[9px] text-muted-foreground">Leave</div>
            </div>
          </div>
          {/* Employee list */}
          <div className="space-y-2">
            {[
              { name: 'Kailash Dhiwar', code: 'VFL4002', status: 'P', time: '06:52', shift: 'Shift 1' },
              { name: 'Dilip Dhalpe', code: 'VFL4006', status: 'P', time: '06:58', shift: 'Shift 1' },
              { name: 'Hanumant S.', code: 'VFL4007', status: 'LC', time: '07:28', shift: 'Shift 1' },
              { name: 'Santosh Patil', code: 'VFL4010', status: 'A', time: '-', shift: 'Shift 1' },
              { name: 'Balasaheb T.', code: 'VFL1064', status: 'P', time: '08:55', shift: 'General' },
            ].map((e) => (
              <div key={e.code} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  e.status === 'P' ? 'bg-success/20 text-success' : 
                  e.status === 'A' ? 'bg-danger/20 text-danger' : 
                  'bg-warning/20 text-warning'
                }`}>{e.status}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{e.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{e.code} · {e.shift}</div>
                </div>
                <div className="font-mono text-xs text-muted-foreground">{e.time}</div>
                <button className="p-1 hover:bg-secondary rounded">
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
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
            <div className="font-mono text-[10px] text-primary tracking-wider uppercase mb-2">MARCH 2026</div>
            <div className="font-display text-3xl font-extrabold">₹31.2L</div>
            <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'कुल अनुमानित पेरोल' : 'Total Estimated Payroll'}</div>
          </div>
          {[
            { cat: 'Staff (VFL1xxx)', count: 98, amount: '₹19.2L' },
            { cat: 'Workers (VFL4xxx)', count: 34, amount: '₹9.8L' },
            { cat: 'Consultants (CONxx)', count: 10, amount: '₹2.2L' },
          ].map((c, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{c.cat}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{c.count} employees</div>
              </div>
              <div className="font-mono text-sm font-bold text-accent">{c.amount}</div>
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
              <div className="font-display text-2xl font-extrabold text-foreground">142</div>
              <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'कुल कर्मचारी' : 'Total Employees'}</div>
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold text-success">91%</div>
              <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'आज हाज़िरी' : "Today's Att."}</div>
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold text-warning">5</div>
              <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'लंबित' : 'Pending'}</div>
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
const ShiftPlanner: React.FC<{ lang: string; activeTab: string; setActiveTab: (t: string) => void }> = ({ lang, activeTab, setActiveTab }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const employees = [
    { code: 'VFL4002', name: 'Kailash D.' },
    { code: 'VFL4006', name: 'Dilip D.' },
    { code: 'VFL4007', name: 'Hanumant S.' },
    { code: 'VFL4010', name: 'Santosh P.' },
    { code: 'VFL4015', name: 'Manoj J.' },
    { code: 'VFL4018', name: 'Ravi G.' },
  ];

  const [shifts, setShifts] = useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {};
    employees.forEach(e => {
      init[e.code] = {};
      days.forEach(d => { init[e.code][d] = d === 'Sun' ? 'OFF' : 'S1'; });
    });
    return init;
  });

  const shiftOptions = ['S1', 'S2', 'S3', 'G', 'D', 'N', 'OFF'];
  const shiftColors: Record<string, string> = {
    S1: 'bg-info/20 text-info',
    S2: 'bg-warning/20 text-warning',
    S3: 'bg-[hsl(var(--leave-purple))]/20 text-[hsl(var(--leave-purple))]',
    G: 'bg-success/20 text-success',
    D: 'bg-primary/20 text-primary',
    N: 'bg-muted text-muted-foreground',
    OFF: 'bg-muted/50 text-muted-foreground',
  };

  const cycleShift = (empCode: string, day: string) => {
    setShifts(prev => {
      const current = prev[empCode][day];
      const idx = shiftOptions.indexOf(current);
      const next = shiftOptions[(idx + 1) % shiftOptions.length];
      return { ...prev, [empCode]: { ...prev[empCode], [day]: next } };
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">
            {lang === 'hi' ? 'शिफ्ट प्लानर' : 'Shift Planner'}
          </h2>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-secondary rounded"><ChevronLeft className="w-4 h-4" /></button>
            <span className="font-mono text-xs text-muted-foreground">31 Mar – 6 Apr</span>
            <button className="p-1 hover:bg-secondary rounded"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {[
            { code: 'S1', label: '07:00' },
            { code: 'S2', label: '15:30' },
            { code: 'S3', label: '00:00' },
            { code: 'G', label: '09:00' },
            { code: 'D', label: 'Day' },
            { code: 'N', label: 'Night' },
          ].map(s => (
            <span key={s.code} className={`font-mono text-[9px] px-2 py-0.5 rounded ${shiftColors[s.code]}`}>
              {s.code}={s.label}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="min-w-[500px]">
            {/* Header row */}
            <div className="grid grid-cols-8 gap-1 mb-1">
              <div className="text-[10px] font-mono text-muted-foreground p-1">Employee</div>
              {days.map(d => (
                <div key={d} className="text-[10px] font-mono text-muted-foreground text-center p-1">{d}</div>
              ))}
            </div>
            {/* Employee rows */}
            {employees.map(emp => (
              <div key={emp.code} className="grid grid-cols-8 gap-1 mb-1">
                <div className="text-[10px] p-1 truncate">
                  <div className="font-medium text-foreground">{emp.name}</div>
                  <div className="font-mono text-muted-foreground">{emp.code}</div>
                </div>
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => cycleShift(emp.code, day)}
                    className={`text-[10px] font-mono font-bold rounded p-1.5 text-center transition-colors ${shiftColors[shifts[emp.code][day]]}`}
                  >
                    {shifts[emp.code][day]}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Publish button */}
        <button className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base touch-target flex items-center justify-center gap-2">
          <Send className="w-5 h-5" />
          {lang === 'hi' ? 'शिफ्ट प्रकाशित करें' : 'Publish Shifts'}
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
