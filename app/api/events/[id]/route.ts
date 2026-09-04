import { NextResponse } from "next/server"

import { getEventDetail } from "@/lib/server-store"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const event = getEventDetail(id)
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }
  return NextResponse.json({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [event.longitude, event.latitude],
    },
    properties: event,
  })
}
