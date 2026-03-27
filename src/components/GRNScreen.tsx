import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Package, Plus, AlertTriangle, CheckCircle2, Truck, X } from 'lucide-react';

interface GRNScreenProps {
  lang: string;
}

const GRNScreen: React.FC<GRNScreenProps> = ({ lang }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const [showForm, setShowForm] = useState(false);
  const [showEOD, setShowEOD] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [condition, setCondition] = useState('Good');
  const [challanNumber, setChallanNumber] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Today's vehicle logs (inward deliveries)
  const { data: todayVehicles } = useQuery({
    queryKey: ['vehicle_log_today_grn'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_log')
        .select('*')
        .eq('log_date', today)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Today's GRNs
  const { data: todayGRNs } = useQuery({
    queryKey: ['grn_today'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goods_receipt_notes')
        .select('*')
        .eq('grn_date', today)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const inwardVehicles = todayVehicles?.filter(v => v.delivery_type === 'Inward' || v.purpose === 'delivery') || [];

  // Vehicles missing GRN
  const grnVehicleIds = new Set(todayGRNs?.map(g => g.vehicle_log_id).filter(Boolean) || []);
  const missingGRNVehicles = inwardVehicles.filter(v => !grnVehicleIds.has(v.id));

  const generateGRNNumber = () => {
    const now = new Date();
    const seq = (todayGRNs?.length || 0) + 1;
    return `GRN-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(seq).padStart(3, '0')}`;
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    const vehicle = todayVehicles?.find(v => v.id === vehicleId);
    if (vehicle) {
      setVendorName(vehicle.vendor_name || '');
      setMaterial(vehicle.material_description || '');
    }
  };

  const handleSubmitGRN = async () => {
    if (!user?.employeeId || !vendorName || !material || !quantity) return;
    setSubmitting(true);

    const grnNumber = generateGRNNumber();

    const { error } = await supabase.from('goods_receipt_notes').insert({
      grn_number: grnNumber,
      grn_date: today,
      vehicle_log_id: selectedVehicle || null,
      vendor_name: vendorName,
      material_description: material,
      quantity_received: parseFloat(quantity),
      unit,
      condition,
      challan_number: challanNumber || null,
      po_number: poNumber || null,
      received_by: user.employeeId,
      qc_status: 'Pending',
      status: 'Open',
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === 'hi' ? `✓ GRN ${grnNumber} बनाया गया` : `✓ GRN ${grnNumber} created`);
      setShowForm(false);
      setSelectedVehicle('');
      setVendorName('');
      setMaterial('');
      setQuantity('');
      setChallanNumber('');
      setPoNumber('');
      queryClient.invalidateQueries({ queryKey: ['grn_today'] });
    }
    setSubmitting(false);
  };

  const handleEODConfirm = async () => {
    if (missingGRNVehicles.length > 0) {
      setShowEOD(true);
      return;
    }

    if (!user?.employeeId) return;

    const { error } = await supabase.from('daily_eod_confirmations').insert({
      employee_id: user.employeeId,
      confirmation_date: today,
      role: 'stores',
      items_confirmed: {
        total_vehicles: inwardVehicles.length,
        total_grns: todayGRNs?.length || 0,
        all_matched: true,
      },
      is_complete: true,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === 'hi' ? '✓ EOD पुष्टि सफल' : '✓ EOD confirmation complete');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          {lang === 'hi' ? 'गुड्स रिसीप्ट नोट / GRN' : 'GRN / गुड्स रिसीप्ट नोट'}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {lang === 'hi' ? 'नया GRN' : 'New GRN'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card rounded-xl border border-border card-shadow p-3 text-center">
          <div className="font-display text-xl font-bold text-info">{inwardVehicles.length}</div>
          <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'इनवार्ड वाहन' : 'Inward Vehicles'}</div>
        </div>
        <div className="bg-card rounded-xl border border-border card-shadow p-3 text-center">
          <div className="font-display text-xl font-bold text-success">{todayGRNs?.length || 0}</div>
          <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'GRN बनाए' : 'GRNs Created'}</div>
        </div>
        <div className="bg-card rounded-xl border border-border card-shadow p-3 text-center">
          <div className={`font-display text-xl font-bold ${missingGRNVehicles.length > 0 ? 'text-danger' : 'text-success'}`}>
            {missingGRNVehicles.length}
          </div>
          <div className="text-[10px] text-muted-foreground">{lang === 'hi' ? 'बिना GRN' : 'Missing GRN'}</div>
        </div>
      </div>

      {/* Today's GRNs list */}
      {todayGRNs && todayGRNs.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] text-primary font-semibold tracking-[0.15em] uppercase">
            {lang === 'hi' ? 'आज के GRN' : "TODAY'S GRNs"}
          </div>
          {todayGRNs.map((grn: any) => (
            <div key={grn.id} className="bg-card rounded-xl border border-border card-shadow p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-sm font-bold text-foreground">{grn.grn_number}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  grn.qc_status === 'Approved' ? 'bg-success/10 text-success' :
                  grn.qc_status === 'Rejected' ? 'bg-danger/10 text-danger' :
                  'bg-warning/10 text-warning'
                }`}>
                  {grn.qc_status === 'Pending' ? (lang === 'hi' ? 'QC लंबित' : 'QC Pending') : grn.qc_status}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {grn.vendor_name} · {grn.material_description} · {grn.quantity_received} {grn.unit}
              </div>
              {grn.challan_number && (
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {lang === 'hi' ? 'चालान' : 'Challan'}: {grn.challan_number}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EOD Button */}
      <button
        onClick={handleEODConfirm}
        className={`w-full py-4 rounded-xl font-display font-bold text-base touch-target ${
          missingGRNVehicles.length > 0
            ? 'bg-warning text-warning-foreground'
            : 'bg-success text-primary-foreground'
        }`}
      >
        {missingGRNVehicles.length > 0
          ? (lang === 'hi' ? `⚠ EOD जांच — ${missingGRNVehicles.length} वाहन बिना GRN` : `⚠ EOD Check — ${missingGRNVehicles.length} vehicles missing GRN`)
          : (lang === 'hi' ? '✓ EOD पुष्टि करें' : '✓ Confirm EOD')}
      </button>

      {/* EOD Missing GRN Modal */}
      {showEOD && missingGRNVehicles.length > 0 && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center">
          <div className="bg-card w-full max-w-lg rounded-t-2xl border-t border-border p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-danger flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {lang === 'hi' ? 'GRN लंबित — EOD ब्लॉक' : 'GRN Missing — EOD Blocked'}
              </h3>
              <button onClick={() => setShowEOD(false)} className="p-1 rounded-md hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {lang === 'hi'
                ? 'नीचे दिए गए इनवार्ड वाहनों के लिए GRN नहीं बनाया गया। EOD पुष्टि तब तक ब्लॉक रहेगी।'
                : 'The following inward vehicles do not have a matching GRN. EOD confirmation is blocked until resolved.'}
            </p>
            {missingGRNVehicles.map((v: any) => (
              <div key={v.id} className="bg-danger/5 border border-danger/20 rounded-xl p-3 flex items-center gap-3">
                <Truck className="w-5 h-5 text-danger flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-bold font-mono text-foreground">{v.vehicle_number}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {v.vendor_name || v.purpose} · {v.material_description || '-'} ·{' '}
                    {v.time_in ? new Date(v.time_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEOD(false);
                    handleSelectVehicle(v.id);
                    setShowForm(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
                >
                  {lang === 'hi' ? 'GRN बनाएं' : 'Create GRN'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New GRN Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center">
          <div className="bg-card w-full max-w-lg rounded-t-2xl border-t border-border p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-foreground">
                {lang === 'hi' ? 'नया GRN बनाएं' : 'Create New GRN'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-md hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Link to vehicle */}
            {inwardVehicles.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {lang === 'hi' ? 'वाहन से जोड़ें (वैकल्पिक)' : 'Link to Vehicle (optional)'}
                </label>
                <select
                  value={selectedVehicle}
                  onChange={e => handleSelectVehicle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">{lang === 'hi' ? '— चुनें —' : '— Select —'}</option>
                  {inwardVehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_number} — {v.vendor_name || v.purpose} ({new Date(v.time_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {lang === 'hi' ? 'विक्रेता नाम *' : 'Vendor Name *'}
              </label>
              <input
                value={vendorName}
                onChange={e => setVendorName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {lang === 'hi' ? 'सामग्री विवरण *' : 'Material Description *'}
              </label>
              <input
                value={material}
                onChange={e => setMaterial(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {lang === 'hi' ? 'मात्रा *' : 'Quantity *'}
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {lang === 'hi' ? 'इकाई' : 'Unit'}
                </label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="kg">kg</option>
                  <option value="nos">nos</option>
                  <option value="litre">litre</option>
                  <option value="meter">meter</option>
                  <option value="set">set</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {lang === 'hi' ? 'स्थिति' : 'Condition'}
              </label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="Good">{lang === 'hi' ? 'अच्छी' : 'Good'}</option>
                <option value="Damaged">{lang === 'hi' ? 'क्षतिग्रस्त' : 'Damaged'}</option>
                <option value="Partial">{lang === 'hi' ? 'आंशिक' : 'Partial'}</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {lang === 'hi' ? 'चालान नंबर' : 'Challan Number'}
              </label>
              <input
                value={challanNumber}
                onChange={e => setChallanNumber(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {lang === 'hi' ? 'PO नंबर (वैकल्पिक)' : 'PO Number (optional)'}
              </label>
              <input
                value={poNumber}
                onChange={e => setPoNumber(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <button
              onClick={handleSubmitGRN}
              disabled={submitting || !vendorName || !material || !quantity}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base touch-target disabled:opacity-50"
            >
              {submitting
                ? '...'
                : (lang === 'hi' ? 'GRN सेव करें / Save GRN' : 'Save GRN / GRN सेव करें')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GRNScreen;
