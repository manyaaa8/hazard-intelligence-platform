"use client"

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { EventList } from "@/components/panel/event-list"
import { EventDetail } from "@/components/panel/event-detail"
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

export function EventPanel({
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
  if (selectedId) {
    return (
      <EventDetail
        eventId={selectedId}
        onBack={onBack}
        onSelectLinked={onSelect}
        onMutated={onMutated}
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search detections, segments, buses…"
            className="h-9 bg-secondary pl-8 text-sm"
            aria-label="Search detections"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <EventList
          events={events}
          isLoading={isLoading}
          error={error}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </div>
    </div>
  )
}
