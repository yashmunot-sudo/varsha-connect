import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, Clock, FileText, ChevronDown, ChevronUp, Send } from 'lucide-react';

const MRM_DEPARTMENTS = [
  'Marketing', 'Design', 'Purchase', 'Production', 'Quality',
  'Maintenance', 'Store', 'HR', 'Finance',
];

const MRMReviewTab: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const isManager = user?.role === 'manager';

  const { data: reviews } = useQuery({
    queryKey: ['mrm_reviews', currentMonth, currentYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mrm_reviews')
        .select('*')
        .eq('review_month', currentMonth)
        .eq('review_year', currentYear);
      if (error) throw error;
      return data;
    },
  });

  const [expandedDept, setExpandedDept] = useState<string | null>(
    isManager ? user?.department || null : null
  );
  const [formData, setFormData] = useState<Record<string, any>>({});

  const getReviewForDept = (dept: string) => reviews?.find(r => r.department === dept);

  const getStatusBadge = (dept: string) => {
    const review = getReviewForDept(dept);
    if (!review) return { label: lang === 'hi' ? 'लंबित' : 'Pending', color: 'bg-warning/15 text-warning' };
    if (review.status === 'Reviewed') return { label: lang === 'hi' ? 'समीक्षित' : 'Reviewed', color: 'bg-success/15 text-success' };
    return { label: lang === 'hi' ? 'जमा' : 'Submitted', color: 'bg-info/15 text-info' };
  };

  const handleSubmit = async (dept: string) => {
    const fd = formData[dept];
    if (!fd?.plan_vs_actual && fd?.plan_vs_actual !== 0) {
      toast.error('Please fill plan vs actual %');
      return;
    }
    const existing = getReviewForDept(dept);
    const payload = {
      department: dept,
      review_month: currentMonth,
      review_year: currentYear,
      plan_vs_actual_pct: fd.plan_vs_actual || 0,
      key_wins: fd.key_wins || null,
      key_issues: fd.key_issues || null,
      pending_actions: fd.pending_actions ? [{ action: fd.pending_actions, owner: fd.action_owner || '', due: fd.action_due || '' }] : [],
      submitted_by: user?.employeeId,
      submitted_at: new Date().toISOString(),
      status: 'Submitted',
    };

    let error;
    if (existing) {
      ({ error } = await supabase.from('mrm_reviews').update(payload as any).eq('id', existing.id));
    } else {
      ({ error } = await supabase.from('mrm_reviews').insert(payload as any));
    }
    if (error) toast.error(error.message);
    else {
      toast.success(lang === 'hi' ? '✓ जमा किया गया' : '✓ Submitted');
      queryClient.invalidateQueries({ queryKey: ['mrm_reviews'] });
    }
  };

  const handleReview = async (dept: string) => {
    const review = getReviewForDept(dept);
    if (!review) return;
    const { error } = await supabase.from('mrm_reviews').update({
      status: 'Reviewed',
      reviewed_by: user?.employeeId,
      reviewed_at: new Date().toISOString(),
    } as any).eq('id', review.id);
    if (error) toast.error(error.message);
    else {
      toast.success('✓ Marked as reviewed');
      queryClient.invalidateQueries({ queryKey: ['mrm_reviews'] });
    }
  };

  const canSubmit = (dept: string) => isManager && user?.department === dept;
  const canReview = user?.role === 'plant_head' || user?.role === 'owner';

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          {lang === 'hi' ? 'MRM — समीक्षा' : 'MRM — Monthly Review'}
        </h2>
        <span className="text-xs text-muted-foreground">
          {now.toLocaleString('en-IN', { month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Summary bar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['Pending', 'Submitted', 'Reviewed'].map(status => {
          const count = MRM_DEPARTMENTS.filter(d => {
            const r = getReviewForDept(d);
            if (status === 'Pending') return !r;
            return r?.status === status;
          }).length;
          const color = status === 'Pending' ? 'bg-warning/15 text-warning' : status === 'Submitted' ? 'bg-info/15 text-info' : 'bg-success/15 text-success';
          return (
            <div key={status} className={`px-3 py-1.5 rounded-full text-xs font-bold ${color}`}>
              {count} {status}
            </div>
          );
        })}
      </div>

      {/* Department cards */}
      {MRM_DEPARTMENTS.map(dept => {
        const badge = getStatusBadge(dept);
        const review = getReviewForDept(dept);
        const isExpanded = expandedDept === dept;

        return (
          <div key={dept} className="bg-card rounded-2xl border border-border card-shadow overflow-hidden">
            <button
              onClick={() => setExpandedDept(isExpanded ? null : dept)}
              className="w-full p-4 flex items-center gap-3 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{dept}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                {/* If review exists, show data */}
                {review && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{lang === 'hi' ? 'योजना बनाम वास्तविक' : 'Plan vs Actual'}</span>
                      <span className="font-bold text-foreground">{review.plan_vs_actual_pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${Number(review.plan_vs_actual_pct) >= 90 ? 'bg-success' : Number(review.plan_vs_actual_pct) >= 70 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${Math.min(Number(review.plan_vs_actual_pct), 100)}%` }} />
                    </div>
                    {review.key_wins && (
                      <div><span className="text-[10px] text-success font-semibold">{lang === 'hi' ? 'उपलब्धियाँ' : 'Wins'}:</span><p className="text-xs text-foreground mt-0.5">{review.key_wins}</p></div>
                    )}
                    {review.key_issues && (
                      <div><span className="text-[10px] text-danger font-semibold">{lang === 'hi' ? 'मुद्दे' : 'Issues'}:</span><p className="text-xs text-foreground mt-0.5">{review.key_issues}</p></div>
                    )}
                    {canReview && review.status !== 'Reviewed' && (
                      <button onClick={() => handleReview(dept)} className="w-full py-2.5 rounded-xl bg-success text-primary-foreground font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all">
                        <Check className="w-4 h-4" /> {lang === 'hi' ? 'समीक्षित करें' : 'Mark Reviewed'}
                      </button>
                    )}
                  </div>
                )}

                {/* Submit form for manager's own department */}
                {canSubmit(dept) && (!review || review.status !== 'Reviewed') && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'योजना बनाम वास्तविक %' : 'Plan vs Actual %'}</label>
                      <input
                        type="range" min="0" max="120" step="1"
                        value={formData[dept]?.plan_vs_actual ?? review?.plan_vs_actual_pct ?? 80}
                        onChange={e => setFormData(prev => ({ ...prev, [dept]: { ...prev[dept], plan_vs_actual: Number(e.target.value) } }))}
                        className="w-full accent-primary"
                      />
                      <div className="text-right text-xs font-bold text-primary">{formData[dept]?.plan_vs_actual ?? review?.plan_vs_actual_pct ?? 80}%</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'मुख्य उपलब्धियाँ' : 'Key Wins'}</label>
                      <textarea rows={2} value={formData[dept]?.key_wins ?? review?.key_wins ?? ''} onChange={e => setFormData(prev => ({ ...prev, [dept]: { ...prev[dept], key_wins: e.target.value } }))} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'मुख्य मुद्दे' : 'Key Issues'}</label>
                      <textarea rows={2} value={formData[dept]?.key_issues ?? review?.key_issues ?? ''} onChange={e => setFormData(prev => ({ ...prev, [dept]: { ...prev[dept], key_issues: e.target.value } }))} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'लंबित कार्य' : 'Pending Action'}</label>
                      <input value={formData[dept]?.pending_actions ?? ''} onChange={e => setFormData(prev => ({ ...prev, [dept]: { ...prev[dept], pending_actions: e.target.value } }))} placeholder={lang === 'hi' ? 'कार्य विवरण' : 'Action item'} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      <div className="flex gap-2 mt-2">
                        <input value={formData[dept]?.action_owner ?? ''} onChange={e => setFormData(prev => ({ ...prev, [dept]: { ...prev[dept], action_owner: e.target.value } }))} placeholder={lang === 'hi' ? 'ज़िम्मेदार' : 'Owner'} className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                        <input type="date" value={formData[dept]?.action_due ?? ''} onChange={e => setFormData(prev => ({ ...prev, [dept]: { ...prev[dept], action_due: e.target.value } }))} className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </div>
                    </div>
                    <button onClick={() => handleSubmit(dept)} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all">
                      <Send className="w-4 h-4" /> {lang === 'hi' ? 'जमा करें' : 'Submit Review'}
                    </button>
                  </div>
                )}

                {/* No review and can't submit */}
                {!review && !canSubmit(dept) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                    <Clock className="w-3.5 h-3.5" />
                    {lang === 'hi' ? 'अभी तक जमा नहीं किया गया' : 'Not yet submitted'}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MRMReviewTab;
