import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  lang: string;
  employeeId?: string;
  onClose: () => void;
}

const LeaveApplicationForm: React.FC<Props> = ({ lang, employeeId, onClose }) => {
  const queryClient = useQueryClient();
  const [leaveType, setLeaveType] = useState('EL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Query available comp-off days
  const { data: compOffDays } = useQuery({
    queryKey: ['comp_off_available', employeeId],
    enabled: !!employeeId && leaveType === 'CO',
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('comp_off_balance')
        .select('*')
        .eq('employee_id', employeeId!)
        .eq('is_used', false)
        .eq('is_expired', false)
        .gte('expiry_date', today);
      return data || [];
    },
  });

  // Get employee info for department/shift
  const { data: myEmp } = useQuery({
    queryKey: ['my_emp_for_leave', employeeId],
    enabled: !!employeeId,
    queryFn: async () => {
      const { data } = await supabase.from('employees').select('department, reporting_manager_emp_code').eq('id', employeeId!).single();
      return data;
    },
  });

  // Coverage check — how many from same department already have approved leave on those dates
  const { data: coverageInfo } = useQuery({
    queryKey: ['leave_coverage', myEmp?.department, fromDate, toDate],
    enabled: !!myEmp?.department && !!fromDate && !!toDate,
    queryFn: async () => {
      // Get total workers in dept
      const { data: deptEmps } = await supabase.from('employees').select('id')
        .eq('department', myEmp!.department).eq('is_active', true);
      const total = deptEmps?.length || 1;

      // Get approved leaves overlapping dates
      const { data: approvedLeaves } = await supabase.from('leave_requests').select('employee_id')
        .eq('status', 'Approved')
        .lte('from_date', toDate)
        .gte('to_date', fromDate);

      const onLeave = new Set(approvedLeaves?.map(l => l.employee_id) || []).size;
      const remaining = total - onLeave - 1; // minus current applicant
      const coveragePct = Math.round((remaining / total) * 100);
      return { total, onLeave, remaining, coveragePct };
    },
  });

  // Get reporting manager id
  const { data: manager } = useQuery({
    queryKey: ['reporting_manager', myEmp?.reporting_manager_emp_code],
    enabled: !!myEmp?.reporting_manager_emp_code,
    queryFn: async () => {
      const { data } = await supabase.from('employees').select('id')
        .eq('emp_code', myEmp!.reporting_manager_emp_code!).maybeSingle();
      return data;
    },
  });

  const isLowCoverage = coverageInfo && coverageInfo.coveragePct < 70;

  const handleSubmit = async () => {
    if (!employeeId || !fromDate || !toDate) return;
    setSubmitting(true);

    // Determine approver - if low coverage, escalate to plant head
    let approverId = manager?.id || null;
    if (isLowCoverage) {
      const { data: plantHead } = await supabase.from('employees').select('id')
        .eq('role', 'plant_head' as any).limit(1).maybeSingle();
      approverId = plantHead?.id || approverId;
    }

    const { error } = await supabase.from('leave_requests').insert({
      employee_id: employeeId,
      leave_type: leaveType,
      from_date: fromDate,
      to_date: toDate,
      reason: reason || null,
      current_approver_id: approverId,
    });

    if (error) {
      toast.error(error.message);
    } else {
      // Notify approver
      if (approverId) {
        await supabase.from('notifications').insert({
          employee_id: approverId,
          title: lang === 'hi' ? 'नया छुट्टी आवेदन / New Leave Request' : 'New Leave Request / नया छुट्टी आवेदन',
          body: `${leaveType} leave from ${fromDate} to ${toDate}`,
          type: 'leave_request',
        });
      }
      toast.success(lang === 'hi' ? 'आवेदन भेज दिया गया / Application Submitted' : 'Application Submitted / आवेदन भेज दिया गया');
      queryClient.invalidateQueries({ queryKey: ['pending_leave_requests'] });
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center">
      <div className="bg-card w-full max-w-lg rounded-t-2xl border-t border-border p-6 space-y-4 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'छुट्टी आवेदन / Leave Application' : 'Leave Application / छुट्टी आवेदन'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'छुट्टी प्रकार / Leave Type' : 'Leave Type / छुट्टी प्रकार'}</label>
          <select value={leaveType} onChange={e => setLeaveType(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
            <option value="EL">{lang === 'hi' ? 'अर्जित छुट्टी (EL) / Earned Leave' : 'Earned Leave (EL) / अर्जित छुट्टी'}</option>
            <option value="CL">{lang === 'hi' ? 'आकस्मिक छुट्टी (CL) / Casual Leave' : 'Casual Leave (CL) / आकस्मिक छुट्टी'}</option>
            <option value="SL">{lang === 'hi' ? 'बीमारी छुट्टी (SL) / Sick Leave' : 'Sick Leave (SL) / बीमारी छुट्टी'}</option>
            <option value="CO">{lang === 'hi' ? 'कम्प-ऑफ (CO) / Comp-Off' : 'Comp-Off (CO) / कम्प-ऑफ'}</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'से / From' : 'From / से'}</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'तक / To' : 'To / तक'}</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'कारण (वैकल्पिक) / Reason' : 'Reason (optional) / कारण'}</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
        </div>

        {/* Coverage Warning */}
        {coverageInfo && fromDate && toDate && (
          <div className={`rounded-xl p-3 flex items-start gap-2 ${isLowCoverage ? 'bg-destructive/10 border border-destructive/30' : 'bg-success/10 border border-success/30'}`}>
            {isLowCoverage && <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />}
            <div className="text-xs">
              <div className={`font-bold ${isLowCoverage ? 'text-destructive' : 'text-success'}`}>
                {lang === 'hi' ? 'विभाग कवरेज' : 'Dept. Coverage'}: {coverageInfo.coveragePct}%
              </div>
              <div className="text-muted-foreground">
                {coverageInfo.onLeave} {lang === 'hi' ? 'पहले से छुट्टी पर' : 'already on leave'} / {coverageInfo.total} {lang === 'hi' ? 'कुल' : 'total'}
              </div>
              {isLowCoverage && (
                <div className="text-destructive font-semibold mt-1">
                  {lang === 'hi' ? '⚠ 70% से कम — प्लांट हेड की मंजूरी आवश्यक' : '⚠ Below 70% — Plant Head approval required'}
                </div>
              )}
            </div>
          </div>
        )}

        <button onClick={handleSubmit} disabled={submitting || !fromDate || !toDate}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target disabled:opacity-50">
          {submitting ? '...' : (lang === 'hi' ? 'आवेदन भेजें / Submit' : 'Submit Application / आवेदन भेजें')}
        </button>
      </div>
    </div>
  );
};

export default LeaveApplicationForm;
