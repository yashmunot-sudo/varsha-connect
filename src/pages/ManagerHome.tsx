import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { BarChart3, Users, FileCheck, Award, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useAllEmployees, useTodayAttendanceAll, useAllScores } from '@/hooks/useEmployeeData';

const ManagerHome: React.FC = () => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');
  const { data: employees } = useAllEmployees();
  const { data: todayAttendance } = useTodayAttendanceAll();
  const { data: scores } = useAllScores();

  const presentCount = todayAttendance?.filter(a => a.status === 'P' || a.status === 'LC' || a.status === 'OT').length || 0;
  const absentCount = (employees?.length || 0) - presentCount;
  const totalEmp = employees?.length || 1;
  const attPct = Math.round((presentCount / Math.max(totalEmp, 1)) * 100);
  const avgScore = scores?.length ? Math.round(scores.reduce((s: number, x: any) => s + Number(x.composite_score), 0) / scores.length) : 0;

  // Group by department
  const departments = employees ? [...new Set(employees.map(e => e.department))] : [];
  const deptStats = departments.map(dept => {
    const deptEmps = employees!.filter(e => e.department === dept);
    const deptPresent = todayAttendance?.filter(a => {
      const emp = employees!.find(e => e.id === a.employee_id);
      return emp?.department === dept && (a.status === 'P' || a.status === 'LC');
    }).length || 0;
    return { dept, present: deptPresent, total: deptEmps.length, pct: Math.round((deptPresent / Math.max(deptEmps.length, 1)) * 100) };
  });

  if (activeTab === 'attendance') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold">{lang === 'hi' ? 'विभाग उपस्थिति' : 'Department Attendance'}</h2>
          {deptStats.map((d) => (
            <div key={d.dept} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{d.dept}</span>
                <span className={`font-mono text-sm font-bold ${d.pct >= 95 ? 'text-success' : d.pct >= 85 ? 'text-warning' : 'text-danger'}`}>{d.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${d.pct >= 95 ? 'bg-success' : d.pct >= 85 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${d.pct}%` }} />
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1">{d.present}/{d.total} {lang === 'hi' ? 'उपस्थित' : 'present'}</div>
            </div>
          ))}
        </div>
        <BottomNav role="manager" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'kpi') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold">{lang === 'hi' ? 'KPI दृश्य' : 'KPI View'}</h2>
          {[
            { label: 'Avg Attendance', value: `${attPct}%` },
            { label: 'Avg Score', value: String(avgScore) },
            { label: 'Absent Today', value: String(absentCount) },
            { label: 'Late Today', value: String(todayAttendance?.filter(a => a.status === 'LC').length || 0) },
          ].map((k, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="font-display text-xl font-bold">{k.value}</div>
              </div>
            </div>
          ))}
        </div>
        <BottomNav role="manager" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'approvals') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold">{lang === 'hi' ? 'लंबित स्वीकृतियाँ' : 'Pending Approvals'}</h2>
          <div className="text-center text-sm text-muted-foreground py-8">
            {lang === 'hi' ? 'कोई लंबित स्वीकृति नहीं' : 'No pending approvals'}
          </div>
        </div>
        <BottomNav role="manager" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Home
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="px-4 py-4 space-y-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="font-mono text-[10px] text-primary tracking-[0.2em] uppercase mb-3">{lang === 'hi' ? 'आज का अवलोकन' : "TODAY'S OVERVIEW"}</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-display text-3xl font-extrabold text-success">{presentCount}</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'उपस्थित' : 'Present'}</div>
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-danger">{absentCount}</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'अनुपस्थित' : 'Absent'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="font-display text-2xl font-bold text-info">{attPct}%</div>
            <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'औसत हाज़िरी' : 'Avg Attendance'}</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="font-display text-2xl font-bold text-primary">{avgScore}</div>
            <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'औसत स्कोर' : 'Avg Score'}</div>
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={() => setActiveTab('attendance')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <BarChart3 className="w-5 h-5 text-info" />
            <span className="text-sm font-semibold flex-1 text-left">{lang === 'hi' ? 'विभाग उपस्थिति' : 'Dept. Attendance'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setActiveTab('approvals')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <FileCheck className="w-5 h-5 text-warning" />
            <span className="text-sm font-semibold flex-1 text-left">{lang === 'hi' ? 'स्वीकृतियाँ' : 'Approvals'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setActiveTab('kpi')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <TrendingUp className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold flex-1 text-left">KPI</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <Award className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold flex-1 text-left">{lang === 'hi' ? 'EoTM नामांकन' : 'EoTM Nominations'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <BottomNav role="manager" activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default ManagerHome;
