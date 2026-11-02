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

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        // Center: Palmerah / Tanah Abang / Central Jakarta
        const map = L.map(mapContainerRef.current, {
          center: [-6.2150, 106.8200],
          zoom: 12,
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
        // 500m walk circle
        L.circle([node.lat, node.lng], {
          radius: 500,
          color: "#10B981",
          weight: 1.5,
          opacity: 0.35,
          fillColor: "#10B981",
          fillOpacity: 0.05,
          dashArray: "4 4",
          interactive: false,
        }).addTo(markersLayer);

        // Station Marker Icon
        const stationIcon = L.divIcon({
          className: "transit-marker",
          html: `<div style="
            background: #111827;
            border: 2px solid #10B981;
            color: #FFFFFF;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 999px;
            box-shadow: 0 0 14px rgba(16, 185, 129, 0.6);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: default;
          ">
            <span>🚆</span>
            <span>${node.name.replace("Stasiun KRL ", "").replace("MRT ", "").replace("Halte TransJakarta ", "TJ ")}</span>
          </div>`,
          iconSize: [90, 24],
          iconAnchor: [45, 12],
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
          radius: tier === "steal" ? 9 : 7,
          color: "#FFFFFF",
          weight: 2,
          fillColor: color,
          fillOpacity: 0.95,
        }).addTo(markersLayer);

        // Interactive Tooltip on Hover
        marker.bindTooltip(
          `<div style="font-family: var(--font-sans); color: #111827; padding: 2px 4px;">
            <div style="font-size: 10px; font-weight: 700; color: #4B5563; text-transform: uppercase;">
              ${kost.districtName} • ${tier.toUpperCase()}
            </div>
            <div style="font-size: 12px; font-weight: 800; margin: 2px 0; color: #111827;">
              ${kost.title}
            </div>
            <div style="font-size: 13px; font-weight: 900; color: #0F766E;">
              Rp ${kost.priceMonthly.toLocaleString("id-ID")}/bln
            </div>
            <div style="font-size: 10px; color: #6B7280; margin-top: 2px;">
              👉 Klik untuk buka simulasi True Cost & Nego
            </div>
          </div>`,
          {
            direction: "top",
            offset: [0, -10],
            opacity: 0.98,
          }
        );

        // Direct Click Action: Instantly opens the TrueCostModal!
        marker.on("click", (e: any) => {
          L.DomEvent.stopPropagation(e);
          onSelectKost?.(kost);
        });
      });

      // Fly to selected hub if specified
      if (selectedHub && selectedHub !== "all") {
        const targetNode = transitNodes.find((n) => n.id === selectedHub);
        if (targetNode) {
          map.flyTo([targetNode.lat, targetNode.lng], 14, { duration: 1.2 });
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
          background: "rgba(17, 24, 39, 0.95)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 700 }}>
          <span>🗺️ Peta Jakarta & Radius Transit</span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 400 }}>
            (Klik sembarang titik untuk langsung buka detail kamar & simulasi True Cost)
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
