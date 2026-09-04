import { formatScore } from "@/lib/map"
import type { ConfidenceBreakdown } from "@/lib/types"

type Factor = {
  key: keyof ConfidenceBreakdown
  label: string
  help: string
  /** display max for the bar (context_factor can exceed 1). */
  max: number
}

const FACTORS: Factor[] = [
  {
    key: "model_confidence",
    label: "Model confidence",
    help: "On-vehicle detector output for a single pass.",
    max: 1,
  },
  {
    key: "persistence_factor",
    label: "Persistence",
    help: "How consistently the hazard reappears over time.",
    max: 1,
  },
  {
    key: "independence_factor",
    label: "Independence",
    help: "Corroboration from independent buses / passes.",
    max: 1,
  },
  {
    key: "context_factor",
    label: "Context",
    help: "Environmental weighting (weather, road class).",
    max: 1.3,
  },
  {
    key: "bus_reliability",
    label: "Bus reliability",
    help: "Track record of the reporting sensor buses.",
    max: 1,
  },
]

export function ScoreBreakdown({
  breakdown,
}: {
  breakdown: ConfidenceBreakdown
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-muted-foreground">
        The <span className="font-medium text-foreground">Evidence Score</span>{" "}
        combines these factors. It is a weight of accumulated evidence, not a
        probability or a percentage certainty.
      </p>
      <ul className="space-y-2.5">
        {FACTORS.map((f) => {
          const value = breakdown[f.key]
          const pct = Math.min(100, (value / f.max) * 100)
          return (
            <li key={f.key} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium text-foreground">
                  {f.label}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatScore(value)}
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-secondary"
                role="meter"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={f.max}
                aria-label={f.label}
              >
                <div
                  className="h-full rounded-full bg-primary/80"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[11px] leading-snug text-muted-foreground">
                {f.help}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
