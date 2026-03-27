import React, { useState } from 'react';

import { BilingualText } from './BilingualText';

import { AlertCircle, CheckCircle2, Truck, FileText } from 'lucide-react';

interface EODConfirmationProps { vehicleCount: number; grnCount: number; onSubmit: (data: { status: string; note: string; vehicles: number; grns: number }) => void; loading?: boolean; }

export function EODConfirmation({ vehicleCount, grnCount, onSubmit, loading = false }: EODConfirmationProps) {

  const [exceptionNote, setExceptionNote] = useState('');

  const isMismatch = vehicleCount !== grnCount;

  const canConfirm = !isMismatch || exceptionNote.trim().length >= 10;

  const handleConfirm = () => { if (!canConfirm) return; onSubmit({ status: isMismatch ? 'Exception' : 'Matched', note: exceptionNote, vehicles: vehicleCount, grns: grnCount }); };

  return (

    <div className="p-4 bg-card rounded-2xl border border-border card-shadow">

      <div className="text-center mb-4"><BilingualText hindi="दिन का अंत" english="End of Day Confirmation" size="base" /></div>

      <div className="flex gap-3 mb-4">

        <div className="flex-1 p-3 bg-info/10 rounded-xl text-center"><Truck className="w-5 h-5 text-info mx-auto mb-1" /><p className="text-2xl font-bold text-foreground">{vehicleCount}</p><BilingualText hindi="वाहन" english="Vehicles" size="xs" textColor="text-muted-foreground" /></div>

        <div className="flex-1 p-3 bg-primary/10 rounded-xl text-center"><FileText className="w-5 h-5 text-primary mx-auto mb-1" /><p className="text-2xl font-bold text-foreground">{grnCount}</p><BilingualText hindi="GRN" english="GRNs Raised" size="xs" textColor="text-muted-foreground" /></div>

      </div>

      {isMismatch ? (

        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl">

          <div className="flex items-center gap-2 text-destructive font-bold mb-2"><AlertCircle className="w-4 h-4" /><BilingualText hindi="चेतावनी: मिलान नहीं" english="Warning: Data Mismatch" size="xs" /></div>

          <p className="text-xs text-muted-foreground mb-2">{vehicleCount - grnCount} vehicle(s) have no matching GRN. Enter a reason to proceed.</p>

          <textarea value={exceptionNote} onChange={(e) => setExceptionNote(e.target.value)} placeholder="कारण लिखें... / Enter reason (minimum 10 characters)..." className="w-full p-3 rounded-xl border border-border bg-background text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" rows={3} />

        </div>

      ) : (

        <div className="flex items-center justify-center gap-2 p-3 bg-success/10 border border-success/30 rounded-xl mb-4"><CheckCircle2 className="w-5 h-5 text-success" /><BilingualText hindi="सब मिल गया" english="All data matched" size="sm" textColor="text-success" /></div>

      )}

      <button onClick={handleConfirm} disabled={!canConfirm || loading} className={'w-full min-h-[56px] rounded-xl font-bold text-primary-foreground transition-all active:scale-[0.97] disabled:opacity-50 ' + (isMismatch ? 'bg-warning' : 'bg-success')}>

        <BilingualText hindi={isMismatch ? 'अपवाद के साथ बंद करें' : 'EOD पुष्टि करें'} english={isMismatch ? 'Close with Exception' : 'Confirm EOD'} textColor="text-primary-foreground" size="sm" />

      </button>

    </div>

  );

}

export default EODConfirmation;
