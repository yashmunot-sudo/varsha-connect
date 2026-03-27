import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAllEmployees } from '@/hooks/useEmployeeData';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

const PFChallanTab: React.FC = () => {
  const { lang } = useLanguage();
  const { data: employees } = useAllEmployees();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const activeEmps = employees?.filter(e => e.is_active && e.uan) || [];

  const rows = activeEmps.map(e => {
    const basic = Number(e.base_salary || 0);
    const gross = Number(e.gross_monthly || basic);
    const pfWages = basic;
    const epsWages = Math.min(pfWages, 15000);
    const empPF = Math.round(pfWages * 0.12);
    const emplPF = Math.round(pfWages * 0.12);
    const epsContrib = Math.min(Math.round(epsWages * 0.0833), 1250);
    const diffEPF = empPF - epsContrib;
    return { ...e, gross, pfWages, empPF, emplPF, totalPF: empPF + emplPF, epsWages, epsContrib, diffEPF };
  });

  const grandEmpPF = rows.reduce((s, r) => s + r.empPF, 0);
  const grandEmplPF = rows.reduce((s, r) => s + r.emplPF, 0);
  const grandTotal = rows.reduce((s, r) => s + r.totalPF, 0);

  const exportECR = () => {
    const headers = ['UAN', 'Employee Name', 'Gross Wages', 'EPF Wages', 'EPS Wages', 'EPF Contribution', 'EPS Contribution', 'Diff EPF-EPS'];
    const csvRows = rows.map(r => [r.uan, r.name, r.gross, r.pfWages, r.epsWages, r.empPF, r.epsContrib, r.diffEPF]);
    const csv = [headers, ...csvRows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `PF_ECR_${monthNames[month]}_${year}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-foreground">PF Challan</h3>
        <button onClick={exportECR} className="text-xs text-primary font-semibold flex items-center gap-1">
          <Download className="w-3.5 h-3.5" /> ECR
        </button>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} className="p-1 rounded hover:bg-muted">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-foreground">{monthNames[month]} {year}</span>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} className="p-1 rounded hover:bg-muted">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-1.5 py-1 text-left">Code</th>
              <th className="border border-border px-1.5 py-1 text-left">Name</th>
              <th className="border border-border px-1.5 py-1 text-left">UAN</th>
              <th className="border border-border px-1.5 py-1 text-right">Gross</th>
              <th className="border border-border px-1.5 py-1 text-right">PF Wages</th>
              <th className="border border-border px-1.5 py-1 text-right">Emp PF</th>
              <th className="border border-border px-1.5 py-1 text-right">Empl PF</th>
              <th className="border border-border px-1.5 py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-muted/50">
                <td className="border border-border px-1.5 py-0.5 font-mono">{r.emp_code}</td>
                <td className="border border-border px-1.5 py-0.5 truncate max-w-[100px]">{r.name}</td>
                <td className="border border-border px-1.5 py-0.5 font-mono">{r.uan || '-'}</td>
                <td className="border border-border px-1.5 py-0.5 text-right font-mono">{r.gross.toLocaleString('en-IN')}</td>
                <td className="border border-border px-1.5 py-0.5 text-right font-mono">{r.pfWages.toLocaleString('en-IN')}</td>
                <td className="border border-border px-1.5 py-0.5 text-right font-mono">{r.empPF.toLocaleString('en-IN')}</td>
                <td className="border border-border px-1.5 py-0.5 text-right font-mono">{r.emplPF.toLocaleString('en-IN')}</td>
                <td className="border border-border px-1.5 py-0.5 text-right font-mono font-bold">{r.totalPF.toLocaleString('en-IN')}</td>
              </tr>
            ))}
            <tr className="bg-muted font-bold">
              <td colSpan={5} className="border border-border px-1.5 py-1 text-right">Grand Total</td>
              <td className="border border-border px-1.5 py-1 text-right font-mono">{grandEmpPF.toLocaleString('en-IN')}</td>
              <td className="border border-border px-1.5 py-1 text-right font-mono">{grandEmplPF.toLocaleString('en-IN')}</td>
              <td className="border border-border px-1.5 py-1 text-right font-mono">{grandTotal.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PFChallanTab;
