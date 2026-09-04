"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { AlertTriangle, Layers3, TriangleAlert } from "lucide-react"

import { api } from "@/lib/api"
import { EVIDENCE_TIER_RANK, evidenceTier, HAZARD_LABEL } from "@/lib/map"
import { useEvents } from "@/hooks/useEvents"
import { useMapLayers } from "@/hooks/useMapLayers"
import { HazardMap } from "@/components/map/hazard-map"
import { MapLegend } from "@/components/map/map-legend"
import { LayerControls } from "@/components/map/layer-controls"
import { EventPanel } from "@/components/panel/event-panel"
import { MobileEventSheet } from "@/components/panel/mobile-event-sheet"

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
  const [mobilePanelsOpen, setMobilePanelsOpen] = useState(false)

  const coverage = useCoverage(layers.coverage)
  const routes = useHeatmap(layers.routes)

  const filteredFeatures = useMemo(() => {
    return features.filter((f) => {
      const p = f.properties
      if (!hazardTypes.includes(p.hazard_type)) return false
      if (showSyntheticOnly && !p.synthetic) return false
      if (
        evidenceFilter !== "ALL" &&
        // "Min. evidence" means at-or-above the selected tier, not an exact
        // match — otherwise picking "High" hides every other tier instead
        // of just filtering out what's below it.
        EVIDENCE_TIER_RANK[evidenceTier(p.evidence_score)] <
          EVIDENCE_TIER_RANK[evidenceFilter]
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
      <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Layers3 className="size-4" aria-hidden />
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
          <Stat label="High evidence" value={counts.high} className="hidden sm:flex" />
          <Stat label="Synthetic" value={counts.synthetic} muted />
        </div>
      </header>

      {/* Persistent, always-visible — this app runs entirely on seeded data. */}
      <div
        role="status"
        className="flex shrink-0 items-center justify-center gap-1.5 border-b border-amber-500/30 bg-amber-500/10 px-3 py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-amber-300"
      >
        <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
        Demo mode · synthetic data — no live detections shown
      </div>

      <div className="relative flex min-h-0 flex-1">
        {/* Map + overlays */}
        <div className="relative min-w-0 flex-1">
          <HazardMap
            features={mapFeatures}
            coverage={layers.coverage ? coverage : []}
            routes={layers.routes ? routes : []}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {error && (
            <div className="pointer-events-none absolute inset-0 z-[600] flex items-center justify-center bg-background/60">
              <div className="pointer-events-auto flex max-w-xs flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center shadow-lg">
                <AlertTriangle className="size-5 text-destructive" aria-hidden />
                <p className="text-sm text-foreground">
                  Could not load hazard data
                </p>
                <p className="text-xs text-muted-foreground">{error.message}</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-1 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary/70"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute left-3 top-3 z-[500] flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setMobilePanelsOpen((v) => !v)}
              className="pointer-events-auto flex size-9 items-center justify-center rounded-lg border border-border bg-card/90 shadow-lg backdrop-blur md:hidden"
              aria-expanded={mobilePanelsOpen}
              aria-label={mobilePanelsOpen ? "Hide map layers panel" : "Show map layers panel"}
            >
              <Layers3 className="size-4 text-foreground" aria-hidden />
            </button>
            <div
              className={
                (mobilePanelsOpen ? "flex" : "hidden") +
                " pointer-events-auto flex-col gap-2 md:flex"
              }
            >
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
          </div>
          <div
            className={
              (mobilePanelsOpen ? "block" : "hidden") +
              " pointer-events-none absolute bottom-3 left-3 z-[500] md:block"
            }
          >
            <MapLegend />
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden w-[360px] shrink-0 flex-col border-l border-border bg-card md:flex">
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

      {/* Mobile bottom sheet — replaces the sidebar below the md breakpoint */}
      <MobileEventSheet
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
    </main>
  )
}

function Stat({
  label,
  value,
  muted,
  className,
}: {
  label: string
  value: number
  muted?: boolean
  className?: string
}) {
  return (
    <div className={(className ?? "flex") + " flex-col items-end leading-tight"}>
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
