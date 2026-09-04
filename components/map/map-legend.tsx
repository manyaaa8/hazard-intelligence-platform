import {
  COVERAGE_HEX,
  EVIDENCE_TIER_LABEL,
  ROUTE_HEX,
  type EvidenceTier,
} from "@/lib/map"
import type { CoverageLevel } from "@/lib/types"

const EVIDENCE_TIERS: EvidenceTier[] = ["HIGH", "MEDIUM", "LOW"]
const COVERAGE_LEVELS: CoverageLevel[] = ["HIGH", "MEDIUM", "LOW"]

export function MapLegend() {
  return (
    <div className="pointer-events-auto max-w-[calc(100vw-1.5rem)] rounded-lg border border-border bg-card/90 p-3 text-xs shadow-lg backdrop-blur">
      <p className="mb-2 font-semibold uppercase tracking-wide text-muted-foreground">
        Evidence Score
      </p>
      <ul className="space-y-1.5">
        {EVIDENCE_TIERS.map((tier) => (
          <li key={tier} className="flex items-center gap-2">
            {/* Shape/size, not just color: matches the map markers' size + H/M/L label. */}
            <span
              className="flex shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-background"
              style={{
                backgroundColor: `var(--evidence-${tier.toLowerCase()})`,
                width: tier === "HIGH" ? 14 : tier === "MEDIUM" ? 11 : 8,
                height: tier === "HIGH" ? 14 : tier === "MEDIUM" ? 11 : 8,
              }}
            >
              {tier[0]}
            </span>
            <span className="text-foreground">{EVIDENCE_TIER_LABEL[tier]}</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">
              {tier === "HIGH"
                ? "≥ 0.70"
                : tier === "MEDIUM"
                  ? "0.50–0.69"
                  : "< 0.50"}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
        <span className="size-3 rounded-full border-2 border-dashed border-muted-foreground" />
        <span className="text-muted-foreground">Dashed ring = synthetic</span>
      </div>

      <div className="mt-3 border-t border-border pt-2">
        <p className="mb-1.5 font-semibold uppercase tracking-wide text-muted-foreground">
          Coverage
        </p>
        <ul className="space-y-1">
          {COVERAGE_LEVELS.map((level) => (
            <li key={level} className="flex items-center gap-2">
              <span
                className="h-1.5 w-4 rounded-full"
                style={{ backgroundColor: COVERAGE_HEX[level] }}
              />
              <span className="text-foreground">{level.charAt(0) + level.slice(1).toLowerCase()}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 border-t border-border pt-2">
        <p className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">
          Route frequency
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Low</span>
          <span
            className="h-1.5 flex-1 rounded-full"
            style={{
              background: `linear-gradient(to right, ${ROUTE_HEX}33, ${ROUTE_HEX})`,
            }}
          />
          <span className="text-[10px] text-muted-foreground">High</span>
        </div>
      </div>
    </div>
  )
}
