export interface AmenityFlags {
  hasAC: boolean;
  hasPrivateBath: boolean; // Kamar Mandi Dalam
  hasFreeElectricity: boolean; // Termasuk Listrik
  hasWifi: boolean;
  hasWaterHeater: boolean;
  hasCarParking: boolean;
  hasMotorParking: boolean;
  roomSizeM2?: number; // e.g. 9 for 3x3, 12 for 3x4
}

export interface TransitNode {
  id: string;
  name: string;
  type: "KRL" | "MRT" | "TransJakarta" | "LRT";
  district: string;
  lat: number;
  lng: number;
  description: string;
}

export type DealTier = "steal" | "fair" | "overpriced";

export interface ValuationBreakdown {
  baseRent: number;
  amenitiesTotal: number;
  amenityDeltas: Record<string, number>;
  transitPenalty: number;
}

export interface ValuationResult {
  fairValue: number;
  difference: number; // Listed - FairValue
  ratio: number; // Listed / FairValue
  dealTier: DealTier;
  dealScoreLabel: string;
  discountPercent: number; // positive = discount (steal), negative = markup
  breakdown: ValuationBreakdown;
  trueMonthlyCost: {
    rent: number;
    estimatedElectricity: number;
    estimatedLaundry: number;
    parkingFee: number;
    totalMonthly: number;
  };
}

export interface KostListing {
  id: string;
  title: string;
  districtKey: string;
  districtName: string;
  type: string; // "Kost Campur" | "Kost Putri" | "Kost Putra"
  priceMonthly: number;
  amenities: AmenityFlags;
  lat?: number;
  lng?: number;
  address?: string;
  ownerPhone?: string;
  sourceUrl: string;
  scrapedAt: string;
  tags?: string[];
  nearestTransit?: {
    nodeId: string;
    nodeName: string;
    distanceMeters: number;
    walkMinutes: number;
  };
  valuation?: ValuationResult;
}
