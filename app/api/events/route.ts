import { NextResponse } from "next/server"

import { getEventsCollection } from "@/lib/server-store"

export async function GET() {
  return NextResponse.json(getEventsCollection())
}
