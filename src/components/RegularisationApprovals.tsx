import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, XIcon } from 'lucide-react';

const RegularisationApprovals: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: pending } = useQuery({
    queryKey: ['pending_regularisations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_regularisation' as any)
        .select('*, employees:employee_id(name, emp_code, department)')
        .eq('status', 'Pending')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Auto-expire requests older than 7 days
      const now = new Date();
      const expired = (data as any[])?.filter(r => {
        const created = new Date(r.created_at);
        return (now.getTime() - created.getTime()) > 7 * 24 * 60 * 60 * 1000;
      }) || [];

      for (const r of expired) {
        await supabase.from('attendance_regularisation' as any).update({ status: 'Expired' }).eq('id', r.id);
      }

      return (data as any[])?.filter(r => {
        const created = new Date(r.created_at);
        return (now.getTime() - created.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      }) || [];
    },
  });

  const handleApprove = async (id: string, employeeId: string, attendanceDate: string, requestedStatus: string) => {
    // Update attendance record
    await supabase.from('attendance').update({ status: requestedStatus as any }).eq('employee_id', employeeId).eq('attendance_date', attendanceDate);
    // Update regularisation request
    const { error } = await supabase.from('attendance_regularisation' as any).update({
      status: 'Approved',
      reviewed_by: user?.employeeId,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success(lang === 'hi' ? '✓ स्वीकृत' : '✓ Approved');
      queryClient.invalidateQueries({ queryKey: ['pending_regularisations'] });
    }
  };

  const handleReject = async (id: string, employeeId: string) => {
    const { error } = await supabase.from('attendance_regularisation' as any).update({
      status: 'Rejected',
      reviewed_by: user?.employeeId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectReason,
    }).eq('id', id);
    if (error) { toast.error(error.message); return; }

    // Send notification to employee
    await supabase.from('notifications').insert({
      employee_id: employeeId,
      title: lang === 'hi' ? 'नियमितीकरण अस्वीकृत' : 'Regularisation Rejected',
      body: rejectReason || 'Your regularisation request was rejected.',
      type: 'regularisation_rejected',
    });

    toast.success(lang === 'hi' ? '✗ अस्वीकृत' : '✗ Rejected');
    setRejectId(null); setRejectReason('');
    queryClient.invalidateQueries({ queryKey: ['pending_regularisations'] });
  };

  return (
    <div className="space-y-3">
      <div className="text-[10px] text-primary font-semibold tracking-[0.15em] uppercase">
        {lang === 'hi' ? 'नियमितीकरण अनुरोध' : 'Regularisation Requests'}
      </div>
      {pending?.map((r: any) => (
        <div key={r.id} className="bg-card rounded-2xl border border-border card-shadow p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">{r.employees?.name}</div>
              <div className="text-[10px] text-muted-foreground">{r.employees?.emp_code} · {r.attendance_date}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {r.requested_status}
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{r.reason}</div>

          {rejectId === r.id ? (
            <div className="space-y-2">
              <input type="text" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder={lang === 'hi' ? 'अस्वीकृति कारण' : 'Rejection reason'}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs" />
              <div className="flex gap-2">
                <button onClick={() => handleReject(r.id, r.employee_id)}
                  className="flex-1 py-2 rounded-lg bg-destructive text-white text-xs font-bold">
                  {lang === 'hi' ? 'भेजें' : 'Send'}
                </button>
                <button onClick={() => setRejectId(null)}
                  className="flex-1 py-2 rounded-lg bg-muted text-foreground text-xs font-bold">
                  {lang === 'hi' ? 'रद्द' : 'Cancel'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => handleApprove(r.id, r.employee_id, r.attendance_date, r.requested_status)}
                className="flex-1 py-2 rounded-xl bg-success text-white font-bold text-sm flex items-center justify-center gap-1">
                <Check className="w-4 h-4" /> {lang === 'hi' ? 'स्वीकृत' : 'Approve'}
              </button>
              <button onClick={() => setRejectId(r.id)}
                className="flex-1 py-2 rounded-xl bg-destructive text-white font-bold text-sm flex items-center justify-center gap-1">
                <XIcon className="w-4 h-4" /> {lang === 'hi' ? 'अस्वीकृत' : 'Reject'}
              </button>
            </div>
          )}
        </div>
      ))}
      {(!pending || pending.length === 0) && (
        <div className="text-center text-xs text-muted-foreground py-4">
          {lang === 'hi' ? 'कोई लंबित अनुरोध नहीं' : 'No pending requests'}
        </div>
      )}
    </div>
  );
};

export default RegularisationApprovals;
