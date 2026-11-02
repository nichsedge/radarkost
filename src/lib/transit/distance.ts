import type { TransitNode } from "../valuation/types";
import transitNodesRaw from "../../data/transit_nodes.json";

export const TRANSIT_NODES: TransitNode[] = transitNodesRaw as TransitNode[];

/**
 * Calculates Haversine distance between two GPS coordinates in meters.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Estimates walking time in minutes assuming 80 meters per minute (4.8 km/h).
 */
export function estimateWalkMinutes(distanceMeters: number): number {
  return Math.max(1, Math.round(distanceMeters / 80));
}

/**
 * Finds the nearest transit hub to a given coordinate.
 */
export function findNearestTransitNode(lat: number, lng: number): {
  node: TransitNode;
  distanceMeters: number;
  walkMinutes: number;
} {
  let nearest = TRANSIT_NODES[0];
  let minDistance = Infinity;

  for (const node of TRANSIT_NODES) {
    const dist = calculateHaversineDistance(lat, lng, node.lat, node.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = node;
    }
  }

  return {
    node: nearest,
    distanceMeters: minDistance,
    walkMinutes: estimateWalkMinutes(minDistance),
  };
}
