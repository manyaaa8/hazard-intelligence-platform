# SentinelRoad — Fleet Hazard Intelligence

Operations console for evidence-scored road hazards detected across a public
bus fleet in Bengaluru. Verify detections, inspect corroborating passes, and
review network coverage.

## Status: demo mode

Every event in this build is `synthetic: true` — seeded demo data, not a live
feed. The app always shows a **DEMO MODE · SYNTHETIC DATA** banner, and every
synthetic detection carries a dashed marker ring + a "Synthetic" badge. Point
`NEXT_PUBLIC_API_BASE` (see `.env.example`) at a live backend to switch off
the bundled demo routes in `app/api/*`.

## Getting started

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and fill in the values you need — the app
runs fully on demo data with no env vars set.

## Architecture

- **Data contract**: `lib/types.ts` is the locked backend contract (Section 7).
  Field names, `LIFECYCLE_ORDER`, and the `Evidence Score` (never a
  probability/percentage) must not be renamed or reshaped.
- **API abstraction**: `lib/api.ts` is the single place that calls `fetch`.
  Components and hooks always go through `api.*`, never `fetch`/`axios`
  directly — this is what lets `NEXT_PUBLIC_API_BASE` swap the whole backend
  without touching UI code.
- **Map**: `components/map/leaflet-map.tsx` renders on the client only
  (Leaflet touches `window`). Markers are sized and labeled by evidence tier
  (H/M/L), not color alone, and cluster into count badges at low zoom.
- **Mobile layout**: below the `md` breakpoint, the right-hand detections
  panel becomes a bottom sheet (`components/panel/mobile-event-sheet.tsx`)
  instead of a fixed sidebar, and the layer/legend overlays collapse behind a
  single toggle button so they don't cover the map on narrow screens.

## Known limitations (prototype scope)

- **Auth & rate limiting are out of scope.** No authenticated requests,
  admin-only verify/reject, RLS policies, or per-IP/per-bus rate limits.
  Required before any production use.
- **Map marker keyboard access is partial.** Leaflet markers accept focus via
  the `keyboard` prop but are not independently screen-reader labeled beyond
  an `alt` string; the event list is the fully keyboard-navigable path to the
  same data.
- **Clustering is a lightweight lat/lng-grid grouping**, not a pixel-accurate
  clustering library — fine at this data volume, but would need a proper
  clustering library (e.g. `react-leaflet-cluster`) at real fleet scale.

## Contract risks — flag to the backend team

These were adapted on the frontend rather than agreed with the backend, per
the note in Section 37 to flag mismatches instead of silently absorbing them:

1. **`/api/coverage`** — the spec returns `{segment_id, coverage_level,
   observation_count}`. The frontend also requires `segment_name` and
   `path: [lat,lng][]` to render the coverage layer at all — without `path`
   this layer cannot draw anything.
2. **`/api/heatmap`** — the spec only says "route-frequency / coverage geo
   data". The frontend invented `{route_id, route_name, frequency,
   observation_count, population_proxy, path}` — this needs sign-off, not
   silent adoption.
3. **`/api/events/{id}` and verify/reject responses** — the frontend assumes
   a `{ properties: {...} }` envelope (`lib/api.ts`). If the real backend
   returns bare properties, the detail view and both actions break.
   `verified_by` is also validated but never stored anywhere — there's no
   audit trail of who verified or rejected a detection.
4. **`USE_MOCK_DATA` flag (Section 21) doesn't exist.** The
   `NEXT_PUBLIC_API_BASE` approach is arguably cleaner, but the mock routes
   stay mounted at `/api/*` with no explicit demo/live switch — worth an
   explicit decision rather than leaving it implicit.
