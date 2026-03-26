import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { useTodayAttendanceAll, useAllEmployees, useAllScores } from '@/hooks/useEmployeeData';
import { usePendingLeaveRequests, usePendingAdvanceRequests } from '@/hooks/useRequestData';
import { Users, AlertTriangle, CheckCircle, Clock, TrendingUp, Building2, Check, XIcon } from 'lucide-react';
import MoreMenu from '@/components/MoreMenu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const PlantHeadHome: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const { data: allEmployees } = useAllEmployees();
  const { data: todayAttendance } = useTodayAttendanceAll();
  const { data: allScores } = useAllScores();
  const { data: pendingLeaves } = usePendingLeaveRequests();

  const activeCount = allEmployees?.length || 0;
  const presentToday = todayAttendance?.filter(a => a.status === 'P' || a.status === 'LC' || a.status === 'OT').length || 0;
  const attendancePct = activeCount > 0 ? Math.round((presentToday / activeCount) * 100) : 0;
  const avgScore = allScores?.length ? Math.round(allScores.reduce((s, r) => s + Number(r.composite_score || 0), 0) / allScores.length) : 0;

  const departments = allEmployees ? [...new Set(allEmployees.map(e => e.department))] : [];
  const deptStats = departments.map(dept => {
    const deptEmps = allEmployees?.filter(e => e.department === dept) || [];
    const deptPresent = todayAttendance?.filter(a => {
      const emp = allEmployees?.find(e => e.id === a.employee_id);
      return emp?.department === dept && (a.status === 'P' || a.status === 'LC');
    }).length || 0;
    const deptScores = allScores?.filter(s => {
      const emp = allEmployees?.find(e => e.id === s.employee_id);
      return emp?.department === dept;
    }) || [];
    const avgDeptScore = deptScores.length ? Math.round(deptScores.reduce((sum, s) => sum + Number(s.composite_score || 0), 0) / deptScores.length) : 0;
    return { dept, total: deptEmps.length, present: deptPresent, avgScore: avgDeptScore };
  }).filter(d => d.total > 0).sort((a, b) => b.avgScore - a.avgScore);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? (lang === 'hi' ? 'सुप्रभात' : 'Good Morning') : hour < 17 ? (lang === 'hi' ? 'नमस्कार' : 'Good Afternoon') : (lang === 'hi' ? 'शुभ संध्या' : 'Good Evening');

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar />
      <div className="px-4 py-4 space-y-4">
        <div className="text-lg font-bold text-foreground">{greeting}, {user?.name?.split(' ')[0]}</div>

        {/* KPI Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-xl font-bold text-foreground">{presentToday}/{activeCount}</div>
            <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'उपस्थित / Present' : 'Present'}</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <TrendingUp className="w-5 h-5 text-success mx-auto mb-1" />
            <div className="text-xl font-bold text-foreground">{attendancePct}%</div>
            <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'हाज़िरी / Attendance' : 'Attendance'}</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <CheckCircle className="w-5 h-5 text-info mx-auto mb-1" />
            <div className="text-xl font-bold text-foreground">{avgScore}</div>
            <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'औसत स्कोर / Avg Score' : 'Avg Score'}</div>
          </div>
        </div>

        {/* Pending Approvals */}
        {pendingLeaves && pendingLeaves.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-warning" />
              <span className="font-bold text-foreground text-sm">
                {lang === 'hi' ? 'लंबित स्वीकृति / Pending Approvals' : 'Pending Approvals'}
              </span>
              <span className="ml-auto bg-warning/15 text-warning text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingLeaves.length}
              </span>
            </div>
          </div>
        )}

        {/* Department Performance */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground text-sm">
              {lang === 'hi' ? 'विभाग प्रदर्शन / Department Performance' : 'Department Performance'}
            </span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {deptStats.slice(0, 10).map((d, i) => (
              <div key={d.dept} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                  <span className="text-sm font-medium text-foreground">{d.dept}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">{d.present}/{d.total}</span>
                  <span className={`font-bold ${d.avgScore >= 70 ? 'text-success' : d.avgScore >= 50 ? 'text-warning' : 'text-destructive'}`}>
                    {d.avgScore} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Escalation Alerts */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="font-bold text-foreground text-sm">
              {lang === 'hi' ? 'एस्केलेशन अलर्ट / Escalation Alerts' : 'Escalation Alerts'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {lang === 'hi' ? 'कोई लंबित एस्केलेशन नहीं / No pending escalations' : 'No pending escalations'}
          </p>
        </div>
      </div>
      <BottomNav role="plant_head" activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default PlantHeadHome;
