"use client";

import React, { useEffect, useRef } from "react";
import type { KostListing, TransitNode } from "@/lib/valuation/types";
import "leaflet/dist/leaflet.css";

interface RadarMapProps {
  listings: KostListing[];
  transitNodes: TransitNode[];
  onSelectKost?: (kost: KostListing) => void;
  selectedHub?: string;
}

export function RadarMap({ listings, transitNodes, onSelectKost, selectedHub }: RadarMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        // Default center: Palmerah / Central Jakarta
        const map = L.map(mapContainerRef.current, {
          center: [-6.2069, 106.8111],
          zoom: 13,
          zoomControl: false,
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);

        // CartoDB Dark Matter Basemap
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
          maxZoom: 19,
          subdomains: "abcd",
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      const markersLayer = markersLayerRef.current;
      if (!map || !markersLayer) return;

      markersLayer.clearLayers();

      // Render Transit Stations & Isochrones
      transitNodes.forEach((node) => {
        // 500m walk circle (~6 mins)
        L.circle([node.lat, node.lng], {
          radius: 500,
          color: "#10B981",
          weight: 1,
          opacity: 0.25,
          fillColor: "#10B981",
          fillOpacity: 0.04,
          dashArray: "4 4",
        }).addTo(markersLayer);

        // Station Icon
        const stationIcon = L.divIcon({
          className: "transit-marker",
          html: `<div style="
            background: #1F2937;
            border: 2px solid #10B981;
            color: #FFFFFF;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 6px;
            border-radius: 999px;
            box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 3px;
          ">
            <span>🚆</span>
            <span>${node.name.replace("Stasiun KRL ", "").replace("MRT ", "").replace("Halte TransJakarta ", "TJ ")}</span>
          </div>`,
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        L.marker([node.lat, node.lng], { icon: stationIcon }).addTo(markersLayer);
      });

      // Render Kost Listings
      listings.forEach((kost) => {
        if (!kost.lat || !kost.lng) return;

        const tier = kost.valuation?.dealTier || "fair";
        const color =
          tier === "steal" ? "#10B981" : tier === "overpriced" ? "#EF4444" : "#F59E0B";

        const marker = L.circleMarker([kost.lat, kost.lng], {
          radius: tier === "steal" ? 8 : 6,
          color: "#FFFFFF",
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.9,
        }).addTo(markersLayer);

        // Custom Popup Content
        const popupContent = document.createElement("div");
        popupContent.style.cssText = "font-family: inherit; color: #111827; padding: 4px; min-width: 200px;";
        popupContent.innerHTML = `
          <div style="font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase;">
            ${kost.type} • ${kost.districtName}
          </div>
          <div style="font-size: 13px; font-weight: 800; margin: 3px 0 6px; color: #111827; line-height: 1.3;">
            ${kost.title}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
            <span style="font-size: 15px; font-weight: 800; color: #0F766E;">
              Rp ${kost.priceMonthly.toLocaleString("id-ID")}
            </span>
            <span style="font-size: 11px; color: #4B5563;">
              Fair: Rp ${kost.valuation?.fairValue.toLocaleString("id-ID")}
            </span>
          </div>
          <div style="font-size: 11px; color: #4B5563; margin-bottom: 8px;">
            🚶 ~${kost.nearestTransit?.walkMinutes} mnt (${kost.nearestTransit?.distanceMeters}m) ke ${kost.nearestTransit?.nodeName}
          </div>
          <button id="inspect-btn-${kost.id}" style="
            width: 100%;
            padding: 6px 10px;
            background: #10B981;
            color: #FFFFFF;
            border: none;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
          ">
            Simulasi True Cost & Nego
          </button>
        `;

        marker.bindPopup(popupContent);

        marker.on("popupopen", () => {
          const btn = document.getElementById(`inspect-btn-${kost.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelectKost?.(kost);
            };
          }
        });
      });

      // Fly to selected hub if specified
      if (selectedHub && selectedHub !== "all") {
        const targetNode = transitNodes.find((n) => n.id === selectedHub);
        if (targetNode) {
          map.flyTo([targetNode.lat, targetNode.lng], 15, { duration: 1.2 });
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [listings, transitNodes, selectedHub, onSelectKost]);

  return (
    <div
      className="radar-card"
      style={{
        overflow: "hidden",
        position: "relative",
        marginBottom: "1.75rem",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Map Header Toolbar */}
      <div
        style={{
          padding: "0.75rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(17, 24, 39, 0.9)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 700 }}>
          <span>🗺️ Jakarta Transit & Spatial Value Map</span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 400 }}>
            (Radius hijau: 500m jalan kaki dari stasiun KRL/MRT)
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.72rem", fontWeight: 600 }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--tier-steal)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--tier-steal)" }} /> Steal
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--tier-fair)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--tier-fair)" }} /> Fair
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--tier-overpriced)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--tier-overpriced)" }} /> Overpriced
          </span>
        </div>
      </div>

      {/* Map DOM Element */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "450px",
          background: "#0B0F17",
          zIndex: 1,
        }}
      />
    </div>
  );
}
