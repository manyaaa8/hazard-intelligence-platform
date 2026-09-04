"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Activity, Radio } from "lucide-react"

import { api } from "@/lib/api"
import { evidenceTier, HAZARD_LABEL } from "@/lib/map"
import { useEvents } from "@/hooks/useEvents"
import { useMapLayers } from "@/hooks/useMapLayers"
import { HazardMap } from "@/components/map/hazard-map"
import { MapLegend } from "@/components/map/map-legend"
import { LayerControls } from "@/components/map/layer-controls"
import { EventPanel } from "@/components/panel/event-panel"

function useCoverage(enabled: boolean) {
  const { data } = useSWR(enabled ? "coverage" : null, () => api.getCoverage(), {
    revalidateOnFocus: false,
  })
  return data ?? []
}

function useHeatmap(enabled: boolean) {
  const { data } = useSWR(enabled ? "heatmap" : null, () => api.getHeatmap(), {
    revalidateOnFocus: false,
  })
  return data ?? []
}

export default function Page() {
  const { features, events, isLoading, error, refetch } = useEvents()
  const {
    layers,
    toggleLayer,
    hazardTypes,
    toggleHazardType,
    evidenceFilter,
    setEvidenceFilter,
    showSyntheticOnly,
    setShowSyntheticOnly,
  } = useMapLayers()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const coverage = useCoverage(layers.coverage)
  const routes = useHeatmap(layers.routes)

  const filteredFeatures = useMemo(() => {
    return features.filter((f) => {
      const p = f.properties
      if (!hazardTypes.includes(p.hazard_type)) return false
      if (showSyntheticOnly && !p.synthetic) return false
      if (
        evidenceFilter !== "ALL" &&
        evidenceTier(p.evidence_score) !== evidenceFilter
      ) {
        return false
      }
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        const haystack = [p.event_id, HAZARD_LABEL[p.hazard_type], ...p.bus_ids]
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [features, hazardTypes, showSyntheticOnly, evidenceFilter, query])

  const filteredEvents = useMemo(
    () => filteredFeatures.map((f) => f.properties),
    [filteredFeatures],
  )

  const mapFeatures = layers.hazards ? filteredFeatures : []

  const counts = useMemo(() => {
    const total = events.length
    const synthetic = events.filter((e) => e.synthetic).length
    const high = events.filter(
      (e) => evidenceTier(e.evidence_score) === "HIGH",
    ).length
    return { total, synthetic, high }
  }, [events])

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex shrink-0 items-center gap-4 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Radio className="size-4" aria-hidden />
          </span>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold tracking-tight">
              Fleet Hazard Intelligence
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Passive road-hazard detection · Bengaluru
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4 text-xs">
          <Stat label="Detections" value={counts.total} />
          <Stat label="High evidence" value={counts.high} />
          <Stat label="Synthetic" value={counts.synthetic} muted />
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground sm:flex">
            <Activity
              className="size-3 text-[var(--evidence-high)]"
              aria-hidden
            />
            Live demo feed
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Map + overlays */}
        <div className="relative min-w-0 flex-1">
          <HazardMap
            features={mapFeatures}
            coverage={layers.coverage ? coverage : []}
            routes={layers.routes ? routes : []}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <div className="pointer-events-none absolute left-3 top-3 z-[500]">
            <LayerControls
              layers={layers}
              toggleLayer={toggleLayer}
              hazardTypes={hazardTypes}
              toggleHazardType={toggleHazardType}
              evidenceFilter={evidenceFilter}
              setEvidenceFilter={setEvidenceFilter}
              showSyntheticOnly={showSyntheticOnly}
              setShowSyntheticOnly={setShowSyntheticOnly}
            />
          </div>
          <div className="pointer-events-none absolute bottom-3 left-3 z-[500]">
            <MapLegend />
          </div>
        </div>

        {/* Right panel */}
        <aside className="flex w-[360px] shrink-0 flex-col border-l border-border bg-card">
          <EventPanel
            events={filteredEvents}
            isLoading={isLoading}
            error={error}
            selectedId={selectedId}
            query={query}
            onQueryChange={setQuery}
            onSelect={setSelectedId}
            onBack={() => setSelectedId(null)}
            onMutated={() => refetch()}
          />
        </aside>
      </div>
    </main>
  )
}

function Stat({
  label,
  value,
  muted,
}: {
  label: string
  value: number
  muted?: boolean
}) {
  return (
    <div className="flex flex-col items-end leading-tight">
      <span
        className={
          "font-mono text-sm font-semibold tabular-nums " +
          (muted ? "text-muted-foreground" : "text-foreground")
        }
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
