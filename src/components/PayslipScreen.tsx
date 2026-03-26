import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAllEmployees, useMyAttendance } from '@/hooks/useEmployeeData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface PayslipScreenProps {
  lang: string;
  employeeId?: string;
  isHR?: boolean;
}

const PayslipScreen: React.FC<PayslipScreenProps> = ({ lang, employeeId, isHR }) => {
  const { user } = useAuth();
  const { data: employees } = useAllEmployees();
  const [selectedEmpId, setSelectedEmpId] = useState(employeeId || user?.employeeId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: selectedEmployee } = useQuery({
    queryKey: ['employee_detail', selectedEmpId],
    enabled: !!selectedEmpId,
    queryFn: async () => {
      const { data } = await supabase.from('employees').select('*').eq('id', selectedEmpId).single();
      return data;
    },
  });

  const { data: monthAttendance } = useQuery({
    queryKey: ['month_attendance', selectedEmpId, selectedMonth, selectedYear],
    enabled: !!selectedEmpId,
    queryFn: async () => {
      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
      const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', selectedEmpId)
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate);
      return data || [];
    },
  });

  const filteredEmployees = useMemo(() => {
    if (!employees || !searchQuery) return employees?.slice(0, 20) || [];
    const q = searchQuery.toLowerCase();
    return employees.filter(e =>
      e.name.toLowerCase().includes(q) || e.emp_code.toLowerCase().includes(q) || e.department.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [employees, searchQuery]);

  const emp = selectedEmployee;
  const daysPresent = monthAttendance?.filter(a => a.status === 'P' || a.status === 'LC' || a.status === 'OT').length || 0;
  const totalWorkingDays = (() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    let wd = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (new Date(selectedYear, selectedMonth, d).getDay() !== 0) wd++;
    }
    return wd;
  })();
  const daysLOP = Math.max(0, totalWorkingDays - daysPresent);
  const attPct = totalWorkingDays > 0 ? Math.round((daysPresent / totalWorkingDays) * 100) : 0;

  const isWorker = emp?.salary_type === 'WORKER' || emp?.category === 'WORKER';

  const grossMonthly = Number(emp?.gross_monthly || 0);
  const grossEarned = totalWorkingDays > 0 ? Math.round((grossMonthly * daysPresent) / totalWorkingDays) : 0;

  const baseSalary = Number(emp?.base_salary || 0);
  const hra = Number(emp?.hra || 0);
  const conveyance = Number(emp?.conveyance || 0);
  const medical = Number(emp?.medical || 0);
  const education = Number(emp?.education || 0);
  const washing = Number(emp?.washing || 0);
  const vda = Number(emp?.vda || 0);
  const heatAllow = Number(emp?.heat_allow || 0);
  const productionAllow = Number(emp?.production_allow || 0);
  const specialAllow = Number(emp?.special_allowance || 0);
  const profDev = Number(emp?.prof_development || 0);
  const communication = Number(emp?.communication || 0);
  const uniform = Number(emp?.uniform || 0);

  const workerEarnings = [
    { label: 'Basic / मूल', amount: baseSalary },
    { label: 'HRA / मकान भत्ता', amount: hra },
    { label: 'Conveyance / वाहन', amount: conveyance },
    { label: 'Washing / धुलाई', amount: washing },
    { label: 'Education / शिक्षा', amount: education },
    { label: 'VDA', amount: vda },
    { label: 'Heat Allowance / गर्मी', amount: heatAllow },
    { label: 'Production Allow / उत्पादन', amount: productionAllow },
  ].filter(e => e.amount > 0);

  const staffEarnings = [
    { label: 'Basic / मूल', amount: baseSalary },
    { label: 'HRA / मकान भत्ता', amount: hra },
    { label: 'Conveyance / वाहन', amount: conveyance },
    { label: 'Medical / चिकित्सा', amount: medical },
    { label: 'Education / शिक्षा', amount: education },
    { label: 'Prof. Dev. / व्यावसायिक', amount: profDev },
    { label: 'Communication / संचार', amount: communication },
    { label: 'Uniform / वर्दी', amount: uniform },
    { label: 'Washing / धुलाई', amount: washing },
    { label: 'Special Allow / विशेष', amount: specialAllow },
  ].filter(e => e.amount > 0);

  const earnings = isWorker ? workerEarnings : staffEarnings;

  const pfDeduction = Number(emp?.pf_deduction || 0) || Math.round(baseSalary * 0.12);
  const esiDeduction = Number(emp?.esic_deduction || 0) || Math.round(grossEarned * 0.0075);
  const profTax = 200;
  const mlwf = 25;
  const advanceRecovery = 0;

  const deductions = [
    { label: 'PF (12%) / भविष्य निधि', amount: pfDeduction },
    { label: 'ESI (0.75%) / राज्य बीमा', amount: esiDeduction },
    { label: 'Prof. Tax / पेशेवर कर', amount: profTax },
    { label: 'MLWF', amount: mlwf },
  ];
  if (advanceRecovery > 0) deductions.push({ label: 'Advance Recovery / अग्रिम वसूली', amount: advanceRecovery });

  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
  const netPayable = grossEarned - totalDeductions;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesHi = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

  if (isHR && !selectedEmpId) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-foreground">
          {lang === 'hi' ? 'पेस्लिप / Payslip' : 'Payslip / पेस्लिप'}
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={lang === 'hi' ? 'नाम, कोड, विभाग खोजें...' : 'Search name, code, dept...'}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground"
          />
        </div>
        <div className="space-y-2">
          {filteredEmployees?.map(e => (
            <button
              key={e.id}
              onClick={() => setSelectedEmpId(e.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all"
            >
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold text-foreground">{e.name}</div>
                <div className="text-[10px] text-muted-foreground">{e.emp_code} · {e.department}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isHR && (
        <button onClick={() => setSelectedEmpId('')} className="text-sm text-primary font-medium">
          ← {lang === 'hi' ? 'वापस' : 'Back to list'}
        </button>
      )}

      {/* Month selector */}
      <div className="flex items-center justify-between">
        <button onClick={() => {
          if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
          else setSelectedMonth(m => m - 1);
        }} className="p-2 rounded-lg hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
        <span className="font-display text-sm font-bold text-foreground">
          {lang === 'hi' ? monthNamesHi[selectedMonth] : monthNames[selectedMonth]} {selectedYear}
        </span>
        <button onClick={() => {
          if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
          else setSelectedMonth(m => m + 1);
        }} className="p-2 rounded-lg hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
      </div>

      {/* Payslip card */}
      <div className="bg-card rounded-xl border border-border card-shadow print:shadow-none" id="payslip-content">
        {/* Header */}
        <div className="bg-primary/5 border-b border-border p-4 text-center">
          <div className="font-display text-base font-extrabold text-foreground">VARSHA FORGINGS PVT LTD</div>
          <div className="text-[10px] text-muted-foreground">Aurangabad, Maharashtra</div>
          <div className="text-xs font-semibold text-primary mt-1">
            {monthNames[selectedMonth]} {selectedYear} — Payslip
          </div>
        </div>

        {/* Employee info */}
        <div className="p-4 border-b border-border grid grid-cols-2 gap-2 text-xs">
          <div><span className="text-muted-foreground">Name / नाम:</span> <span className="font-semibold text-foreground">{emp?.name}</span></div>
          <div><span className="text-muted-foreground">Code / कोड:</span> <span className="font-semibold text-foreground">{emp?.emp_code}</span></div>
          <div><span className="text-muted-foreground">Dept / विभाग:</span> <span className="font-semibold text-foreground">{emp?.department}</span></div>
          <div><span className="text-muted-foreground">Desig / पद:</span> <span className="font-semibold text-foreground">{emp?.designation || '-'}</span></div>
          <div><span className="text-muted-foreground">UAN:</span> <span className="font-semibold text-foreground">{emp?.uan || '-'}</span></div>
          <div><span className="text-muted-foreground">ESI:</span> <span className="font-semibold text-foreground">{emp?.esi_no || '-'}</span></div>
          <div><span className="text-muted-foreground">PAN:</span> <span className="font-semibold text-foreground">{emp?.pan || '-'}</span></div>
          <div><span className="text-muted-foreground">A/C:</span> <span className="font-semibold text-foreground">{emp?.account_no || '-'}</span></div>
        </div>

        {/* Earnings & Deductions side by side on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Earnings */}
          <div className="p-4 border-b sm:border-b-0 sm:border-r border-border">
            <div className="text-[10px] text-primary font-semibold tracking-wider uppercase mb-2">
              {lang === 'hi' ? 'आय / EARNINGS' : 'EARNINGS / आय'}
            </div>
            <div className="space-y-1.5">
              {earnings.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{e.label}</span>
                  <span className="font-mono font-medium text-foreground">₹{e.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="border-t border-border pt-1.5 mt-2 flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">{lang === 'hi' ? 'सकल अर्जित / Gross Earned' : 'Gross Earned / सकल अर्जित'}</span>
                <span className="text-success font-mono">₹{grossEarned.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="p-4">
            <div className="text-[10px] text-destructive font-semibold tracking-wider uppercase mb-2">
              {lang === 'hi' ? 'कटौती / DEDUCTIONS' : 'DEDUCTIONS / कटौती'}
            </div>
            <div className="space-y-1.5">
              {deductions.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-mono font-medium text-foreground">₹{d.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="border-t border-border pt-1.5 mt-2 flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">{lang === 'hi' ? 'कुल कटौती / Total Deductions' : 'Total Deductions / कुल कटौती'}</span>
                <span className="text-destructive font-mono">₹{totalDeductions.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Payable */}
        <div className="bg-primary/5 border-t border-border p-4 flex items-center justify-between">
          <span className="font-display text-sm font-extrabold text-foreground">
            {lang === 'hi' ? 'शुद्ध देय / NET PAYABLE' : 'NET PAYABLE / शुद्ध देय'}
          </span>
          <span className="font-display text-xl font-extrabold text-primary">₹{netPayable.toLocaleString('en-IN')}</span>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="font-bold text-foreground">{daysPresent}</div>
            <div className="text-muted-foreground">{lang === 'hi' ? 'कार्य दिवस / Days Worked' : 'Days Worked'}</div>
          </div>
          <div>
            <div className="font-bold text-destructive">{daysLOP}</div>
            <div className="text-muted-foreground">{lang === 'hi' ? 'LOP दिवस / LOP Days' : 'LOP Days'}</div>
          </div>
          <div>
            <div className="font-bold text-success">{attPct}%</div>
            <div className="text-muted-foreground">{lang === 'hi' ? 'हाज़िरी / Attendance' : 'Attendance'}</div>
          </div>
        </div>
      </div>

      {/* Download PDF */}
      <button
        onClick={() => window.print()}
        className="w-full py-3 rounded-xl border border-primary text-primary font-display font-bold text-sm flex items-center justify-center gap-2 touch-target"
      >
        <Download className="w-4 h-4" />
        {lang === 'hi' ? 'PDF डाउनलोड / Download PDF' : 'Download PDF / PDF डाउनलोड'}
      </button>
    </div>
  );
};

export default PayslipScreen;
