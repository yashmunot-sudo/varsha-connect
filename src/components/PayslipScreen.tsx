import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAllEmployees } from '@/hooks/useEmployeeData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface PayslipScreenProps {
  lang: string;
  employeeId?: string;
  isHR?: boolean;
}

// Number to words converter for Indian currency
function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }
  const result = convert(Math.abs(Math.round(num)));
  return 'Rupees ' + result.charAt(0).toUpperCase() + result.slice(1) + ' only';
}

const PayslipScreen: React.FC<PayslipScreenProps> = ({ lang, employeeId, isHR }) => {
  const { user } = useAuth();
  const { data: employees } = useAllEmployees();
  const [selectedEmpId, setSelectedEmpId] = useState(employeeId || user?.employeeId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hrView, setHrView] = useState<'list' | 'payroll'>('list');

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

  const { data: leaveBalance } = useQuery({
    queryKey: ['payslip_leave_balance', selectedEmpId, selectedYear],
    enabled: !!selectedEmpId,
    queryFn: async () => {
      const { data } = await supabase.from('leave_balances').select('*')
        .eq('employee_id', selectedEmpId).eq('year', selectedYear).maybeSingle();
      return data;
    },
  });

  const { data: advanceData } = useQuery({
    queryKey: ['payslip_advance', selectedEmpId, selectedMonth, selectedYear],
    enabled: !!selectedEmpId,
    queryFn: async () => {
      const monthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
      const { data } = await supabase.from('salary_advances').select('*')
        .eq('employee_id', selectedEmpId).eq('month', monthStr).maybeSingle();
      return data;
    },
  });

  const filteredEmployees = useMemo(() => {
    if (!employees || !searchQuery) return employees?.slice(0, 30) || [];
    const q = searchQuery.toLowerCase();
    return employees.filter(e =>
      e.name.toLowerCase().includes(q) || e.emp_code.toLowerCase().includes(q) || e.department.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [employees, searchQuery]);

  const emp = selectedEmployee;
  const presentDays = monthAttendance?.filter(a => a.status === 'P' || a.status === 'LC' || a.status === 'OT').length || 0;
  const otHours = monthAttendance?.reduce((sum, a) => sum + Number(a.overtime_hours || 0), 0) || 0;
  const daysPayable = presentDays; // prorated on 26-day month

  const basic = Number(emp?.base_salary || 0);
  const hra = Number(emp?.hra || 0);
  const conveyance = Number(emp?.conveyance || 0);
  const washing = Number(emp?.washing || 0);
  const education = Number(emp?.education || 0);
  const vda = Number(emp?.vda || 0);
  const heatAllow = Number(emp?.heat_allow || 0);
  const productionAllow = Number(emp?.production_allow || 0);

  // OT calculation: (basic/26/8) × 2 × ot_hours
  const otAmount = Math.round((basic / 26 / 8) * 2 * otHours);

  // Prorate factor
  const prorate = daysPayable / 26;

  // Earnings prorated
  const earningsRows = [
    { label: 'Basic', amount: Math.round(basic * prorate) },
    { label: 'HRA', amount: Math.round(hra * prorate) },
    { label: 'Conveyance Allow.', amount: Math.round(conveyance * prorate) },
    { label: 'Washing Allow.', amount: Math.round(washing * prorate) },
    { label: 'Education Allow.', amount: Math.round(education * prorate) },
    { label: 'VDA', amount: Math.round(vda * prorate) },
    { label: 'Heat Allow.', amount: Math.round(heatAllow * prorate) },
    { label: 'Overtime', amount: otAmount, note: otHours > 0 ? `${otHours} Hours` : '' },
    { label: 'Dispatch Incentive', amount: 0 },
    { label: 'Production Allow.', amount: Math.round(productionAllow * prorate) },
    { label: 'Arrears', amount: 0 },
    { label: 'Other Allowance', amount: 0 },
  ];

  const grossEarned = earningsRows.reduce((s, r) => s + r.amount, 0);

  // Deductions
  const pfAmount = Math.min(Math.round(basic * 0.12), 1800);
  const esicAmount = emp?.esi_no ? Math.round(grossEarned * 0.0075) : 0;
  const profTax = 200;
  const mlwf = 25;
  const advanceRecovery = Number(advanceData?.amount_deducted || 0);

  const deductionRows = [
    { label: 'PF', amount: pfAmount },
    { label: 'ESIC', amount: esicAmount },
    { label: 'P. Tax', amount: profTax },
    { label: 'M.L.W.F.', amount: mlwf },
    { label: 'Salary Advance', amount: advanceRecovery },
    { label: 'Society', amount: 0 },
    { label: 'Production Efficiency', amount: 0 },
    { label: 'Canteen', amount: 0 },
    { label: 'Other Deduction', amount: 0 },
  ];

  const totalDeductions = deductionRows.reduce((s, r) => s + r.amount, 0);
  const netPay = grossEarned - totalDeductions;

  const elBal = leaveBalance ? Number(leaveBalance.earned_leave) - Number(leaveBalance.el_used) : 0;
  const clBal = leaveBalance ? Number(leaveBalance.casual_leave) - Number(leaveBalance.cl_used) : 0;
  const slBal = leaveBalance ? Number(leaveBalance.sick_leave) - Number(leaveBalance.sl_used) : 0;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // HR Payroll View
  if (isHR && hrView === 'payroll') {
    return <HRPayrollView lang={lang} employees={employees || []} selectedMonth={selectedMonth} selectedYear={selectedYear}
      setSelectedMonth={setSelectedMonth} setSelectedYear={setSelectedYear} monthNames={monthNames}
      onSelectEmp={(id) => { setSelectedEmpId(id); setHrView('list'); }}
      onBack={() => setHrView('list')} />;
  }

  // HR Employee picker
  if (isHR && !selectedEmpId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'पेस्लिप / Payslip' : 'Payslip / पेस्लिप'}
          </h2>
          <button onClick={() => setHrView('payroll')} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
            {lang === 'hi' ? 'पेरोल दृश्य' : 'Payroll View'}
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder={lang === 'hi' ? 'नाम, कोड, विभाग खोजें...' : 'Search name, code, dept...'}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground" />
        </div>
        <div className="space-y-2">
          {filteredEmployees?.map(e => (
            <button key={e.id} onClick={() => setSelectedEmpId(e.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all">
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
          {monthNames[selectedMonth]} {selectedYear}
        </span>
        <button onClick={() => {
          if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
          else setSelectedMonth(m => m + 1);
        }} className="p-2 rounded-lg hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
      </div>

      {/* Payslip content */}
      <div className="bg-white text-black rounded-xl border border-border card-shadow print:shadow-none print:border-0 print:rounded-none" id="payslip-content">
        {/* Header */}
        <div className="border-b border-black p-4 text-center">
          <div className="font-bold text-base tracking-wide">VARSHA FORGINGS PVT LTD</div>
          <div className="text-[10px]">B7, M.I.D.C AREA, WALUJ, AURANGABAD.</div>
          <div className="text-xs font-semibold mt-1 underline">
            Payment Slip For The Month Of {monthNames[selectedMonth]} {selectedYear}
          </div>
        </div>

        {/* Employee Info Table */}
        <table className="w-full text-[11px] border-collapse">
          <tbody>
            <tr>
              <td className="border border-black/30 px-2 py-1 font-semibold">Name</td>
              <td className="border border-black/30 px-2 py-1" colSpan={2}>{emp?.name || '-'}</td>
              <td className="border border-black/30 px-2 py-1 font-semibold">Emp ID</td>
              <td className="border border-black/30 px-2 py-1" colSpan={2}>{emp?.emp_code || '-'}</td>
            </tr>
            <tr>
              <td className="border border-black/30 px-2 py-1 font-semibold">Dept.</td>
              <td className="border border-black/30 px-2 py-1" colSpan={2}>{emp?.department || '-'}</td>
              <td className="border border-black/30 px-2 py-1 font-semibold">Designation</td>
              <td className="border border-black/30 px-2 py-1" colSpan={2}>{emp?.designation || '-'}</td>
            </tr>
            <tr>
              <td className="border border-black/30 px-2 py-1 font-semibold">Present</td>
              <td className="border border-black/30 px-2 py-1">{presentDays}</td>
              <td className="border border-black/30 px-2 py-1 font-semibold">PH</td>
              <td className="border border-black/30 px-2 py-1"></td>
              <td className="border border-black/30 px-2 py-1 font-semibold">OT Hrs</td>
              <td className="border border-black/30 px-2 py-1">{otHours}</td>
            </tr>
            <tr>
              <td className="border border-black/30 px-2 py-1 font-semibold">EL</td>
              <td className="border border-black/30 px-2 py-1">{elBal}</td>
              <td className="border border-black/30 px-2 py-1 font-semibold">CL</td>
              <td className="border border-black/30 px-2 py-1">{clBal}</td>
              <td className="border border-black/30 px-2 py-1 font-semibold">SL</td>
              <td className="border border-black/30 px-2 py-1">{slBal}</td>
            </tr>
            <tr>
              <td className="border border-black/30 px-2 py-1 font-semibold">Days Payable</td>
              <td className="border border-black/30 px-2 py-1">{daysPayable}</td>
              <td className="border border-black/30 px-2 py-1" colSpan={4}></td>
            </tr>
          </tbody>
        </table>

        {/* Main Earnings & Deductions Table */}
        <table className="w-full text-[11px] border-collapse mt-0">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black/30 px-2 py-1.5 text-left font-semibold w-[40%]">Payment Structure</th>
              <th className="border border-black/30 px-2 py-1.5 text-right font-semibold w-[15%]">Earnings</th>
              <th className="border border-black/30 px-2 py-1.5 text-right font-semibold w-[15%]">Arrears</th>
              <th className="border border-black/30 px-2 py-1.5 text-left font-semibold w-[15%]">Deductions</th>
              <th className="border border-black/30 px-2 py-1.5 text-right font-semibold w-[15%]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {earningsRows.map((er, i) => {
              const dr = deductionRows[i];
              return (
                <tr key={i}>
                  <td className="border border-black/30 px-2 py-0.5">{er.label}</td>
                  <td className="border border-black/30 px-2 py-0.5 text-right font-mono">
                    {er.amount > 0 ? er.amount.toLocaleString('en-IN') : ''}
                    {er.note ? ` (${er.note})` : ''}
                  </td>
                  <td className="border border-black/30 px-2 py-0.5 text-right font-mono"></td>
                  <td className="border border-black/30 px-2 py-0.5">{dr?.label || ''}</td>
                  <td className="border border-black/30 px-2 py-0.5 text-right font-mono">
                    {dr && dr.amount > 0 ? dr.amount.toLocaleString('en-IN') : ''}
                  </td>
                </tr>
              );
            })}
            {/* Extra deduction rows if more than earnings */}
            {deductionRows.slice(earningsRows.length).map((dr, i) => (
              <tr key={`extra-${i}`}>
                <td className="border border-black/30 px-2 py-0.5"></td>
                <td className="border border-black/30 px-2 py-0.5"></td>
                <td className="border border-black/30 px-2 py-0.5"></td>
                <td className="border border-black/30 px-2 py-0.5">{dr.label}</td>
                <td className="border border-black/30 px-2 py-0.5 text-right font-mono">
                  {dr.amount > 0 ? dr.amount.toLocaleString('en-IN') : ''}
                </td>
              </tr>
            ))}
            {/* Totals row */}
            <tr className="font-bold bg-gray-50">
              <td className="border border-black/30 px-2 py-1">Gross Earnings</td>
              <td className="border border-black/30 px-2 py-1 text-right font-mono">{grossEarned.toLocaleString('en-IN')}</td>
              <td className="border border-black/30 px-2 py-1"></td>
              <td className="border border-black/30 px-2 py-1">Total Deductions</td>
              <td className="border border-black/30 px-2 py-1 text-right font-mono">{totalDeductions.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer Table */}
        <table className="w-full text-[11px] border-collapse mt-0">
          <tbody>
            <tr>
              <td className="border border-black/30 px-2 py-1 font-semibold">UAN</td>
              <td className="border border-black/30 px-2 py-1">{emp?.uan || '-'}</td>
              <td className="border border-black/30 px-2 py-1 font-bold text-right" rowSpan={3}>
                <div className="text-base">Net Pay</div>
                <div className="text-lg font-bold mt-1">₹{netPay.toLocaleString('en-IN')}</div>
                <div className="text-[9px] font-normal mt-1 italic">{numberToWords(netPay)}</div>
              </td>
            </tr>
            <tr>
              <td className="border border-black/30 px-2 py-1 font-semibold">CL Available</td>
              <td className="border border-black/30 px-2 py-1">{clBal}</td>
            </tr>
            <tr>
              <td className="border border-black/30 px-2 py-1 font-semibold">EL Available</td>
              <td className="border border-black/30 px-2 py-1">{elBal}</td>
            </tr>
            <tr>
              <td className="border border-black/30 px-2 py-1 font-semibold">SL Available</td>
              <td className="border border-black/30 px-2 py-1">{slBal}</td>
              <td className="border border-black/30 px-2 py-1 text-[9px] text-center">
                A/C: {emp?.account_no || '-'} | IFSC: {emp?.ifsc || '-'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Download PDF */}
      <button onClick={() => window.print()}
        className="w-full py-3 rounded-xl border border-primary text-primary font-display font-bold text-sm flex items-center justify-center gap-2 touch-target print:hidden">
        <Download className="w-4 h-4" />
        {lang === 'hi' ? 'PDF डाउनलोड / Download PDF' : 'Download PDF / PDF डाउनलोड'}
      </button>
    </div>
  );
};

// HR Payroll View Component
const HRPayrollView: React.FC<{
  lang: string;
  employees: any[];
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (m: number | ((p: number) => number)) => void;
  setSelectedYear: (y: number | ((p: number) => number)) => void;
  monthNames: string[];
  onSelectEmp: (id: string) => void;
  onBack: () => void;
}> = ({ lang, employees, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, monthNames, onSelectEmp, onBack }) => {
  const [search, setSearch] = useState('');

  // Calculate payroll for all employees
  const payrollData = useMemo(() => {
    return employees.map(emp => {
      const basic = Number(emp.base_salary || 0);
      const hra = Number(emp.hra || 0);
      const conv = Number(emp.conveyance || 0);
      const wash = Number(emp.washing || 0);
      const edu = Number(emp.education || 0);
      const vdaVal = Number(emp.vda || 0);
      const heat = Number(emp.heat_allow || 0);
      const prod = Number(emp.production_allow || 0);
      const gross = basic + hra + conv + wash + edu + vdaVal + heat + prod;
      const pf = Math.min(Math.round(basic * 0.12), 1800);
      const esic = emp.esi_no ? Math.round(gross * 0.0075) : 0;
      const totalDed = pf + esic + 200 + 25;
      const net = gross - totalDed;
      return { ...emp, basic, gross, pf, esic, pt: 200, mlwf: 25, totalDed, net };
    });
  }, [employees]);

  const filtered = useMemo(() => {
    if (!search) return payrollData;
    const q = search.toLowerCase();
    return payrollData.filter(e => e.name.toLowerCase().includes(q) || e.emp_code.toLowerCase().includes(q) || e.department.toLowerCase().includes(q));
  }, [payrollData, search]);

  const workerTotal = filtered.filter(e => e.category === 'WORKER').reduce((s, e) => s + e.net, 0);
  const staffTotal = filtered.filter(e => e.category === 'STAFF').reduce((s, e) => s + e.net, 0);
  const grandTotal = filtered.reduce((s, e) => s + e.net, 0);

  const exportCSV = () => {
    const headers = 'EmpCode,Name,Department,Designation,BasicWage,GrossEarned,PF,ESIC,PT,MLWF,AdvanceRecovery,OtherDeductions,TotalDeductions,NetPayable,BankAccount,IFSC';
    const rows = filtered.map(e =>
      `${e.emp_code},"${e.name}",${e.department},${e.designation || ''},${e.basic},${e.gross},${e.pf},${e.esic},${e.pt},${e.mlwf},0,0,${e.totalDed},${e.net},${e.account_no || ''},${e.ifsc || ''}`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${monthNames[selectedMonth]}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-primary font-medium">
        ← {lang === 'hi' ? 'वापस' : 'Back'}
      </button>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          {lang === 'hi' ? 'पेरोल / Payroll' : 'Payroll / पेरोल'}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear((y: number) => y - 1); }
            else setSelectedMonth((m: number) => m - 1);
          }} className="p-1 rounded hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs font-bold text-foreground">{monthNames[selectedMonth]} {selectedYear}</span>
          <button onClick={() => {
            if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear((y: number) => y + 1); }
            else setSelectedMonth((m: number) => m + 1);
          }} className="p-1 rounded hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'hi' ? 'खोजें...' : 'Search...'}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground" />
      </div>

      {/* Category totals */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-info/10 border border-info/30 rounded-xl p-2">
          <div className="font-display text-sm font-bold text-info">₹{(workerTotal / 100000).toFixed(1)}L</div>
          <div className="text-[9px] text-muted-foreground">{lang === 'hi' ? 'कर्मचारी' : 'Workers'}</div>
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-2">
          <div className="font-display text-sm font-bold text-primary">₹{(staffTotal / 100000).toFixed(1)}L</div>
          <div className="text-[9px] text-muted-foreground">{lang === 'hi' ? 'स्टाफ' : 'Staff'}</div>
        </div>
        <div className="bg-success/10 border border-success/30 rounded-xl p-2">
          <div className="font-display text-sm font-bold text-success">₹{(grandTotal / 100000).toFixed(1)}L</div>
          <div className="text-[9px] text-muted-foreground">{lang === 'hi' ? 'कुल' : 'Grand Total'}</div>
        </div>
      </div>

      {/* Employee list */}
      <div className="space-y-1.5">
        {filtered.map(e => (
          <button key={e.id} onClick={() => onSelectEmp(e.id)}
            className="w-full flex items-center gap-2 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all text-left">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">{e.name}</div>
              <div className="text-[9px] text-muted-foreground">{e.emp_code} · {e.department}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[10px] text-muted-foreground">₹{e.gross.toLocaleString('en-IN')}</div>
              <div className="text-xs font-bold text-foreground">₹{e.net.toLocaleString('en-IN')}</div>
            </div>
          </button>
        ))}
      </div>

      <button onClick={exportCSV}
        className="w-full py-3 rounded-xl border border-primary text-primary font-display font-bold text-sm flex items-center justify-center gap-2 touch-target">
        <Download className="w-4 h-4" />
        {lang === 'hi' ? 'CSV निर्यात / Export CSV' : 'Export CSV / CSV निर्यात'}
      </button>
    </div>
  );
};

export default PayslipScreen;
