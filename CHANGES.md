# Fixes applied (from the code review)

## Blockers

1. **Responsive layout.** `app/page.tsx`: the fixed `w-[360px]` sidebar is now
   `hidden md:flex` (desktop only). Below `md`, a new
   `components/panel/mobile-event-sheet.tsx` renders the same `EventPanel` as
   a bottom sheet — collapsed to a one-line peek by default, expanding to
   ~80% viewport height on tap or automatically when a map marker is
   selected. The map keeps full width on mobile since the sheet is a fixed
   overlay, not a flex sibling.

2. **"Live demo feed" mislabeling.** Replaced the small "Live demo feed" pill
   with a persistent, always-visible banner directly under the header:
   **⚠ DEMO MODE · SYNTHETIC DATA — no live detections shown.** It no longer
   hides on small screens.

3. **Map controls & evidence encoding.** `components/map/leaflet-map.tsx`:
   - Added `<ZoomControl position="topright" />` (zoom buttons were missing
     entirely).
   - Switched the basemap to CARTO's dark tiles (configurable via
     `NEXT_PUBLIC_TILE_URL` / `NEXT_PUBLIC_TILE_ATTRIBUTION`, see
     `.env.example`) — the old comment claimed a dark basemap but served
     plain light OSM tiles.
   - Replaced identical `CircleMarker`s with sized, labeled `Marker`s
     (H/M/L letter + size scales with tier) so evidence reads without
     relying on color — this also puts the score on the marker itself
     instead of only in a hover-only tooltip.
   - Added lightweight lat/lng-grid clustering (`lib/map.ts:
     clusterCellKey`) — markers merge into a count badge at low zoom and
     split apart on zoom-in; no new dependency needed since I couldn't
     install one in this sandbox (see note below).

## Should-fix

- **Legend**: added Coverage (Low/Medium/High) and Route-frequency
  (Low ──── High gradient) keys to `map-legend.tsx`.
- **"Min. evidence" filter**: changed from exact-tier equality to
  at-or-above using a new `EVIDENCE_TIER_RANK` table in `lib/map.ts`, so
  picking "High" no longer hides Medium/Low as if they didn't exist below it.
- **Linked hazards**: `EventDetail` now shows an icon + hazard label
  (fetched via the existing `getEvent` call) instead of a bare event ID, and
  shows an explicit empty state when there are no linked hazards instead of
  hiding the section.
- **Timestamps**: added `first_seen` / `last_seen` to the event detail view
  (the collection endpoint's type, `HazardEventProperties`, genuinely
  doesn't include them per the locked contract — only the detail type does —
  so they're shown where the data actually exists).
- **`next.config.mjs`**: removed `ignoreBuildErrors: true`.
- **Dead code**: deleted the unused `components/ui/badge.tsx`, `card.tsx`,
  `tabs.tsx`, `tooltip.tsx` (nothing imported them).
- **Map error state**: added a centered "Could not load hazard data" overlay
  with a Retry button on the map itself when `/api/events` fails (previously
  only the list showed an error; the map stayed silently blank).
- **Reject button**: now `variant="destructive"` from the start (was
  `secondary`), and the confirm-step copy explicitly warns that rejecting
  discounts every reporting bus's reliability score.
- **README.md** and **.env.example**: added, including the "Contract risks"
  section flagging the 3 frontend/backend mismatches called out in the
  review (`/api/coverage` fields, invented `/api/heatmap` shape, the
  `{ properties }` envelope assumption, and unstored `verified_by`).

## Not fixed — flagging honestly

- **Marker keyboard/ARIA access** is still only partial. Leaflet's `Marker`
  accepts a `keyboard` prop and an `alt` string (added), but there's no full
  screen-reader-quality labeling of the SVG/canvas map itself — the event
  list remains the fully accessible path to the same data, same as before.
- **Clustering** is a simple lat/lng-grid grouping, not a pixel-accurate
  clustering library. I couldn't add a new npm dependency in this sandbox
  (no network access to install `react-leaflet-cluster` or similar) — the
  current approach works correctly for this data volume but should be
  swapped for a real library before scaling up.
- I could not run `pnpm install` / `pnpm build` in this environment (no
  network access), so these changes are reviewed for correctness by hand
  and via brace/paren balance checks, not a live build. Please run
  `pnpm install && pnpm build` before you rely on this.
