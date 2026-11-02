import type { AmenityFlags, ValuationResult, ValuationBreakdown, DealTier } from "./types";
import districtBaselinesRaw from "../../data/districts_baseline.json";

interface DistrictBaseline {
  name: string;
  city: string;
  baseBareRent: number;
}

const DISTRICT_BASELINES: Record<string, DistrictBaseline> = districtBaselinesRaw;

// Hedonic Amenity Coefficients (Market calibrated in IDR)
export const HEDONIC_WEIGHTS = {
  ac: 500_000,
  privateBath: 400_000,
  freeElectricity: 250_000,
  waterHeater: 150_000,
  wifi: 100_000,
  carParking: 350_000,
  sqmBaseline: 9, // Standard 3x3m
  sqmExtraPerMeter: 45_000,
} as const;

export function calculateFairValue(
  districtKey: string,
  priceMonthly: number,
  amenities: AmenityFlags,
  distanceToTransitMeters?: number
): ValuationResult {
  const normKey = districtKey.toLowerCase().trim();
  const district = DISTRICT_BASELINES[normKey] || {
    name: districtKey,
    city: "Jakarta",
    baseBareRent: 950_000, // General Jakarta fallback
  };

  const baseRent = district.baseBareRent;
  const amenityDeltas: Record<string, number> = {};

  if (amenities.hasAC) {
    amenityDeltas["Air Conditioner (AC)"] = HEDONIC_WEIGHTS.ac;
  }
  if (amenities.hasPrivateBath) {
    amenityDeltas["Kamar Mandi Dalam"] = HEDONIC_WEIGHTS.privateBath;
  }
  if (amenities.hasFreeElectricity) {
    amenityDeltas["Listrik Termasuk"] = HEDONIC_WEIGHTS.freeElectricity;
  }
  if (amenities.hasWaterHeater) {
    amenityDeltas["Water Heater"] = HEDONIC_WEIGHTS.waterHeater;
  }
  if (amenities.hasWifi) {
    amenityDeltas["WiFi Cepat"] = HEDONIC_WEIGHTS.wifi;
  }

  // Room area adjustments (relative to standard 9m²)
  if (amenities.roomSizeM2 && amenities.roomSizeM2 !== HEDONIC_WEIGHTS.sqmBaseline) {
    const diff = amenities.roomSizeM2 - HEDONIC_WEIGHTS.sqmBaseline;
    const delta = diff * HEDONIC_WEIGHTS.sqmExtraPerMeter;
    amenityDeltas[`Luas Kamar (${amenities.roomSizeM2}m²)`] = Math.round(delta);
  }

  const amenitiesTotal = Object.values(amenityDeltas).reduce((sum, v) => sum + v, 0);

  // Transit distance penalty (rooms far from transit hub suffer decay)
  let transitPenalty = 0;
  if (distanceToTransitMeters !== undefined && distanceToTransitMeters > 500) {
    // 500m to 2000m: -Rp 40k per 250m beyond 500m
    const excessMeters = Math.min(distanceToTransitMeters - 500, 2000);
    transitPenalty = Math.round((excessMeters / 250) * 40_000);
  }

  const fairValue = Math.max(500_000, baseRent + amenitiesTotal - transitPenalty);
  const difference = priceMonthly - fairValue;
  const ratio = fairValue > 0 ? priceMonthly / fairValue : 1;
  const discountPercent = Math.round(((fairValue - priceMonthly) / fairValue) * 100);

  // Deal Tier Classification
  let dealTier: DealTier = "fair";
  let dealScoreLabel = "Fair Market";

  if (ratio <= 0.85) {
    dealTier = "steal";
    dealScoreLabel = "Steal / Undervalued";
  } else if (ratio >= 1.18) {
    dealTier = "overpriced";
    dealScoreLabel = "Overpriced / Premium Markup";
  }

  // True Monthly Cost Computation
  const estElectricity = amenities.hasFreeElectricity ? 0 : amenities.hasAC ? 275_000 : 75_000;
  const estLaundry = 150_000;
  const parkingFee = amenities.hasCarParking ? 0 : 0; // standard motor usually free or small

  const breakdown: ValuationBreakdown = {
    baseRent,
    amenitiesTotal,
    amenityDeltas,
    transitPenalty,
  };

  return {
    fairValue,
    difference,
    ratio: Number(ratio.toFixed(2)),
    dealTier,
    dealScoreLabel,
    discountPercent,
    breakdown,
    trueMonthlyCost: {
      rent: priceMonthly,
      estimatedElectricity: estElectricity,
      estimatedLaundry: estLaundry,
      parkingFee,
      totalMonthly: priceMonthly + estElectricity + estLaundry + parkingFee,
    },
  };
}
