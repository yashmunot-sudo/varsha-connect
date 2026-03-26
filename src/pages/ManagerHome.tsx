import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { BarChart3, Users, FileCheck, Award, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

const ManagerHome: React.FC = () => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');

  if (activeTab === 'attendance') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold">
            {lang === 'hi' ? 'विभाग उपस्थिति' : 'Department Attendance'}
          </h2>
          {[
            { dept: 'Cutting Shop', present: 12, total: 14, pct: 86 },
            { dept: 'Die Shop', present: 8, total: 8, pct: 100 },
            { dept: 'Heat Treatment', present: 6, total: 7, pct: 86 },
            { dept: 'Final Shop', present: 10, total: 11, pct: 91 },
            { dept: 'Maintenance', present: 5, total: 5, pct: 100 },
          ].map((d) => (
            <div key={d.dept} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{d.dept}</span>
                <span className={`font-mono text-sm font-bold ${d.pct >= 95 ? 'text-success' : d.pct >= 85 ? 'text-warning' : 'text-danger'}`}>
                  {d.pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${d.pct >= 95 ? 'bg-success' : d.pct >= 85 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${d.pct}%` }} />
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1">
                {d.present}/{d.total} {lang === 'hi' ? 'उपस्थित' : 'present'}
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
          <h2 className="font-display text-lg font-bold">
            {lang === 'hi' ? 'लंबित स्वीकृतियाँ' : 'Pending Approvals'}
          </h2>
          {[
            { name: 'कैलाश धीवर', type: 'Leave', date: '28 Mar', days: 2 },
            { name: 'Dilip Dhalpe', type: 'Advance', date: '27 Mar', amount: '₹5,000' },
          ].map((r, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{r.name}</span>
                <span className="font-mono text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded">{r.type}</span>
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                {r.date} · {r.days ? `${r.days} days` : r.amount}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-bold touch-target">
                  {lang === 'hi' ? 'स्वीकृत' : 'Approve'}
                </button>
                <button className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-bold border border-destructive/30 touch-target">
                  {lang === 'hi' ? 'अस्वीकार' : 'Reject'}
                </button>
              </div>
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
          <h2 className="font-display text-lg font-bold">
            {lang === 'hi' ? 'KPI दृश्य' : 'KPI View'}
          </h2>
          {[
            { label: 'Avg Attendance', value: '92%', trend: 'up', change: '+2%' },
            { label: 'Avg Score', value: '78', trend: 'up', change: '+5' },
            { label: 'Absent Today', value: '3', trend: 'down', change: '-1' },
            { label: 'Late Today', value: '4', trend: 'up', change: '+2' },
            { label: 'Overtime Hours', value: '127h', trend: 'up', change: '+12h' },
          ].map((k, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="font-display text-xl font-bold">{k.value}</div>
              </div>
              <div className={`flex items-center gap-1 text-xs font-mono ${k.trend === 'up' && k.label !== 'Absent Today' && k.label !== 'Late Today' ? 'text-success' : 'text-danger'}`}>
                {k.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {k.change}
              </div>
            </div>
          ))}
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
          <div className="font-mono text-[10px] text-primary tracking-[0.2em] uppercase mb-3">
            {lang === 'hi' ? 'आज का अवलोकन' : "TODAY'S OVERVIEW"}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-display text-3xl font-extrabold text-success">41</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'उपस्थित' : 'Present'}</div>
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-danger">4</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'अनुपस्थित' : 'Absent'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="font-display text-2xl font-bold text-info">92%</div>
            <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'औसत हाज़िरी' : 'Avg Attendance'}</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="font-display text-2xl font-bold text-primary">78</div>
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
            <span className="bg-danger text-destructive-foreground font-mono text-[10px] px-2 py-0.5 rounded-full">2</span>
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
