import type {
  CoverageLevel,
  HazardType,
  LifecycleStatus,
} from "@/lib/types"

/** Bengaluru city center — stable default view, never randomized. */
export const MAP_CENTER: [number, number] = [12.9716, 77.5946]
export const MAP_DEFAULT_ZOOM = 13

export type EvidenceTier = "HIGH" | "MEDIUM" | "LOW"

/** Evidence Score -> tier. Thresholds are the single source of truth. */
export function evidenceTier(score: number): EvidenceTier {
  if (score >= 0.7) return "HIGH"
  if (score >= 0.5) return "MEDIUM"
  return "LOW"
}

/** Ordinal rank so filters can express "at least this tier" instead of exact equality. */
export const EVIDENCE_TIER_RANK: Record<EvidenceTier, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
}

/**
 * Groups hazard points into grid cells for map clustering. Cell size shrinks
 * as zoom increases, so clusters split apart automatically on zoom-in and
 * merge back on zoom-out. This is a lightweight lat/lng-grid approach (not
 * pixel-perfect like a dedicated clustering library) — good enough for the
 * marker counts this prototype handles.
 */
export function clusterCellKey(lat: number, lng: number, zoom: number): string {
  const cellDeg = 0.02 * Math.pow(2, 13 - zoom)
  return `${Math.round(lat / cellDeg)}_${Math.round(lng / cellDeg)}`
}

/** Below this zoom, clustering is meaningless (cell would be tiny) — always show individual markers. */
export const CLUSTER_MAX_ZOOM = 16

export const EVIDENCE_TIER_LABEL: Record<EvidenceTier, string> = {
  HIGH: "High evidence",
  MEDIUM: "Medium evidence",
  LOW: "Low evidence",
}

/** CSS variables defined in globals.css, used by both DOM and Leaflet icons. */
export const EVIDENCE_TIER_COLOR: Record<EvidenceTier, string> = {
  HIGH: "var(--evidence-high)",
  MEDIUM: "var(--evidence-medium)",
  LOW: "var(--evidence-low)",
}

export const HAZARD_LABEL: Record<HazardType, string> = {
  pothole: "Pothole",
  waterlogging: "Waterlogging",
  traffic_bottleneck: "Traffic Bottleneck",
}

export const STATUS_LABEL: Record<LifecycleStatus, string> = {
  DETECTED: "Detected",
  CORROBORATED: "Corroborated",
  VERIFIED: "Verified",
  ASSIGNED: "Assigned",
  FIXED: "Fixed",
}

export const COVERAGE_COLOR: Record<CoverageLevel, string> = {
  LOW: "var(--coverage-low)",
  MEDIUM: "var(--coverage-medium)",
  HIGH: "var(--coverage-high)",
}

export function formatScore(score: number): string {
  return score.toFixed(2)
}

/**
 * Raw hex values mirroring the CSS tokens in globals.css. Leaflet draws to
 * SVG/canvas and cannot resolve `var(--…)`, so map layers use these directly.
 * Keep in sync with :root in app/globals.css.
 */
export const EVIDENCE_HEX: Record<EvidenceTier, string> = {
  HIGH: "#e5484d",
  MEDIUM: "#e8842c",
  LOW: "#d0a215",
}

export const COVERAGE_HEX: Record<CoverageLevel, string> = {
  LOW: "#37455a",
  MEDIUM: "#2f8f96",
  HIGH: "#2dd4bf",
}

export const ROUTE_HEX = "#2dd4bf"
