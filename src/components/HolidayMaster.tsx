import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Calendar } from 'lucide-react';

const HolidayMaster: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [isNational, setIsNational] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: holidays } = useQuery({
    queryKey: ['public_holidays', currentYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_holidays' as any)
        .select('*')
        .eq('year', currentYear)
        .order('holiday_date', { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  const handleAdd = async () => {
    if (!date || !nameEn || !user?.employeeId) return;
    setSubmitting(true);
    const { error } = await supabase.from('public_holidays' as any).insert({
      holiday_date: date,
      holiday_name: nameEn,
      holiday_name_hi: nameHi || null,
      year: new Date(date).getFullYear(),
      is_national: isNational,
      created_by: user.employeeId,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success('✓ Added');
    setDate(''); setNameEn(''); setNameHi(''); setIsNational(false); setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['public_holidays'] });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('public_holidays' as any).delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); queryClient.invalidateQueries({ queryKey: ['public_holidays'] }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm font-bold text-foreground">
            {lang === 'hi' ? 'छुट्टियाँ' : 'Holidays'} ({currentYear})
          </h3>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="text-xs text-primary font-semibold flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> {lang === 'hi' ? 'जोड़ें' : 'Add'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-3 space-y-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Name (English)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input type="text" value={nameHi} onChange={e => setNameHi(e.target.value)} placeholder="नाम (हिंदी)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-xs text-foreground">
            <input type="checkbox" checked={isNational} onChange={e => setIsNational(e.target.checked)} />
            {lang === 'hi' ? 'राष्ट्रीय' : 'National'}
          </label>
          <button onClick={handleAdd} disabled={submitting || !date || !nameEn}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50">
            {submitting ? '...' : (lang === 'hi' ? 'जोड़ें' : 'Add Holiday')}
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        {holidays?.map((h: any) => (
          <div key={h.id} className="flex items-center gap-2 bg-card rounded-xl border border-border px-3 py-2">
            <div className="flex-1">
              <div className="text-xs font-semibold text-foreground">{h.holiday_name}</div>
              <div className="text-[10px] text-muted-foreground">{h.holiday_name_hi} · {h.holiday_date}</div>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${h.is_national ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {h.is_national ? 'National' : 'Local'}
            </span>
            <button onClick={() => handleDelete(h.id)} className="p-1 hover:bg-destructive/10 rounded">
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          </div>
        ))}
        {(!holidays || holidays.length === 0) && (
          <div className="text-center text-xs text-muted-foreground py-4">
            {lang === 'hi' ? 'कोई छुट्टी नहीं' : 'No holidays added'}
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayMaster;
