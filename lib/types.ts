// Locked backend contract. Do not rename fields or invent a simpler schema.

export type HazardType = "pothole" | "waterlogging" | "traffic_bottleneck"

export type LifecycleStatus =
  | "DETECTED"
  | "CORROBORATED"
  | "VERIFIED"
  | "ASSIGNED"
  | "FIXED"

/** Ordered lifecycle pipeline. Rejection is handled separately, not a 6th stage. */
export const LIFECYCLE_ORDER: LifecycleStatus[] = [
  "DETECTED",
  "CORROBORATED",
  "VERIFIED",
  "ASSIGNED",
  "FIXED",
]

export type ConfidenceBreakdown = {
  model_confidence: number // 0-1
  persistence_factor: number // 0-1
  independence_factor: number // 0-1
  context_factor: number // typically 0.7-1.3
  bus_reliability: number // 0-1
}

export type HazardEventProperties = {
  event_id: string
  hazard_type: HazardType
  /** 0-1. Always "Evidence Score", never "confidence %" or "probability". */
  evidence_score: number
  confidence_breakdown: ConfidenceBreakdown
  status: LifecycleStatus
  independent_passes: number
  bus_ids: string[]
  linked_events: string[]
  /** true = seeded/demo data, must always be visibly flagged. */
  synthetic: boolean
  latitude: number
  longitude: number
  /** Optional: present only when rejected via the reject action. */
  rejected?: boolean
}

export type HazardObservation = {
  observation_id: string
  bus_id: string
  timestamp: string // ISO
  model_confidence: number
  note: string
}

/** Detail endpoint returns the same properties plus a full observation list. */
export type HazardEventDetailProperties = HazardEventProperties & {
  observations: HazardObservation[]
  first_seen: string // ISO
  last_seen: string // ISO
  segment_name: string
}

export type HazardFeature<
  P extends HazardEventProperties = HazardEventProperties,
> = {
  type: "Feature"
  geometry: { type: "Point"; coordinates: [number, number] } // [lng, lat]
  properties: P
}

export type HazardFeatureCollection = {
  type: "FeatureCollection"
  features: HazardFeature[]
}

export type CoverageLevel = "LOW" | "MEDIUM" | "HIGH"

export type CoverageSegment = {
  segment_id: string
  segment_name: string
  coverage_level: CoverageLevel
  observation_count: number
  /** Polyline path [lat, lng][] describing the monitored road segment. */
  path: [number, number][]
}

export type RouteFrequencySegment = {
  route_id: string
  route_name: string
  /** Relative traversal frequency 0-1, drives line weight/opacity. */
  frequency: number
  observation_count: number
  /** population-proxy estimate — never a validated figure. */
  population_proxy: number
  path: [number, number][]
}

export type BusReliability = {
  bus_id: string
  reliability_score: number // 0-1
  history: number[] // 0-1 over time, oldest -> newest
}

export type VerificationBody = {
  verified_by: string
}
