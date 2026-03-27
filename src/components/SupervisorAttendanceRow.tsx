import React, { useState } from 'react';
import { BilingualText } from './BilingualText';

interface SupervisorAttendanceRowProps {
  workerName: string;
  workerCode: string;
  onConfirm: (code: string, status: 'present' | 'absent') => void;
}

export function SupervisorAttendanceRow({ workerName, workerCode, onConfirm }: SupervisorAttendanceRowProps) {
  const [sliderValue, setSliderValue] = useState(50);
  const [status, setStatus] = useState<'pending' | 'present' | 'absent'>('pending');

  const handleRelease = () => {
    if (sliderValue >= 90) {
      setSliderValue(100);
      setStatus('present');
      onConfirm(workerCode, 'present');
    } else if (sliderValue <= 10) {
      setSliderValue(0);
      setStatus('absent');
      onConfirm(workerCode, 'absent');
    } else {
      setSliderValue(50);
    }
  };

  if (status !== 'pending') {
    return (
      <div className={`p-4 rounded-xl shadow-sm mb-3 flex justify-between items-center border ${status === 'present' ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'}`}>
        <div>
          <p className="font-bold text-foreground">{workerName}</p>
          <p className="text-xs text-muted-foreground">{workerCode}</p>
        </div>
        <BilingualText
          hindi={status === 'present' ? 'उपस्थित' : 'अनुपस्थित'}
          english={status === 'present' ? 'Present' : 'Absent'}
          textColor={status === 'present' ? 'text-success' : 'text-destructive'}
        />
      </div>
    );
  }

  return (
    <div className="p-4 bg-card rounded-xl shadow-sm mb-3 border border-border">
      <div className="mb-4 text-center">
        <p className="font-bold text-foreground text-lg">{workerName}</p>
        <p className="text-sm text-muted-foreground">{workerCode}</p>
      </div>

      <div className="relative w-full h-14 bg-muted rounded-full flex items-center overflow-hidden">
        <div className="absolute left-4 text-destructive font-bold text-xs pointer-events-none">Absent ←</div>
        <div className="absolute right-4 text-success font-bold text-xs pointer-events-none">→ Present</div>

        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          onTouchEnd={handleRelease}
          onMouseUp={handleRelease}
          className="w-full h-full opacity-0 cursor-pointer absolute z-10"
        />

        <div
          className="absolute h-12 w-12 bg-primary rounded-full shadow-md flex items-center justify-center pointer-events-none transition-all duration-75"
          style={{ left: `calc(${sliderValue}% - 24px)` }}
        >
          <span className="text-primary-foreground text-xl flex items-center justify-center">↕</span>
        </div>
      </div>
    </div>
  );
}
