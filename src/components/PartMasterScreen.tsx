import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  lang: string;
}

const PartMasterScreen: React.FC<Props> = ({ lang }) => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: parts } = useQuery({
    queryKey: ['part_master'],
    queryFn: async () => {
      const { data } = await supabase.from('part_master').select('*').order('part_number');
      return data || [];
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          {lang === 'hi' ? 'पार्ट मास्टर / Part Master' : 'Part Master / पार्ट मास्टर'}
        </h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
          <Plus className="w-3.5 h-3.5" /> {lang === 'hi' ? 'नया' : 'Add Part'}
        </button>
      </div>

      {parts && parts.length > 0 ? (
        <div className="space-y-2">
          {parts.map((p: any) => (
            <div key={p.id} className="bg-card rounded-xl border border-border card-shadow p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-foreground">{p.part_name}</div>
                  <div className="text-[10px] text-muted-foreground">{p.part_number} · {p.machine_type} · {p.department}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-primary">{p.cycle_time_seconds}s</div>
                  <div className="text-[9px] text-muted-foreground">{lang === 'hi' ? 'चक्र समय' : 'cycle time'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground py-8 bg-muted/30 rounded-xl">
          {lang === 'hi' ? 'कोई पार्ट नहीं — ऊपर "नया" पर क्लिक करें' : 'No parts yet — click "Add Part" above'}
        </div>
      )}

      {showForm && <AddPartForm lang={lang} onClose={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['part_master'] }); }} />}
    </div>
  );
};

const AddPartForm: React.FC<{ lang: string; onClose: () => void }> = ({ lang, onClose }) => {
  const [partNumber, setPartNumber] = useState('');
  const [partName, setPartName] = useState('');
  const [cycleTime, setCycleTime] = useState('');
  const [machineType, setMachineType] = useState('CNC');
  const [department, setDepartment] = useState('Machine Shop');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!partNumber || !partName || !cycleTime) return;
    setSubmitting(true);
    const { error } = await supabase.from('part_master').insert({
      part_number: partNumber,
      part_name: partName,
      cycle_time_seconds: Number(cycleTime),
      machine_type: machineType,
      department,
    });
    if (error) toast.error(error.message);
    else { toast.success(lang === 'hi' ? '✓ पार्ट जोड़ा गया' : '✓ Part added'); onClose(); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center">
      <div className="bg-card w-full max-w-lg rounded-t-2xl border-t border-border p-6 space-y-3 animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'नया पार्ट / Add Part' : 'Add Part / नया पार्ट'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Part Number *</label>
          <input type="text" value={partNumber} onChange={e => setPartNumber(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Part Name *</label>
          <input type="text" value={partName} onChange={e => setPartName(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Cycle Time (s) *</label>
            <input type="number" value={cycleTime} onChange={e => setCycleTime(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Machine Type</label>
            <select value={machineType} onChange={e => setMachineType(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
              <option value="CNC">CNC</option>
              <option value="VMC">VMC</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Department</label>
          <select value={department} onChange={e => setDepartment(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
            <option value="Machine Shop">Machine Shop</option>
            <option value="VMC Shop">VMC Shop</option>
          </select>
        </div>
        <button onClick={handleSubmit} disabled={submitting || !partNumber || !partName || !cycleTime}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target disabled:opacity-50">
          {submitting ? '...' : (lang === 'hi' ? 'पार्ट जोड़ें / Add Part' : 'Add Part / पार्ट जोड़ें')}
        </button>
      </div>
    </div>
  );
};

export default PartMasterScreen;
