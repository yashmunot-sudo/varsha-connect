import React from 'react';
import { useAllScores } from '@/hooks/useEmployeeData';
import { Award, TrendingUp } from 'lucide-react';

interface LeaderboardPanelProps {
  lang: string;
  currentEmployeeId?: string;
}

const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ lang, currentEmployeeId }) => {
  const { data: scores, isLoading } = useAllScores();

  if (isLoading) return <div className="text-center py-8 text-sm text-muted-foreground">Loading...</div>;

  const top10 = scores?.slice(0, 10) || [];
  const myRank = scores?.findIndex(s => s.employee_id === currentEmployeeId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
          <Award className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            {lang === 'hi' ? 'EoTM लीडरबोर्ड' : 'EoTM Leaderboard'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {lang === 'hi' ? 'इस महीने की रैंकिंग' : 'This month rankings'}
          </p>
        </div>
      </div>

      {myRank !== undefined && myRank >= 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-3 flex items-center gap-3">
          <span className="font-display text-2xl font-extrabold text-primary">#{myRank + 1}</span>
          <span className="text-sm font-medium text-foreground">{lang === 'hi' ? 'आपकी रैंक' : 'Your Rank'}</span>
        </div>
      )}

      <div className="space-y-2">
        {top10.map((s: any, i: number) => {
          const isMe = s.employee_id === currentEmployeeId;
          const medalColors = ['text-warning', 'text-muted-foreground', 'text-primary'];
          return (
            <div key={s.id} className={`rounded-xl border card-shadow p-3 flex items-center gap-3 ${isMe ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}>
              <span className={`font-display text-lg font-extrabold w-8 text-center ${i < 3 ? medalColors[i] : 'text-muted-foreground'}`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{s.employees?.name}</div>
                <div className="text-[10px] text-muted-foreground">{s.employees?.department}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg font-bold text-foreground">{Math.round(Number(s.composite_score))}</div>
                <div className="text-[10px] text-muted-foreground">pts</div>
              </div>
            </div>
          );
        })}
        {top10.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {lang === 'hi' ? 'अभी कोई स्कोर नहीं' : 'No scores yet this month'}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPanel;
