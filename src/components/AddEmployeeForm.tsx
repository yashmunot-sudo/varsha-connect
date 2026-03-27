import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  lang: string;
  onClose: () => void;
}

const AddEmployeeForm: React.FC<Props> = ({ lang, onClose }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    emp_code: '', name: '', phone: '', department: 'Machine Shop',
    designation: '', role: 'worker', salary_type: 'WORKER',
    gross_monthly: '', date_of_joining: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const departments = ['Machine Shop', 'VMC Shop', 'Quality', 'Stores', 'Dispatch', 'Maintenance',
    'Administration', 'Purchase', 'Marketing', 'Design', 'Accounts', 'HR', 'IT', 'Production'];

  const roles = [
    { value: 'worker', label: 'Member / सदस्य' },
    { value: 'supervisor', label: 'Supervisor / सुपरवाइज़र' },
    { value: 'manager', label: 'Manager / मैनेजर' },
    { value: 'hr_admin', label: 'HR Admin' },
    { value: 'security_guard', label: 'Security / सुरक्षा' },
  ];

  const handleSubmit = async () => {
    if (!form.emp_code || !form.name || !form.phone) return;
    setSubmitting(true);

    const { error } = await supabase.from('employees').insert({
      emp_code: form.emp_code,
      name: form.name,
      phone: form.phone,
      department: form.department,
      designation: form.designation || null,
      role: form.role as any,
      salary_type: form.salary_type,
      gross_monthly: form.gross_monthly ? Number(form.gross_monthly) : 0,
      date_of_joining: form.date_of_joining || null,
      is_active: false, // Needs owner approval
      category: form.salary_type === 'WORKER' ? 'WORKER' : 'STAFF',
    } as any);

    if (error) {
      toast.error(error.message);
    } else {
      // Notify owner VFL1001
      const { data: owner } = await supabase.from('employees').select('id')
        .eq('emp_code', 'VFL1001').maybeSingle();
      if (owner) {
        await supabase.from('notifications').insert({
          employee_id: owner.id,
          title: lang === 'hi' ? 'नया कर्मचारी अनुमोदन / New Employee Approval' : 'New Employee Approval / नया कर्मचारी अनुमोदन',
          body: `${form.name} (${form.emp_code}) — ${form.department}. Approve to activate.`,
          type: 'employee_approval',
        });
      }
      toast.success(lang === 'hi' ? 'कर्मचारी जोड़ा गया — मालिक अनुमोदन लंबित' : 'Employee added — Owner approval pending');
      queryClient.invalidateQueries({ queryKey: ['all_employees_unfiltered'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    }
    setSubmitting(false);
  };

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center">
      <div className="bg-card w-full max-w-lg rounded-t-2xl border-t border-border p-6 space-y-3 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'नया कर्मचारी जोड़ें / Add Employee' : 'Add Employee / नया कर्मचारी जोड़ें'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        {[
          { key: 'emp_code', label: 'Emp Code / कोड', type: 'text', placeholder: 'VFL4xxx', required: true },
          { key: 'name', label: 'Name / नाम', type: 'text', placeholder: '', required: true },
          { key: 'phone', label: 'Phone / फ़ोन', type: 'tel', placeholder: '9xxxxxxxxx', required: true },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs text-muted-foreground mb-1 block">{f.label} {f.required && '*'}</label>
            <input type={f.type} value={(form as any)[f.key]} onChange={e => update(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'विभाग / Dept' : 'Dept / विभाग'}</label>
            <select value={form.department} onChange={e => update('department', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'भूमिका / Role' : 'Role / भूमिका'}</label>
            <select value={form.role} onChange={e => update('role', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'पद / Designation' : 'Designation / पद'}</label>
            <input type="text" value={form.designation} onChange={e => update('designation', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'प्रकार / Type' : 'Salary Type'}</label>
            <select value={form.salary_type} onChange={e => update('salary_type', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
              <option value="WORKER">Member / सदस्य</option>
              <option value="STAFF">Staff / स्टाफ</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'सकल मासिक (₹)' : 'Gross Monthly (₹)'}</label>
            <input type="number" value={form.gross_monthly} onChange={e => update('gross_monthly', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'शामिल होने की तारीख' : 'Date of Joining'}</label>
            <input type="date" value={form.date_of_joining} onChange={e => update('date_of_joining', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting || !form.emp_code || !form.name || !form.phone}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target disabled:opacity-50">
          {submitting ? '...' : (lang === 'hi' ? 'कर्मचारी जोड़ें / Add Employee' : 'Add Employee / कर्मचारी जोड़ें')}
        </button>

        <p className="text-center text-[10px] text-muted-foreground">
          {lang === 'hi' ? 'कर्मचारी निष्क्रिय के रूप में जोड़ा जाएगा — मालिक अनुमोदन आवश्यक' : 'Employee added as inactive — Owner approval required to activate'}
        </p>
      </div>
    </div>
  );
};

export default AddEmployeeForm;
