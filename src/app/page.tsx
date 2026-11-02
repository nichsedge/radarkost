"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { KostListing, TransitNode } from "@/lib/valuation/types";
import { TransitFilter } from "@/components/radar/TransitFilter";
import { KostCard } from "@/components/radar/KostCard";
import { ValueScatterPlot } from "@/components/radar/ValueScatterPlot";
import { TrueCostModal } from "@/components/calculator/TrueCostModal";
import transitNodesData from "@/data/transit_nodes.json";
import { 
  Radar, 
  Sparkles, 
  TrendingDown, 
  Layers, 
  ShieldAlert, 
  SlidersHorizontal,
  Compass
} from "lucide-react";

export default function HomePage() {
  const [allListings, setAllListings] = useState<KostListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHub, setSelectedHub] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");
  const [filterAC, setFilterAC] = useState(false);
  const [filterKM, setFilterKM] = useState(false);
  const [filterFreeListrik, setFilterFreeListrik] = useState(false);
  const [maxBudget, setMaxBudget] = useState(5000000);
  const [activeModalKost, setActiveModalKost] = useState<KostListing | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "plot">("grid");

  const transitNodes = transitNodesData as TransitNode[];

  // Fetch listings from API
  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch("/api/kosts");
        const data = await res.json();
        if (data.listings) {
          setAllListings(data.listings);
        }
      } catch (e) {
        console.error("Failed to load listings:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  // Filter listings
  const filteredListings = useMemo(() => {
    return allListings.filter((item) => {
      if (selectedHub !== "all" && item.nearestTransit?.nodeId !== selectedHub) {
        return false;
      }
      if (selectedTier !== "all" && item.valuation?.dealTier !== selectedTier) {
        return false;
      }
      if (filterAC && !item.amenities.hasAC) {
        return false;
      }
      if (filterKM && !item.amenities.hasPrivateBath) {
        return false;
      }
      if (filterFreeListrik && !item.amenities.hasFreeElectricity) {
        return false;
      }
      if (item.priceMonthly > maxBudget) {
        return false;
      }
      return true;
    });
  }, [allListings, selectedHub, selectedTier, filterAC, filterKM, filterFreeListrik, maxBudget]);

  const stats = useMemo(() => {
    const steals = allListings.filter((l) => l.valuation?.dealTier === "steal").length;
    const fairs = allListings.filter((l) => l.valuation?.dealTier === "fair").length;
    const overpriced = allListings.filter((l) => l.valuation?.dealTier === "overpriced").length;
    return {
      total: allListings.length,
      steals,
      fairs,
      overpriced,
    };
  }, [allListings]);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Hero Metrics Row */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-radar)", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
          <Radar size={16} />
          <span>Jakarta Commuter Rental Radar</span>
        </div>
        <h1 style={{ fontSize: "2.1rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          Deteksi Kost Undervalued & Eliminasi Markup Calo
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "780px", lineHeight: 1.5 }}>
          Mengevaluasi setiap listing kamar kost di Jakarta berdasarkan model hedonic fair-value, jarak jalan kaki ke stasiun KRL/MRT, dan simulasi uang keluar riil bulanan.
        </p>

        {/* Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.9rem", marginTop: "1.5rem" }}>
          <div className="radar-card" style={{ padding: "1rem" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Layers size={13} /> Total Listing Teranalisis
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "0.25rem", color: "var(--text-primary)" }}>
              {stats.total} Kamar
            </div>
          </div>

          <div className="radar-card" style={{ padding: "1rem", borderLeft: "4px solid var(--tier-steal)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--tier-steal)", display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 700 }}>
              <Sparkles size={13} /> Steal Gems (&gt;15% Murah)
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "0.25rem", color: "var(--tier-steal)" }}>
              {stats.steals} Kamar
            </div>
          </div>

          <div className="radar-card" style={{ padding: "1rem", borderLeft: "4px solid var(--tier-fair)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--tier-fair)", display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 700 }}>
              <Compass size={13} /> Sesuai Harga Wajar Pasar
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "0.25rem", color: "var(--tier-fair)" }}>
              {stats.fairs} Kamar
            </div>
          </div>

          <div className="radar-card" style={{ padding: "1rem", borderLeft: "4px solid var(--tier-overpriced)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--tier-overpriced)", display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 700 }}>
              <ShieldAlert size={13} /> Kemahalan / Mark-up Calo
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "0.25rem", color: "var(--tier-overpriced)" }}>
              {stats.overpriced} Kamar
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <TransitFilter
        transitNodes={transitNodes}
        selectedHub={selectedHub}
        onSelectHub={setSelectedHub}
        selectedTier={selectedTier}
        onSelectTier={setSelectedTier}
        filterAC={filterAC}
        onToggleAC={() => setFilterAC((p) => !p)}
        filterKM={filterKM}
        onToggleKM={() => setFilterKM((p) => !p)}
        filterFreeListrik={filterFreeListrik}
        onToggleFreeListrik={() => setFilterFreeListrik((p) => !p)}
        maxBudget={maxBudget}
        onChangeMaxBudget={setMaxBudget}
      />

      {/* Value Scatter Plot Visualizer */}
      <ValueScatterPlot listings={filteredListings} onSelectKost={setActiveModalKost} />

      {/* View Header & Count */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Menampilkan <strong style={{ color: "var(--text-primary)" }}>{filteredListings.length}</strong> listing kamar aktif
        </div>

        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "6px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              border: viewMode === "grid" ? "1px solid var(--accent-radar)" : "1px solid var(--border-subtle)",
              background: viewMode === "grid" ? "rgba(16, 185, 129, 0.15)" : "transparent",
              color: viewMode === "grid" ? "var(--accent-radar)" : "var(--text-muted)",
            }}
          >
            Grid Cards
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
          Memuat data radar...
        </div>
      ) : filteredListings.length === 0 ? (
        <div
          className="radar-card"
          style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}
        >
          Tidak ada kamar kost yang cocok dengan kombinasi filter saat ini. Coba longgarkan budget atau filter transit.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {filteredListings.map((kost) => (
            <KostCard key={kost.id} kost={kost} onOpenCalculator={setActiveModalKost} />
          ))}
        </div>
      )}

      {/* True Cost of Living Modal */}
      <TrueCostModal kost={activeModalKost} onClose={() => setActiveModalKost(null)} />
    </div>
  );
}
