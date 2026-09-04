import type {
  BusReliability,
  CoverageSegment,
  HazardEventDetailProperties,
  HazardFeatureCollection,
  RouteFrequencySegment,
} from "@/lib/types"

/**
 * Single API abstraction. UI components and hooks call these functions only —
 * never fetch/axios directly. Point NEXT_PUBLIC_API_BASE at the live backend
 * (Section 7 contract) to switch off the bundled demo routes.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ""

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    })
  } catch {
    throw new ApiError("Network request failed", 0)
  }
  if (!res.ok) {
    const detail = await res.json().catch(() => null)
    throw new ApiError(detail?.error ?? `Request failed (${res.status})`, res.status)
  }
  return (await res.json()) as T
}

export const api = {
  getEvents: () => request<HazardFeatureCollection>("/api/events"),

  getEvent: (id: string) =>
    request<{ properties: HazardEventDetailProperties }>(
      `/api/events/${encodeURIComponent(id)}`,
    ).then((r) => r.properties),

  verifyEvent: (eventId: string, verifiedBy: string) =>
    request<{ properties: HazardEventDetailProperties }>(
      `/api/events/${encodeURIComponent(eventId)}/verify`,
      { method: "POST", body: JSON.stringify({ verified_by: verifiedBy }) },
    ).then((r) => r.properties),

  rejectEvent: (eventId: string, verifiedBy: string) =>
    request<{ properties: HazardEventDetailProperties }>(
      `/api/events/${encodeURIComponent(eventId)}/reject`,
      { method: "POST", body: JSON.stringify({ verified_by: verifiedBy }) },
    ).then((r) => r.properties),

  getCoverage: () => request<CoverageSegment[]>("/api/coverage"),

  getHeatmap: () => request<RouteFrequencySegment[]>("/api/heatmap"),

  getBusReliability: (busId: string) =>
    request<BusReliability>(
      `/api/buses/${encodeURIComponent(busId)}/reliability`,
    ),
}

export { ApiError }
