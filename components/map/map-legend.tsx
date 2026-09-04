import { EVIDENCE_TIER_LABEL, type EvidenceTier } from "@/lib/map"

const EVIDENCE_TIERS: EvidenceTier[] = ["HIGH", "MEDIUM", "LOW"]

export function MapLegend() {
  return (
    <div className="pointer-events-auto rounded-lg border border-border bg-card/90 p-3 text-xs shadow-lg backdrop-blur">
      <p className="mb-2 font-semibold uppercase tracking-wide text-muted-foreground">
        Evidence Score
      </p>
      <ul className="space-y-1.5">
        {EVIDENCE_TIERS.map((tier) => (
          <li key={tier} className="flex items-center gap-2">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: `var(--evidence-${tier.toLowerCase()})` }}
            />
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
    </div>
  )
}
