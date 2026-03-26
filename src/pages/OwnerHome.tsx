import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { TrendingUp, TrendingDown, Users, AlertTriangle, Award, IndianRupee, Heart, ChevronRight } from 'lucide-react';
import { useAllEmployees, useTodayAttendanceAll, useAllScores } from '@/hooks/useEmployeeData';

const OwnerHome: React.FC = () => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');
  const { data: employees } = useAllEmployees();
  const { data: todayAttendance } = useTodayAttendanceAll();
  const { data: scores } = useAllScores();

  const totalEmp = employees?.length || 0;
  const presentCount = todayAttendance?.filter(a => a.status === 'P' || a.status === 'LC' || a.status === 'OT').length || 0;
  const attPct = totalEmp > 0 ? Math.round((presentCount / totalEmp) * 100) : 0;
  const avgScore = scores?.length ? Math.round(scores.reduce((s: number, x: any) => s + Number(x.composite_score), 0) / scores.length) : 0;
  const topScorer = scores?.[0];

  // Estimate payroll from employee data
  const totalPayroll = employees?.reduce((sum, e) => sum + Number(e.base_salary || 0) + Number(e.hra || 0), 0) || 0;
  const payrollLakhs = (totalPayroll / 100000).toFixed(1);

  if (activeTab === 'costs') {
    const staffCost = employees?.filter(e => e.category === 'STAFF').reduce((s, e) => s + Number(e.base_salary || 0) + Number(e.hra || 0), 0) || 0;
    const workerCost = employees?.filter(e => e.category === 'WORKER').reduce((s, e) => s + Number(e.base_salary || 0) + Number(e.hra || 0), 0) || 0;
    const consultCost = employees?.filter(e => e.category === 'CONSULTANT').reduce((s, e) => s + Number(e.base_salary || 0) + Number(e.hra || 0), 0) || 0;

    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold">{lang === 'hi' ? 'कार्यबल लागत' : 'Workforce Costs'}</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="font-display text-3xl font-extrabold mb-1">₹{payrollLakhs}L</div>
            <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'मासिक पेरोल' : 'Monthly Payroll'}</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-3">{lang === 'hi' ? 'श्रेणी अनुसार विभाजन' : 'BY CATEGORY'}</div>
            {[
              { label: 'Staff', amount: `₹${(staffCost / 100000).toFixed(1)}L`, pct: totalPayroll > 0 ? Math.round((staffCost / totalPayroll) * 100) : 0, color: 'bg-info' },
              { label: 'Workers', amount: `₹${(workerCost / 100000).toFixed(1)}L`, pct: totalPayroll > 0 ? Math.round((workerCost / totalPayroll) * 100) : 0, color: 'bg-success' },
              { label: 'Consultants', amount: `₹${(consultCost / 100000).toFixed(1)}L`, pct: totalPayroll > 0 ? Math.round((consultCost / totalPayroll) * 100) : 0, color: 'bg-[hsl(var(--leave-purple))]' },
            ].map((c, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">{c.label}</span>
                  <span className="font-mono text-xs font-bold">{c.amount}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <BottomNav role="owner" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'people') {
    // Show low scorers
    const lowScorers = scores?.filter((s: any) => Number(s.composite_score) < 60).slice(0, 5) || [];
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold">{lang === 'hi' ? 'ध्यान देने की ज़रूरत' : 'Needs Attention'}</h2>
          {lowScorers.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">{lang === 'hi' ? 'सब ठीक है!' : 'All good!'}</div>
          )}
          {lowScorers.map((p: any) => (
            <div key={p.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-warning" />
              <div>
                <div className="text-sm font-semibold">{p.employees?.name}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{p.employees?.emp_code}</div>
                <div className="text-xs text-muted-foreground mt-1">Score: {Math.round(Number(p.composite_score))}</div>
              </div>
            </div>
          ))}
        </div>
        <BottomNav role="owner" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Home — Morning Dashboard
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="px-4 py-4 space-y-4">
        <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase">
          {lang === 'hi' ? 'सुबह का डैशबोर्ड' : 'MORNING DASHBOARD'}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">{lang === 'hi' ? 'इस महीने कार्यबल लागत' : 'Workforce Cost This Month'}</span>
          </div>
          <div className="font-display text-4xl font-extrabold text-gradient-fire">₹{payrollLakhs}L</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-success" />
              <span className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'हाज़िरी स्वास्थ्य' : 'Attendance Health'}</span>
            </div>
            <div className="font-display text-3xl font-extrabold text-success">{attPct}%</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'औसत स्कोर' : 'Avg Score'}</span>
            </div>
            <div className="font-display text-3xl font-extrabold text-primary">{avgScore}</div>
          </div>
        </div>

        {topScorer && (
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <Award className="w-8 h-8 text-warning" />
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">EoTM {lang === 'hi' ? 'इस महीने' : 'This Month'}</div>
              <div className="font-display text-sm font-bold">{topScorer.employees?.name} ({topScorer.employees?.emp_code})</div>
              <div className="font-mono text-[10px] text-muted-foreground">Score: {Math.round(Number(topScorer.composite_score))} · {topScorer.employees?.department}</div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button onClick={() => setActiveTab('costs')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <IndianRupee className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold flex-1 text-left">{lang === 'hi' ? 'लागत विवरण' : 'Cost Details'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setActiveTab('people')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="text-sm font-semibold flex-1 text-left">{lang === 'hi' ? 'ध्यान देने की ज़रूरत' : 'Needs Attention'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <BottomNav role="owner" activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default OwnerHome;
