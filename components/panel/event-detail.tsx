"use client"

import { useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import {
  ArrowLeft,
  Check,
  Link2,
  MapPin,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { EvidenceBadge } from "@/components/shared/evidence-badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { HazardTypeBadge, SyntheticBadge } from "@/components/shared/hazard-badge"
import { ScoreBreakdown } from "@/components/shared/score-breakdown"
import { BusReliability } from "@/components/panel/bus-reliability"
import { useEvent } from "@/hooks/useEvents"
import { useVerification } from "@/hooks/useVerification"
import { api } from "@/lib/api"
import { LIFECYCLE_ORDER, type LifecycleStatus } from "@/lib/types"
import { HAZARD_LABEL, STATUS_LABEL } from "@/lib/map"
import { cn } from "@/lib/utils"

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

/** Shows "🔗 Waterlogging · EVT-108" instead of a bare event ID. */
function LinkedEventChip({
  id,
  onSelect,
}: {
  id: string
  onSelect: (id: string) => void
}) {
  const { data } = useSWR(["event", id], () => api.getEvent(id), {
    revalidateOnFocus: false,
  })
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-1 text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
    >
      <Link2 className="size-3" aria-hidden />
      {data ? HAZARD_LABEL[data.hazard_type] : "Linked hazard"}
      <span className="font-mono text-[10px] text-muted-foreground">{id}</span>
    </button>
  )
}

// Operator identity attributed to verify/reject actions in this demo console.
const OPERATOR = "ops-console"

function LifecycleTimeline({
  status,
  rejected,
}: {
  status: LifecycleStatus
  rejected?: boolean
}) {
  const currentIndex = LIFECYCLE_ORDER.indexOf(status)
  return (
    <ol className="flex items-center gap-1">
      {LIFECYCLE_ORDER.map((s, i) => {
        const reached = i <= currentIndex && !rejected
        const isCurrent = i === currentIndex && !rejected
        return (
          <li key={s} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i === 0 ? "opacity-0" : reached ? "bg-primary" : "bg-border",
                )}
              />
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full border-2",
                  isCurrent
                    ? "border-primary bg-primary"
                    : reached
                      ? "border-primary bg-primary/40"
                      : "border-border bg-secondary",
                )}
              />
              <span
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i === LIFECYCLE_ORDER.length - 1
                    ? "opacity-0"
                    : i < currentIndex && !rejected
                      ? "bg-primary"
                      : "bg-border",
                )}
              />
            </div>
            <span
              className={cn(
                "text-center text-[9px] font-medium uppercase tracking-wide",
                isCurrent ? "text-primary" : "text-muted-foreground",
              )}
            >
              {STATUS_LABEL[s]}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

type Props = {
  eventId: string
  onBack: () => void
  onSelectLinked: (id: string) => void
  onMutated: () => void
}

export function EventDetail({
  eventId,
  onBack,
  onSelectLinked,
  onMutated,
}: Props) {
  const { event, isLoading, error, refetch } = useEvent(eventId)
  const { verify, reject, isVerifying, isRejecting, pending } =
    useVerification(OPERATOR)
  const [confirm, setConfirm] = useState<"verify" | "reject" | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-foreground">Could not load this detection.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error?.message ?? "Unknown error"}
        </p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={onBack}>
          Back to list
        </Button>
      </div>
    )
  }

  const terminal = event.status === "FIXED"

  async function handle(action: "verify" | "reject") {
    try {
      const fn = action === "verify" ? verify : reject
      const updated = await fn(event.event_id)
      if (updated) {
        if (action === "verify") {
          toast.success("Detection verified", {
            description: `${updated.event_id} advanced to ${STATUS_LABEL[updated.status]}.`,
          })
        } else {
          toast.success("Detection rejected", {
            description: `${updated.event_id} flagged as a false positive.`,
          })
        }
      }
      setConfirm(null)
      await refetch()
      onMutated()
    } catch (e) {
      toast.error("Action failed", {
        description: e instanceof Error ? e.message : "Please retry.",
      })
      setConfirm(null)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onBack}
          aria-label="Back to detections list"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <span className="font-mono text-sm font-medium text-foreground">
          {event.event_id}
        </span>
        {event.synthetic && <SyntheticBadge className="ml-auto" />}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-5 p-4">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <HazardTypeBadge type={event.hazard_type} />
              <StatusBadge status={event.status} rejected={event.rejected} />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="text-foreground">{event.segment_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <EvidenceBadge score={event.evidence_score} />
              <span className="text-xs text-muted-foreground">
                {event.independent_passes} independent pass
                {event.independent_passes === 1 ? "" : "es"}
              </span>
            </div>
            <p className="font-mono text-[11px] text-muted-foreground">
              First seen {formatTimestamp(event.first_seen)} · Last seen{" "}
              {formatTimestamp(event.last_seen)}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <LifecycleTimeline
              status={event.status}
              rejected={event.rejected}
            />
          </div>

          {/* Verification actions */}
          <div className="space-y-2">
            {event.rejected ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                This detection was rejected as a false positive. Reporting bus
                reliability was discounted.
              </p>
            ) : confirm ? (
              <div className="space-y-2 rounded-md border border-border bg-secondary/60 p-3">
                <p className="text-sm text-foreground">
                  {confirm === "verify"
                    ? "Confirm this hazard and advance its lifecycle?"
                    : "Reject this detection as a false positive? This will discount the reliability score of every reporting bus."}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={confirm === "reject" ? "destructive" : "default"}
                    disabled={pending !== null}
                    onClick={() => handle(confirm)}
                  >
                    {confirm === "verify"
                      ? isVerifying
                        ? "Verifying…"
                        : "Confirm verify"
                      : isRejecting
                        ? "Rejecting…"
                        : "Confirm reject"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending !== null}
                    onClick={() => setConfirm(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={terminal}
                  onClick={() => setConfirm("verify")}
                >
                  <Check className="size-4" />
                  {terminal ? "Resolved" : "Verify"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setConfirm("reject")}
                >
                  <X className="size-4" />
                  Reject
                </Button>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Evidence breakdown
            </h3>
            <ScoreBreakdown breakdown={event.confidence_breakdown} />
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Reporting buses
            </h3>
            <div className="space-y-1.5">
              {event.bus_ids.map((busId) => (
                <BusReliability key={busId} busId={busId} />
              ))}
            </div>
          </div>

          <Separator />
          <div className="space-y-2">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Link2 className="size-3.5" aria-hidden />
              Co-occurring events
            </h3>
            {event.linked_events.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {event.linked_events.map((id) => (
                  <LinkedEventChip key={id} id={id} onSelect={onSelectLinked} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No linked hazards — this detection hasn't co-occurred with
                another one nearby.
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Observation log
            </h3>
            <ul className="space-y-2">
              {event.observations.map((o) => (
                <li
                  key={o.observation_id}
                  className="rounded-md border border-border bg-secondary/40 p-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-foreground">
                      {o.bus_id}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(o.timestamp).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    {o.note}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    model conf. {o.model_confidence.toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
