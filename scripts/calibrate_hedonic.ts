import fs from "node:fs";
import path from "node:path";
import type { KostListing } from "../src/lib/valuation/types";

const DATA_FILE = path.resolve(process.cwd(), "data/kosts.json");

async function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error("Please run `bun run ingest` first.");
    process.exit(1);
  }

  const listings: KostListing[] = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  console.log(`Analyzing ${listings.length} listings for Hedonic calibration...\n`);

  // Group by district
  const byDistrict: Record<string, number[]> = {};
  for (const item of listings) {
    if (!byDistrict[item.districtName]) {
      byDistrict[item.districtName] = [];
    }
    byDistrict[item.districtName].push(item.priceMonthly);
  }

  console.log("📍 District Price Summary (Monthly IDR):");
  for (const [dist, prices] of Object.entries(byDistrict)) {
    prices.sort((a, b) => a - b);
    const min = prices[0];
    const max = prices[prices.length - 1];
    const median = prices[Math.floor(prices.length / 2)];
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    console.log(`  • ${dist.padEnd(20)} | Listings: ${prices.length.toString().padStart(2)} | Median: Rp ${median.toLocaleString("id-ID")} | Range: Rp ${min.toLocaleString("id-ID")} - ${max.toLocaleString("id-ID")}`);
  }

  // Amenity price impact analysis
  const acListings = listings.filter((l) => l.amenities.hasAC);
  const nonAcListings = listings.filter((l) => !l.amenities.hasAC);
  const avgAc = Math.round(acListings.reduce((s, l) => s + l.priceMonthly, 0) / (acListings.length || 1));
  const avgNonAc = Math.round(nonAcListings.reduce((s, l) => s + l.priceMonthly, 0) / (nonAcListings.length || 1));

  console.log("\n💡 Empirical Amenity Premiums:");
  console.log(`  • AC vs Non-AC Delta:       Rp ${(avgAc - avgNonAc).toLocaleString("id-ID")} (AC avg: Rp ${avgAc.toLocaleString("id-ID")} vs Non-AC: Rp ${avgNonAc.toLocaleString("id-ID")})`);

  console.log("\n🎯 Top 3 Detected 'Steal' Gems:");
  const steals = listings
    .filter((l) => l.valuation?.dealTier === "steal")
    .sort((a, b) => (b.valuation?.discountPercent || 0) - (a.valuation?.discountPercent || 0))
    .slice(0, 3);

  for (const s of steals) {
    console.log(`  🟢 ${s.title}`);
    console.log(`     District: ${s.districtName} | Listed: Rp ${s.priceMonthly.toLocaleString("id-ID")} | Fair Value: Rp ${s.valuation?.fairValue.toLocaleString("id-ID")} (${s.valuation?.discountPercent}% discount)`);
    console.log(`     Amenities: ${Object.keys(s.amenities).filter((k) => (s.amenities as any)[k] === true).join(", ")}`);
    console.log(`     Link: ${s.sourceUrl}\n`);
  }
}

main().catch(console.error);
