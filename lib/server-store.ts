import "server-only"

import {
  buildSeedEvents,
  SEED_BUS_RELIABILITY,
  SEED_COVERAGE,
  SEED_ROUTES,
} from "@/lib/mock-data"
import {
  LIFECYCLE_ORDER,
  type BusReliability,
  type CoverageSegment,
  type HazardEventDetailProperties,
  type HazardFeature,
  type HazardFeatureCollection,
  type LifecycleStatus,
  type RouteFrequencySegment,
} from "@/lib/types"

/**
 * In-memory demo store. Persisted on globalThis so verify/reject mutations
 * survive dev HMR. Replace this module with real backend calls when the
 * `/api/events` service (Section 7 contract) goes live.
 */
type Store = {
  events: Map<string, HazardEventDetailProperties>
  coverage: CoverageSegment[]
  routes: RouteFrequencySegment[]
  buses: Record<string, BusReliability>
}

const g = globalThis as unknown as { __hazardStore?: Store }

function createStore(): Store {
  const events = new Map<string, HazardEventDetailProperties>()
  for (const e of buildSeedEvents()) events.set(e.event_id, e)
  return {
    events,
    coverage: SEED_COVERAGE,
    routes: SEED_ROUTES,
    buses: SEED_BUS_RELIABILITY,
  }
}

function store(): Store {
  if (!g.__hazardStore) g.__hazardStore = createStore()
  return g.__hazardStore
}

function toFeature(p: HazardEventDetailProperties): HazardFeature {
  // Strip detail-only fields from the collection payload.
  const { observations, first_seen, last_seen, segment_name, ...properties } = p
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
    properties,
  }
}

export function getEventsCollection(): HazardFeatureCollection {
  return {
    type: "FeatureCollection",
    features: Array.from(store().events.values()).map(toFeature),
  }
}

export function getEventDetail(id: string): HazardEventDetailProperties | null {
  return store().events.get(id) ?? null
}

function advanceStatus(current: LifecycleStatus): LifecycleStatus {
  const i = LIFECYCLE_ORDER.indexOf(current)
  // VERIFIED is the operator confirmation ceiling for this action.
  const cap = LIFECYCLE_ORDER.indexOf("VERIFIED")
  if (i < 0) return current
  return LIFECYCLE_ORDER[Math.min(i + 1, cap)]
}

export function verifyEvent(
  id: string,
): HazardEventDetailProperties | null {
  const e = store().events.get(id)
  if (!e) return null
  const updated: HazardEventDetailProperties = {
    ...e,
    rejected: false,
    status: advanceStatus(e.status),
  }
  store().events.set(id, updated)
  return updated
}

export function rejectEvent(
  id: string,
): HazardEventDetailProperties | null {
  const e = store().events.get(id)
  if (!e) return null
  const updated: HazardEventDetailProperties = { ...e, rejected: true }
  store().events.set(id, updated)

  // Discount the reporting bus's reliability score (demo heuristic).
  for (const busId of e.bus_ids) {
    const bus = store().buses[busId]
    if (!bus) continue
    const next = Math.max(0, Number((bus.reliability_score - 0.05).toFixed(2)))
    store().buses[busId] = {
      ...bus,
      reliability_score: next,
      history: [...bus.history, next].slice(-8),
    }
  }
  return updated
}

export function getCoverage(): CoverageSegment[] {
  return store().coverage
}

export function getRoutes(): RouteFrequencySegment[] {
  return store().routes
}

export function getBusReliability(id: string): BusReliability | null {
  return store().buses[id] ?? null
}
