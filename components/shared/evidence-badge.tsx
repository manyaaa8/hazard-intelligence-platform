import { cn } from "@/lib/utils"
import {
  EVIDENCE_TIER_LABEL,
  evidenceTier,
  formatScore,
  type EvidenceTier,
} from "@/lib/map"

const TIER_CLASSES: Record<EvidenceTier, string> = {
  HIGH: "border-[var(--evidence-high)]/40 bg-[var(--evidence-high)]/12 text-[var(--evidence-high)]",
  MEDIUM:
    "border-[var(--evidence-medium)]/40 bg-[var(--evidence-medium)]/12 text-[var(--evidence-medium)]",
  LOW: "border-[var(--evidence-low)]/40 bg-[var(--evidence-low)]/12 text-[var(--evidence-low)]",
}

export function EvidenceDot({
  score,
  className,
}: {
  score: number
  className?: string
}) {
  const tier = evidenceTier(score)
  return (
    <span
      className={cn("inline-block size-2.5 rounded-full", className)}
      style={{ backgroundColor: `var(--evidence-${tier.toLowerCase()})` }}
      aria-hidden
    />
  )
}

export function EvidenceBadge({
  score,
  showLabel = true,
  className,
}: {
  score: number
  showLabel?: boolean
  className?: string
}) {
  const tier = evidenceTier(score)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-xs font-medium tabular-nums",
        TIER_CLASSES[tier],
        className,
      )}
      title="Evidence Score (0–1)"
    >
      {formatScore(score)}
      {showLabel && (
        <span className="font-sans text-[10px] font-semibold uppercase tracking-wide opacity-80">
          {EVIDENCE_TIER_LABEL[tier]}
        </span>
      )}
    </span>
  )
}
