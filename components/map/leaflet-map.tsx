"use client"

import { useEffect, useMemo, useState } from "react"
import L from "leaflet"
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"

import {
  CLUSTER_MAX_ZOOM,
  clusterCellKey,
  COVERAGE_HEX,
  EVIDENCE_HEX,
  EVIDENCE_TIER_RANK,
  evidenceTier,
  HAZARD_LABEL,
  MAP_CENTER,
  MAP_DEFAULT_ZOOM,
  ROUTE_HEX,
} from "@/lib/map"
import type {
  CoverageSegment,
  HazardFeature,
  RouteFrequencySegment,
} from "@/lib/types"

export type LeafletMapProps = {
  features: HazardFeature[]
  coverage: CoverageSegment[]
  routes: RouteFrequencySegment[]
  selectedId: string | null
  onSelect: (id: string) => void
}

// Configurable so a different tile provider can be swapped in without a code
// change (see .env.example). Defaults to CARTO's dark basemap, which matches
// the control-room theme — plain OSM tiles are bright and clash with it.
const TILE_URL =
  process.env.NEXT_PUBLIC_TILE_URL ??
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_TILE_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

// Size + letter label give evidence tier a non-color encoding, so it reads
// even to a viewer who can't distinguish the hue (and works over screenshots).
const TIER_SIZE: Record<ReturnType<typeof evidenceTier>, number> = {
  HIGH: 26,
  MEDIUM: 20,
  LOW: 15,
}
const TIER_LETTER: Record<ReturnType<typeof evidenceTier>, string> = {
  HIGH: "H",
  MEDIUM: "M",
  LOW: "L",
}

function hazardDivIcon(opts: {
  tier: ReturnType<typeof evidenceTier>
  rejected?: boolean
  selected?: boolean
  synthetic?: boolean
}) {
  const base = TIER_SIZE[opts.tier]
  const size = opts.selected ? base + 8 : base
  const color = opts.rejected ? "#6b7280" : EVIDENCE_HEX[opts.tier]
  const border = opts.synthetic ? "dashed" : "solid"
  const fontSize = Math.max(9, Math.round(size * 0.42))
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:9999px;
      background:${color}${opts.rejected ? "26" : "cc"};
      border:2px ${border} ${color};
      display:flex;align-items:center;justify-content:center;
      color:#0b0f14;font:${fontSize}px ui-sans-serif,system-ui,sans-serif;font-weight:700;
      box-shadow:${opts.selected ? "0 0 0 3px rgba(45,212,191,0.5)" : "none"};
    ">${TIER_LETTER[opts.tier]}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function clusterDivIcon(count: number, dominantColor: string) {
  const size = Math.min(46, 24 + count * 2)
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:9999px;
      background:${dominantColor}dd;border:2px solid #0b0f14;
      display:flex;align-items:center;justify-content:center;
      color:#0b0f14;font:700 ${Math.max(11, size * 0.36)}px ui-sans-serif,system-ui,sans-serif;
      box-shadow:0 0 0 4px ${dominantColor}33;
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FlyToSelected({
  features,
  selectedId,
}: {
  features: HazardFeature[]
  selectedId: string | null
}) {
  const map = useMap()
  useEffect(() => {
    if (!selectedId) return
    const f = features.find((x) => x.properties.event_id === selectedId)
    if (!f) return
    const [lng, lat] = f.geometry.coordinates
    map.flyTo([lat, lng], Math.max(map.getZoom(), CLUSTER_MAX_ZOOM), {
      duration: 0.6,
    })
  }, [selectedId, features, map])
  return null
}

function ZoomTracker({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoom(map.getZoom()),
  })
  useEffect(() => {
    onZoom(map.getZoom())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

export default function LeafletMap({
  features,
  coverage,
  routes,
  selectedId,
  onSelect,
}: LeafletMapProps) {
  const [zoom, setZoom] = useState(MAP_DEFAULT_ZOOM)
  const [mapRef, setMapRef] = useState<L.Map | null>(null)

  // Group nearby hazards into clusters at low zoom; split them apart as the
  // viewer zooms in. Selecting a feature always flies in past CLUSTER_MAX_ZOOM
  // first, so a clustered point is still reachable.
  const clusters = useMemo(() => {
    if (zoom >= CLUSTER_MAX_ZOOM) {
      return features.map((f) => ({ key: f.properties.event_id, features: [f] }))
    }
    const groups = new Map<string, HazardFeature[]>()
    for (const f of features) {
      const [lng, lat] = f.geometry.coordinates
      const key = clusterCellKey(lat, lng, zoom)
      const g = groups.get(key)
      if (g) g.push(f)
      else groups.set(key, [f])
    }
    return Array.from(groups.entries()).map(([key, fs]) => ({ key, features: fs }))
  }, [features, zoom])

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_DEFAULT_ZOOM}
      zoomControl={false}
      className="size-full bg-background"
      preferCanvas={false}
      ref={setMapRef}
    >
      <ZoomControl position="topright" />
      <ZoomTracker onZoom={setZoom} />

      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

      {/* Route-frequency lines (rendered under hazards) */}
      {routes.map((r) => (
        <Polyline
          key={r.route_id}
          positions={r.path}
          pathOptions={{
            color: ROUTE_HEX,
            weight: 2 + r.frequency * 8,
            opacity: 0.25 + r.frequency * 0.5,
            dashArray: "1 6",
            lineCap: "round",
          }}
        >
          <Tooltip sticky>
            <span className="text-xs">
              {r.route_name} · {(r.frequency * 100).toFixed(0)}% traversal
            </span>
          </Tooltip>
        </Polyline>
      ))}

      {/* Coverage segments */}
      {coverage.map((c) => (
        <Polyline
          key={c.segment_id}
          positions={c.path}
          pathOptions={{
            color: COVERAGE_HEX[c.coverage_level],
            weight: 6,
            opacity: 0.7,
            lineCap: "round",
          }}
        >
          <Tooltip sticky>
            <span className="text-xs">
              {c.segment_name} · {c.coverage_level} coverage ·{" "}
              {c.observation_count} obs
            </span>
          </Tooltip>
        </Polyline>
      ))}

      {/* Hazard markers, clustered at low zoom */}
      {clusters.map((group) => {
        if (group.features.length === 1) {
          const f = group.features[0]
          const p = f.properties
          const [lng, lat] = f.geometry.coordinates
          const tier = evidenceTier(p.evidence_score)
          const selected = p.event_id === selectedId
          return (
            <Marker
              key={p.event_id}
              position={[lat, lng]}
              icon={hazardDivIcon({
                tier,
                rejected: p.rejected,
                selected,
                synthetic: p.synthetic,
              })}
              eventHandlers={{ click: () => onSelect(p.event_id) }}
              keyboard
              alt={`${HAZARD_LABEL[p.hazard_type]}, evidence score ${p.evidence_score.toFixed(2)}${p.synthetic ? ", synthetic" : ""}`}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                <span className="text-xs font-medium">
                  {HAZARD_LABEL[p.hazard_type]} · {p.evidence_score.toFixed(2)}
                  {p.synthetic ? " · synthetic" : ""}
                </span>
              </Tooltip>
            </Marker>
          )
        }

        // Cluster marker: center on the group's average position, colored by
        // its highest evidence tier, clicking zooms in to split it apart.
        const avgLat =
          group.features.reduce((s, f) => s + f.geometry.coordinates[1], 0) /
          group.features.length
        const avgLng =
          group.features.reduce((s, f) => s + f.geometry.coordinates[0], 0) /
          group.features.length
        const topTier = group.features
          .map((f) => evidenceTier(f.properties.evidence_score))
          .reduce((best, t) =>
            EVIDENCE_TIER_RANK[t] > EVIDENCE_TIER_RANK[best] ? t : best,
          )
        return (
          <Marker
            key={group.key}
            position={[avgLat, avgLng]}
            icon={clusterDivIcon(group.features.length, EVIDENCE_HEX[topTier])}
            eventHandlers={{
              click: () => {
                if (!mapRef) return
                mapRef.flyTo([avgLat, avgLng], Math.min(zoom + 3, CLUSTER_MAX_ZOOM), {
                  duration: 0.5,
                })
              },
            }}
            alt={`${group.features.length} hazards in this area — click to zoom in`}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <span className="text-xs font-medium">
                {group.features.length} detections · click to zoom in
              </span>
            </Tooltip>
          </Marker>
        )
      })}

      <FlyToSelected features={features} selectedId={selectedId} />
    </MapContainer>
  )
}
