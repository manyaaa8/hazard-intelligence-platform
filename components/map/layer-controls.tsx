
"use client"

import { Layers3 } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { HAZARD_ICON } from "@/components/shared/hazard-badge"
import { HAZARD_LABEL } from "@/lib/map"
import type { HazardType } from "@/lib/types"
import type {
  EvidenceFilter,
  LayerState,
} from "@/hooks/useMapLayers"

const HAZARD_TYPES: HazardType[] = [
  "pothole",
  "waterlogging",
  "traffic_bottleneck",
]

const EVIDENCE_FILTERS: EvidenceFilter[] = ["ALL", "HIGH", "MEDIUM", "LOW"]

type Props = {
  layers: LayerState
  toggleLayer: (key: keyof LayerState) => void
  hazardTypes: HazardType[]
  toggleHazardType: (type: HazardType) => void
  evidenceFilter: EvidenceFilter
  setEvidenceFilter: (f: EvidenceFilter) => void
  showSyntheticOnly: boolean
  setShowSyntheticOnly: (v: boolean) => void
}

function Row({
  label,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string
  checked: boolean
  onChange: () => void
  icon?: React.ElementType
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
      {Icon && <Icon className="size-3.5 text-muted-foreground" aria-hidden />}
      <span className="text-foreground">{label}</span>
      <Switch
        className="ml-auto"
        checked={checked}
        onCheckedChange={onChange}
        aria-label={label}
      />
    </label>
  )
}

export function LayerControls({
  layers,
  toggleLayer,
  hazardTypes,
  toggleHazardType,
  evidenceFilter,
  setEvidenceFilter,
  showSyntheticOnly,
  setShowSyntheticOnly,
}: Props) {
  return (
    <div className="pointer-events-auto w-60 rounded-lg border border-border bg-card/90 p-3 shadow-lg backdrop-blur">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Layers3 className="size-3.5" aria-hidden />
        Layers
      </div>

      <Row
        label="Hazard detections"
        checked={layers.hazards}
        onChange={() => toggleLayer("hazards")}
      />
      <Row
        label="Coverage segments"
        checked={layers.coverage}
        onChange={() => toggleLayer("coverage")}
      />
      <Row
        label="Route frequency"
        checked={layers.routes}
        onChange={() => toggleLayer("routes")}
      />

      <Separator className="my-2" />

      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Hazard types
      </p>
      {HAZARD_TYPES.map((t) => (
        <Row
          key={t}
          label={HAZARD_LABEL[t]}
          icon={HAZARD_ICON[t]}
          checked={hazardTypes.includes(t)}
          onChange={() => toggleHazardType(t)}
        />
      ))}

      <Separator className="my-2" />

      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Min. evidence (and above)
      </p>
      <div className="grid grid-cols-4 gap-1">
        {EVIDENCE_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setEvidenceFilter(f)}
            className={
              "rounded-md border px-1.5 py-1 text-[11px] font-medium transition-colors " +
              (evidenceFilter === f
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground")
            }
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <Separator className="my-2" />

      <Row
        label="Synthetic only"
        checked={showSyntheticOnly}
        onChange={() => setShowSyntheticOnly(!showSyntheticOnly)}
      />
    </div>
  )
}
