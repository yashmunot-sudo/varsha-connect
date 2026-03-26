import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import ProfileScreen from '@/components/ProfileScreen';
import SettingsScreen from '@/components/SettingsScreen';
import { Shield, Truck, UserCheck, Clock, Plus, Search, ChevronRight } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SecurityGuardHome: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('home');

  // Vehicle log
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [purpose, setPurpose] = useState('delivery');
  const [material, setMaterial] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const { data: todayVehicles } = useQuery({
    queryKey: ['vehicle_log_today'],
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

  // Attendance confirmation for checkpoint 2
  const { data: pendingCheckpoints } = useQuery({
    queryKey: ['pending_checkpoints_security'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_checkpoints')
        .select('*, employees(name, emp_code)')
        .eq('attendance_date', today)
        .is('checkpoint_2_time', null)
        .not('checkpoint_1_time', 'is', null);
      if (error) throw error;
      return data;
    },
  });

  const handleLogVehicle = async () => {
    if (!vehicleNumber.trim() || !user?.employeeId) return;
    const { error } = await supabase.from('vehicle_log').insert({
      vehicle_number: vehicleNumber.toUpperCase(),
      driver_name: driverName || null,
      purpose,
      material_description: material || null,
      entry_time: new Date().toISOString(),
      entry_date: today,
      logged_by: user.employeeId,
    } as any);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === 'hi' ? '✓ वाहन लॉग किया गया' : '✓ Vehicle logged');
      setVehicleNumber(''); setDriverName(''); setMaterial('');
      queryClient.invalidateQueries({ queryKey: ['vehicle_log_today'] });
    }
  };

  const confirmCheckpoint2 = async (checkpointId: string) => {
    const { error } = await supabase.from('attendance_checkpoints').update({
      checkpoint_2_time: new Date().toISOString(),
      checkpoint_2_confirmed_by: user?.employeeId,
    }).eq('id', checkpointId);
    if (error) toast.error(error.message);
    else {
      toast.success(lang === 'hi' ? '✓ पुष्टि की गई' : '✓ Confirmed');
      queryClient.invalidateQueries({ queryKey: ['pending_checkpoints_security'] });
    }
  };

  if (activeTab === 'vehicles') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4 space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'वाहन लॉग' : 'Vehicle Log'}
          </h2>

          <div className="bg-card rounded-2xl border border-border card-shadow p-4 space-y-3">
            <input value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} placeholder={lang === 'hi' ? 'वाहन नंबर' : 'Vehicle Number'} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <input value={driverName} onChange={e => setDriverName(e.target.value)} placeholder={lang === 'hi' ? 'ड्राइवर नाम (वैकल्पिक)' : 'Driver Name (optional)'} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
              <option value="delivery">{lang === 'hi' ? 'डिलीवरी' : 'Delivery'}</option>
              <option value="pickup">{lang === 'hi' ? 'पिकअप' : 'Pickup'}</option>
              <option value="visitor">{lang === 'hi' ? 'विज़िटर' : 'Visitor'}</option>
              <option value="employee">{lang === 'hi' ? 'कर्मचारी' : 'Employee'}</option>
            </select>
            <input value={material} onChange={e => setMaterial(e.target.value)} placeholder={lang === 'hi' ? 'सामग्री (वैकल्पिक)' : 'Material (optional)'} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <button onClick={handleLogVehicle} disabled={!vehicleNumber.trim()} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm touch-target disabled:opacity-50">
              <Plus className="w-4 h-4 inline mr-2" />
              {lang === 'hi' ? 'वाहन लॉग करें' : 'Log Vehicle'}
            </button>
          </div>

          {todayVehicles && todayVehicles.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] text-primary font-semibold tracking-[0.15em] uppercase">
                {lang === 'hi' ? 'आज' : 'Today'}: {todayVehicles.length} {lang === 'hi' ? 'वाहन' : 'vehicles'}
              </div>
              {todayVehicles.map((v: any) => (
                <div key={v.id} className="bg-card rounded-xl border border-border card-shadow p-3 flex items-center gap-3">
                  <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-bold font-mono text-foreground">{v.vehicle_number}</div>
                    <div className="text-[10px] text-muted-foreground">{v.purpose} · {v.driver_name || '-'}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {v.entry_time ? new Date(v.entry_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <BottomNav role="security_guard" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'more') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <div className="px-4 py-4">
          <SettingsScreen />
        </div>
        <BottomNav role="security_guard" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Home
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return lang === 'hi' ? 'सुप्रभात' : 'Good Morning';
    if (h < 17) return lang === 'hi' ? 'नमस्ते' : 'Good Afternoon';
    return lang === 'hi' ? 'शुभ संध्या' : 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="px-4 py-4 space-y-4">
        <div>
          <div className="text-xs text-primary font-semibold tracking-[0.15em] uppercase mb-1">
            {greeting()}, {user?.name?.split(' ')[0]}
          </div>
          <h1 className="font-display text-xl font-extrabold text-foreground">
            {lang === 'hi' ? 'सुरक्षा गार्ड' : 'Security Guard'}
          </h1>
        </div>

        {/* Today's summary */}
        <div className="bg-gradient-to-br from-primary/8 to-info/5 rounded-2xl border border-primary/15 p-5">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="font-display text-3xl font-extrabold text-primary">{todayVehicles?.length || 0}</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'आज के वाहन' : 'Vehicles Today'}</div>
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-warning">{pendingCheckpoints?.length || 0}</div>
              <div className="text-xs text-muted-foreground">{lang === 'hi' ? 'पुष्टि लंबित' : 'Pending Confirms'}</div>
            </div>
          </div>
        </div>

        {/* Pending attendance confirmations */}
        {pendingCheckpoints && pendingCheckpoints.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] text-primary font-semibold tracking-[0.15em] uppercase">
              {lang === 'hi' ? 'उपस्थिति पुष्टि' : 'Attendance Confirmations'}
            </div>
            {pendingCheckpoints.map((cp: any) => (
              <div key={cp.id} className="bg-card rounded-2xl border border-border card-shadow p-4 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{cp.employees?.name}</div>
                  <div className="text-[10px] text-muted-foreground">{cp.employees?.emp_code}</div>
                </div>
                <button onClick={() => confirmCheckpoint2(cp.id)} className="px-3 py-2 rounded-xl bg-success text-primary-foreground text-xs font-bold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> {lang === 'hi' ? 'पुष्टि' : 'Confirm'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="space-y-2">
          <button onClick={() => setActiveTab('vehicles')} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card card-shadow hover:bg-muted/50 transition-all active:scale-[0.98]">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-semibold flex-1 text-left text-foreground">{lang === 'hi' ? 'वाहन लॉग' : 'Vehicle Log'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <BottomNav role="security_guard" activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default SecurityGuardHome;
