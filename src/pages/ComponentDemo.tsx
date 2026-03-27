import React from 'react';
import { BilingualText } from '@/components/BilingualText';
import { SupervisorAttendanceRow } from '@/components/SupervisorAttendanceRow';
import { EODConfirmation } from '@/components/EODConfirmation';
import { toast } from 'sonner';

const DEMO_WORKERS = [
  { name: 'राजेश कुमार', code: 'EMP-001' },
  { name: 'सुनील यादव', code: 'EMP-002' },
  { name: 'प्रदीप शर्मा', code: 'EMP-003' },
];

const ComponentDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-4 space-y-8 pb-20">
      {/* BilingualText Demo */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-3 border-b border-border pb-2">BilingualText</h2>
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
          <BilingualText hindi="नमस्ते दुनिया" english="Hello World" className="text-xl" />
          <BilingualText hindi="उपस्थिति" english="Attendance" className="text-sm" textColor="text-primary" />
        </div>
      </section>

      {/* Slide-to-Confirm Demo */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-3 border-b border-border pb-2">Slide-to-Confirm Attendance</h2>
        {DEMO_WORKERS.map(w => (
          <SupervisorAttendanceRow
            key={w.code}
            workerName={w.name}
            workerCode={w.code}
            onConfirm={(code, status) => toast.success(`${code}: ${status}`)}
          />
        ))}
      </section>

      {/* EOD Matched */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-3 border-b border-border pb-2">EOD — Matched</h2>
        <EODConfirmation vehicleCount={10} grnCount={10} onSubmit={(d) => toast.success(`EOD: ${d.status}`)} />
      </section>

      {/* EOD Mismatch */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-3 border-b border-border pb-2">EOD — Mismatch</h2>
        <EODConfirmation vehicleCount={10} grnCount={8} onSubmit={(d) => toast.success(`EOD: ${d.status} — ${d.note}`)} />
      </section>
    </div>
  );
};

export default ComponentDemo;
