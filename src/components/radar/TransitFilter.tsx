"use client";

import React from "react";
import type { TransitNode } from "@/lib/valuation/types";
import { Train, Bus, Sparkles, SlidersHorizontal } from "lucide-react";

interface TransitFilterProps {
  transitNodes: TransitNode[];
  selectedHub: string;
  onSelectHub: (id: string) => void;
  selectedTier: string;
  onSelectTier: (tier: string) => void;
  filterAC: boolean;
  onToggleAC: () => void;
  filterKM: boolean;
  onToggleKM: () => void;
  filterFreeListrik: boolean;
  onToggleFreeListrik: () => void;
  maxBudget: number;
  onChangeMaxBudget: (val: number) => void;
}

export function TransitFilter({
  transitNodes,
  selectedHub,
  onSelectHub,
  selectedTier,
  onSelectTier,
  filterAC,
  onToggleAC,
  filterKM,
  onToggleKM,
  filterFreeListrik,
  onToggleFreeListrik,
  maxBudget,
  onChangeMaxBudget,
}: TransitFilterProps) {
  return (
    <div
      className="radar-card"
      style={{
        padding: "1.25rem",
        marginBottom: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.2rem",
      }}
    >
      {/* Commuter Transit Hub Selector */}
      <div>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Train size={15} color="var(--accent-radar)" />
          <span>Filter Dekat Hub Transit KRL / MRT / Busway:</span>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => onSelectHub("all")}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              border: selectedHub === "all" ? "1px solid var(--accent-radar)" : "1px solid var(--border-subtle)",
              background: selectedHub === "all" ? "var(--accent-glow)" : "rgba(255, 255, 255, 0.04)",
              color: selectedHub === "all" ? "var(--accent-radar)" : "var(--text-secondary)",
            }}
          >
            Semua Hub Transit
          </button>
          {transitNodes.map((hub) => {
            const isSelected = selectedHub === hub.id;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => onSelectHub(hub.id)}
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: isSelected ? "1px solid var(--accent-radar)" : "1px solid var(--border-subtle)",
                  background: isSelected ? "var(--accent-glow)" : "rgba(255, 255, 255, 0.04)",
                  color: isSelected ? "var(--accent-radar)" : "var(--text-secondary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                {hub.type === "TransJakarta" ? <Bus size={13} /> : <Train size={13} />}
                <span>{hub.name.replace("Stasiun KRL ", "").replace("MRT ", "")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Deal Tier + Amenity Toggles + Budget */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "0.9rem" }}>
        {/* Deal Tier Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, marginRight: "0.2rem" }}>
            Rating:
          </span>
          {[
            { id: "all", label: "Semua" },
            { id: "steal", label: "🟢 Steal Only" },
            { id: "fair", label: "🟡 Fair" },
            { id: "overpriced", label: "🔴 Overpriced" },
          ].map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => onSelectTier(tier.id)}
              style={{
                padding: "0.3rem 0.65rem",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                border: selectedTier === tier.id ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid transparent",
                background: selectedTier === tier.id ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.03)",
                color: selectedTier === tier.id ? "#FFFFFF" : "var(--text-muted)",
              }}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* Amenity Switches */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onToggleAC}
            style={{
              padding: "0.3rem 0.65rem",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              border: filterAC ? "1px solid #60A5FA" : "1px solid var(--border-subtle)",
              background: filterAC ? "rgba(59, 130, 246, 0.15)" : "transparent",
              color: filterAC ? "#60A5FA" : "var(--text-muted)",
            }}
          >
            ❄️ Harus AC
          </button>

          <button
            type="button"
            onClick={onToggleKM}
            style={{
              padding: "0.3rem 0.65rem",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              border: filterKM ? "1px solid #C084FC" : "1px solid var(--border-subtle)",
              background: filterKM ? "rgba(168, 85, 247, 0.15)" : "transparent",
              color: filterKM ? "#C084FC" : "var(--text-muted)",
            }}
          >
            🚿 KM Dalam
          </button>

          <button
            type="button"
            onClick={onToggleFreeListrik}
            style={{
              padding: "0.3rem 0.65rem",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              border: filterFreeListrik ? "1px solid #FBBF24" : "1px solid var(--border-subtle)",
              background: filterFreeListrik ? "rgba(245, 158, 11, 0.15)" : "transparent",
              color: filterFreeListrik ? "#FBBF24" : "var(--text-muted)",
            }}
          >
            ⚡ Listrik Gratis
          </button>
        </div>

        {/* Budget Limit Slider */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: "220px" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            Max: <strong>Rp {(maxBudget / 1_000_000).toFixed(1)}M</strong>
          </span>
          <input
            type="range"
            min="1000000"
            max="6000000"
            step="250000"
            value={maxBudget}
            onChange={(e) => onChangeMaxBudget(Number(e.target.value))}
            style={{ flex: 1, accentColor: "var(--accent-radar)" }}
          />
        </div>
      </div>
    </div>
  );
}
