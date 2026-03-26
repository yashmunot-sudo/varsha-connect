import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle2, Circle, ClipboardCheck } from 'lucide-react';

interface DailyChecklistProps {
  lang: string;
  employeeId?: string;
  onComplete: () => void;
}

const CHECKLIST_ITEMS = [
  { id: 'clean_workspace', label_hi: 'कार्यस्थल साफ किया', label_en: 'Cleaned workspace' },
  { id: 'machine_off', label_hi: 'मशीन बंद की', label_en: 'Machine switched off' },
  { id: 'tools_stored', label_hi: 'उपकरण रखे', label_en: 'Tools stored properly' },
  { id: 'safety_gear', label_hi: 'सुरक्षा गियर जमा किया', label_en: 'Safety gear returned' },
  { id: 'report_issues', label_hi: 'समस्याएं रिपोर्ट कीं', label_en: 'Issues reported (if any)' },
];

const DailyChecklist: React.FC<DailyChecklistProps> = ({ lang, employeeId, onComplete }) => {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const toggleItem = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allDone = checked.size === CHECKLIST_ITEMS.length;

  const handleSubmit = async () => {
    if (!employeeId || !allDone) return;
    setSubmitting(true);
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('daily_checklist_log').insert({
      employee_id: employeeId,
      date: today,
      items_completed: Array.from(checked),
      completed_at: new Date().toISOString(),
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === 'hi' ? '✓ चेकलिस्ट पूरी — अब चेक-आउट करें' : '✓ Checklist complete — now check out');
      onComplete();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center">
      <div className="bg-card w-full max-w-lg rounded-t-2xl border-t border-border p-6 space-y-4 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              {lang === 'hi' ? 'शिफ्ट समाप्ति चेकलिस्ट' : 'End-of-Shift Checklist'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {lang === 'hi' ? 'चेक-आउट से पहले पूरा करें' : 'Complete before checking out'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {CHECKLIST_ITEMS.map(item => {
            const done = checked.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  done
                    ? 'bg-success/5 border-success/30'
                    : 'bg-card border-border hover:bg-muted/50'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                )}
                <span className={`text-sm font-medium ${done ? 'text-success' : 'text-foreground'}`}>
                  {lang === 'hi' ? item.label_hi : item.label_en}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          {checked.size}/{CHECKLIST_ITEMS.length} {lang === 'hi' ? 'पूरा' : 'completed'}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allDone || submitting}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base touch-target disabled:opacity-50 transition-all"
        >
          {submitting ? '...' : (lang === 'hi' ? 'चेकलिस्ट पूरी करें और चेक-आउट करें' : 'Complete & Check Out')}
        </button>
      </div>
    </div>
  );
};

export default DailyChecklist;
