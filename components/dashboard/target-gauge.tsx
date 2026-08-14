import type { dashboard } from "@/lib/api/client";
import { formatPrice } from "@/lib/format";

const R = 70;
const ARC_LEN = Math.PI * R;
const ARC_PATH = `M 20 90 A ${R} ${R} 0 0 1 160 90`;

/** Dash offset that leaves `pct` percent of the arc visible. */
export function arcOffset(pct: number): number {
  const clamped = Math.min(Math.max(pct, 0), 100);
  return ARC_LEN * (1 - clamped / 100);
}

const legend = [
  { label: "Tercapai", className: "bg-brand-deep" },
  { label: "Sisa Target", className: "bg-chart-5" },
];

interface TargetGaugeProps {
  percent?: number;
  target?: dashboard.TargetResponse;
}

export function TargetGauge({ percent, target }: TargetGaugeProps) {
  const pct = target ? Math.round(target.percentage) : (percent ?? 75);
  const currentText = target ? formatPrice(target.currentAmount) : "Rp 112,5jt";
  const targetText = target ? formatPrice(target.targetAmount) : "Rp 150jt";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Target Bulanan</h2>
        <span className="text-xs text-muted-foreground">{currentText} / {targetText}</span>
      </div>

      <div className="relative mt-4">
        <svg
          viewBox="0 0 180 100"
          className="w-full"
          role="img"
          aria-label={`Target bulanan ${pct}% tercapai`}
        >
          <path
            d={ARC_PATH}
            fill="none"
            strokeWidth="18"
            strokeLinecap="round"
            className="stroke-chart-5"
          />
          <path
            d={ARC_PATH}
            fill="none"
            strokeWidth="18"
            strokeLinecap="round"
            className="stroke-brand-deep transition-all duration-1000"
            strokeDasharray={ARC_LEN}
            strokeDashoffset={arcOffset(pct)}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-1 text-center">
          <p className="text-3xl font-bold tracking-tight text-foreground">{pct}%</p>
          <p className="text-xs text-muted-foreground">Target omset tercapai</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {legend.map((entry) => (
          <span key={entry.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span aria-hidden="true" className={`size-2 rounded-full ${entry.className}`} />
            {entry.label}
          </span>
        ))}
      </div>
    </div>
  );
}

