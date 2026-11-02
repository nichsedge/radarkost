# RadarKost — Agent Guidelines & Architecture Contract

## ⚡ Project Overview
**RadarKost** is an analytical rental intelligence platform and Fair-Value Radar for Jakarta commuter hubs. It evaluates Indonesian kost listings against a hedonic pricing model, strips aggregator markups, maps commute friction (KRL/MRT/TransJakarta), and calculates True Cost of Living (rent + electricity + parking).

- **Port**: `3005` (dev server `bun run dev`)
- **Runtime**: `bun` v1.3+
- **Frontend Stack**: Next.js 16 (App Router), React 19, TypeScript, Lucide Icons, Pure CSS Tokens
- **Database**: Local SQLite / libSQL (`data/radarkost.sqlite`)
- **Upstream Data Source**: `~/Projects/indoscraping` (`data/property/sewakost/latest.json`, `rumah123/latest.json`)

---

## 🏛️ Architecture & Directory Topology

```
radarkost/
├── data/
│   ├── radarkost.sqlite        # SQLite operational database
│   └── raw/                    # Cached snapshots from indoscraping
├── scripts/
│   ├── ingest_indoscraping.ts  # ETL pipeline from indoscraping JSON to SQLite
│   └── calibrate_hedonic.ts    # Hedonic regression & baseline median generator
└── src/
    ├── app/                    # Next.js 16 App Router
    │   ├── api/kosts/          # Filtered query endpoints
    │   ├── api/estimate/       # Instant valuation calculator API
    │   └── kost/[id]/          # Property detail & True Cost breakdown
    ├── components/
    │   ├── radar/              # Map, DealScore, ScatterPlot, TransitFilter
    │   ├── calculator/         # TrueCostModal
    │   └── layout/             # Header, Footer
    ├── lib/
    │   ├── valuation/          # Hedonic valuation formula & scoring rules
    │   ├── transit/            # KRL/MRT/TJ hubs registry & distance calculators
    │   └── db/                 # Database schema & client
    └── data/
        ├── transit_nodes.json  # Curated commuter hubs with GPS coordinates
        └── districts_baseline.json # Base median prices per kecamatan
```

---

## 📐 Valuation Engine Contract
- **Fair Value (FV)** is calculated deterministically via hedonic regression:
  $$\text{Fair Value} = \text{Base}_{\text{Kecamatan}} + \sum \Delta_{\text{Amenities}} - \text{Penalty}_{\text{Transit}}$$
- **Deal Score Tiers**:
  - $\text{Ratio} = \frac{\text{Listed Price}}{\text{Fair Value}}$
  - $\le 0.85$: **Steal / Undervalued** (🟢 green)
  - $0.86 – 1.15$: **Fair Market** (🟡 amber)
  - $\ge 1.16$: **Overpriced** (🔴 red)

---

## ⚡ Modern Standards & Rules
1. **Strict Modern Syntax**: Use modern TypeScript, ES modules, and `bun run <cmd>`.
2. **Direct Execution**: Run scripts via `bun run scripts/<name>.ts`.
3. **No Siloed Data**: Follow workstation SSOT guidelines; consume raw feeds from `indoscraping`.
