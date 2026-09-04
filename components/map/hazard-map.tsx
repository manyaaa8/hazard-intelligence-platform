"use client"

import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"
import type { LeafletMapProps } from "@/components/map/leaflet-map"

// Leaflet touches `window`, so the map must never render on the server.
const LeafletMap = dynamic(() => import("@/components/map/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-3 p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-64 w-full" />
        <p className="text-center text-xs text-muted-foreground">
          Loading hazard map…
        </p>
      </div>
    </div>
  ),
})

export function HazardMap(props: LeafletMapProps) {
  return <LeafletMap {...props} />
}
