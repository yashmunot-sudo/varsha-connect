import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const PurchaseRequisitionTab: React.FC = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex-1 relative" style={{ minHeight: 'calc(100vh - 140px)' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading procurement...</span>
          </div>
        </div>
      )}
      <iframe
        src="https://erpvarsha-star.github.io/vfpl-procurement/vfpl_procurement_final.html"
        className="w-full h-full border-0"
        style={{ minHeight: 'calc(100vh - 140px)' }}
        onLoad={() => setLoading(false)}
        title="Purchase Requisition"
      />
    </div>
  );
};

export default PurchaseRequisitionTab;
