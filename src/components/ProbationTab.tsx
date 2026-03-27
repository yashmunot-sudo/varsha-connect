import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Props {
  employee: any;
}

const ProbationTab: React.FC<Props> = ({ employee }) => {
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const [probationPeriod, setProbationPeriod] = useState<3 | 6>(6);
  const [probationStatus, setProbationStatus] = useState(employee?.probation_status || 'not_applicable');
  const [saving, setSaving] = useState(false);

  const joiningDate = employee?.date_of_joining;
  const expectedConfDate = joiningDate
    ? new Date(new Date(joiningDate).setMonth(new Date(joiningDate).getMonth() + probationPeriod)).toISOString().split('T')[0]
    : null;

  useEffect(() => {
    // Check if confirmation is due and send notification
    if (!expectedConfDate || !employee?.id) return;
    const today = new Date();
    const expDate = new Date(expectedConfDate);
    const daysUntil = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 7 && daysUntil >= 0 && probationStatus === 'on_probation') {
      // Check if notification already sent today
      const todayStr = today.toISOString().split('T')[0];
      supabase.from('notifications')
        .select('id')
        .eq('type', 'probation_due')
        .gte('created_at', todayStr + 'T00:00:00')
        .ilike('body', `%${employee.name}%`)
        .then(({ data }) => {
          if (!data?.length) {
            // Send notification to all HR admins
            supabase.from('employees').select('id').eq('role', 'hr_admin' as any).then(({ data: hrAdmins }) => {
              if (hrAdmins?.length) {
                supabase.from('notifications').insert(
                  hrAdmins.map(hr => ({
                    employee_id: hr.id,
                    title: lang === 'hi' ? 'पुष्टि अवधि समाप्त' : 'Confirmation Due',
                    body: `${employee.name} is due for confirmation on ${expectedConfDate}.`,
                    type: 'probation_due',
                  }))
                );
              }
            });
          }
        });
    }

    // Overdue reminder
    if (daysUntil < 0 && probationStatus === 'on_probation') {
      const todayStr = today.toISOString().split('T')[0];
      supabase.from('notifications')
        .select('id')
        .eq('type', 'probation_overdue')
        .gte('created_at', todayStr + 'T00:00:00')
        .ilike('body', `%${employee.name}%`)
        .then(({ data }) => {
          if (!data?.length) {
            supabase.from('employees').select('id').eq('role', 'hr_admin' as any).then(({ data: hrAdmins }) => {
              if (hrAdmins?.length) {
                supabase.from('notifications').insert(
                  hrAdmins.map(hr => ({
                    employee_id: hr.id,
                    title: lang === 'hi' ? 'पुष्टि अवधि बीत गई' : 'Confirmation Overdue',
                    body: `${employee.name} confirmation was due on ${expectedConfDate} but probation_status is still on_probation.`,
                    type: 'probation_overdue',
                  }))
                );
              }
            });
          }
        });
    }
  }, [expectedConfDate, probationStatus, employee]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('employees').update({
      probation_status: probationStatus,
      confirmation_date: probationStatus === 'confirmed' ? new Date().toISOString().split('T')[0] : null,
    } as any).eq('id', employee.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success('Saved'); queryClient.invalidateQueries({ queryKey: ['employee_detail'] }); }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display text-sm font-bold text-foreground">
        {lang === 'hi' ? 'परिवीक्षा ट्रैकिंग' : 'Probation Tracking'}
      </h3>

      <div className="bg-card rounded-xl border border-border p-3 space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{lang === 'hi' ? 'ज्वाइनिंग तिथि' : 'Joining Date'}</span>
          <span className="font-semibold text-foreground">{joiningDate || '-'}</span>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">{lang === 'hi' ? 'परिवीक्षा अवधि' : 'Probation Period'}</label>
          <select value={probationPeriod} onChange={e => setProbationPeriod(Number(e.target.value) as 3 | 6)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value={3}>3 {lang === 'hi' ? 'महीने' : 'months'}</option>
            <option value={6}>6 {lang === 'hi' ? 'महीने' : 'months'}</option>
          </select>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{lang === 'hi' ? 'अपेक्षित पुष्टि तिथि' : 'Expected Confirmation'}</span>
          <span className="font-semibold text-foreground">{expectedConfDate || '-'}</span>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">{lang === 'hi' ? 'स्थिति' : 'Status'}</label>
          <select value={probationStatus} onChange={e => setProbationStatus(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="not_applicable">{lang === 'hi' ? 'लागू नहीं' : 'Not Applicable'}</option>
            <option value="on_probation">{lang === 'hi' ? 'परिवीक्षा पर' : 'On Probation'}</option>
            <option value="confirmed">{lang === 'hi' ? 'पुष्टि' : 'Confirmed'}</option>
          </select>
        </div>

        {employee?.confirmation_date && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{lang === 'hi' ? 'पुष्टि तिथि' : 'Confirmation Date'}</span>
            <span className="font-semibold text-success">{employee.confirmation_date}</span>
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50">
          {saving ? '...' : (lang === 'hi' ? 'सहेजें' : 'Save')}
        </button>
      </div>
    </div>
  );
};

export default ProbationTab;
