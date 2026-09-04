import { NextResponse } from "next/server"

import { verifyEvent } from "@/lib/server-store"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = (await req.json().catch(() => ({}))) as { verified_by?: string }
  if (!body.verified_by) {
    return NextResponse.json(
      { error: "verified_by is required" },
      { status: 400 },
    )
  }
  const updated = verifyEvent(id)
  if (!updated) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }
  return NextResponse.json({ properties: updated })
}
