import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { Users, Plus, FileText, ChevronRight, UserCheck, Clock } from 'lucide-react';
import MoreMenu from '@/components/MoreMenu';
import { useTeamAttendance, useTodayCasualWorkers } from '@/hooks/useEmployeeData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const SupervisorHome: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('home');
  const [casualName, setCasualName] = useState('');
  const [casualId, setCasualId] = useState('');

  const { data: teamMembers } = useTeamAttendance(user?.department);
  const { data: casualWorkers } = useTodayCasualWorkers();

  const presentCount = teamMembers?.filter(m => m.status === 'P' || m.status === 'LC').length || 0;
  const absentCount = teamMembers?.filter(m => !m.status).length || 0;
  const lateCount = teamMembers?.filter(m => m.status === 'LC').length || 0;
  const totalTeam = teamMembers?.length || 0;

  const statusConfig: Record<string, { label_hi: string; label_en: string; dot: string; color: string }> = {
    P: { label_hi: 'उपस्थित', label_en: 'Present', dot: 'status-present', color: 'text-success' },
    A: { label_hi: 'अनुपस्थित', label_en: 'Absent', dot: 'status-absent', color: 'text-danger' },
    LC: { label_hi: 'देर से', label_en: 'Late', dot: 'status-late', color: 'text-warning' },
  };

  const handleAddCasual = async () => {
    if (!casualName.trim() || !user?.employeeId) return;
    const { error } = await supabase.from('casual_workers').insert({
      name: casualName,
      id_number: casualId || null,
      logged_by: user.employeeId,
      department: user.department,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === 'hi' ? '✓ जोड़ा गया' : '✓ Worker added');
      setCasualName('');
      setCasualId('');
      queryClient.invalidateQueries({ queryKey: ['casual_workers_today'] });
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return lang === 'hi' ? 'सुप्रभात' : 'Good Morning';
    if (h < 17) return lang === 'hi' ? 'नमस्ते' : 'Good Afternoon';
    return lang === 'hi' ? 'शुभ संध्या' : 'Good Evening';
  };

  if (activeTab === 'team') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">
              {lang === 'hi' ? 'मेरी टीम — आज' : 'My Team — Today'}
            </h2>
            <span className="text-xs text-muted-foreground">{totalTeam} {lang === 'hi' ? 'सदस्य' : 'members'}</span>
          </div>
          {teamMembers?.map((m) => {
            const status = m.status || 'A';
            const s = statusConfig[status] || statusConfig['A'];
            const timeStr = m.checkInTime ? new Date(m.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-';
            return (
              <div key={m.id} className="bg-card rounded-2xl border border-border card-shadow p-4 flex items-center gap-3">
                <div className={`status-dot ${s.dot}`} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{m.name_hi || m.name}</div>
                  <div className="text-[10px] text-muted-foreground">{m.emp_code}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold ${s.color}`}>
                    {lang === 'hi' ? s.label_hi : s.label_en}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                    <Clock className="w-2.5 h-2.5" />
                    {timeStr}
                  </div>
                </div>
              </div>
            );
          })}
          {(!teamMembers || teamMembers.length === 0) && (
            <div className="text-center text-sm text-muted-foreground py-8">
              {lang === 'hi' ? 'कोई टीम सदस्य नहीं' : 'No team members found'}
            </div>
          )}
        </div>
        <BottomNav role="supervisor" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'casual') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'कैज़ुअल वर्कर लॉग' : 'Log Casual Workers'}
          </h2>
          <div className="bg-card rounded-2xl border border-border card-shadow p-4 space-y-3">
            <input
              type="text"
              value={casualName}
              onChange={e => setCasualName(e.target.value)}
              placeholder={lang === 'hi' ? 'नाम' : 'Name'}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            <input
              type="text"
              value={casualId}
              onChange={e => setCasualId(e.target.value)}
              placeholder={lang === 'hi' ? 'ID नंबर (वैकल्पिक)' : 'ID Number (optional)'}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            <button onClick={handleAddCasual} disabled={!casualName.trim()} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target disabled:opacity-50 shadow-md shadow-primary/20 active:scale-[0.98] transition-all">
              <Plus className="w-4 h-4 inline mr-2" />
              {lang === 'hi' ? 'जोड़ें' : 'Add Worker'}
            </button>
          </div>

          {casualWorkers && casualWorkers.length > 0 && (
            <>
              <div className="text-[10px] text-primary font-semibold tracking-[0.15em] uppercase">
                {lang === 'hi' ? 'आज लॉग किए गए' : 'Logged Today'}: {casualWorkers.length}
              </div>
              {casualWorkers.map((cw: any) => (
                <div key={cw.id} className="bg-card rounded-2xl border border-border card-shadow p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">{cw.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{cw.id_number || '-'}</span>
                </div>
              ))}
            </>
          )}
        </div>
        <BottomNav role="supervisor" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'more') {
    return <MoreMenu role="supervisor" activeTab={activeTab} onTabChange={setActiveTab} />;
  }

  if (activeTab === 'report') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'शिफ्ट रिपोर्ट' : 'Shift Report'}
          </h2>
          <div className="bg-card rounded-2xl border border-border card-shadow p-4 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{lang === 'hi' ? 'उत्पादन संख्या' : 'Production Numbers'}</label>
              <input type="number" placeholder="0" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{lang === 'hi' ? 'घटनाएं / नोट्स' : 'Incidents / Notes'}</label>
              <textarea rows={3} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
            </div>
            <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target shadow-md shadow-primary/20 active:scale-[0.98] transition-all">
              {lang === 'hi' ? 'रिपोर्ट जमा करें' : 'Submit Report'}
            </button>
          </div>
        </div>
        <BottomNav role="supervisor" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Home
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
            {user?.department || (lang === 'hi' ? 'सुपरवाइज़र' : 'Supervisor')}
          </h1>
        </div>

        {/* Team status hero card */}
        <div className="bg-gradient-to-br from-primary/8 to-info/5 rounded-2xl border border-primary/15 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-primary font-semibold tracking-[0.15em] uppercase">
              {lang === 'hi' ? 'टीम स्थिति' : 'Team Status'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-display text-2xl font-bold text-success">{presentCount}</div>
              <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'उपस्थित' : 'Present'}</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-danger">{absentCount}</div>
              <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'अनुपस्थित' : 'Absent'}</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-warning">{lateCount}</div>
              <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'देर से' : 'Late'}</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-2">
          {[
            { tab: 'team', icon: Users, color: 'bg-info/10', iconColor: 'text-info', label: lang === 'hi' ? 'टीम देखें' : 'View Team' },
            { tab: 'casual', icon: Plus, color: 'bg-primary/10', iconColor: 'text-primary', label: lang === 'hi' ? 'कैज़ुअल वर्कर लॉग' : 'Log Casual Workers' },
            { tab: 'report', icon: FileText, color: 'bg-warning/10', iconColor: 'text-warning', label: lang === 'hi' ? 'शिफ्ट रिपोर्ट' : 'Shift Report' },
          ].map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card card-shadow hover:bg-muted/50 transition-all active:scale-[0.98]">
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <span className="text-sm font-semibold flex-1 text-left text-foreground">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
      <BottomNav role="supervisor" activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default SupervisorHome;
