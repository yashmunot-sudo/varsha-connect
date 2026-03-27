import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAllEmployees } from '@/hooks/useEmployeeData';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

const ESICChallanTab: React.FC = () => {
  const { lang } = useLanguage();
  const { data: employees } = useAllEmployees();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const esiEmps = employees?.filter(e => e.is_active && e.esi_no) || [];

  const rows = esiEmps.map(e => {
    const gross = Number(e.gross_monthly || e.base_salary || 0);
    const empESIC = Math.round(gross * 0.0075);
    const emplESIC = Math.round(gross * 0.0325);
    const totalESIC = Math.round(gross * 0.04);
    return { ...e, gross, empESIC, emplESIC, totalESIC };
  });

  const grandEmp = rows.reduce((s, r) => s + r.empESIC, 0);
  const grandEmpl = rows.reduce((s, r) => s + r.emplESIC, 0);
  const grandTotal = rows.reduce((s, r) => s + r.totalESIC, 0);

  const exportCSV = () => {
    const headers = ['Emp Code', 'Name', 'ESI Number', 'Gross Wages', 'Employee ESIC', 'Employer ESIC', 'Total ESIC'];
    const csvRows = rows.map(r => [r.emp_code, r.name, r.esi_no, r.gross, r.empESIC, r.emplESIC, r.totalESIC]);
    const csv = [headers, ...csvRows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ESIC_${monthNames[month]}_${year}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-foreground">ESIC Challan</h3>
        <button onClick={exportCSV} className="text-xs text-primary font-semibold flex items-center gap-1">
          <Download className="w-3.5 h-3.5" /> CSV
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
        <table className="w-full text-[10px] border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-1.5 py-1 text-left">Code</th>
              <th className="border border-border px-1.5 py-1 text-left">Name</th>
              <th className="border border-border px-1.5 py-1 text-left">ESI No</th>
              <th className="border border-border px-1.5 py-1 text-right">Gross</th>
              <th className="border border-border px-1.5 py-1 text-right">Emp (0.75%)</th>
              <th className="border border-border px-1.5 py-1 text-right">Empl (3.25%)</th>
              <th className="border border-border px-1.5 py-1 text-right">Total (4%)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-muted/50">
                <td className="border border-border px-1.5 py-0.5 font-mono">{r.emp_code}</td>
                <td className="border border-border px-1.5 py-0.5 truncate max-w-[100px]">{r.name}</td>
                <td className="border border-border px-1.5 py-0.5 font-mono">{r.esi_no}</td>
                <td className="border border-border px-1.5 py-0.5 text-right font-mono">{r.gross.toLocaleString('en-IN')}</td>
                <td className="border border-border px-1.5 py-0.5 text-right font-mono">{r.empESIC.toLocaleString('en-IN')}</td>
                <td className="border border-border px-1.5 py-0.5 text-right font-mono">{r.emplESIC.toLocaleString('en-IN')}</td>
                <td className="border border-border px-1.5 py-0.5 text-right font-mono font-bold">{r.totalESIC.toLocaleString('en-IN')}</td>
              </tr>
            ))}
            <tr className="bg-muted font-bold">
              <td colSpan={4} className="border border-border px-1.5 py-1 text-right">Grand Total</td>
              <td className="border border-border px-1.5 py-1 text-right font-mono">{grandEmp.toLocaleString('en-IN')}</td>
              <td className="border border-border px-1.5 py-1 text-right font-mono">{grandEmpl.toLocaleString('en-IN')}</td>
              <td className="border border-border px-1.5 py-1 text-right font-mono">{grandTotal.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ESICChallanTab;
