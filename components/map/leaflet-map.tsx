"use client"

import { useEffect } from "react"
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"

import {
  COVERAGE_HEX,
  EVIDENCE_HEX,
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
    map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.6 })
  }, [selectedId, features, map])
  return null
}

export default function LeafletMap({
  features,
  coverage,
  routes,
  selectedId,
  onSelect,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_DEFAULT_ZOOM}
      zoomControl={false}
      className="size-full bg-background"
      preferCanvas={false}
    >
      <TileLayer
        // Dark basemap to match the control-room theme.
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
       attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

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

      {/* Hazard markers */}
      {features.map((f) => {
        const p = f.properties
        const [lng, lat] = f.geometry.coordinates
        const tier = evidenceTier(p.evidence_score)
        const color = EVIDENCE_HEX[tier]
        const selected = p.event_id === selectedId
        const rejected = p.rejected
        return (
          <CircleMarker
            key={p.event_id}
            center={[lat, lng]}
            radius={selected ? 11 : 7}
            pathOptions={{
              color: rejected ? "#6b7280" : color,
              weight: selected ? 3 : 2,
              // Synthetic detections get a dashed ring so demo data is obvious.
              dashArray: p.synthetic ? "3 3" : undefined,
              fillColor: rejected ? "#6b7280" : color,
              fillOpacity: rejected ? 0.15 : selected ? 0.85 : 0.55,
            }}
            eventHandlers={{ click: () => onSelect(p.event_id) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <span className="text-xs font-medium">
                {HAZARD_LABEL[p.hazard_type]} · {p.evidence_score.toFixed(2)}
                {p.synthetic ? " · synthetic" : ""}
              </span>
            </Tooltip>
          </CircleMarker>
        )
      })}

      <FlyToSelected features={features} selectedId={selectedId} />
    </MapContainer>
  )
}
