import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { TrendingUp, TrendingDown, Users, AlertTriangle, Award, IndianRupee, Heart, ChevronRight } from 'lucide-react';

const OwnerHome: React.FC = () => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');

  if (activeTab === 'costs') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold">
            {lang === 'hi' ? 'कार्यबल लागत' : 'Workforce Costs'}
          </h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="font-display text-3xl font-extrabold mb-1">₹31.2L</div>
            <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'मार्च 2026 कुल पेरोल' : 'March 2026 Total Payroll'}</div>
          </div>
          <div className="space-y-2">
            {[
              { month: 'Mar 2026', amount: '₹31.2L', trend: 'up', change: '+2.3%' },
              { month: 'Feb 2026', amount: '₹30.5L', trend: 'down', change: '-1.1%' },
              { month: 'Jan 2026', amount: '₹30.8L', trend: 'up', change: '+0.8%' },
              { month: 'Dec 2025', amount: '₹30.6L', trend: 'up', change: '+1.5%' },
            ].map((m, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-3 flex items-center justify-between">
                <span className="text-sm">{m.month}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold">{m.amount}</span>
                  <span className={`flex items-center gap-0.5 font-mono text-[10px] ${m.trend === 'up' ? 'text-danger' : 'text-success'}`}>
                    {m.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {m.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-3">
              {lang === 'hi' ? 'श्रेणी अनुसार विभाजन' : 'BY CATEGORY'}
            </div>
            {[
              { label: 'Staff', amount: '₹19.2L', pct: 62, color: 'bg-info' },
              { label: 'Workers', amount: '₹9.8L', pct: 31, color: 'bg-success' },
              { label: 'Consultants', amount: '₹2.2L', pct: 7, color: 'bg-[hsl(var(--leave-purple))]' },
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
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold">
            {lang === 'hi' ? 'ध्यान देने की ज़रूरत' : 'Needs Attention'}
          </h2>
          {[
            { name: 'Santosh Patil', code: 'VFL4010', issue: 'Absent 4 days this month', severity: 'high' },
            { name: 'Ramesh K.', code: 'VFL4022', issue: 'Score dropped 30%', severity: 'medium' },
            { name: 'Suresh J.', code: 'VFL4031', issue: 'No maintenance observations', severity: 'low' },
          ].map((p, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                p.severity === 'high' ? 'text-danger' : p.severity === 'medium' ? 'text-warning' : 'text-muted-foreground'
              }`} />
              <div>
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{p.code}</div>
                <div className="text-xs text-muted-foreground mt-1">{p.issue}</div>
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

        {/* Workforce cost */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              {lang === 'hi' ? 'इस महीने कार्यबल लागत' : 'Workforce Cost This Month'}
            </span>
          </div>
          <div className="font-display text-4xl font-extrabold text-gradient-fire">₹31.2L</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-danger font-mono">
            <TrendingUp className="w-3 h-3" /> +2.3% vs last month
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-success" />
              <span className="text-[10px] text-muted-foreground">
                {lang === 'hi' ? 'हाज़िरी स्वास्थ्य' : 'Attendance Health'}
              </span>
            </div>
            <div className="font-display text-3xl font-extrabold text-success">92%</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-muted-foreground">
                {lang === 'hi' ? 'संतुष्टि स्कोर' : 'Satisfaction'}
              </span>
            </div>
            <div className="font-display text-3xl font-extrabold text-primary">78</div>
          </div>
        </div>

        {/* EoTM */}
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <Award className="w-8 h-8 text-warning" />
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">
              EoTM {lang === 'hi' ? 'इस महीने' : 'This Month'}
            </div>
            <div className="font-display text-sm font-bold">कैलाश धीवर (VFL4002)</div>
            <div className="font-mono text-[10px] text-muted-foreground">Score: 95 · Cutting Shop</div>
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-2">
          <button onClick={() => setActiveTab('costs')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <IndianRupee className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold flex-1 text-left">
              {lang === 'hi' ? 'लागत विवरण' : 'Cost Details'}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setActiveTab('people')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="text-sm font-semibold flex-1 text-left">
              {lang === 'hi' ? 'ध्यान देने की ज़रूरत' : 'Needs Attention'}
            </span>
            <span className="bg-danger text-destructive-foreground font-mono text-[10px] px-2 py-0.5 rounded-full">3</span>
          </button>
        </div>
      </div>
      <BottomNav role="owner" activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default OwnerHome;
