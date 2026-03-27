import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAllEmployees } from '@/hooks/useEmployeeData';
import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

const MIN_WAGES: Record<string, number> = {
  unskilled: 10765,
  skilled: 12930,
  operator: 15095,
};

const MinWagesCompliance: React.FC = () => {
  const { lang } = useLanguage();
  const { data: employees } = useAllEmployees();
  const [showList, setShowList] = useState(false);

  const workers = employees?.filter(e => e.salary_type === 'WORKER' && e.is_active) || [];

  const nonCompliant = workers.filter(e => {
    const skillLevel = (e as any).skill_level || 'unskilled';
    const minWage = MIN_WAGES[skillLevel] || MIN_WAGES.unskilled;
    return Number(e.base_salary || 0) < minWage;
  });

  const compliantCount = workers.length - nonCompliant.length;

  if (showList) {
    return (
      <div className="space-y-3">
        <button onClick={() => setShowList(false)} className="text-sm text-primary font-medium">
          ← {lang === 'hi' ? 'वापस' : 'Back'}
        </button>
        <h3 className="font-display text-sm font-bold text-foreground">
          {lang === 'hi' ? 'गैर-अनुपालन कर्मचारी' : 'Non-Compliant Employees'} ({nonCompliant.length})
        </h3>
        {nonCompliant.map(e => {
          const skillLevel = (e as any).skill_level || 'unskilled';
          const minWage = MIN_WAGES[skillLevel] || MIN_WAGES.unskilled;
          const shortfall = minWage - Number(e.base_salary || 0);
          return (
            <div key={e.id} className="bg-card rounded-xl border border-destructive/30 p-3 space-y-1">
              <div className="flex justify-between">
                <div>
                  <div className="text-sm font-semibold text-foreground">{e.name}</div>
                  <div className="text-[10px] text-muted-foreground">{e.emp_code} · {skillLevel}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <span className="text-muted-foreground">Current</span>
                  <div className="font-mono font-bold text-foreground">₹{Number(e.base_salary || 0).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Minimum</span>
                  <div className="font-mono font-bold text-foreground">₹{minWage.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Shortfall</span>
                  <div className="font-mono font-bold text-destructive">₹{shortfall.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <button onClick={() => nonCompliant.length > 0 && setShowList(true)}
      className="w-full bg-card rounded-xl border border-border card-shadow p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${nonCompliant.length > 0 ? 'bg-destructive/10' : 'bg-success/10'}`}>
        {nonCompliant.length > 0 ? <AlertTriangle className="w-5 h-5 text-destructive" /> : <CheckCircle2 className="w-5 h-5 text-success" />}
      </div>
      <div className="flex-1 text-left">
        <div className="text-sm font-semibold text-foreground">{lang === 'hi' ? 'न्यूनतम वेतन अनुपालन' : 'Min. Wages Compliance'}</div>
        <div className="text-[10px] text-muted-foreground">
          <span className="text-success font-bold">{compliantCount}</span> compliant
          {nonCompliant.length > 0 && <> · <span className="text-destructive font-bold">{nonCompliant.length}</span> non-compliant</>}
        </div>
      </div>
      {nonCompliant.length > 0 && (
        <span className="bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{nonCompliant.length}</span>
      )}
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
};

export default MinWagesCompliance;
