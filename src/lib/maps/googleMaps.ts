import { calculateHaversineDistance, estimateWalkMinutes } from "../transit/distance";

export interface WalkingRouteResult {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  actualDistanceMeters: number;
  actualDurationMinutes: number;
  straightDistanceMeters: number;
  detourFactor: number; // actualDistance / straightDistance (e.g., 1.78x detour)
  encodedPolyline?: string;
  source: "google_routes" | "haversine_fallback";
}

export interface GeocodeResult {
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId?: string;
}

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

/**
 * Calculates accurate walking route and duration between two GPS coordinates using Google Routes API.
 * Falls back to Haversine straight-line estimation if API key is missing or network call fails.
 */
export async function computeWalkingRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<WalkingRouteResult> {
  const straightDistance = calculateHaversineDistance(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng
  );

  if (!GOOGLE_MAPS_API_KEY) {
    return {
      origin,
      destination,
      actualDistanceMeters: straightDistance,
      actualDurationMinutes: estimateWalkMinutes(straightDistance),
      straightDistanceMeters: straightDistance,
      detourFactor: 1.0,
      source: "haversine_fallback",
    };
  }

  try {
    const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
      },
      body: JSON.stringify({
        origin: {
          location: { latLng: { latitude: origin.lat, longitude: origin.lng } },
        },
        destination: {
          location: { latLng: { latitude: destination.lat, longitude: destination.lng } },
        },
        travelMode: "WALK",
      }),
    });

    if (!res.ok) {
      throw new Error(`Routes API responded with HTTP ${res.status}`);
    }

    const data = await res.json();
    const route = data.routes?.[0];

    if (!route) {
      throw new Error("No route found in Routes API response");
    }

    const actualDistance = Number(route.distanceMeters || straightDistance);
    const durationSeconds = route.duration
      ? parseInt(route.duration.replace("s", ""), 10)
      : Math.round(actualDistance / 1.33); // standard ~1.33 m/s walking speed
    const actualDurationMinutes = Math.max(1, Math.round(durationSeconds / 60));
    const detourFactor = Number((actualDistance / Math.max(straightDistance, 1)).toFixed(2));

    return {
      origin,
      destination,
      actualDistanceMeters: actualDistance,
      actualDurationMinutes,
      straightDistanceMeters: straightDistance,
      detourFactor,
      encodedPolyline: route.polyline?.encodedPolyline,
      source: "google_routes",
    };
  } catch (err) {
    console.warn("Falling back to Haversine distance estimation due to API error:", err);
    return {
      origin,
      destination,
      actualDistanceMeters: straightDistance,
      actualDurationMinutes: estimateWalkMinutes(straightDistance),
      straightDistanceMeters: straightDistance,
      detourFactor: 1.0,
      source: "haversine_fallback",
    };
  }
}

/**
 * Geocodes an address or street name to GPS coordinates using Google Geocoding API.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!GOOGLE_MAPS_API_KEY || !address.trim()) return null;

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", address);
    url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
    // Bias results to Jakarta / Jabodetabek area
    url.searchParams.set("components", "country:ID");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);

    const data = await res.json();
    if (data.status !== "OK" || !data.results?.[0]) {
      return null;
    }

    const first = data.results[0];
    return {
      formattedAddress: first.formatted_address,
      lat: first.geometry.location.lat,
      lng: first.geometry.location.lng,
      placeId: first.place_id,
    };
  } catch (err) {
    console.error("Geocoding failed:", err);
    return null;
  }
}
