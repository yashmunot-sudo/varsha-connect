import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  lang: string;
  employeeId?: string;
  onClose: () => void;
}

const AdvanceApplicationForm: React.FC<Props> = ({ lang, employeeId, onClose }) => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [repaymentMonths, setRepaymentMonths] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Get employee gross for ratio check
  const { data: empInfo } = useQuery({
    queryKey: ['emp_advance_info', employeeId],
    enabled: !!employeeId,
    queryFn: async () => {
      const { data } = await supabase.from('employees').select('gross_monthly, reporting_manager_emp_code').eq('id', employeeId!).single();
      return data;
    },
  });

  // Get current outstanding advance balance
  const { data: currentBalance } = useQuery({
    queryKey: ['advance_outstanding', employeeId],
    enabled: !!employeeId,
    queryFn: async () => {
      const { data } = await supabase.from('salary_advances').select('closing_balance')
        .eq('employee_id', employeeId!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data?.closing_balance || 0;
    },
  });

  const grossMonthly = Number(empInfo?.gross_monthly || 0);
  const outstanding = Number(currentBalance || 0);
  const requestedAmt = Number(amount || 0);
  const projectedTotal = outstanding + requestedAmt;
  const pctOfGross = grossMonthly > 0 ? Math.round((projectedTotal / grossMonthly) * 100) : 0;

  const isAbove30 = pctOfGross > 30;
  const isAbove50 = pctOfGross > 50;

  const handleSubmit = async () => {
    if (!employeeId || !amount || requestedAmt <= 0) return;
    if (isAbove50) {
      toast.error(lang === 'hi' ? '50% से अधिक — स्वतः अस्वीकृत' : 'Above 50% of salary — auto-rejected');
      return;
    }
    setSubmitting(true);

    const { error } = await supabase.from('advance_requests').insert({
      employee_id: employeeId,
      amount_requested: requestedAmt,
      reason: reason || null,
      repayment_months: repaymentMonths,
    });

    if (error) {
      toast.error(error.message);
    } else {
      // Notify reporting manager
      if (empInfo?.reporting_manager_emp_code) {
        const { data: mgr } = await supabase.from('employees').select('id')
          .eq('emp_code', empInfo.reporting_manager_emp_code).maybeSingle();
        if (mgr) {
          await supabase.from('notifications').insert({
            employee_id: mgr.id,
            title: lang === 'hi' ? 'नया अग्रिम आवेदन / New Advance Request' : 'New Advance Request / नया अग्रिम आवेदन',
            body: `₹${requestedAmt.toLocaleString('en-IN')} — ${repaymentMonths} month(s)`,
            type: 'advance_request',
          });
        }
      }
      // If above 30%, also notify plant head
      if (isAbove30) {
        const { data: ph } = await supabase.from('employees').select('id')
          .eq('role', 'plant_head' as any).limit(1).maybeSingle();
        if (ph) {
          await supabase.from('notifications').insert({
            employee_id: ph.id,
            title: lang === 'hi' ? 'अग्रिम अनुमोदन आवश्यक / Advance Approval Required' : 'Advance Approval Required / अग्रिम अनुमोदन आवश्यक',
            body: `₹${requestedAmt.toLocaleString('en-IN')} (${pctOfGross}% of salary)`,
            type: 'advance_escalation',
          });
        }
      }
      toast.success(lang === 'hi' ? 'आवेदन भेज दिया गया / Application Submitted' : 'Application Submitted / आवेदन भेज दिया गया');
      queryClient.invalidateQueries({ queryKey: ['pending_advance_requests'] });
      queryClient.invalidateQueries({ queryKey: ['advance_balance'] });
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center">
      <div className="bg-card w-full max-w-lg rounded-t-2xl border-t border-border p-6 space-y-4 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'अग्रिम आवेदन / Advance Application' : 'Advance Application / अग्रिम आवेदन'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'राशि (₹) / Amount' : 'Amount (₹) / राशि'}</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="5000"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg text-foreground" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'कारण / Reason' : 'Reason / कारण'}</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'चुकौती अवधि / Repayment' : 'Repayment / चुकौती अवधि'}</label>
          <select value={repaymentMonths} onChange={e => setRepaymentMonths(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
            <option value={1}>1 {lang === 'hi' ? 'महीना / month' : 'month / महीना'}</option>
            <option value={2}>2 {lang === 'hi' ? 'महीने / months' : 'months / महीने'}</option>
            <option value={3}>3 {lang === 'hi' ? 'महीने / months' : 'months / महीने'}</option>
            <option value={6}>6 {lang === 'hi' ? 'महीने / months' : 'months / महीने'}</option>
          </select>
        </div>

        {/* Balance info */}
        {requestedAmt > 0 && (
          <div className={`rounded-xl p-3 border ${isAbove50 ? 'bg-destructive/10 border-destructive/30' : isAbove30 ? 'bg-warning/10 border-warning/30' : 'bg-muted border-border'}`}>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{lang === 'hi' ? 'वर्तमान बकाया' : 'Current Outstanding'}</span>
                <span className="font-mono font-medium text-foreground">₹{outstanding.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{lang === 'hi' ? 'नया अनुरोध' : 'New Request'}</span>
                <span className="font-mono font-medium text-foreground">₹{requestedAmt.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-border pt-1 flex justify-between font-bold">
                <span className="text-foreground">{lang === 'hi' ? 'कुल अनुमानित' : 'Projected Total'}</span>
                <span className="font-mono text-foreground">₹{projectedTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{lang === 'hi' ? 'सकल वेतन का %' : '% of Gross Salary'}</span>
                <span className={`font-bold ${isAbove50 ? 'text-destructive' : isAbove30 ? 'text-warning' : 'text-success'}`}>{pctOfGross}%</span>
              </div>
            </div>
            {isAbove50 && (
              <div className="flex items-center gap-1 mt-2 text-destructive text-xs font-bold">
                <XCircle className="w-4 h-4" />
                {lang === 'hi' ? '50% से अधिक — स्वतः अस्वीकृत' : 'Above 50% — Auto-rejected'}
              </div>
            )}
            {isAbove30 && !isAbove50 && (
              <div className="flex items-center gap-1 mt-2 text-warning text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                {lang === 'hi' ? '30% से अधिक — प्लांट हेड मंजूरी आवश्यक' : 'Above 30% — Plant Head approval required'}
              </div>
            )}
          </div>
        )}

        <button onClick={handleSubmit} disabled={submitting || !amount || isAbove50}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target disabled:opacity-50">
          {submitting ? '...' : (lang === 'hi' ? 'आवेदन भेजें / Submit' : 'Submit Application / आवेदन भेजें')}
        </button>
      </div>
    </div>
  );
};

export default AdvanceApplicationForm;
