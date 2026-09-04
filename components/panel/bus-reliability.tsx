"use client"

import useSWR from "swr"
import { TrendingDown, TrendingUp, Minus } from "lucide-react"

import { api } from "@/lib/api"
import { formatScore } from "@/lib/map"
import { cn } from "@/lib/utils"

function Sparkline({ history }: { history: number[] }) {
  const w = 72
  const h = 20
  if (history.length < 2) return null
  const min = Math.min(...history)
  const max = Math.max(...history)
  const span = max - min || 1
  const step = w / (history.length - 1)
  const pts = history
    .map((v, i) => {
      const x = i * step
      const y = h - ((v - min) / span) * (h - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
  const declining = history[history.length - 1] < history[0]
  const stroke = declining ? "var(--evidence-high)" : "var(--primary)"
  return (
    <svg width={w} height={h} className="overflow-visible" aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function BusReliability({ busId }: { busId: string }) {
  const { data, isLoading } = useSWR(
    ["bus", busId],
    () => api.getBusReliability(busId),
    { revalidateOnFocus: false },
  )

  const trend =
    data && data.history.length >= 2
      ? data.history[data.history.length - 1] - data.history[0]
      : 0
  const TrendIcon = trend < -0.02 ? TrendingDown : trend > 0.02 ? TrendingUp : Minus
  const trendColor =
    trend < -0.02
      ? "text-[var(--evidence-high)]"
      : trend > 0.02
        ? "text-primary"
        : "text-muted-foreground"

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/50 px-2.5 py-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-medium text-foreground">
          {busId}
        </span>
        {data && (
          <span className={cn("flex items-center gap-0.5 text-[11px]", trendColor)}>
            <TrendIcon className="size-3" aria-hidden />
          </span>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        {isLoading ? (
          <span className="text-xs text-muted-foreground">…</span>
        ) : data ? (
          <>
            <Sparkline history={data.history} />
            <span className="font-mono text-xs tabular-nums text-foreground">
              {formatScore(data.reliability_score)}
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">n/a</span>
        )}
      </div>
    </div>
  )
}
