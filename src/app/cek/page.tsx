"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { calculateFairValue } from "@/lib/valuation/hedonic";
import districtBaselinesRaw from "@/data/districts_baseline.json";
import transitNodesRaw from "@/data/transit_nodes.json";
import type { AmenityFlags, TransitNode } from "@/lib/valuation/types";
import { 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Copy, 
  Check, 
  Zap, 
  Bath, 
  Wind, 
  Wifi, 
  Car, 
  Footprints,
  ShieldCheck,
  TrendingDown,
  MessageCircle,
  MapPin,
  Navigation,
  Loader2
} from "lucide-react";

export default function CekHargaKostPage() {
  const districts = districtBaselinesRaw as Record<string, { name: string; city: string; baseBareRent: number }>;
  const transitNodes = transitNodesRaw as TransitNode[];

  // Form State
  const [districtKey, setDistrictKey] = useState("palmerah");
  const [advertisedRent, setAdvertisedRent] = useState(2200000);
  const [roomSize, setRoomSize] = useState(9); // 9, 12, 16
  const [hasAC, setHasAC] = useState(true);
  const [hasKM, setHasKM] = useState(true);
  const [hasListrik, setHasListrik] = useState(false);
  const [hasWifi, setHasWifi] = useState(true);
  const [hasWaterHeater, setHasWaterHeater] = useState(false);
  const [hasMotorParking, setHasMotorParking] = useState(true);
  const [distanceToTransit, setDistanceToTransit] = useState(600); // meters
  const [copied, setCopied] = useState(false);

  // Google Maps True Route State
  const [addressInput, setAddressInput] = useState("");
  const [targetHubId, setTargetHubId] = useState("krl-palmerah");
  const [isRouting, setIsRouting] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  async function handleCalculateRealRoute() {
    if (!addressInput.trim()) return;
    setIsRouting(true);
    setRouteError(null);
    try {
      const res = await fetch("/api/transit/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addressInput, hubId: targetHubId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghitung rute");
      }
      setRouteData(data);
      if (data.route?.actualDistanceMeters) {
        setDistanceToTransit(data.route.actualDistanceMeters);
      }
    } catch (err: any) {
      setRouteError(err.message);
    } finally {
      setIsRouting(false);
    }
  }

  const amenities: AmenityFlags = useMemo(() => ({
    hasAC,
    hasPrivateBath: hasKM,
    hasFreeElectricity: hasListrik,
    hasWifi,
    hasWaterHeater,
    hasCarParking: false,
    hasMotorParking,
    roomSizeM2: roomSize,
  }), [hasAC, hasKM, hasListrik, hasWifi, hasWaterHeater, hasMotorParking, roomSize]);

  // Valuation Calculation
  const valuation = useMemo(() => {
    return calculateFairValue(districtKey, advertisedRent, amenities, distanceToTransit);
  }, [districtKey, advertisedRent, amenities, distanceToTransit]);

  const diff = advertisedRent - valuation.fairValue;
  const isSteal = valuation.dealTier === "steal";
  const isOverpriced = valuation.dealTier === "overpriced";

  // Negotiation Script
  const negotiationText = useMemo(() => {
    const dName = districts[districtKey]?.name || districtKey;
    const estFair = valuation.fairValue.toLocaleString("id-ID");
    const listed = advertisedRent.toLocaleString("id-ID");

    if (isOverpriced) {
      return `Halo Bu/Pak, saya berminat dengan kamar kost di ${dName}. Setelah saya cek pasaran kamar serupa di area sekitar (luas ${roomSize}m², ${hasAC ? "AC" : "Non-AC"}, ${hasKM ? "KM Dalam" : "KM Luar"}, listrik ${hasListrik ? "termasuk" : "token"}), rata-rata pasaran berkisar di Rp ${estFair}/bulan. Apakah harganya masih bisa disesuaikan atau ada diskon untuk sewa langsung 3/6 bulan? Terima kasih!`;
    }
    return `Halo Bu/Pak, saya melihat info kamar kost di ${dName} seharga Rp ${listed}/bulan. Apakah unit masih tersedia untuk survey minggu ini? Terima kasih!`;
  }, [districts, districtKey, valuation, advertisedRent, roomSize, hasAC, hasKM, hasListrik, isOverpriced]);

  function handleCopy() {
    navigator.clipboard.writeText(negotiationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "1.5rem 1.5rem 4rem" }}>
      {/* Top back button */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Radar Utama</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-radar)", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
          <Calculator size={16} />
          <span>Independent Rent Auditor</span>
        </div>
        <h1 style={{ fontSize: "2.1rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          Cek Nilai Wajar Kost (Fair-Value Audit)
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "720px", lineHeight: 1.5 }}>
          Masukkan harga sewa dan spesifikasi kamar yang sedang kamu incar di Mamikos, OLX, atau media sosial. Algoritma kami akan membongkar apakah harganya pantas atau kemahalan.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.75rem" }}>
        {/* Left Column: Input Form */}
        <div className="radar-card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text-primary)" }}>
            1. Spesifikasi Kamar
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {/* Sub-district */}
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                Kecamatan / Area Jakarta:
              </label>
              <select
                value={districtKey}
                onChange={(e) => setDistrictKey(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                {Object.entries(districts).map(([key, d]) => (
                  <option key={key} value={key} style={{ background: "#111827", color: "#FFF" }}>
                    {d.name} ({d.city}) — Nilai Dasar: Rp {d.baseBareRent.toLocaleString("id-ID")}
                  </option>
                ))}
              </select>
            </div>

            {/* Advertised Monthly Rent */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                  Harga Ditawarkan (Iklan):
                </label>
                <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  Rp {advertisedRent.toLocaleString("id-ID")}
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 400 }}> /bln</span>
                </span>
              </div>
              <input
                type="range"
                min="600000"
                max="6000000"
                step="50000"
                value={advertisedRent}
                onChange={(e) => setAdvertisedRent(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent-radar)" }}
              />
            </div>

            {/* Room Area */}
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                Luas Kamar:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                {[
                  { size: 9, label: "Standard (3×3m)" },
                  { size: 12, label: "Medium (3×4m)" },
                  { size: 16, label: "Besar (4×4m)" },
                ].map((opt) => (
                  <button
                    key={opt.size}
                    type="button"
                    onClick={() => setRoomSize(opt.size)}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: roomSize === opt.size ? "1px solid var(--accent-radar)" : "1px solid var(--border-subtle)",
                      background: roomSize === opt.size ? "var(--accent-glow)" : "transparent",
                      color: roomSize === opt.size ? "var(--accent-radar)" : "var(--text-muted)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenity Switches */}
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Fasilitas yang Didapat:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", cursor: "pointer", padding: "0.45rem", borderRadius: "6px", background: "rgba(255,255,255,0.02)" }}>
                  <input type="checkbox" checked={hasAC} onChange={(e) => setHasAC(e.target.checked)} style={{ accentColor: "var(--accent-radar)" }} />
                  <Wind size={14} color="#60A5FA" />
                  <span>Ada AC (+500rb)</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", cursor: "pointer", padding: "0.45rem", borderRadius: "6px", background: "rgba(255,255,255,0.02)" }}>
                  <input type="checkbox" checked={hasKM} onChange={(e) => setHasKM(e.target.checked)} style={{ accentColor: "var(--accent-radar)" }} />
                  <Bath size={14} color="#C084FC" />
                  <span>KM Dalam (+400rb)</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", cursor: "pointer", padding: "0.45rem", borderRadius: "6px", background: "rgba(255,255,255,0.02)" }}>
                  <input type="checkbox" checked={hasListrik} onChange={(e) => setHasListrik(e.target.checked)} style={{ accentColor: "var(--accent-radar)" }} />
                  <Zap size={14} color="#FBBF24" />
                  <span>Listrik Gratis (+250rb)</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", cursor: "pointer", padding: "0.45rem", borderRadius: "6px", background: "rgba(255,255,255,0.02)" }}>
                  <input type="checkbox" checked={hasWifi} onChange={(e) => setHasWifi(e.target.checked)} style={{ accentColor: "var(--accent-radar)" }} />
                  <Wifi size={14} color="#34D399" />
                  <span>WiFi (+100rb)</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", cursor: "pointer", padding: "0.45rem", borderRadius: "6px", background: "rgba(255,255,255,0.02)" }}>
                  <input type="checkbox" checked={hasWaterHeater} onChange={(e) => setHasWaterHeater(e.target.checked)} style={{ accentColor: "var(--accent-radar)" }} />
                  <Sparkles size={14} color="#F472B6" />
                  <span>Water Heater (+150rb)</span>
                </label>
              </div>
            </div>

            {/* Transit Distance & Google Maps True Route */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.3rem" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Footprints size={14} color="var(--accent-radar)" />
                  Jarak Jalan Kaki ke Stasiun/Halte:
                </label>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent-radar)" }}>
                  {distanceToTransit}m (~{Math.round(distanceToTransit / 80)} mnt jalan)
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="3000"
                step="25"
                value={distanceToTransit}
                onChange={(e) => setDistanceToTransit(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent-radar)", marginBottom: "0.75rem" }}
              />

              {/* Google Maps True Route Calculator Card */}
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.25)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Navigation size={13} color="var(--accent-radar)" />
                    Hitung Rute Nyata (Google Maps)
                  </span>
                  <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "rgba(52, 211, 153, 0.15)", color: "#34D399", fontWeight: 600 }}>
                    Google Routes API
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                  <select
                    value={targetHubId}
                    onChange={(e) => setTargetHubId(e.target.value)}
                    style={{
                      padding: "0.4rem 0.5rem",
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                      fontSize: "0.75rem",
                      outline: "none",
                    }}
                  >
                    {transitNodes.map((node) => (
                      <option key={node.id} value={node.id} style={{ background: "#111827", color: "#fff" }}>
                        {node.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Alamat/Jalan kost..."
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCalculateRealRoute()}
                    style={{
                      padding: "0.4rem 0.5rem",
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                      fontSize: "0.75rem",
                      outline: "none",
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCalculateRealRoute}
                  disabled={isRouting || !addressInput.trim()}
                  style={{
                    padding: "0.45rem",
                    borderRadius: "6px",
                    background: addressInput.trim() ? "var(--accent-radar)" : "rgba(255, 255, 255, 0.08)",
                    color: addressInput.trim() ? "#000" : "var(--text-muted)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    border: "none",
                    cursor: addressInput.trim() ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.35rem",
                    transition: "all 0.2s",
                  }}
                >
                  {isRouting ? (
                    <>
                      <Loader2 size={13} className="spin" />
                      <span>Menghitung Rute Jalan Kaki...</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={13} />
                      <span>Cek Rute Riil & Sinkronkan</span>
                    </>
                  )}
                </button>

                {routeError && (
                  <div style={{ fontSize: "0.7rem", color: "var(--tier-overpriced)", marginTop: "0.2rem" }}>
                    ⚠️ {routeError}
                  </div>
                )}

                {routeData && (
                  <div
                    style={{
                      marginTop: "0.3rem",
                      padding: "0.5rem",
                      borderRadius: "6px",
                      background: "rgba(52, 211, 153, 0.08)",
                      border: "1px solid rgba(52, 211, 153, 0.2)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                      fontSize: "0.72rem",
                    }}
                  >
                    <div style={{ color: "#34D399", fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
                      <span>🚶 Rute Nyata: {routeData.route?.actualDistanceMeters}m ({routeData.route?.actualDurationMinutes} mnt jalan)</span>
                      <span>Detour: {routeData.route?.detourFactor}x</span>
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>
                      Garis lurus: {routeData.route?.straightDistanceMeters}m | Penalti detour riil diterapkan otomatis ke valuasi.
                    </div>
                    {routeData.geocoded?.formattedAddress && (
                      <div style={{ color: "var(--text-secondary)", fontSize: "0.65rem", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        📍 {routeData.geocoded.formattedAddress}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Report & Verdict */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Verdict Score Card */}
          <div
            className="radar-card"
            style={{
              padding: "1.75rem",
              borderLeft: isSteal ? "5px solid var(--tier-steal)" : isOverpriced ? "5px solid var(--tier-overpriced)" : "5px solid var(--tier-fair)",
              background: "rgba(17, 24, 39, 0.95)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700, color: "var(--text-muted)" }}>
                  Hasil Audit Algoritma
                </div>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 900,
                    marginTop: "0.2rem",
                    color: isSteal ? "var(--tier-steal)" : isOverpriced ? "var(--tier-overpriced)" : "var(--tier-fair)",
                  }}
                >
                  {isSteal ? "🟢 STEAL / SANGAT MURAH" : isOverpriced ? "🔴 KEMAHALAN / OVERPRICED" : "🟡 HARGA WAJAR PASAR"}
                </div>
              </div>

              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  padding: "0.4rem 0.75rem",
                  borderRadius: "8px",
                  background: isSteal ? "rgba(16, 185, 129, 0.15)" : isOverpriced ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                  color: isSteal ? "var(--tier-steal)" : isOverpriced ? "var(--tier-overpriced)" : "var(--tier-fair)",
                }}
              >
                {valuation.discountPercent > 0 ? `Hemat ${valuation.discountPercent}%` : `Markup +${Math.abs(valuation.discountPercent)}%`}
              </div>
            </div>

            {/* Price Comparison Block */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", padding: "1rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", marginBottom: "1.25rem" }}>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Harga Ditawarkan:</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  Rp {advertisedRent.toLocaleString("id-ID")}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Nilai Wajar Pasar (Fair Value):</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--accent-radar)" }}>
                  Rp {valuation.fairValue.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            {/* Deconstruction Details */}
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>• Nilai Kamar Kosong {districts[districtKey]?.name}:</span>
                <span style={{ fontWeight: 600 }}>Rp {valuation.breakdown.baseRent.toLocaleString("id-ID")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>• Tambahan Fasilitas:</span>
                <span style={{ color: "var(--tier-steal)", fontWeight: 600 }}>+Rp {valuation.breakdown.amenitiesTotal.toLocaleString("id-ID")}</span>
              </div>
              {valuation.breakdown.transitPenalty > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>• Penalti Jarak ({distanceToTransit}m):</span>
                  <span style={{ color: "var(--tier-overpriced)", fontWeight: 600 }}>-Rp {valuation.breakdown.transitPenalty.toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Negotiation WhatsApp Helper */}
          <div className="radar-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <MessageCircle size={15} color="var(--accent-radar)" />
                <span>Template Nego WhatsApp ke Pemilik:</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "0.35rem 0.65rem",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: copied ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)",
                  color: copied ? "var(--tier-steal)" : "var(--text-primary)",
                  border: "none",
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? "Tersalin!" : "Salin Pesan"}</span>
              </button>
            </div>

            <div
              style={{
                padding: "0.85rem",
                borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                fontFamily: "var(--font-sans)",
              }}
            >
              {negotiationText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
