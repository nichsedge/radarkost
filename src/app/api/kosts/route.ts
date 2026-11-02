import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import type { KostListing } from "@/lib/valuation/types";

const DATA_FILE = path.resolve(process.cwd(), "data/kosts.json");

export async function GET(request: Request) {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return NextResponse.json({ error: "Data file not found. Please run ingest first." }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const hub = searchParams.get("hub");
    const tier = searchParams.get("tier");
    const hasAC = searchParams.get("ac") === "true";
    const hasKM = searchParams.get("km") === "true";
    const hasFreeListrik = searchParams.get("listrik") === "true";
    const maxBudget = searchParams.get("maxBudget") ? Number(searchParams.get("maxBudget")) : Infinity;

    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    let listings: KostListing[] = JSON.parse(raw);

    // Apply filters
    if (hub && hub !== "all") {
      listings = listings.filter((l) => l.nearestTransit?.nodeId === hub);
    }
    if (tier && tier !== "all") {
      listings = listings.filter((l) => l.valuation?.dealTier === tier);
    }
    if (hasAC) {
      listings = listings.filter((l) => l.amenities.hasAC);
    }
    if (hasKM) {
      listings = listings.filter((l) => l.amenities.hasPrivateBath);
    }
    if (hasFreeListrik) {
      listings = listings.filter((l) => l.amenities.hasFreeElectricity);
    }
    if (maxBudget < Infinity) {
      listings = listings.filter((l) => l.priceMonthly <= maxBudget);
    }

    // Stats
    const stats = {
      total: listings.length,
      steals: listings.filter((l) => l.valuation?.dealTier === "steal").length,
      fair: listings.filter((l) => l.valuation?.dealTier === "fair").length,
      overpriced: listings.filter((l) => l.valuation?.dealTier === "overpriced").length,
      medianPrice: listings.length
        ? [...listings].sort((a, b) => a.priceMonthly - b.priceMonthly)[Math.floor(listings.length / 2)].priceMonthly
        : 0,
    };

    return NextResponse.json({ listings, stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
