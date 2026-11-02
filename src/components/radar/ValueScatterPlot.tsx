"use client";

import React, { useState } from "react";
import type { KostListing } from "@/lib/valuation/types";
import { Sparkles, Footprints, ArrowUpDown } from "lucide-react";

interface ValueScatterPlotProps {
  listings: KostListing[];
  onSelectKost?: (kost: KostListing) => void;
}

export function ValueScatterPlot({ listings, onSelectKost }: ValueScatterPlotProps) {
  const [hovered, setHovered] = useState<KostListing | null>(null);

  if (!listings.length) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
        Tidak ada data listing untuk plot ini.
      </div>
    );
  }

  // Dimensions
  const width = 800;
  const height = 340;
  const padding = { top: 30, right: 40, bottom: 45, left: 65 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Max bounds
  const maxDistance = 2200; // meters
  const minPrice = 400_000;
  const maxPrice = 4_200_000;

  function getX(distMeters: number) {
    const clamped = Math.min(Math.max(distMeters, 0), maxDistance);
    return padding.left + (clamped / maxDistance) * plotWidth;
  }

  function getY(price: number) {
    const clamped = Math.min(Math.max(price, minPrice), maxPrice);
    return padding.top + plotHeight - ((clamped - minPrice) / (maxPrice - minPrice)) * plotHeight;
  }

  return (
    <div
      className="radar-card"
      style={{
        padding: "1.25rem",
        marginBottom: "1.75rem",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <div>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.45rem", color: "var(--text-primary)" }}>
            <Sparkles size={16} color="var(--accent-radar)" />
            <span>Value Frontier Radar (Sewa vs Jarak Transit)</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Titik di bawah garis adalah anomali murah (Steals). Klik titik untuk inspeksi.
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", fontSize: "0.72rem", fontWeight: 600 }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--tier-steal)" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--tier-steal)" }} /> Steal (&gt;15% Murah)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--tier-fair)" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--tier-fair)" }} /> Fair Market
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--tier-overpriced)" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--tier-overpriced)" }} /> Overpriced
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", minWidth: "600px", display: "block" }}
        >
          {/* Grid lines */}
          {[1_000_000, 2_000_000, 3_000_000, 4_000_000].map((price) => (
            <g key={price}>
              <line
                x1={padding.left}
                y1={getY(price)}
                x2={width - padding.right}
                y2={getY(price)}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={getY(price) + 4}
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="end"
                fontFamily="var(--font-mono)"
              >
                Rp {(price / 1_000_000).toFixed(0)}M
              </text>
            </g>
          ))}

          {[500, 1000, 1500, 2000].map((dist) => (
            <g key={dist}>
              <line
                x1={getX(dist)}
                y1={padding.top}
                x2={getX(dist)}
                y2={padding.top + plotHeight}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
              />
              <text
                x={getX(dist)}
                y={padding.top + plotHeight + 18}
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                {dist}m
              </text>
            </g>
          ))}

          {/* Reference Median Frontier Line */}
          <line
            x1={getX(200)}
            y1={getY(2_200_000)}
            x2={getX(2000)}
            y2={getY(1_700_000)}
            stroke="rgba(16, 185, 129, 0.3)"
            strokeWidth="2"
            strokeDasharray="6 6"
          />

          {/* Data Points */}
          {listings.map((k) => {
            const dist = k.nearestTransit?.distanceMeters || 800;
            const cx = getX(dist);
            const cy = getY(k.priceMonthly);
            const tier = k.valuation?.dealTier || "fair";

            const color =
              tier === "steal" ? "var(--tier-steal)" : tier === "overpriced" ? "var(--tier-overpriced)" : "var(--tier-fair)";

            const isHovered = hovered?.id === k.id;

            return (
              <circle
                key={k.id}
                cx={cx}
                cy={cy}
                r={isHovered ? 8 : tier === "steal" ? 6 : 5}
                fill={color}
                stroke={isHovered ? "#FFFFFF" : "rgba(0, 0, 0, 0.4)"}
                strokeWidth={isHovered ? 2.5 : 1.5}
                style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                onMouseEnter={() => setHovered(k)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelectKost?.(k)}
              />
            );
          })}
        </svg>
      </div>

      {/* Hover preview tooltip */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "1.5rem",
            right: "1.5rem",
            background: "rgba(17, 24, 39, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "8px",
            padding: "0.6rem 0.9rem",
            fontSize: "0.75rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{hovered.title}</div>
          <div style={{ color: "var(--accent-radar)", fontWeight: 800, marginTop: "0.15rem" }}>
            Rp {hovered.priceMonthly.toLocaleString("id-ID")}/bln
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "0.15rem" }}>
            🚶 {hovered.nearestTransit?.distanceMeters}m dari {hovered.nearestTransit?.nodeName}
          </div>
        </div>
      )}
    </div>
  );
}
