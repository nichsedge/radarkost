import fs from "node:fs";
import path from "node:path";
import { calculateFairValue } from "../src/lib/valuation/hedonic";
import { findNearestTransitNode } from "../src/lib/transit/distance";
import type { KostListing, AmenityFlags } from "../src/lib/valuation/types";

const INDOSCRAPING_DIR = path.resolve(process.env.HOME || "/home/al", "Projects/indoscraping/data/property/sewakost");
const OUTPUT_DATA_DIR = path.resolve(process.cwd(), "data");
const OUTPUT_JSON_FILE = path.join(OUTPUT_DATA_DIR, "kosts.json");

// District centroid approximations for geospatial calibration
const DISTRICT_CENTROIDS: Record<string, { lat: number; lng: number; name: string }> = {
  palmerah: { lat: -6.2045, lng: 106.7932, name: "Palmerah" },
  kemanggisan: { lat: -6.1978, lng: 106.7874, name: "Kemanggisan" },
  "tanah-abang": { lat: -6.1895, lng: 106.8142, name: "Tanah Abang" },
  "bendungan-hilir": { lat: -6.2163, lng: 106.8188, name: "Bendungan Hilir" },
  "grogol-petamburan": { lat: -6.1685, lng: 106.7892, name: "Grogol Petamburan" },
  "kebon-jeruk": { lat: -6.1925, lng: 106.7689, name: "Kebon Jeruk" },
  karet: { lat: -6.2052, lng: 106.8189, name: "Karet Tengsin" },
};

function parseDistrict(areaCategory?: string, title?: string, tags?: string[]): { key: string; name: string; lat: number; lng: number } {
  const text = `${areaCategory || ""} ${title || ""} ${(tags || []).join(" ")}`.toLowerCase();

  for (const [key, centroid] of Object.entries(DISTRICT_CENTROIDS)) {
    if (text.includes(key.replace("-", " ")) || text.includes(key)) {
      // Add slight jitter so cards don't overlap exactly on map
      const jitterLat = (Math.random() - 0.5) * 0.008;
      const jitterLng = (Math.random() - 0.5) * 0.008;
      return {
        key,
        name: centroid.name,
        lat: centroid.lat + jitterLat,
        lng: centroid.lng + jitterLng,
      };
    }
  }

  // Fallback to Palmerah / Jakarta Barat
  return {
    key: "palmerah",
    name: "Palmerah",
    lat: -6.2045 + (Math.random() - 0.5) * 0.008,
    lng: 106.7932 + (Math.random() - 0.5) * 0.008,
  };
}

function parseAmenities(facilities: string[] = [], text = ""): AmenityFlags {
  const combined = `${facilities.join(" ")} ${text}`.toLowerCase();
  return {
    hasAC: combined.includes("ac") && !combined.includes("non ac") && !combined.includes("tanpa ac"),
    hasPrivateBath: combined.includes("kamar mandi dalam") || combined.includes("km dalam"),
    hasFreeElectricity: combined.includes("listrik gratis") || combined.includes("termasuk listrik") || combined.includes("bebas listrik"),
    hasWifi: combined.includes("wifi") || combined.includes("wi-fi") || combined.includes("internet"),
    hasWaterHeater: combined.includes("water heater") || combined.includes("air panas"),
    hasCarParking: combined.includes("parkir mobil"),
    hasMotorParking: combined.includes("parkir motor") || combined.includes("parkir"),
    roomSizeM2: combined.includes("4x4") ? 16 : combined.includes("3x4") ? 12 : combined.includes("3x3") ? 9 : 9,
  };
}

async function main() {
  console.log("📡 Ingesting SewaKost datasets from indoscraping...");

  if (!fs.existsSync(OUTPUT_DATA_DIR)) {
    fs.mkdirSync(OUTPUT_DATA_DIR, { recursive: true });
  }

  const rawFiles: string[] = [];
  const latestPath = path.join(INDOSCRAPING_DIR, "latest.json");
  const historyPath = path.join(INDOSCRAPING_DIR, "history");

  if (fs.existsSync(latestPath)) rawFiles.push(latestPath);
  if (fs.existsSync(historyPath)) {
    const histFiles = fs.readdirSync(historyPath).filter((f) => f.endsWith(".json"));
    for (const hf of histFiles) {
      rawFiles.push(path.join(historyPath, hf));
    }
  }

  console.log(`Found ${rawFiles.length} raw files to process.`);

  const seenUrls = new Set<string>();
  const normalizedListings: KostListing[] = [];

  for (const filePath of rawFiles) {
    try {
      const rawContent = fs.readFileSync(filePath, "utf-8");
      const items = JSON.parse(rawContent);
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        const url = item.url || "";
        if (!url || seenUrls.has(url)) continue;
        seenUrls.add(url);

        const price = item.min_price || item.priceNumeric || (item.max_price ? item.max_price : null);
        if (!price || price < 400_000 || price > 15_000_000) continue;

        const facilities: string[] = item.facilities || [];
        const tags: string[] = item.tags || [];
        const title: string = item.title || "Kost Jakarta";
        const district = parseDistrict(item._area_category || item.area, title, tags);

        const amenities = parseAmenities(facilities, `${title} ${tags.join(" ")}`);
        const nearest = findNearestTransitNode(district.lat, district.lng);

        const valuation = calculateFairValue(
          district.key,
          price,
          amenities,
          nearest.distanceMeters
        );

        const phone = (item.phone_numbers && item.phone_numbers[0]) || "";
        // Clean phone for direct WhatsApp link
        let cleanPhone = phone.replace(/[^\d+]/g, "");
        if (cleanPhone.startsWith("08")) {
          cleanPhone = "628" + cleanPhone.slice(2);
        } else if (cleanPhone.startsWith("+62")) {
          cleanPhone = cleanPhone.slice(1);
        }

        const listing: KostListing = {
          id: Buffer.from(url).toString("base64url").slice(0, 16),
          title: title.trim(),
          districtKey: district.key,
          districtName: district.name,
          type: item.type || (title.toLowerCase().includes("putri") ? "Kost Putri" : title.toLowerCase().includes("putra") ? "Kost Putra" : "Kost Campur"),
          priceMonthly: price,
          amenities,
          lat: district.lat,
          lng: district.lng,
          address: district.name,
          ownerPhone: cleanPhone,
          sourceUrl: url,
          scrapedAt: item.scraped_at || new Date().toISOString(),
          tags: tags.length ? tags : facilities,
          nearestTransit: {
            nodeId: nearest.node.id,
            nodeName: nearest.node.name,
            distanceMeters: nearest.distanceMeters,
            walkMinutes: nearest.walkMinutes,
          },
          valuation,
        };

        normalizedListings.push(listing);
      }
    } catch (err) {
      console.warn(`Error reading ${filePath}:`, err);
    }
  }

  console.log(`✅ Normalized ${normalizedListings.length} unique kost listings.`);
  fs.writeFileSync(OUTPUT_JSON_FILE, JSON.stringify(normalizedListings, null, 2));
  console.log(`Saved output to ${OUTPUT_JSON_FILE}`);

  // Summary breakdown
  const steals = normalizedListings.filter((l) => l.valuation?.dealTier === "steal");
  const fairs = normalizedListings.filter((l) => l.valuation?.dealTier === "fair");
  const overpriced = normalizedListings.filter((l) => l.valuation?.dealTier === "overpriced");

  console.log("\n📊 Calibration Deal Distribution:");
  console.log(`  🟢 Steals / Undervalued: ${steals.length} (${Math.round((steals.length / normalizedListings.length) * 100)}%)`);
  console.log(`  🟡 Fair Market:         ${fairs.length} (${Math.round((fairs.length / normalizedListings.length) * 100)}%)`);
  console.log(`  🔴 Overpriced:          ${overpriced.length} (${Math.round((overpriced.length / normalizedListings.length) * 100)}%)`);
}

main().catch(console.error);
