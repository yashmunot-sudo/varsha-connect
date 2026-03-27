import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Minus, Plus, Edit3 } from 'lucide-react';
import BilingualText from '@/components/BilingualText';

interface Props {
  departmentOverride?: string; // e.g. 'GATE' for security guard
}

const CasualWorkerCount: React.FC<Props> = ({ departmentOverride }) => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const department = departmentOverride || user?.department || 'General';
  const shiftType = 'general'; // auto-filled

  const [unskilled, setUnskilled] = useState(0);
  const [skilled, setSkilled] = useState(0);
  const [operator, setOperator] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const { data: existing, isLoading } = useQuery({
    queryKey: ['casual_worker_count', user?.employeeId, today],
    enabled: !!user?.employeeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('casual_workers' as any)
        .select('*')
        .eq('supervisor_id', user!.employeeId)
        .eq('shift_date', today)
        .eq('shift_type', shiftType)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const hasSubmitted = !!existing && !editing;

  const handleEdit = () => {
    if (existing) {
      setUnskilled(existing.unskilled_count || 0);
      setSkilled(existing.skilled_count || 0);
      setOperator(existing.operator_count || 0);
    }
    setEditing(true);
  };

  const handleSubmit = async () => {
    if (!user?.employeeId) return;
    setSubmitting(true);

    const payload = {
      supervisor_id: user.employeeId,
      department,
      shift_date: today,
      shift_type: shiftType,
      unskilled_count: unskilled,
      skilled_count: skilled,
      operator_count: operator,
    };

    let error;
    if (existing) {
      const result = await supabase.from('casual_workers' as any).update(payload).eq('id', existing.id);
      error = result.error;
    } else {
      const result = await supabase.from('casual_workers' as any).insert(payload);
      error = result.error;
    }

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === 'hi' ? '✓ सहेजा गया' : '✓ Saved');
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ['casual_worker_count'] });
    }
  };

  const CountInput = ({ label_hi, label_en, value, onChange }: { label_hi: string; label_en: string; value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <BilingualText hindi={label_hi} english={label_en} size="sm" />
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(0, value - 1))} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center active:scale-95 transition-all">
          <Minus className="w-4 h-4 text-foreground" />
        </button>
        <span className="font-display text-2xl font-bold text-foreground w-12 text-center">{value}</span>
        <button onClick={() => onChange(value + 1)} className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center active:scale-95 transition-all">
          <Plus className="w-4 h-4 text-primary" />
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (hasSubmitted) {
    const total = (existing.unskilled_count || 0) + (existing.skilled_count || 0) + (existing.operator_count || 0);
    return (
      <div className="px-4 py-4 space-y-4">
        <h2 className="font-display text-lg font-bold text-foreground">
          {lang === 'hi' ? 'ठेका श्रमिक गणना' : 'Contract Worker Count'}
        </h2>
        <div className="bg-card rounded-2xl border border-border card-shadow p-4 space-y-3">
          <div className="text-[10px] text-success font-semibold tracking-wider uppercase mb-2">
            ✓ {lang === 'hi' ? 'आज जमा किया गया' : 'Submitted Today'}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="font-display text-2xl font-bold text-foreground">{existing.unskilled_count}</div>
              <BilingualText hindi="अकुशल" english="Unskilled" size="xs" textColor="text-muted-foreground" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-foreground">{existing.skilled_count}</div>
              <BilingualText hindi="कुशल" english="Skilled" size="xs" textColor="text-muted-foreground" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-foreground">{existing.operator_count}</div>
              <BilingualText hindi="ऑपरेटर" english="Operator" size="xs" textColor="text-muted-foreground" />
            </div>
          </div>
          <div className="text-center pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">{lang === 'hi' ? 'कुल' : 'Total'}: </span>
            <span className="font-display text-lg font-bold text-primary">{total}</span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {lang === 'hi' ? 'विभाग' : 'Dept'}: {department} · {lang === 'hi' ? 'शिफ्ट' : 'Shift'}: {shiftType}
          </div>
          <button onClick={handleEdit} className="w-full py-3 rounded-xl border border-primary text-primary font-display font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <Edit3 className="w-4 h-4" /> {lang === 'hi' ? 'संपादित करें' : 'Edit'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="font-display text-lg font-bold text-foreground">
        {lang === 'hi' ? 'ठेका श्रमिक गणना' : 'Contract Worker Count'}
      </h2>
      <div className="bg-card rounded-2xl border border-border card-shadow p-4 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
          <span>{lang === 'hi' ? 'विभाग' : 'Dept'}: <strong className="text-foreground">{department}</strong></span>
          <span>{lang === 'hi' ? 'शिफ्ट' : 'Shift'}: <strong className="text-foreground">{shiftType}</strong></span>
        </div>
        <CountInput label_hi="अकुशल" label_en="Unskilled" value={unskilled} onChange={setUnskilled} />
        <CountInput label_hi="कुशल" label_en="Skilled" value={skilled} onChange={setSkilled} />
        <CountInput label_hi="ऑपरेटर" label_en="Operator" value={operator} onChange={setOperator} />
      </div>
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-xl bg-[hsl(30,90%,50%)] text-white font-display font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center"
        style={{ minHeight: '56px' }}
      >
        {submitting ? '...' : (lang === 'hi' ? 'जमा करें / Submit' : 'Submit / जमा करें')}
      </button>
    </div>
  );
};

export default CasualWorkerCount;
