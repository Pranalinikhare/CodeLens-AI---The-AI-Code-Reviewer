import type { QualityScore } from "@/lib/ai";

interface QualityScoreCardProps {
  score: QualityScore;
}

function ScoreRing({ value, label, size = 60 }: { value: number; label: string; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  const color = value >= 80 ? "hsl(var(--accent))" : value >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
          {value}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

export function QualityScoreCard({ score }: QualityScoreCardProps) {
  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <h3 className="text-sm font-medium text-foreground mb-4">Code Quality Score</h3>
      <div className="flex items-center justify-center mb-4">
        <ScoreRing value={score.overall} label="Overall" size={80} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <ScoreRing value={score.readability} label="Read" />
        <ScoreRing value={score.performance} label="Perf" />
        <ScoreRing value={score.maintainability} label="Maint" />
        <ScoreRing value={score.security} label="Sec" />
      </div>
    </div>
  );
}
