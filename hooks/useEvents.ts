"use client"

import useSWR from "swr"

import { api } from "@/lib/api"
import type {
  HazardEventDetailProperties,
  HazardEventProperties,
  HazardFeature,
} from "@/lib/types"

export type EventListItem = HazardEventProperties

export function useEvents() {
  const { data, error, isLoading, mutate } = useSWR(
    "events",
    () => api.getEvents(),
    { revalidateOnFocus: false },
  )

  const events: HazardEventProperties[] = (data?.features ?? []).map(
    (f: HazardFeature) => f.properties,
  )

  return {
    events,
    features: data?.features ?? [],
    isLoading,
    error: error as Error | undefined,
    refetch: mutate,
  }
}

export function useEvent(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["event", id] : null,
    () => api.getEvent(id as string),
    { revalidateOnFocus: false },
  )

  return {
    event: data as HazardEventDetailProperties | undefined,
    isLoading,
    error: error as Error | undefined,
    refetch: mutate,
  }
}
