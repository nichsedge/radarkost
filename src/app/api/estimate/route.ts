import { NextResponse } from "next/server";
import { calculateFairValue } from "@/lib/valuation/hedonic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { district = "palmerah", price = 1500000, amenities = {}, distanceMeters } = body;

    const result = calculateFairValue(district, Number(price), amenities, distanceMeters);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
