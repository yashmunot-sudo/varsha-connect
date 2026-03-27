import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

const ContractLabourSummary: React.FC = () => {
  const { lang } = useLanguage();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data: records } = useQuery({
    queryKey: ['contract_labour_summary', month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('casual_workers' as any)
        .select('*, employees:supervisor_id(name)')
        .gte('shift_date', startDate)
        .lte('shift_date', endDate)
        .order('shift_date', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const exportCSV = () => {
    if (!records?.length) return;
    const headers = ['Department', 'Shift Date', 'Unskilled', 'Skilled', 'Operator', 'Total', 'Submitted By', 'Time'];
    const rows = records.map((r: any) => [
      r.department,
      r.shift_date,
      r.unskilled_count,
      r.skilled_count,
      r.operator_count,
      (r.unskilled_count || 0) + (r.skilled_count || 0) + (r.operator_count || 0),
      r.employees?.name || '-',
      new Date(r.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `contract_labour_${monthNames[month]}_${year}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          {lang === 'hi' ? 'ठेका श्रम सारांश' : 'Contract Labour Summary'}
        </h2>
        <button onClick={exportCSV} className="text-xs text-primary font-semibold flex items-center gap-1">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} className="p-2 rounded-lg hover:bg-muted">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-display text-sm font-bold text-foreground">{monthNames[month]} {year}</span>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} className="p-2 rounded-lg hover:bg-muted">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-2 py-1.5 text-left font-semibold">{lang === 'hi' ? 'विभाग' : 'Dept'}</th>
              <th className="border border-border px-2 py-1.5 text-left font-semibold">{lang === 'hi' ? 'तिथि' : 'Date'}</th>
              <th className="border border-border px-2 py-1.5 text-right font-semibold">Un</th>
              <th className="border border-border px-2 py-1.5 text-right font-semibold">Sk</th>
              <th className="border border-border px-2 py-1.5 text-right font-semibold">Op</th>
              <th className="border border-border px-2 py-1.5 text-right font-semibold">{lang === 'hi' ? 'कुल' : 'Total'}</th>
              <th className="border border-border px-2 py-1.5 text-left font-semibold">{lang === 'hi' ? 'द्वारा' : 'By'}</th>
              <th className="border border-border px-2 py-1.5 text-left font-semibold">{lang === 'hi' ? 'समय' : 'Time'}</th>
            </tr>
          </thead>
          <tbody>
            {records?.map((r: any) => {
              const total = (r.unskilled_count || 0) + (r.skilled_count || 0) + (r.operator_count || 0);
              return (
                <tr key={r.id} className="hover:bg-muted/50">
                  <td className="border border-border px-2 py-1">{r.department}</td>
                  <td className="border border-border px-2 py-1">{r.shift_date}</td>
                  <td className="border border-border px-2 py-1 text-right font-mono">{r.unskilled_count}</td>
                  <td className="border border-border px-2 py-1 text-right font-mono">{r.skilled_count}</td>
                  <td className="border border-border px-2 py-1 text-right font-mono">{r.operator_count}</td>
                  <td className="border border-border px-2 py-1 text-right font-mono font-bold">{total}</td>
                  <td className="border border-border px-2 py-1 truncate max-w-[80px]">{r.employees?.name || '-'}</td>
                  <td className="border border-border px-2 py-1">{new Date(r.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              );
            })}
            {(!records || records.length === 0) && (
              <tr><td colSpan={8} className="border border-border px-2 py-4 text-center text-muted-foreground">{lang === 'hi' ? 'कोई डेटा नहीं' : 'No data'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractLabourSummary;
