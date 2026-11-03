import { NextResponse } from "next/server";
import { TRANSIT_NODES } from "@/lib/transit/distance";
import { computeWalkingRoute, geocodeAddress } from "@/lib/maps/googleMaps";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      hubId = "krl-palmerah", 
      originLat, 
      originLng, 
      address 
    } = body;

    // Find destination transit hub
    const hub = TRANSIT_NODES.find((n) => n.id === hubId) || TRANSIT_NODES[0];

    let lat = originLat;
    let lng = originLng;
    let geocodedInfo = null;

    // If an address is provided instead of coordinates, geocode it
    if ((lat === undefined || lng === undefined) && address) {
      const geocoded = await geocodeAddress(address);
      if (!geocoded) {
        return NextResponse.json(
          { error: `Alamat '${address}' tidak dapat ditemukan via Google Geocoding.` },
          { status: 404 }
        );
      }
      lat = geocoded.lat;
      lng = geocoded.lng;
      geocodedInfo = geocoded;
    }

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Koordinat asal (originLat & originLng) atau string alamat wajib diisi." },
        { status: 400 }
      );
    }

    // Compute walking route with Google Routes API
    const route = await computeWalkingRoute(
      { lat, lng },
      { lat: hub.lat, lng: hub.lng }
    );

    return NextResponse.json({
      hub: {
        id: hub.id,
        name: hub.name,
        type: hub.type,
        district: hub.district,
        coordinates: { lat: hub.lat, lng: hub.lng },
      },
      origin: { lat, lng },
      geocoded: geocodedInfo,
      route,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
