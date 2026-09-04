import { NextResponse } from "next/server"

import { getCoverage } from "@/lib/server-store"

export async function GET() {
  return NextResponse.json(getCoverage())
}
