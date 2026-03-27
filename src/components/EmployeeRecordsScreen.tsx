import React, { useState, useMemo } from 'react';
import { useAllEmployees } from '@/hooks/useEmployeeData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronRight, Plus, User, Briefcase, Calendar, FileText, ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AddEmployeeForm from './AddEmployeeForm';

interface EmployeeRecordsScreenProps {
  lang: string;
  isOwner?: boolean;
}

const EmployeeRecordsScreen: React.FC<EmployeeRecordsScreenProps> = ({ lang, isOwner }) => {
  const { data: employees } = useAllEmployees();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('personal');

  const { data: allEmployees } = useQuery({
    queryKey: ['all_employees_unfiltered'],
    queryFn: async () => {
      const { data } = await supabase.from('employees').select('*').order('emp_code');
      return data || [];
    },
  });

  const filteredList = useMemo(() => {
    let list = allEmployees || [];
    if (filter === 'active') list = list.filter(e => e.is_active);
    if (filter === 'inactive') list = list.filter(e => !e.is_active);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.emp_code.toLowerCase().includes(q) || e.department.toLowerCase().includes(q));
    }
    return list;
  }, [allEmployees, filter, search]);

  const { data: selectedEmp } = useQuery({
    queryKey: ['emp_detail', selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data } = await supabase.from('employees').select('*').eq('id', selectedId!).single();
      return data;
    },
  });

  const { data: empContract } = useQuery({
    queryKey: ['emp_contract', selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data } = await supabase.from('employee_contracts').select('*').eq('employee_id', selectedId!).maybeSingle();
      return data;
    },
  });

  const { data: empLeaveHistory } = useQuery({
    queryKey: ['emp_leave_history', selectedId],
    enabled: !!selectedId && activeDetailTab === 'leave',
    queryFn: async () => {
      const { data } = await supabase.from('leave_requests').select('*').eq('employee_id', selectedId!).order('applied_at', { ascending: false }).limit(20);
      return data || [];
    },
  });

  const handleDeactivate = async () => {
    if (!selectedId || !selectedEmp) return;
    const confirmed = window.confirm(
      lang === 'hi'
        ? `क्या आप ${selectedEmp.name} को निष्क्रिय करना चाहते हैं?`
        : `Are you sure you want to deactivate ${selectedEmp.name}?`
    );
    if (!confirmed) return;

    const { error } = await supabase.from('employees').update({ is_active: false } as any).eq('id', selectedId);
    if (error) toast.error(error.message);
    else {
      toast.success(lang === 'hi' ? 'निष्क्रिय किया गया' : 'Deactivated');
      // Notify owner
      const { data: ownerEmp } = await supabase.from('employees').select('id').eq('role', 'owner' as any).limit(1).maybeSingle();
      if (ownerEmp) {
        await supabase.from('notifications').insert({
          employee_id: ownerEmp.id,
          title: 'Employee Deactivated',
          body: `HR has deactivated ${selectedEmp.name} (${selectedEmp.emp_code}). Confirm?`,
          type: 'deactivation',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['all_employees_unfiltered'] });
      setSelectedId(null);
    }
  };

  if (selectedId && selectedEmp) {
    const tabs = [
      { id: 'personal', icon: User, label: lang === 'hi' ? 'व्यक्तिगत' : 'Personal' },
      { id: 'salary', icon: Briefcase, label: lang === 'hi' ? 'वेतन' : 'Salary' },
      { id: 'contract', icon: FileText, label: lang === 'hi' ? 'अनुबंध' : 'Contract' },
      { id: 'leave', icon: Calendar, label: lang === 'hi' ? 'छुट्टी इतिहास' : 'Leave' },
    ];

    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedId(null)} className="text-sm text-primary font-medium flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> {lang === 'hi' ? 'वापस' : 'Back'}
        </button>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-lg font-bold text-foreground">{selectedEmp.name}</div>
          <div className="text-xs text-muted-foreground">{selectedEmp.emp_code} · {selectedEmp.department} · {selectedEmp.designation || '-'}</div>
          <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedEmp.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            {selectedEmp.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Detail tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveDetailTab(t.id)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${activeDetailTab === t.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {activeDetailTab === 'personal' && (
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            {[
              { label: 'Phone / फ़ोन', value: selectedEmp.phone },
              { label: 'DOB / जन्मतिथि', value: selectedEmp.date_of_birth || '-' },
              { label: 'Blood Group / रक्त समूह', value: selectedEmp.blood_group || '-' },
              { label: 'Address / पता', value: selectedEmp.address || '-' },
              { label: 'Emergency / आपातकालीन', value: selectedEmp.emergency_contact || '-' },
              { label: 'Email', value: selectedEmp.office_email || selectedEmp.personal_email || '-' },
              { label: 'Aadhar / आधार', value: selectedEmp.aadhar || '-' },
            ].map((f, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">{f.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeDetailTab === 'salary' && !isOwner && (
          <div className="bg-card rounded-xl border border-border p-4 space-y-2">
            {[
              { label: 'Basic / मूल', val: selectedEmp.base_salary },
              { label: 'HRA', val: selectedEmp.hra },
              { label: 'Conveyance / वाहन', val: selectedEmp.conveyance },
              { label: 'Medical / चिकित्सा', val: selectedEmp.medical },
              { label: 'Special / विशेष', val: selectedEmp.special_allowance },
              { label: 'Gross / सकल', val: selectedEmp.gross_monthly },
              { label: 'PF Deduction', val: selectedEmp.pf_deduction },
              { label: 'ESI Deduction', val: selectedEmp.esic_deduction },
            ].map((f, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-mono font-medium text-foreground">₹{Number(f.val || 0).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
        {activeDetailTab === 'salary' && isOwner && (
          <div className="text-center text-sm text-muted-foreground py-8">
            {lang === 'hi' ? 'वेतन विवरण मालिक के लिए उपलब्ध नहीं' : 'Salary details not available for Owner view'}
          </div>
        )}

        {activeDetailTab === 'contract' && (
          <div className="bg-card rounded-xl border border-border p-4 space-y-2">
            {[
              { label: 'Employment Type', val: empContract?.employment_type || 'Permanent' },
              { label: 'Grade / ग्रेड', val: empContract?.grade || selectedEmp.grade || '-' },
              { label: 'CTC Annual / वार्षिक', val: `₹${(empContract?.current_ctc || selectedEmp.ctc_annual || 0).toLocaleString('en-IN')}` },
              { label: 'Date of Joining', val: empContract?.date_of_joining || selectedEmp.date_of_joining || '-' },
              { label: 'Confirmation Date', val: empContract?.confirmation_date || '-' },
              { label: 'Last Increment', val: empContract?.last_increment_date || '-' },
              { label: 'Next Review', val: empContract?.next_review_date || '-' },
              { label: 'Notice Period', val: `${empContract?.notice_period_days || 30} days` },
            ].map((f, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-medium text-foreground">{f.val}</span>
              </div>
            ))}
          </div>
        )}

        {activeDetailTab === 'leave' && (
          <div className="space-y-2">
            {empLeaveHistory?.map((lr: any) => (
              <div key={lr.id} className="bg-card rounded-xl border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-foreground">{lr.leave_type}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    lr.status === 'Approved' ? 'bg-success/10 text-success' :
                    lr.status === 'Rejected' ? 'bg-destructive/10 text-destructive' :
                    'bg-warning/10 text-warning'
                  }`}>{lr.status}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">{lr.from_date} → {lr.to_date}</div>
              </div>
            ))}
            {(!empLeaveHistory || empLeaveHistory.length === 0) && (
              <div className="text-center text-sm text-muted-foreground py-6">
                {lang === 'hi' ? 'कोई छुट्टी इतिहास नहीं' : 'No leave history'}
              </div>
            )}
          </div>
        )}

        {/* Deactivate button - HR only */}
        {!isOwner && (
          <button
            onClick={handleDeactivate}
            className="w-full py-3 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm flex items-center justify-center gap-2 touch-target"
          >
            <Trash2 className="w-4 h-4" />
            {lang === 'hi' ? 'कर्मचारी निष्क्रिय करें / Deactivate' : 'Deactivate Employee / निष्क्रिय करें'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          {lang === 'hi' ? 'कर्मचारी रिकॉर्ड / Employee Records' : 'Employee Records / कर्मचारी रिकॉर्ड'}
        </h2>
        <span className="text-xs text-muted-foreground">{filteredList.length}</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'hi' ? 'खोजें...' : 'Search...'}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground"
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {(['active', 'inactive', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {f === 'active' ? (lang === 'hi' ? 'सक्रिय' : 'Active') :
             f === 'inactive' ? (lang === 'hi' ? 'निष्क्रिय' : 'Inactive') :
             (lang === 'hi' ? 'सभी' : 'All')}
          </button>
        ))}
      </div>

      {/* Employee list */}
      <div className="space-y-2">
        {filteredList.map(e => (
          <button
            key={e.id}
            onClick={() => { setSelectedId(e.id); setActiveDetailTab('personal'); }}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all active:scale-[0.98]"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${e.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {e.name.charAt(0)}
            </div>
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
};

export default EmployeeRecordsScreen;
