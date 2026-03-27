import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface Props {
  date: string;
  currentStatus?: string;
  onClose: () => void;
}

const AttendanceRegularisation: React.FC<Props> = ({ date, currentStatus, onClose }) => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [requestedStatus, setRequestedStatus] = useState('P');
  const [reason, setReason] = useState('');
  const [shiftType, setShiftType] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.employeeId || !reason.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('attendance_regularisation' as any).insert({
      employee_id: user.employeeId,
      attendance_date: date,
      requested_status: requestedStatus,
      reason,
      shift_type: shiftType,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(lang === 'hi' ? '✓ आवेदन भेजा गया' : '✓ Request submitted');
    queryClient.invalidateQueries({ queryKey: ['attendance'] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center">
      <div className="bg-card w-full max-w-lg rounded-t-2xl border-t border-border p-6 space-y-4 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'उपस्थिति नियमितीकरण' : 'Attendance Regularisation'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="text-xs text-muted-foreground">
          {lang === 'hi' ? 'तिथि' : 'Date'}: <strong className="text-foreground">{date}</strong>
          {currentStatus && <> · {lang === 'hi' ? 'वर्तमान' : 'Current'}: <strong className="text-foreground">{currentStatus}</strong></>}
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'सही स्थिति' : 'Correct Status'}</label>
          <select value={requestedStatus} onChange={e => setRequestedStatus(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
            <option value="P">{lang === 'hi' ? 'उपस्थित (P)' : 'Present (P)'}</option>
            <option value="LC">{lang === 'hi' ? 'देर से (LC)' : 'Late Coming (LC)'}</option>
            <option value="H">{lang === 'hi' ? 'छुट्टी (H)' : 'Holiday (H)'}</option>
            <option value="L">{lang === 'hi' ? 'अवकाश (L)' : 'Leave (L)'}</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'कारण' : 'Reason'}</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)}
            placeholder={lang === 'hi' ? 'कारण दर्ज करें' : 'Enter reason'}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{lang === 'hi' ? 'शिफ्ट' : 'Shift Worked'}</label>
          <select value={shiftType} onChange={e => setShiftType(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
            <option value="general">General</option>
            <option value="day">Day</option>
            <option value="night">Night</option>
          </select>
        </div>

        <button onClick={handleSubmit} disabled={submitting || !reason.trim()}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target disabled:opacity-50">
          {submitting ? '...' : (lang === 'hi' ? 'आवेदन भेजें' : 'Submit Request')}
        </button>
      </div>
    </div>
  );
};

export default AttendanceRegularisation;
