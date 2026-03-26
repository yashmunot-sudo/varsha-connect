import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, X } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const MissingDataBanner: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user?.employeeId) return;
    const dismissedAt = localStorage.getItem(`vfl-missing-dismissed-${user.employeeId}`);
    if (dismissedAt) {
      const d = new Date(dismissedAt);
      const now = new Date();
      // Show again after 30 days
      if (now.getTime() - d.getTime() < 30 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
        return;
      }
    }

    const fetchMissing = async () => {
      const { data } = await supabase.from('employees').select('missing_data').eq('id', user.employeeId).single();
      if (data?.missing_data && Array.isArray(data.missing_data) && data.missing_data.length > 0) {
        setMissingFields(data.missing_data as string[]);
      }
    };
    fetchMissing();
  }, [user?.employeeId]);

  if (dismissed || missingFields.length === 0) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(`vfl-missing-dismissed-${user?.employeeId}`, new Date().toISOString());
  };

  return (
    <div className="mx-4 mt-2 bg-warning/10 border border-warning/30 rounded-xl p-3 flex items-start gap-2">
      <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="text-xs font-semibold text-foreground">
          {lang === 'hi' ? 'कुछ जानकारी गायब है / Some info missing' : 'Some info missing / कुछ जानकारी गायब है'}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          {lang === 'hi' ? 'HR से संपर्क करें: ' : 'Contact HR to update: '}
          {missingFields.join(', ')}
        </div>
      </div>
      <button onClick={handleDismiss} className="p-1 rounded hover:bg-muted">
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
};

export default MissingDataBanner;
