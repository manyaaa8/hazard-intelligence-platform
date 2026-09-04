import { NextResponse } from "next/server"

import { getRoutes } from "@/lib/server-store"

// Route-frequency / coverage geo data.
export async function GET() {
  return NextResponse.json(getRoutes())
}
