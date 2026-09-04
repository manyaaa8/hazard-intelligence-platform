"use client"

import { useCallback, useState } from "react"

import { api } from "@/lib/api"
import type { HazardEventDetailProperties } from "@/lib/types"

type Action = "verify" | "reject"

/**
 * Operational verify/reject actions. Tracks in-flight state to prevent
 * duplicate submissions and surfaces failures to the caller.
 */
export function useVerification(verifiedBy: string) {
  const [pending, setPending] = useState<Action | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async (
      action: Action,
      eventId: string,
    ): Promise<HazardEventDetailProperties | null> => {
      if (pending) return null // guard against duplicate submissions
      setPending(action)
      setError(null)
      try {
        const fn = action === "verify" ? api.verifyEvent : api.rejectEvent
        return await fn(eventId, verifiedBy)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Action failed")
        throw e
      } finally {
        setPending(null)
      }
    },
    [pending, verifiedBy],
  )

  return {
    verify: (eventId: string) => run("verify", eventId),
    reject: (eventId: string) => run("reject", eventId),
    isVerifying: pending === "verify",
    isRejecting: pending === "reject",
    pending,
    error,
  }
}
