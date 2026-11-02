import React from "react";
import type { KostListing } from "@/lib/valuation/types";
import { DealScoreBadge } from "./DealScoreBadge";
import { 
  Wind, 
  Bath, 
  Zap, 
  Wifi, 
  MapPin, 
  Footprints, 
  MessageCircle, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface KostCardProps {
  kost: KostListing;
  onOpenCalculator?: (kost: KostListing) => void;
}

export function KostCard({ kost, onOpenCalculator }: KostCardProps) {
  const v = kost.valuation;
  const isSteal = v?.dealTier === "steal";

  // Pre-formatted WhatsApp text
  const waGreeting = encodeURIComponent(
    `Halo Bu/Pak, saya melihat listing "${kost.title}" via RadarKost. Apakah kamar masih tersedia untuk disewa? Mau tanya apakah listrik token atau sudah termasuk, dan kamar mandi dalam? Terima kasih!`
  );
  const waUrl = kost.ownerPhone ? `https://wa.me/${kost.ownerPhone}?text=${waGreeting}` : "";

  return (
    <div
      className="radar-card"
      style={{
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        borderLeft: isSteal ? "4px solid var(--tier-steal)" : undefined,
      }}
    >
      <div>
        {/* Top Badges */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "0.7rem",
                padding: "0.15rem 0.5rem",
                borderRadius: "4px",
                background: "rgba(255, 255, 255, 0.08)",
                color: "var(--text-secondary)",
                fontWeight: 600,
              }}
            >
              {kost.type}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <MapPin size={12} />
              {kost.districtName}
            </span>
          </div>

          {v && <DealScoreBadge tier={v.dealTier} discountPercent={v.discountPercent} size="sm" />}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            lineHeight: 1.35,
            color: "var(--text-primary)",
            marginBottom: "0.6rem",
          }}
        >
          {kost.title}
        </h3>

        {/* Pricing Matrix */}
        <div style={{ marginBottom: "0.85rem" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
            <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Rp {kost.priceMonthly.toLocaleString("id-ID")}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/ bulan</span>
          </div>

          {v && (
            <div style={{ fontSize: "0.76rem", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Fair Value:</span>
              <span style={{ fontWeight: 600, color: isSteal ? "var(--tier-steal)" : "var(--text-secondary)" }}>
                Rp {v.fairValue.toLocaleString("id-ID")}
              </span>
              {v.difference !== 0 && (
                <span style={{ color: isSteal ? "var(--tier-steal)" : "var(--tier-overpriced)", fontSize: "0.7rem", fontWeight: 700 }}>
                  ({v.difference < 0 ? `Hemat Rp ${Math.abs(v.difference).toLocaleString("id-ID")}` : `+Rp ${v.difference.toLocaleString("id-ID")}`})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Amenity Badges */}
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
          {kost.amenities.hasAC && (
            <span style={{ fontSize: "0.72rem", padding: "0.2rem 0.45rem", borderRadius: "6px", background: "rgba(59, 130, 246, 0.12)", color: "#60A5FA", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <Wind size={12} /> AC
            </span>
          )}
          {kost.amenities.hasPrivateBath && (
            <span style={{ fontSize: "0.72rem", padding: "0.2rem 0.45rem", borderRadius: "6px", background: "rgba(168, 85, 247, 0.12)", color: "#C084FC", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <Bath size={12} /> KM Dalam
            </span>
          )}
          {kost.amenities.hasFreeElectricity && (
            <span style={{ fontSize: "0.72rem", padding: "0.2rem 0.45rem", borderRadius: "6px", background: "rgba(245, 158, 11, 0.12)", color: "#FBBF24", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <Zap size={12} /> Free Listrik
            </span>
          )}
          {kost.amenities.hasWifi && (
            <span style={{ fontSize: "0.72rem", padding: "0.2rem 0.45rem", borderRadius: "6px", background: "rgba(16, 185, 129, 0.12)", color: "#34D399", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <Wifi size={12} /> WiFi
            </span>
          )}
        </div>

        {/* Transit Distance */}
        {kost.nearestTransit && (
          <div
            style={{
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              fontSize: "0.76rem",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Footprints size={14} color="var(--accent-radar)" />
              <span>{kost.nearestTransit.nodeName}</span>
            </div>
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              ~{kost.nearestTransit.walkMinutes} mnt ({kost.nearestTransit.distanceMeters}m)
            </span>
          </div>
        )}
      </div>

      {/* Bottom CTA Group */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {/* True Cost of Living summary banner */}
        {v && (
          <button
            type="button"
            onClick={() => onOpenCalculator?.(kost)}
            style={{
              background: "transparent",
              border: "1px dashed rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              padding: "0.45rem 0.65rem",
              color: "var(--text-muted)",
              fontSize: "0.72rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <span>True Outflow (Listrik + Laundry):</span>
            <span style={{ fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
              ~Rp {v.trueMonthlyCost.totalMonthly.toLocaleString("id-ID")}
              <ChevronRight size={12} />
            </span>
          </button>
        )}

        <div style={{ display: "grid", gridTemplateColumns: waUrl ? "1fr auto" : "1fr", gap: "0.5rem" }}>
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.45rem",
                padding: "0.6rem 0.85rem",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "#FFFFFF",
                fontSize: "0.82rem",
                fontWeight: 700,
                boxShadow: "0 2px 10px rgba(16, 185, 129, 0.25)",
              }}
            >
              <MessageCircle size={15} />
              <span>Chat WA Owner</span>
            </a>
          ) : (
            <a
              href={kost.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.45rem",
                padding: "0.6rem 0.85rem",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.1)",
                color: "var(--text-primary)",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              <ExternalLink size={14} />
              <span>Buka Listing</span>
            </a>
          )}

          {waUrl && (
            <a
              href={kost.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Buka listing asli di SewaKost"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.6rem 0.75rem",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
