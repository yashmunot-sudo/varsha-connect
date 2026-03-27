import React, { useState } from 'react';
import { BilingualText } from './BilingualText';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface EODSubmitData {
  status: 'Exception' | 'Matched';
  note: string;
  vehicles: number;
  grns: number;
}

interface EODConfirmationProps {
  vehicleCount: number;
  grnCount: number;
  onSubmit: (data: EODSubmitData) => void;
}

export function EODConfirmation({ vehicleCount, grnCount, onSubmit }: EODConfirmationProps) {
  const [exceptionNote, setExceptionNote] = useState('');
  const isMismatch = vehicleCount !== grnCount;

  const handleConfirm = () => {
    onSubmit({
      status: isMismatch ? 'Exception' : 'Matched',
      note: exceptionNote,
      vehicles: vehicleCount,
      grns: grnCount
    });
  };

  return (
    <div className="p-4 bg-card rounded-xl shadow-sm border border-border">
      <h3 className="text-lg font-bold text-center mb-4">
        <BilingualText hindi="दिन का अंत" english="End of Day Confirmation" />
      </h3>

      <div className="flex justify-around mb-6 text-center">
        <div className="p-3 bg-info/10 rounded-xl w-5/12">
          <p className="text-2xl font-bold text-info">{vehicleCount}</p>
          <BilingualText hindi="वाहन" english="Vehicles Logged" className="text-xs text-info mt-1" />
        </div>
        <div className="p-3 bg-primary/10 rounded-xl w-5/12">
          <p className="text-2xl font-bold text-primary">{grnCount}</p>
          <BilingualText hindi="प्राप्त माल" english="GRNs Raised" className="text-xs text-primary mt-1" />
        </div>
      </div>

      {isMismatch ? (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
          <div className="flex items-center text-destructive mb-2 font-bold">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
            <BilingualText hindi="चेतावनी: डेटा मेल नहीं खा रहा" english="Warning: Data Mismatch" />
          </div>
          <p className="text-sm text-destructive/80 mb-3">
            Some vehicles do not have a matching GRN. To close the gate, you must enter a reason. This will be reported to the Plant Head.
          </p>
          <textarea
            value={exceptionNote}
            onChange={(e) => setExceptionNote(e.target.value)}
            placeholder="कारण लिखें... / Enter reason..."
            className="w-full p-3 border border-border rounded-xl text-sm mb-2 focus:ring-2 focus:ring-destructive/40 outline-none bg-background text-foreground"
            rows={3}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center text-success mb-6 p-3 bg-success/10 rounded-xl font-bold">
          <CheckCircle2 className="w-6 h-6 mr-2 shrink-0" />
          <BilingualText hindi="डेटा सही है" english="Data Matched Successfully" />
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={isMismatch && exceptionNote.trim().length < 5}
        className={`w-full min-h-[56px] rounded-xl font-bold text-base text-primary-foreground transition-colors disabled:opacity-50
          ${isMismatch ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}
      >
        <BilingualText
          hindi={isMismatch ? "अपवाद के साथ बंद करें" : "पुष्टि करें"}
          english={isMismatch ? "Close with Exception" : "Confirm EOD"}
        />
      </button>
    </div>
  );
}
