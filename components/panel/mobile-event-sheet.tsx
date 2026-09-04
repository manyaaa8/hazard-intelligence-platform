"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { EventPanel } from "@/components/panel/event-panel"
import type { HazardEventProperties } from "@/lib/types"

type Props = {
  events: HazardEventProperties[]
  isLoading: boolean
  error?: Error
  selectedId: string | null
  query: string
  onQueryChange: (q: string) => void
  onSelect: (id: string) => void
  onBack: () => void
  onMutated: () => void
}

/**
 * Mobile equivalent of the desktop sidebar (Section 23). Sits fixed to the
 * bottom of the viewport so the map keeps the full width; starts collapsed
 * to a one-line peek and expands to a near-full-height sheet on tap, or
 * automatically when a marker is selected on the map.
 */
export function MobileEventSheet({
  events,
  isLoading,
  error,
  selectedId,
  query,
  onQueryChange,
  onSelect,
  onBack,
  onMutated,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (selectedId) setExpanded(true)
  }, [selectedId])

  return (
    <div
      className={
        "fixed inset-x-0 bottom-0 z-[700] flex flex-col rounded-t-xl border-t border-border bg-card shadow-2xl transition-[height] duration-200 ease-out md:hidden " +
        (expanded ? "h-[80dvh]" : "h-14")
      }
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex shrink-0 items-center justify-between gap-2 px-4 py-3"
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse detections panel" : "Expand detections panel"}
      >
        <span className="h-1 w-10 rounded-full bg-border" aria-hidden />
        <span className="flex-1 text-left text-sm font-medium text-foreground">
          {isLoading
            ? "Loading detections…"
            : `${events.length} detection${events.length === 1 ? "" : "s"}`}
        </span>
        {expanded ? (
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
        ) : (
          <ChevronUp className="size-4 text-muted-foreground" aria-hidden />
        )}
      </button>

      {expanded && (
        <div className="min-h-0 flex-1 border-t border-border">
          <EventPanel
            events={events}
            isLoading={isLoading}
            error={error}
            selectedId={selectedId}
            query={query}
            onQueryChange={onQueryChange}
            onSelect={onSelect}
            onBack={onBack}
            onMutated={onMutated}
          />
        </div>
      )}
    </div>
  )
}
