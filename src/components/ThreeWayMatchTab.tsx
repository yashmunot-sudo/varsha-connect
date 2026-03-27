import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const ThreeWayMatchTab: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: approvedGRNs } = useQuery({
    queryKey: ['approved_grns_for_match'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goods_receipt_notes')
        .select('*')
        .eq('qc_status', 'Approved')
        .order('grn_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="font-display text-lg font-bold text-foreground">
        {lang === 'hi' ? 'थ्री-वे मैच' : 'Three-Way Match'}
      </h2>
      {approvedGRNs?.map(grn => (
        <GRNMatchCard key={grn.id} grn={grn} userId={user?.employeeId} lang={lang} queryClient={queryClient} />
      ))}
      {(!approvedGRNs || approvedGRNs.length === 0) && (
        <div className="text-center text-sm text-muted-foreground py-8">
          {lang === 'hi' ? 'कोई स्वीकृत GRN नहीं' : 'No approved GRNs found'}
        </div>
      )}
    </div>
  );
};

const GRNMatchCard: React.FC<{ grn: any; userId?: string; lang: string; queryClient: any }> = ({ grn, userId, lang, queryClient }) => {
  const [poPrice, setPoPrice] = useState('');
  const [invoicePrice, setInvoicePrice] = useState('');
  const [grnQty, setGrnQty] = useState(String(grn.quantity_received || ''));
  const [invoiceQty, setInvoiceQty] = useState('');
  const [saving, setSaving] = useState(false);

  const poPriceNum = Number(poPrice) || 0;
  const invPriceNum = Number(invoicePrice) || 0;
  const grnQtyNum = Number(grnQty) || 0;
  const invQtyNum = Number(invoiceQty) || 0;

  const priceMatch = poPrice && invoicePrice && poPriceNum === invPriceNum;
  const priceMismatch = poPrice && invoicePrice && poPriceNum !== invPriceNum;
  const qtyMatch = grnQty && invoiceQty && grnQtyNum === invQtyNum;
  const qtyMismatch = grnQty && invoiceQty && grnQtyNum !== invQtyNum;
  const allMatch = priceMatch && qtyMatch;
  const hasException = priceMismatch || qtyMismatch;
  const isReleased = (grn as any).payment_status === 'Released';

  const saveMatch = async (status: 'Matched' | 'Exception') => {
    if (!userId) return;
    setSaving(true);

    // Save to three_way_match
    const { error } = await supabase.from('three_way_match' as any).insert({
      grn_id: grn.id,
      po_price: poPriceNum,
      invoice_price: invPriceNum,
      grn_qty: grnQtyNum,
      invoice_qty: invQtyNum,
      overall_status: status,
      matched_by: userId,
      matched_at: new Date().toISOString(),
    });

    if (error) { toast.error(error.message); setSaving(false); return; }

    if (status === 'Matched') {
      // Release payment
      await supabase.from('goods_receipt_notes').update({ payment_status: 'Released' } as any).eq('id', grn.id);
      // Notify HR admins
      const { data: hrAdmins } = await supabase.from('employees').select('id').eq('role', 'hr_admin' as any);
      if (hrAdmins?.length) {
        await supabase.from('notifications').insert(
          hrAdmins.map(hr => ({
            employee_id: hr.id,
            title: 'Payment Released',
            body: `Payment released for GRN ${grn.grn_number} - ${grn.vendor_name}`,
            type: 'payment_release',
          }))
        );
      }
      toast.success(lang === 'hi' ? '✓ भुगतान जारी' : '✓ Payment Released');
    } else {
      // Notify purchase dept
      const { data: purchaseEmps } = await supabase.from('employees').select('id').eq('department', 'Purchase');
      if (purchaseEmps?.length) {
        await supabase.from('notifications').insert(
          purchaseEmps.map(e => ({
            employee_id: e.id,
            title: 'Match Exception',
            body: `Exception in GRN ${grn.grn_number} - ${grn.vendor_name}. Price/Qty mismatch.`,
            type: 'match_exception',
          }))
        );
      }
      toast.success(lang === 'hi' ? '⚠ एस्केलेट किया गया' : '⚠ Escalated');
    }

    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ['approved_grns_for_match'] });
  };

  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-4 space-y-3">
      <div>
        <div className="text-sm font-bold text-foreground">{grn.grn_number}</div>
        <div className="text-[10px] text-muted-foreground">{grn.vendor_name} · {grn.material_description}</div>
      </div>

      {isReleased ? (
        <div className="flex items-center gap-2 text-success text-sm font-bold">
          <CheckCircle2 className="w-4 h-4" /> {lang === 'hi' ? 'भुगतान जारी' : 'Payment Released'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'PO मूल्य' : 'PO Price'}</label>
              <input type="number" value={poPrice} onChange={e => setPoPrice(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${priceMatch ? 'border-success bg-success/5' : priceMismatch ? 'border-destructive bg-destructive/5' : 'border-border bg-background'}`} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'इनवॉइस मूल्य' : 'Invoice Price'}</label>
              <input type="number" value={invoicePrice} onChange={e => setInvoicePrice(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${priceMatch ? 'border-success bg-success/5' : priceMismatch ? 'border-destructive bg-destructive/5' : 'border-border bg-background'}`} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'GRN मात्रा' : 'GRN Qty'}</label>
              <input type="number" value={grnQty} onChange={e => setGrnQty(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${qtyMatch ? 'border-success bg-success/5' : qtyMismatch ? 'border-destructive bg-destructive/5' : 'border-border bg-background'}`} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'इनवॉइस मात्रा' : 'Invoice Qty'}</label>
              <input type="number" value={invoiceQty} onChange={e => setInvoiceQty(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${qtyMatch ? 'border-success bg-success/5' : qtyMismatch ? 'border-destructive bg-destructive/5' : 'border-border bg-background'}`} />
            </div>
          </div>

          {allMatch && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-success text-xs font-bold bg-success/10 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4" /> Match Complete
              </div>
              <button onClick={() => saveMatch('Matched')} disabled={saving}
                className="w-full py-3 rounded-xl bg-success text-white font-display font-bold text-sm active:scale-[0.98] disabled:opacity-50">
                {lang === 'hi' ? 'भुगतान जारी करें' : 'Release Payment'}
              </button>
            </div>
          )}

          {hasException && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-destructive text-xs font-bold bg-destructive/10 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4" /> Exception
              </div>
              <button onClick={() => saveMatch('Exception')} disabled={saving}
                className="w-full py-3 rounded-xl bg-destructive text-white font-display font-bold text-sm active:scale-[0.98] disabled:opacity-50">
                {lang === 'hi' ? 'एस्केलेट करें' : 'Escalate'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ThreeWayMatchTab;
