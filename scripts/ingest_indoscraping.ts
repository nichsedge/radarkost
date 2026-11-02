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
  grogol: { lat: -6.1685, lng: 106.7892, name: "Grogol" },
  "kebon-jeruk": { lat: -6.1925, lng: 106.7689, name: "Kebon Jeruk" },
  karet: { lat: -6.2052, lng: 106.8189, name: "Karet Tengsin" },
  setiabudi: { lat: -6.2150, lng: 106.8290, name: "Setiabudi" },
  tebet: { lat: -6.2285, lng: 106.8550, name: "Tebet" },
  "kebayoran-baru": { lat: -6.2420, lng: 106.8010, name: "Kebayoran Baru" },
  "kebayoran-lama": { lat: -6.2380, lng: 106.7810, name: "Kebayoran Lama" },
  cilandak: { lat: -6.2890, lng: 106.7980, name: "Cilandak" },
  "mampang-prapatan": { lat: -6.2480, lng: 106.8270, name: "Mampang Prapatan" },
  mampang: { lat: -6.2480, lng: 106.8270, name: "Mampang" },
  "cempaka-putih": { lat: -6.1820, lng: 106.8680, name: "Cempaka Putih" },
  matraman: { lat: -6.2050, lng: 106.8580, name: "Matraman" },
  "kelapa-gading": { lat: -6.1580, lng: 106.9080, name: "Kelapa Gading" },
  kembangan: { lat: -6.1890, lng: 106.7380, name: "Kembangan" },
  pancoran: { lat: -6.2460, lng: 106.8450, name: "Pancoran" },
};

function parseDistrict(url: string, areaCategory?: string, title?: string, tags?: string[]): { key: string; name: string; lat: number; lng: number } | null {
  const text = `${url} ${areaCategory || ""} ${title || ""} ${(tags || []).join(" ")}`.toLowerCase();

  // Strictly verify it belongs to Jakarta
  if (!text.includes("jakarta")) {
    return null;
  }

  // Sub-district specificity check
  if (text.includes("kemanggisan")) {
    return { key: "kemanggisan", name: "Kemanggisan", lat: -6.1978 + (Math.random() - 0.5) * 0.005, lng: 106.7874 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("slipi")) {
    return { key: "palmerah", name: "Slipi / Palmerah", lat: -6.2005 + (Math.random() - 0.5) * 0.005, lng: 106.7980 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("palmerah")) {
    return { key: "palmerah", name: "Palmerah", lat: -6.2045 + (Math.random() - 0.5) * 0.005, lng: 106.7932 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("tanah abang") || text.includes("tanah-abang")) {
    return { key: "tanah-abang", name: "Tanah Abang", lat: -6.1895 + (Math.random() - 0.5) * 0.005, lng: 106.8142 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("bendungan hilir") || text.includes("bendungan-hilir") || text.includes("benhil")) {
    return { key: "bendungan-hilir", name: "Bendungan Hilir", lat: -6.2163 + (Math.random() - 0.5) * 0.005, lng: 106.8188 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("setiabudi") || text.includes("kuningan") || text.includes("karet")) {
    return { key: "setiabudi", name: "Setiabudi / Kuningan", lat: -6.2150 + (Math.random() - 0.5) * 0.005, lng: 106.8290 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("tebet")) {
    return { key: "tebet", name: "Tebet", lat: -6.2285 + (Math.random() - 0.5) * 0.005, lng: 106.8550 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("cilandak") || text.includes("fatmawati") || text.includes("cipete") || text.includes("simatupang")) {
    return { key: "cilandak", name: "Cilandak / Fatmawati", lat: -6.2890 + (Math.random() - 0.5) * 0.005, lng: 106.7980 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("kebayoran-baru") || text.includes("kebayoran baru") || text.includes("blok m") || text.includes("senayan") || text.includes("gandaria") || text.includes("dharmawangsa")) {
    return { key: "kebayoran-baru", name: "Kebayoran Baru", lat: -6.2420 + (Math.random() - 0.5) * 0.005, lng: 106.8010 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("kebayoran-lama") || text.includes("kebayoran lama")) {
    return { key: "kebayoran-lama", name: "Kebayoran Lama", lat: -6.2380 + (Math.random() - 0.5) * 0.005, lng: 106.7810 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("mampang") || text.includes("tendean") || text.includes("kemang")) {
    return { key: "mampang-prapatan", name: "Mampang Prapatan", lat: -6.2480 + (Math.random() - 0.5) * 0.005, lng: 106.8270 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("grogol") || text.includes("tomang") || text.includes("tanjung duren") || text.includes("roxy")) {
    return { key: "grogol-petamburan", name: "Grogol Petamburan", lat: -6.1685 + (Math.random() - 0.5) * 0.005, lng: 106.7892 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("kebon jeruk") || text.includes("kebon-jeruk") || text.includes("kedoya")) {
    return { key: "kebon-jeruk", name: "Kebon Jeruk", lat: -6.1925 + (Math.random() - 0.5) * 0.005, lng: 106.7689 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("cempaka putih") || text.includes("cempaka-putih") || text.includes("salemba") || text.includes("senen")) {
    return { key: "cempaka-putih", name: "Cempaka Putih", lat: -6.1820 + (Math.random() - 0.5) * 0.005, lng: 106.8680 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("matraman") || text.includes("manggarai") || text.includes("jatinegara")) {
    return { key: "matraman", name: "Matraman", lat: -6.2050 + (Math.random() - 0.5) * 0.005, lng: 106.8580 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("kelapa gading") || text.includes("kelapa-gading") || text.includes("sunter") || text.includes("pluit")) {
    return { key: "kelapa-gading", name: "Kelapa Gading", lat: -6.1580 + (Math.random() - 0.5) * 0.005, lng: 106.9080 + (Math.random() - 0.5) * 0.005 };
  }

  // Fallback by Jakarta administrative city
  if (text.includes("jakarta-selatan") || text.includes("jakarta selatan")) {
    return { key: "setiabudi", name: "Jakarta Selatan (Setiabudi)", lat: -6.2150 + (Math.random() - 0.5) * 0.005, lng: 106.8290 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("jakarta-pusat") || text.includes("jakarta pusat")) {
    return { key: "tanah-abang", name: "Jakarta Pusat (Tanah Abang)", lat: -6.1895 + (Math.random() - 0.5) * 0.005, lng: 106.8142 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("jakarta-barat") || text.includes("jakarta barat")) {
    return { key: "palmerah", name: "Jakarta Barat (Palmerah)", lat: -6.2045 + (Math.random() - 0.5) * 0.005, lng: 106.7932 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("jakarta-timur") || text.includes("jakarta timur")) {
    return { key: "matraman", name: "Jakarta Timur (Matraman)", lat: -6.2050 + (Math.random() - 0.5) * 0.005, lng: 106.8580 + (Math.random() - 0.5) * 0.005 };
  }
  if (text.includes("jakarta-utara") || text.includes("jakarta utara")) {
    return { key: "kelapa-gading", name: "Jakarta Utara (Kelapa Gading)", lat: -6.1580 + (Math.random() - 0.5) * 0.005, lng: 106.9080 + (Math.random() - 0.5) * 0.005 };
  }

  // Not in Jakarta -> Do not ingest
  return null;
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

        // Strict listing validation: Must be an actual listing on SewaKost ending with numeric ID
        if (!/\/kost\/jakarta\/[a-z0-9\-]+\/[a-z0-9\-]+-\d{4,8}\/?$/.test(url)) {
          continue;
        }

        const facilities: string[] = item.facilities || [];
        const tags: string[] = item.tags || [];
        const title: string = item.title || "Kost Jakarta";
        const lowerTitle = title.toLowerCase();

        // Reject category pages, tag aggregations, and national landing pages
        if (
          lowerTitle.includes("hasil pencarian") ||
          lowerTitle.includes("pilihan mulai") ||
          lowerTitle.includes("daftar kost") ||
          lowerTitle.includes("cari kost") ||
          lowerTitle.includes("sewa kost di bali") ||
          lowerTitle.includes("sewa kost di semarang") ||
          lowerTitle.includes("sewa kost di jogja") ||
          lowerTitle.includes("sewa kost di jawa")
        ) {
          continue;
        }

        const district = parseDistrict(url, item._area_category || item.area, title, tags);
        if (!district) continue;

        const amenities = parseAmenities(facilities, `${title} ${tags.join(" ")}`);

        // Compute realistic monthly rent from room tier
        let price = item.priceNumeric;
        const minP = item.min_price;
        const maxP = item.max_price;

        if (minP && maxP && maxP > minP) {
          if (amenities.hasAC && amenities.hasPrivateBath) {
            price = Math.round(minP + (maxP - minP) * 0.65);
          } else if (amenities.hasAC || amenities.hasPrivateBath) {
            price = Math.round(minP + (maxP - minP) * 0.35);
          } else {
            price = minP;
          }
        } else {
          price = minP || maxP || item.priceNumeric;
        }

        // Clamp minimum realistic monthly rent in Jakarta
        if (!price || price < 500_000 || price > 15_000_000) continue;

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

        const checkText = `${title} ${tags.join(" ")} ${item.type || ""} ${url}`.toLowerCase();
        let kostType = "Kost Campur";
        if (
          checkText.includes("putri") ||
          checkText.includes("wanita") ||
          checkText.includes("karyawati") ||
          checkText.includes("cewek") ||
          checkText.includes("muslimah")
        ) {
          kostType = "Kost Putri";
        } else if (
          checkText.includes("putra") ||
          checkText.includes("pria") ||
          checkText.includes("cowok") ||
          checkText.includes("karyawan pria")
        ) {
          kostType = "Kost Putra";
        } else {
          kostType = "Kost Campur";
        }

        const listing: KostListing = {
          id: Buffer.from(url).toString("base64url").slice(0, 16),
          title: title.trim(),
          districtKey: district.key,
          districtName: district.name,
          type: kostType,
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
