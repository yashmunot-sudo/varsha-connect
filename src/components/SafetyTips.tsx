import React from 'react';
import { Shield, Flame, Zap, HardHat, Eye } from 'lucide-react';

interface SafetyTipsProps {
  lang: string;
}

const TIPS = [
  { icon: HardHat, label_hi: 'हमेशा हेलमेट और सेफ्टी शूज़ पहनें', label_en: 'Always wear helmet and safety shoes', color: 'text-primary bg-primary/10' },
  { icon: Eye, label_hi: 'मशीन पर काम करते समय चश्मा पहनें', label_en: 'Wear safety goggles when operating machines', color: 'text-info bg-info/10' },
  { icon: Flame, label_hi: 'गर्म धातु को बिना दस्ताने के न छुएं', label_en: 'Never touch hot metal without gloves', color: 'text-danger bg-danger/10' },
  { icon: Zap, label_hi: 'बिजली के तारों से दूर रहें', label_en: 'Stay away from exposed electrical wires', color: 'text-warning bg-warning/10' },
  { icon: Shield, label_hi: 'कोई खतरा दिखे तो तुरंत सुपरवाइज़र को बताएं', label_en: 'Report any hazard to your supervisor immediately', color: 'text-success bg-success/10' },
];

const SafetyTips: React.FC<SafetyTipsProps> = ({ lang }) => {
  const todayIndex = new Date().getDay();
  const tip = TIPS[todayIndex % TIPS.length];
  const Icon = tip.icon;
  const [iconColor, bgColor] = tip.color.split(' ');

  return (
    <div className={`rounded-2xl border border-border card-shadow p-4 ${bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">
          {lang === 'hi' ? 'आज की सुरक्षा टिप' : "TODAY'S SAFETY TIP"}
        </span>
      </div>
      <p className="text-sm font-medium text-foreground">
        {lang === 'hi' ? tip.label_hi : tip.label_en}
      </p>
    </div>
  );
};

export default SafetyTips;
