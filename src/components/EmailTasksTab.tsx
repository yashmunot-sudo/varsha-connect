import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, ExternalLink, Check, AlertTriangle, Clock } from 'lucide-react';

type FilterType = 'Unread' | 'Pending' | 'Replied' | 'Escalated';

const EmailTasksTab: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>('Unread');

  const { data: emails, isLoading } = useQuery({
    queryKey: ['email_tasks', user?.employeeId],
    enabled: !!user?.employeeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_tasks')
        .select('*')
        .eq('assigned_to', user!.employeeId)
        .order('received_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = emails?.filter(e => e.status === filter) || [];

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: 'Unread', label: lang === 'hi' ? 'अपठित' : 'Unread', count: emails?.filter(e => e.status === 'Unread').length || 0 },
    { id: 'Pending', label: lang === 'hi' ? 'लंबित' : 'Pending', count: emails?.filter(e => e.status === 'Pending').length || 0 },
    { id: 'Replied', label: lang === 'hi' ? 'उत्तर दिया' : 'Replied', count: emails?.filter(e => e.status === 'Replied').length || 0 },
    { id: 'Escalated', label: lang === 'hi' ? 'एस्केलेटेड' : 'Escalated', count: emails?.filter(e => e.status === 'Escalated').length || 0 },
  ];

  const markReplied = async (id: string) => {
    const { error } = await supabase.from('email_tasks').update({
      status: 'Replied',
      replied_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('✓ Marked as replied');
      queryClient.invalidateQueries({ queryKey: ['email_tasks'] });
    }
  };

  const urgencyBadge = (urgency: string | null) => {
    if (urgency === 'High') return <span className="text-[10px] font-bold bg-destructive/15 text-destructive px-1.5 py-0.5 rounded-full">High</span>;
    if (urgency === 'Medium') return <span className="text-[10px] font-bold bg-warning/15 text-warning px-1.5 py-0.5 rounded-full">Med</span>;
    return null;
  };

  const timeAgo = (dt: string) => {
    const diff = Date.now() - new Date(dt).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return `${Math.floor(diff / 60000)}m`;
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <div className="px-4 py-4 space-y-3">
      <h2 className="font-display text-lg font-bold text-foreground">
        {lang === 'hi' ? 'ईमेल कार्य' : 'Email Tasks'}
      </h2>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === f.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {f.label} {f.count > 0 && `(${f.count})`}
          </button>
        ))}
      </div>

      {/* Email cards */}
      {isLoading && (
        <div className="text-center py-8 text-sm text-muted-foreground">Loading...</div>
      )}

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">{lang === 'hi' ? 'कोई ईमेल नहीं' : 'No emails in this filter'}</div>
        </div>
      )}

      {filtered.map(email => (
        <div key={email.id} className="bg-card rounded-2xl border border-border card-shadow p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">{email.from_name || email.from_address}</div>
              <div className="text-[10px] text-muted-foreground truncate">{email.from_address}</div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {urgencyBadge(email.urgency)}
              <span className="text-[10px] text-muted-foreground">{timeAgo(email.received_at)}</span>
            </div>
          </div>
          <div className="text-xs font-medium text-foreground line-clamp-2">{email.subject}</div>
          {email.body_preview && (
            <div className="text-[11px] text-muted-foreground line-clamp-2">{email.body_preview}</div>
          )}

          {/* Deadline warning */}
          {email.reply_deadline && new Date(email.reply_deadline) < new Date() && email.status !== 'Replied' && (
            <div className="flex items-center gap-1 text-destructive text-[10px] font-semibold">
              <AlertTriangle className="w-3 h-3" /> {lang === 'hi' ? 'समय सीमा पार' : 'Past deadline'}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {email.gmail_message_id && (
              <a
                href={`https://mail.google.com/mail/u/0/#inbox/${email.gmail_message_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-xl bg-muted text-foreground text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Gmail
              </a>
            )}
            {email.status !== 'Replied' && (
              <button
                onClick={() => markReplied(email.id)}
                className="flex-1 py-2 rounded-xl bg-success text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
              >
                <Check className="w-3.5 h-3.5" /> {lang === 'hi' ? 'उत्तर दिया' : 'Mark Replied'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailTasksTab;
