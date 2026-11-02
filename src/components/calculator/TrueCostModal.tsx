"use client";

import React, { useState } from "react";
import type { KostListing } from "@/lib/valuation/types";
import { X, Calculator, Zap, Sparkles, AlertCircle, Shirt, Droplets, Car } from "lucide-react";

interface TrueCostModalProps {
  kost: KostListing | null;
  onClose: () => void;
}

export function TrueCostModal({ kost, onClose }: TrueCostModalProps) {
  if (!kost) return null;

  const v = kost.valuation;
  const initialElec = kost.amenities.hasFreeElectricity ? 0 : kost.amenities.hasAC ? 275_000 : 75_000;
  
  const [elecCost, setElecCost] = useState(initialElec);
  const [laundryCost, setLaundryCost] = useState(150_000);
  const [drinkingWater, setDrinkingWater] = useState(50_000);
  const [parkingCost, setParkingCost] = useState(kost.amenities.hasCarParking ? 0 : 50_000);

  const realTotal = kost.priceMonthly + elecCost + laundryCost + drinkingWater + parkingCost;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="radar-card"
        style={{
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "1.75rem",
          background: "#111827",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-radar)", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase" }}>
              <Calculator size={16} />
              <span>Valuation & Living Outflow Simulator</span>
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginTop: "0.25rem", color: "var(--text-primary)" }}>
              {kost.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "none",
              color: "var(--text-muted)",
              padding: "0.4rem",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Hedonic Valuation Section */}
        {v && (
          <div
            style={{
              padding: "1rem",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-subtle)",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Sparkles size={14} color="var(--accent-radar)" />
              <span>Hedonic Fair-Value Deconstruction</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Nilai Dasar {kost.districtName} (Kamar Kosong):</span>
                <span style={{ fontWeight: 600 }}>Rp {v.breakdown.baseRent.toLocaleString("id-ID")}</span>
              </div>

              {Object.entries(v.breakdown.amenityDeltas).map(([amenity, delta]) => (
                <div key={amenity} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>+ {amenity}:</span>
                  <span style={{ color: "#34D399", fontWeight: 600 }}>+Rp {delta.toLocaleString("id-ID")}</span>
                </div>
              ))}

              {v.breakdown.transitPenalty > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>- Penalti Jarak Transit ({kost.nearestTransit?.distanceMeters}m):</span>
                  <span style={{ color: "#F87171", fontWeight: 600 }}>-Rp {v.breakdown.transitPenalty.toLocaleString("id-ID")}</span>
                </div>
              )}

              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", marginTop: "0.4rem", paddingTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700 }}>Nilai Wajar Pasar (Fair Value):</span>
                <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--accent-radar)" }}>
                  Rp {v.fairValue.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Real Cash Outflow Section */}
        <div>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Zap size={15} color="#FBBF24" />
            <span>Simulasi Pengeluaran Riil Bulanan (Cash Outflow)</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {/* Rent */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Sewa Kamar (Listing):</span>
              <span style={{ fontWeight: 700 }}>Rp {kost.priceMonthly.toLocaleString("id-ID")}</span>
            </div>

            {/* Electricity */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Zap size={13} color="#FBBF24" /> Listrik (Token / Bulan):
                </span>
                <span style={{ fontWeight: 600 }}>Rp {elecCost.toLocaleString("id-ID")}</span>
              </div>
              <input
                type="range"
                min="0"
                max="600000"
                step="25000"
                value={elecCost}
                onChange={(e) => setElecCost(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent-radar)" }}
              />
            </div>

            {/* Laundry */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Shirt size={13} color="#60A5FA" /> Laundry Kiloan (~20kg):
                </span>
                <span style={{ fontWeight: 600 }}>Rp {laundryCost.toLocaleString("id-ID")}</span>
              </div>
              <input
                type="range"
                min="0"
                max="400000"
                step="25000"
                value={laundryCost}
                onChange={(e) => setLaundryCost(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#60A5FA" }}
              />
            </div>

            {/* Water & Parking Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
                  Galon & Air Minum:
                </label>
                <select
                  value={drinkingWater}
                  onChange={(e) => setDrinkingWater(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "0.45rem",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    fontSize: "0.8rem",
                  }}
                >
                  <option value={0}>Termasuk di Kos (Rp 0)</option>
                  <option value={50000}>Beli Galon Isi Ulang (Rp 50.000)</option>
                  <option value={90000}>Aqua Asli 4 Galon (Rp 90.000)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
                  Parkir Kendaraan:
                </label>
                <select
                  value={parkingCost}
                  onChange={(e) => setParkingCost(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "0.45rem",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    fontSize: "0.8rem",
                  }}
                >
                  <option value={0}>Gratis / Termasuk (Rp 0)</option>
                  <option value={50000}>Parkir Motor (Rp 50.000)</option>
                  <option value={350000}>Parkir Mobil (Rp 350.000)</option>
                </select>
              </div>
            </div>

            {/* Total Highlight */}
            <div
              style={{
                marginTop: "0.75rem",
                padding: "1rem",
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.03em", color: "var(--accent-radar)", fontWeight: 700 }}>
                  Total Uang Keluar Sebenarnya
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Listing: Rp {kost.priceMonthly.toLocaleString("id-ID")}
                </div>
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#FFFFFF" }}>
                Rp {realTotal.toLocaleString("id-ID")}
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>/bln</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
