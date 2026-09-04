import { CircleDot, Layers, ShieldCheck, Wrench, CheckCircle2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { STATUS_LABEL } from "@/lib/map"
import type { LifecycleStatus } from "@/lib/types"

const STATUS_STYLE: Record<
  LifecycleStatus,
  { icon: React.ElementType; className: string }
> = {
  DETECTED: {
    icon: CircleDot,
    className: "border-muted-foreground/30 bg-muted text-muted-foreground",
  },
  CORROBORATED: {
    icon: Layers,
    className:
      "border-[var(--evidence-medium)]/40 bg-[var(--evidence-medium)]/10 text-[var(--evidence-medium)]",
  },
  VERIFIED: {
    icon: ShieldCheck,
    className: "border-primary/40 bg-primary/10 text-primary",
  },
  ASSIGNED: {
    icon: Wrench,
    className:
      "border-[var(--coverage-medium)]/50 bg-[var(--coverage-medium)]/12 text-[var(--coverage-high)]",
  },
  FIXED: {
    icon: CheckCircle2,
    className: "border-primary/50 bg-primary/15 text-primary",
  },
}

export function StatusBadge({
  status,
  rejected,
  className,
}: {
  status: LifecycleStatus
  rejected?: boolean
  className?: string
}) {
  if (rejected) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-destructive",
          className,
        )}
      >
        Rejected
      </span>
    )
  }
  const { icon: Icon, className: style } = STATUS_STYLE[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        style,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  )
}
