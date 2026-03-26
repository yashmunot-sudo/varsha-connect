import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { Users, AlertTriangle, Award, IndianRupee, Heart, ChevronRight, TrendingUp, Factory, Zap } from 'lucide-react';
import { useAllEmployees, useTodayAttendanceAll, useAllScores } from '@/hooks/useEmployeeData';

const OwnerHome: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const { data: employees } = useAllEmployees();
  const { data: todayAttendance } = useTodayAttendanceAll();
  const { data: scores } = useAllScores();

  const totalEmp = employees?.length || 0;
  const presentCount = todayAttendance?.filter(a => a.status === 'P' || a.status === 'LC' || a.status === 'OT').length || 0;
  const attPct = totalEmp > 0 ? Math.round((presentCount / totalEmp) * 100) : 0;
  const avgScore = scores?.length ? Math.round(scores.reduce((s: number, x: any) => s + Number(x.composite_score), 0) / scores.length) : 0;
  const topScorer = scores?.[0];

  const totalPayroll = employees?.reduce((sum, e) => sum + Number(e.base_salary || 0) + Number(e.hra || 0), 0) || 0;
  const payrollLakhs = (totalPayroll / 100000).toFixed(1);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return lang === 'hi' ? 'सुप्रभात' : 'Good Morning';
    if (h < 17) return lang === 'hi' ? 'नमस्ते' : 'Good Afternoon';
    return lang === 'hi' ? 'शुभ संध्या' : 'Good Evening';
  };

  if (activeTab === 'costs') {
    const staffCost = employees?.filter(e => e.category === 'STAFF').reduce((s, e) => s + Number(e.base_salary || 0) + Number(e.hra || 0), 0) || 0;
    const workerCost = employees?.filter(e => e.category === 'WORKER').reduce((s, e) => s + Number(e.base_salary || 0) + Number(e.hra || 0), 0) || 0;
    const consultCost = employees?.filter(e => e.category === 'CONSULTANT').reduce((s, e) => s + Number(e.base_salary || 0) + Number(e.hra || 0), 0) || 0;

    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">{lang === 'hi' ? 'कार्यबल लागत' : 'Workforce Costs'}</h2>
          <div className="bg-gradient-to-br from-primary/10 to-warning/5 rounded-2xl border border-primary/15 p-5">
            <div className="font-display text-4xl font-extrabold text-foreground mb-1">₹{payrollLakhs}L</div>
            <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'मासिक पेरोल' : 'Monthly Payroll'}</div>
          </div>
          <div className="bg-card rounded-2xl border border-border card-shadow p-5">
            <div className="text-[10px] text-muted-foreground tracking-wider uppercase mb-4">{lang === 'hi' ? 'श्रेणी अनुसार विभाजन' : 'BY CATEGORY'}</div>
            {[
              { label: 'Staff', amount: `₹${(staffCost / 100000).toFixed(1)}L`, pct: totalPayroll > 0 ? Math.round((staffCost / totalPayroll) * 100) : 0, color: 'bg-info' },
              { label: 'Workers', amount: `₹${(workerCost / 100000).toFixed(1)}L`, pct: totalPayroll > 0 ? Math.round((workerCost / totalPayroll) * 100) : 0, color: 'bg-success' },
              { label: 'Consultants', amount: `₹${(consultCost / 100000).toFixed(1)}L`, pct: totalPayroll > 0 ? Math.round((consultCost / totalPayroll) * 100) : 0, color: 'bg-[hsl(var(--leave-purple))]' },
            ].map((c, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-foreground">{c.label}</span>
                  <span className="text-xs font-bold text-foreground">{c.amount} ({c.pct}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${c.color} transition-all`} style={{ width: `${c.pct}%` }} />
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
    const lowScorers = scores?.filter((s: any) => Number(s.composite_score) < 60).slice(0, 5) || [];
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">{lang === 'hi' ? 'ध्यान देने की ज़रूरत' : 'Needs Attention'}</h2>
          {lowScorers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-7 h-7 text-success" />
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">{lang === 'hi' ? 'सब ठीक है!' : 'All Good!'}</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'कोई चिंता नहीं' : 'No concerns right now'}</div>
            </div>
          )}
          {lowScorers.map((p: any) => (
            <div key={p.id} className="bg-card rounded-2xl border border-border card-shadow p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4.5 h-4.5 text-warning" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{p.employees?.name}</div>
                <div className="text-[10px] text-muted-foreground">{p.employees?.emp_code}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-warning" style={{ width: `${Math.round(Number(p.composite_score))}%` }} />
                  </div>
                  <span className="text-xs font-bold text-warning">{Math.round(Number(p.composite_score))}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <BottomNav role="owner" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Home — Owner Morning Dashboard
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="px-4 py-4 space-y-4">
        {/* Greeting */}
        <div>
          <div className="text-xs text-primary font-semibold tracking-[0.15em] uppercase mb-1">
            {greeting()}, {user?.name?.split(' ')[0] || 'Sir'}
          </div>
          <h1 className="font-display text-xl font-extrabold text-foreground">
            {lang === 'hi' ? 'सुबह का डैशबोर्ड' : 'Morning Dashboard'}
          </h1>
        </div>

        {/* Hero cost card */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-warning/5 rounded-2xl border border-primary/15 p-5">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">{lang === 'hi' ? 'इस महीने कार्यबल लागत' : 'Workforce Cost This Month'}</span>
          </div>
          <div className="font-display text-4xl font-extrabold text-primary">₹{payrollLakhs}L</div>
          <div className="text-[10px] text-muted-foreground mt-1">{totalEmp} {lang === 'hi' ? 'कर्मचारी' : 'employees'}</div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl border border-border card-shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-success" />
              </div>
              <span className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'हाज़िरी' : 'Attendance'}</span>
            </div>
            <div className="font-display text-3xl font-extrabold text-success">{attPct}%</div>
            <div className="text-[10px] text-muted-foreground">{presentCount}/{totalEmp} {lang === 'hi' ? 'आज' : 'today'}</div>
          </div>
          <div className="bg-card rounded-2xl border border-border card-shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'औसत स्कोर' : 'Avg Score'}</span>
            </div>
            <div className="font-display text-3xl font-extrabold text-primary">{avgScore}</div>
            <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'इस महीने' : 'this month'}</div>
          </div>
        </div>

        {/* EoTM highlight */}
        {topScorer && (
          <div className="bg-gradient-to-r from-warning/10 to-warning/5 rounded-2xl border border-warning/20 p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-warning/15 flex items-center justify-center">
              <Award className="w-6 h-6 text-warning" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-warning font-semibold tracking-wider uppercase">EoTM {lang === 'hi' ? 'इस महीने' : 'This Month'}</div>
              <div className="font-display text-sm font-bold text-foreground">{topScorer.employees?.name}</div>
              <div className="text-[10px] text-muted-foreground">Score: {Math.round(Number(topScorer.composite_score))} · {topScorer.employees?.department}</div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="space-y-2">
          <button onClick={() => setActiveTab('costs')} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card card-shadow hover:bg-muted/50 transition-all active:scale-[0.98]">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-semibold flex-1 text-left text-foreground">{lang === 'hi' ? 'लागत विवरण' : 'Cost Details'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setActiveTab('people')} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card card-shadow hover:bg-muted/50 transition-all active:scale-[0.98]">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm font-semibold flex-1 text-left text-foreground">{lang === 'hi' ? 'ध्यान देने की ज़रूरत' : 'Needs Attention'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <BottomNav role="owner" activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default OwnerHome;
