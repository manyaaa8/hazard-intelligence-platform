import { Construction, Droplets, TrafficCone, FlaskConical } from "lucide-react"

import { cn } from "@/lib/utils"
import { HAZARD_LABEL } from "@/lib/map"
import type { HazardType } from "@/lib/types"

export const HAZARD_ICON: Record<HazardType, React.ElementType> = {
  pothole: Construction,
  waterlogging: Droplets,
  traffic_bottleneck: TrafficCone,
}

export function HazardTypeBadge({
  type,
  className,
}: {
  type: HazardType
  className?: string
}) {
  const Icon = HAZARD_ICON[type]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {HAZARD_LABEL[type]}
    </span>
  )
}

/**
 * Synthetic / demo data must ALWAYS be visibly flagged. This badge is the
 * canonical marker; markers on the map also use a dashed ring.
 */
export function SyntheticBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-dashed border-muted-foreground/50 bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
        className,
      )}
      title="Synthetic (seeded demo) data — not a live detection"
    >
      <FlaskConical className="size-3" aria-hidden />
      Synthetic
    </span>
  )
}
