import React, { useState, useRef } from 'react';

import { BilingualText } from './BilingualText';

import { UserCheck, XCircle } from 'lucide-react';

interface SupervisorAttendanceRowProps { workerName: string; workerCode: string; workerDept?: string; checkInTime?: string; onConfirm: (workerCode: string, status: 'present' | 'absent') => void; }

export function SupervisorAttendanceRow({ workerName, workerCode, workerDept, checkInTime, onConfirm }: SupervisorAttendanceRowProps) {

  const [sliderValue, setSliderValue] = useState(50);

  const [status, setStatus] = useState<'pending' | 'present' | 'absent'>('pending');

  const [confirmed, setConfirmed] = useState(false);

  const lastActionTime = useRef<number>(0);

  const handleRelease = () => {

    const now = Date.now();

    if (now - lastActionTime.current < 1000) return;

    if (sliderValue >= 85) { lastActionTime.current = now; setSliderValue(100); setStatus('present'); setConfirmed(true); onConfirm(workerCode, 'present'); }

    else if (sliderValue <= 15) { lastActionTime.current = now; setSliderValue(0); setStatus('absent'); setConfirmed(true); onConfirm(workerCode, 'absent'); }

    else { setSliderValue(50); }

  };

  if (confirmed) {

    return (

      <div className={'p-4 rounded-2xl border mb-2 flex items-center justify-between transition-all ' + (status === 'present' ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30')}>

        <div><p className="font-semibold text-sm text-foreground">{workerName}</p><p className="text-[10px] text-muted-foreground">{workerCode}</p></div>

        <div className="flex items-center gap-2">

          {status === 'present' ? <UserCheck className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}

          <BilingualText hindi={status === 'present' ? 'उपस्थित' : 'अनुपस्थित'} english={status === 'present' ? 'Present' : 'Absent'} textColor={status === 'present' ? 'text-success' : 'text-destructive'} size="xs" />

        </div>

      </div>

    );

  }

  return (

    <div className="p-4 bg-card rounded-2xl border border-border card-shadow mb-2">

      <div className="flex items-center justify-between mb-3">

        <div><p className="font-semibold text-sm text-foreground">{workerName}</p><p className="text-[10px] text-muted-foreground">{workerCode}{workerDept ? ' · ' + workerDept : ''}</p></div>

        {checkInTime && <p className="text-[10px] text-muted-foreground">{checkInTime}</p>}

      </div>

      <div className="relative w-full h-14 bg-muted rounded-full flex items-center overflow-hidden select-none">

        <span className="absolute left-4 text-destructive font-bold text-[10px] pointer-events-none z-20">← अनुपस्थित</span>

        <span className="absolute right-4 text-success font-bold text-[10px] pointer-events-none z-20">उपस्थित →</span>

        <input type="range" min="0" max="100" value={sliderValue} onChange={(e) => setSliderValue(Number(e.target.value))} onTouchEnd={handleRelease} onMouseUp={handleRelease} className="w-full h-full opacity-0 cursor-pointer absolute z-30" />

        <div className="absolute h-11 w-11 bg-primary rounded-full shadow-lg flex items-center justify-center pointer-events-none z-10 transition-all duration-75" style={{ left: 'calc(' + sliderValue + '% - 22px)' }}>

          <span className="text-primary-foreground text-lg font-bold">⇆</span>

        </div>

      </div>

    </div>

  );

}

export default SupervisorAttendanceRow;
