import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Check, Clock, FileText, Wrench, Calendar } from 'lucide-react';

interface NotificationsPanelProps {
  lang: string;
  employeeId?: string;
}

export function useMyNotifications(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['notifications', employeeId],
    enabled: !!employeeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('employee_id', employeeId!)
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });
}

export function useUnreadCount(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['unread_count', employeeId],
    enabled: !!employeeId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', employeeId!)
        .eq('read', false);
      if (error) throw error;
      return count || 0;
    },
  });
}

const typeIcons: Record<string, React.ElementType> = {
  shift: Calendar,
  leave: FileText,
  maintenance: Wrench,
  attendance: Clock,
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ lang, employeeId }) => {
  const queryClient = useQueryClient();
  const { data: notifications } = useMyNotifications(employeeId);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true } as any).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['unread_count'] });
  };

  const markAllRead = async () => {
    if (!employeeId) return;
    await supabase.from('notifications').update({ read: true } as any)
      .eq('employee_id', employeeId).eq('read', false);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['unread_count'] });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          {lang === 'hi' ? 'सूचनाएं' : 'Notifications'}
        </h2>
        <button onClick={markAllRead} className="text-xs text-primary font-semibold">
          {lang === 'hi' ? 'सभी पढ़ें' : 'Mark all read'}
        </button>
      </div>

      {(!notifications || notifications.length === 0) && (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Bell className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="text-sm font-semibold text-foreground mb-1">
            {lang === 'hi' ? 'कोई सूचना नहीं' : 'No notifications'}
          </div>
          <div className="text-xs text-muted-foreground">
            {lang === 'hi' ? 'आप अपडेट हैं!' : "You're all caught up!"}
          </div>
        </div>
      )}

      {notifications?.map((n) => {
        const Icon = typeIcons[n.type || ''] || Bell;
        return (
          <button
            key={n.id}
            onClick={() => !n.read && markRead(n.id)}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              n.read
                ? 'bg-card border-border card-shadow'
                : 'bg-primary/5 border-primary/20 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                n.read ? 'bg-muted' : 'bg-primary/10'
              }`}>
                <Icon className={`w-4 h-4 ${n.read ? 'text-muted-foreground' : 'text-primary'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${n.read ? 'text-foreground' : 'text-primary'}`}>
                    {n.title}
                  </span>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  {new Date(n.created_at!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default NotificationsPanel;
