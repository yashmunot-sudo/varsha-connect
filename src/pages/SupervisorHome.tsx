import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { Users, Plus, FileText, ChevronRight, AlertTriangle } from 'lucide-react';
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

  const statusConfig: Record<string, { label_hi: string; label_en: string; dot: string }> = {
    P: { label_hi: 'उपस्थित', label_en: 'Present', dot: 'status-present' },
    A: { label_hi: 'अनुपस्थित', label_en: 'Absent', dot: 'status-absent' },
    LC: { label_hi: 'देर से', label_en: 'Late', dot: 'status-late' },
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
      toast.success(lang === 'hi' ? 'जोड़ा गया' : 'Worker added');
      setCasualName('');
      setCasualId('');
      queryClient.invalidateQueries({ queryKey: ['casual_workers_today'] });
    }
  };

  if (activeTab === 'team') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-3">
          <h2 className="font-display text-lg font-bold">
            {lang === 'hi' ? 'मेरी टीम — आज' : 'My Team — Today'}
          </h2>
          {teamMembers?.map((m) => {
            const status = m.status || 'A';
            const s = statusConfig[status] || statusConfig['A'];
            const timeStr = m.checkInTime ? new Date(m.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-';
            return (
              <div key={m.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                <div className={`status-dot ${s.dot}`} />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{m.name_hi || m.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{m.emp_code}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-medium ${status === 'P' ? 'text-success' : status === 'LC' ? 'text-warning' : 'text-danger'}`}>
                    {lang === 'hi' ? s.label_hi : s.label_en}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">{timeStr}</div>
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
          <h2 className="font-display text-lg font-bold">
            {lang === 'hi' ? 'कैज़ुअल वर्कर लॉग' : 'Log Casual Workers'}
          </h2>
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <input
              type="text"
              value={casualName}
              onChange={e => setCasualName(e.target.value)}
              placeholder={lang === 'hi' ? 'नाम' : 'Name'}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              value={casualId}
              onChange={e => setCasualId(e.target.value)}
              placeholder={lang === 'hi' ? 'ID नंबर' : 'ID Number'}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button onClick={handleAddCasual} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target">
              <Plus className="w-4 h-4 inline mr-2" />
              {lang === 'hi' ? 'जोड़ें' : 'Add Worker'}
            </button>
          </div>
          <div className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-2">
            {lang === 'hi' ? 'आज लॉग किए गए' : 'Logged Today'}: {casualWorkers?.length || 0}
          </div>
          {casualWorkers?.map((cw: any) => (
            <div key={cw.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
              <div className="status-dot status-present" />
              <span className="text-sm">{cw.name}</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">{cw.id_number || '-'}</span>
            </div>
          ))}
        </div>
        <BottomNav role="supervisor" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'report') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold">
            {lang === 'hi' ? 'शिफ्ट रिपोर्ट' : 'Shift Report'}
          </h2>
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'उत्पादन संख्या' : 'Production Numbers'}</label>
              <input type="number" placeholder="0" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'घटनाएं / नोट्स' : 'Incidents / Notes'}</label>
              <textarea rows={3} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target">
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
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-mono text-[10px] text-primary tracking-[0.2em] uppercase">
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

        <div className="space-y-2">
          <button onClick={() => setActiveTab('team')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <Users className="w-5 h-5 text-info" />
            <span className="text-sm font-semibold flex-1 text-left">{lang === 'hi' ? 'टीम देखें' : 'View Team'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setActiveTab('casual')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <Plus className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold flex-1 text-left">{lang === 'hi' ? 'कैज़ुअल वर्कर लॉग' : 'Log Casual Workers'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setActiveTab('report')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold flex-1 text-left">{lang === 'hi' ? 'शिफ्ट रिपोर्ट' : 'Shift Report'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <BottomNav role="supervisor" activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default SupervisorHome;
