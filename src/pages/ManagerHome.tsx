import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { BarChart3, Users, FileCheck, Award, ChevronRight, TrendingUp, Check, XIcon, Briefcase } from 'lucide-react';
import { useAllEmployees, useTodayAttendanceAll, useAllScores } from '@/hooks/useEmployeeData';
import { usePendingLeaveRequests, usePendingAdvanceRequests } from '@/hooks/useRequestData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const ManagerHome: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('home');
  const { data: employees } = useAllEmployees();
  const { data: todayAttendance } = useTodayAttendanceAll();
  const { data: scores } = useAllScores();
  const { data: pendingLeaves } = usePendingLeaveRequests();
  const { data: pendingAdvances } = usePendingAdvanceRequests();

  const presentCount = todayAttendance?.filter(a => a.status === 'P' || a.status === 'LC' || a.status === 'OT').length || 0;
  const absentCount = (employees?.length || 0) - presentCount;
  const totalEmp = employees?.length || 1;
  const attPct = Math.round((presentCount / Math.max(totalEmp, 1)) * 100);
  const avgScore = scores?.length ? Math.round(scores.reduce((s: number, x: any) => s + Number(x.composite_score), 0) / scores.length) : 0;

  const departments = employees ? [...new Set(employees.map(e => e.department))] : [];
  const deptStats = departments.map(dept => {
    const deptEmps = employees!.filter(e => e.department === dept);
    const deptPresent = todayAttendance?.filter(a => {
      const emp = employees!.find(e => e.id === a.employee_id);
      return emp?.department === dept && (a.status === 'P' || a.status === 'LC');
    }).length || 0;
    return { dept, present: deptPresent, total: deptEmps.length, pct: Math.round((deptPresent / Math.max(deptEmps.length, 1)) * 100) };
  });

  const totalPending = (pendingLeaves?.length || 0) + (pendingAdvances?.length || 0);

  const handleApproval = async (table: 'leave_requests' | 'advance_requests', id: string, status: 'Approved' | 'Rejected') => {
    const { error } = await supabase.from(table).update({
      status,
      reviewed_by: user?.employeeId,
      reviewed_at: new Date().toISOString(),
    } as any).eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(status === 'Approved' ? (lang === 'hi' ? '✓ स्वीकृत' : '✓ Approved') : (lang === 'hi' ? '✗ अस्वीकृत' : '✗ Rejected'));
      queryClient.invalidateQueries({ queryKey: ['pending_leave_requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending_advance_requests'] });
    }
  };

  if (activeTab === 'attendance') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">{lang === 'hi' ? 'विभाग उपस्थिति' : 'Department Attendance'}</h2>
          {deptStats.map((d) => (
            <div key={d.dept} className="bg-card rounded-2xl border border-border card-shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{d.dept}</span>
                <span className={`text-sm font-bold ${d.pct >= 95 ? 'text-success' : d.pct >= 85 ? 'text-warning' : 'text-danger'}`}>{d.pct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${d.pct >= 95 ? 'bg-success' : d.pct >= 85 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${d.pct}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1.5">{d.present}/{d.total} {lang === 'hi' ? 'उपस्थित' : 'present'}</div>
            </div>
          ))}
        </div>
        <BottomNav role="manager" activeTab={activeTab} onTabChange={setActiveTab} badges={{ approvals: totalPending }} />
      </div>
    );
  }

  if (activeTab === 'kpi') {
    const kpis = [
      { label: lang === 'hi' ? 'औसत हाज़िरी' : 'Avg Attendance', value: `${attPct}%`, color: 'text-success', bg: 'bg-success/10', icon: Users },
      { label: lang === 'hi' ? 'औसत स्कोर' : 'Avg Score', value: String(avgScore), color: 'text-primary', bg: 'bg-primary/10', icon: TrendingUp },
      { label: lang === 'hi' ? 'आज अनुपस्थित' : 'Absent Today', value: String(absentCount), color: 'text-danger', bg: 'bg-danger/10', icon: Users },
      { label: lang === 'hi' ? 'आज देरी' : 'Late Today', value: String(todayAttendance?.filter(a => a.status === 'LC').length || 0), color: 'text-warning', bg: 'bg-warning/10', icon: BarChart3 },
    ];

    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-3">
          <h2 className="font-display text-lg font-bold text-foreground">{lang === 'hi' ? 'KPI दृश्य' : 'KPI View'}</h2>
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <div key={i} className="bg-card rounded-2xl border border-border card-shadow p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${k.color}`} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">{k.label}</div>
                  <div className={`font-display text-xl font-bold ${k.color}`}>{k.value}</div>
                </div>
              </div>
            );
          })}
        </div>
        <BottomNav role="manager" activeTab={activeTab} onTabChange={setActiveTab} badges={{ approvals: totalPending }} />
      </div>
    );
  }

  if (activeTab === 'approvals') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">{lang === 'hi' ? 'लंबित स्वीकृतियाँ' : 'Pending Approvals'}</h2>
            {totalPending > 0 && (
              <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">{totalPending}</span>
            )}
          </div>

          {pendingLeaves && pendingLeaves.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] text-primary font-semibold tracking-[0.15em] uppercase">{lang === 'hi' ? 'छुट्टी आवेदन' : 'Leave Requests'}</div>
              {pendingLeaves.map((req: any) => (
                <div key={req.id} className="bg-card rounded-2xl border border-border card-shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{req.employees?.name}</div>
                      <div className="text-[10px] text-muted-foreground">{req.employees?.emp_code} · {req.employees?.department}</div>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{req.leave_type}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    {req.from_date} → {req.to_date} {req.reason && `· ${req.reason}`}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproval('leave_requests', req.id, 'Approved')} className="flex-1 py-2.5 rounded-xl bg-success text-primary-foreground font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all shadow-sm">
                      <Check className="w-4 h-4" /> {lang === 'hi' ? 'स्वीकृत' : 'Approve'}
                    </button>
                    <button onClick={() => handleApproval('leave_requests', req.id, 'Rejected')} className="flex-1 py-2.5 rounded-xl bg-danger text-primary-foreground font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all shadow-sm">
                      <XIcon className="w-4 h-4" /> {lang === 'hi' ? 'अस्वीकृत' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pendingAdvances && pendingAdvances.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] text-primary font-semibold tracking-[0.15em] uppercase">{lang === 'hi' ? 'अग्रिम आवेदन' : 'Advance Requests'}</div>
              {pendingAdvances.map((req: any) => (
                <div key={req.id} className="bg-card rounded-2xl border border-border card-shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{req.employees?.name}</div>
                      <div className="text-[10px] text-muted-foreground">{req.employees?.emp_code} · {req.employees?.department}</div>
                    </div>
                    <span className="font-display text-lg font-bold text-foreground">₹{req.amount_requested?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    {req.repayment_months} {lang === 'hi' ? 'महीने' : 'months'} {req.reason && `· ${req.reason}`}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproval('advance_requests', req.id, 'Approved')} className="flex-1 py-2.5 rounded-xl bg-success text-primary-foreground font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all shadow-sm">
                      <Check className="w-4 h-4" /> {lang === 'hi' ? 'स्वीकृत' : 'Approve'}
                    </button>
                    <button onClick={() => handleApproval('advance_requests', req.id, 'Rejected')} className="flex-1 py-2.5 rounded-xl bg-danger text-primary-foreground font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all shadow-sm">
                      <XIcon className="w-4 h-4" /> {lang === 'hi' ? 'अस्वीकृत' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPending === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-3">
                <Check className="w-7 h-7 text-success" />
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">{lang === 'hi' ? 'सब स्वीकृत!' : 'All Clear!'}</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'कोई लंबित स्वीकृति नहीं' : 'No pending approvals'}</div>
            </div>
          )}
        </div>
        <BottomNav role="manager" activeTab={activeTab} onTabChange={setActiveTab} badges={{ approvals: totalPending }} />
      </div>
    );
  }

  // Home
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return lang === 'hi' ? 'सुप्रभात' : 'Good Morning';
    if (h < 17) return lang === 'hi' ? 'नमस्ते' : 'Good Afternoon';
    return lang === 'hi' ? 'शुभ संध्या' : 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="px-4 py-4 space-y-4">
        {/* Greeting */}
        <div>
          <div className="text-xs text-primary font-semibold tracking-[0.15em] uppercase mb-1">
            {greeting()}, {user?.name?.split(' ')[0]}
          </div>
          <h1 className="font-display text-xl font-extrabold text-foreground">
            {lang === 'hi' ? 'मैनेजर डैशबोर्ड' : 'Manager Dashboard'}
          </h1>
        </div>

        {/* Overview card */}
        <div className="bg-gradient-to-br from-info/8 to-primary/5 rounded-2xl border border-info/15 p-5">
          <div className="text-[10px] text-info font-semibold tracking-[0.15em] uppercase mb-3">{lang === 'hi' ? 'आज का अवलोकन' : "TODAY'S OVERVIEW"}</div>
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
          <div className="bg-card rounded-2xl border border-border card-shadow p-4 text-center">
            <div className="font-display text-2xl font-bold text-info">{attPct}%</div>
            <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'औसत हाज़िरी' : 'Avg Attendance'}</div>
          </div>
          <div className="bg-card rounded-2xl border border-border card-shadow p-4 text-center">
            <div className="font-display text-2xl font-bold text-primary">{avgScore}</div>
            <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'औसत स्कोर' : 'Avg Score'}</div>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { tab: 'attendance', icon: BarChart3, color: 'bg-info/10', iconColor: 'text-info', label: lang === 'hi' ? 'विभाग उपस्थिति' : 'Dept. Attendance' },
            { tab: 'approvals', icon: FileCheck, color: 'bg-warning/10', iconColor: 'text-warning', label: lang === 'hi' ? 'स्वीकृतियाँ' : 'Approvals', badge: totalPending },
            { tab: 'kpi', icon: TrendingUp, color: 'bg-primary/10', iconColor: 'text-primary', label: 'KPI' },
          ].map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card card-shadow hover:bg-muted/50 transition-all active:scale-[0.98]">
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <span className="text-sm font-semibold flex-1 text-left text-foreground">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-2 py-0.5">{item.badge}</span>
              ) : null}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
      <BottomNav role="manager" activeTab={activeTab} onTabChange={setActiveTab} badges={{ approvals: totalPending }} />
    </div>
  );
};

export default ManagerHome;
