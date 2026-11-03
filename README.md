# 📡 RadarKost (Kost & Rental Fair-Value Radar)

> **Jakarta Commuter Hub Rental Intelligence & Fair-Value Valuation Engine.**  
> Strips aggregator markups, detects underpriced gems, and computes the True Cost of Living across Jakarta transit hubs.

---

## ✨ Features

- 🎯 **Hedonic Fair-Value Engine**: Calculates the baseline value for every room based on kecamatan medians, amenity deltas (AC, private bath, electricity token, WiFi, room area), and distance decay.
- 🚦 **Deal Rating Spectrum**:
  - 🟢 **Steal / Undervalued** ($>15\%$ below fair value)
  - 🟡 **Fair Market** ($\pm 10\%$)
  - 🔴 **Overpriced** ($>20\%$ above fair value)
- 🚆 **Transit-First Hub Discovery**: Filter by walking distance or commute stops from major hubs (KRL Stasiun Palmerah, Tanah Abang, Sudirman, MRT Dukuh Atas, Halte TJ Petamburan).
- 📍 **True Walking Route Engine (Google Maps)**: Calculates actual pedestrian walking distance, detour ratios, and walking durations via Google Routes API & Geocoding API to prevent misleading "as-the-crow-flies" transit claims.
- 💰 **True Cost of Living**: Advertised rent + estimated electricity token + laundry + parking = actual monthly outflow.
- 💬 **Direct-to-Owner WhatsApp**: 1-click WhatsApp inquiry bypassing middleman aggregator fees.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Runtime**: [Bun](https://bun.sh/)
- **Styling**: Modern CSS Design Tokens + Responsive Layout
- **Database**: Local SQLite via `@libsql/client`
- **Data Ingestion**: Integrated with `~/Projects/indoscraping`

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Ingest raw listings from indoscraping & calibrate hedonic model
bun run ingest
bun run calibrate

# 3. Start development server on port 3005
bun run dev
```

Visit [http://localhost:3005](http://localhost:3005).
