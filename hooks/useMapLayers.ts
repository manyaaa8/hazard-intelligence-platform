"use client"

import { useCallback, useState } from "react"

import type { HazardType } from "@/lib/types"

export type LayerState = {
  hazards: boolean
  coverage: boolean
  routes: boolean
}

export type EvidenceFilter = "ALL" | "HIGH" | "MEDIUM" | "LOW"

const ALL_HAZARDS: HazardType[] = [
  "pothole",
  "waterlogging",
  "traffic_bottleneck",
]

export function useMapLayers() {
  const [layers, setLayers] = useState<LayerState>({
    hazards: true,
    coverage: false,
    routes: false,
  })
  const [hazardTypes, setHazardTypes] = useState<HazardType[]>(ALL_HAZARDS)
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceFilter>("ALL")
  const [showSyntheticOnly, setShowSyntheticOnly] = useState(false)

  const toggleLayer = useCallback((key: keyof LayerState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const toggleHazardType = useCallback((type: HazardType) => {
    setHazardTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type],
    )
  }, [])

  return {
    layers,
    toggleLayer,
    hazardTypes,
    toggleHazardType,
    evidenceFilter,
    setEvidenceFilter,
    showSyntheticOnly,
    setShowSyntheticOnly,
  }
}
