import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAllEmployees } from '@/hooks/useEmployeeData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

const LeaveEncashmentTab: React.FC = () => {
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const { data: employees } = useAllEmployees();
  const currentYear = new Date().getFullYear();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);

  const { data: balances } = useQuery({
    queryKey: ['leave_balances_all', currentYear],
    queryFn: async () => {
      const { data, error } = await supabase.from('leave_balances').select('*').eq('year', currentYear);
      if (error) throw error;
      return data;
    },
  });

  const activeEmps = employees?.filter(e => e.is_active) || [];

  const rows = activeEmps.map(e => {
    const bal = balances?.find(b => b.employee_id === e.id);
    const elBalance = bal ? Number(bal.earned_leave) - Number(bal.el_used) - Number((bal as any).encashed_days || 0) : 0;
    const basic = Number(e.base_salary || 0);
    const encashmentAmount = Math.round(elBalance * (basic / 26));
    return { ...e, elBalance: Math.max(0, elBalance), basic, encashmentAmount, balanceId: bal?.id };
  }).filter(r => r.elBalance > 0);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map(r => r.id)));
  };

  const handleProcess = async () => {
    if (selected.size === 0) return;
    setProcessing(true);

    for (const empId of selected) {
      const row = rows.find(r => r.id === empId);
      if (!row || !row.balanceId) continue;

      // Update leave_balances: set encashed_days, reduce balance
      await supabase.from('leave_balances').update({
        encashed_days: row.elBalance,
        el_used: Number(balances?.find(b => b.employee_id === empId)?.el_used || 0) + row.elBalance,
      } as any).eq('id', row.balanceId);
    }

    setProcessing(false);
    toast.success(lang === 'hi' ? '✓ एनकैशमेंट प्रोसेस हुआ' : '✓ Encashment Processed');
    setSelected(new Set());
    queryClient.invalidateQueries({ queryKey: ['leave_balances_all'] });
  };

  const exportCSV = () => {
    const selectedRows = rows.filter(r => selected.has(r.id));
    if (!selectedRows.length) return;
    const headers = ['Name', 'Emp Code', 'EL Balance', 'Basic Salary', 'Encashment Amount'];
    const csvRows = selectedRows.map(r => [r.name, r.emp_code, r.elBalance, r.basic, r.encashmentAmount]);
    const csv = [headers, ...csvRows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `leave_encashment_${currentYear}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-foreground">
          {lang === 'hi' ? 'छुट्टी एनकैशमेंट' : 'Leave Encashment'}
        </h3>
        <button onClick={exportCSV} className="text-xs text-primary font-semibold flex items-center gap-1">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-1.5 py-1 text-left">
                <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} />
              </th>
              <th className="border border-border px-1.5 py-1 text-left">Name</th>
              <th className="border border-border px-1.5 py-1 text-left">Code</th>
              <th className="border border-border px-1.5 py-1 text-right">EL Days</th>
              <th className="border border-border px-1.5 py-1 text-right">Basic</th>
              <th className="border border-border px-1.5 py-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-muted/50">
                <td className="border border-border px-1.5 py-0.5">
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} />
                </td>
                <td className="border border-border px-1.5 py-0.5">{r.name}</td>
                <td className="border border-border px-1.5 py-0.5 font-mono">{r.emp_code}</td>
                <td className="border border-border px-1.5 py-0.5 text-right font-mono">{r.elBalance}</td>
                <td className="border border-border px-1.5 py-0.5 text-right font-mono">₹{r.basic.toLocaleString('en-IN')}</td>
                <td className="border border-border px-1.5 py-0.5 text-right font-mono font-bold">₹{r.encashmentAmount.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected.size > 0 && (
        <button onClick={handleProcess} disabled={processing}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm disabled:opacity-50">
          {processing ? '...' : `${lang === 'hi' ? 'प्रोसेस करें' : 'Process Encashment'} (${selected.size})`}
        </button>
      )}
    </div>
  );
};

export default LeaveEncashmentTab;
