import { NextResponse } from "next/server"

import { getBusReliability } from "@/lib/server-store"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bus_id: string }> },
) {
  const { bus_id } = await params
  const reliability = getBusReliability(bus_id)
  if (!reliability) {
    return NextResponse.json({ error: "Bus not found" }, { status: 404 })
  }
  return NextResponse.json(reliability)
}
