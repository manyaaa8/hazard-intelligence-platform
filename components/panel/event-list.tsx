"use client"

import { AlertTriangle } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { EvidenceDot } from "@/components/shared/evidence-badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { SyntheticBadge } from "@/components/shared/hazard-badge"
import { HAZARD_ICON } from "@/components/shared/hazard-badge"
import { HAZARD_LABEL, formatScore } from "@/lib/map"
import { cn } from "@/lib/utils"
import type { HazardEventProperties } from "@/lib/types"

type Props = {
  events: HazardEventProperties[]
  isLoading: boolean
  error?: Error
  selectedId: string | null
  onSelect: (id: string) => void
}

export function EventList({
  events,
  isLoading,
  error,
  selectedId,
  onSelect,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center">
        <AlertTriangle className="size-5 text-destructive" aria-hidden />
        <p className="text-sm text-foreground">Failed to load detections</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        No detections match the current filters.
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <ul className="divide-y divide-border">
        {events.map((e) => {
          const Icon = HAZARD_ICON[e.hazard_type]
          const active = e.event_id === selectedId
          return (
            <li key={e.event_id}>
              <button
                type="button"
                onClick={() => onSelect(e.event_id)}
                className={cn(
                  "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-secondary/60",
                  active && "bg-secondary",
                )}
              >
                <div className="mt-0.5 flex flex-col items-center gap-1">
                  <Icon
                    className={cn(
                      "size-4",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                  <EvidenceDot score={e.evidence_score} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {HAZARD_LABEL[e.hazard_type]}
                    </span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {formatScore(e.evidence_score)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={e.status} rejected={e.rejected} />
                    {e.synthetic && <SyntheticBadge />}
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {e.event_id} · {e.independent_passes} pass
                    {e.independent_passes === 1 ? "" : "es"} ·{" "}
                    {e.bus_ids.length} bus
                    {e.bus_ids.length === 1 ? "" : "es"}
                  </p>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </ScrollArea>
  )
}
