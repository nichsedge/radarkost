import React from "react";
import type { DealTier } from "@/lib/valuation/types";
import { Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";

interface DealScoreBadgeProps {
  tier: DealTier;
  discountPercent?: number;
  ratio?: number;
  size?: "sm" | "md" | "lg";
}

export function DealScoreBadge({ tier, discountPercent = 0, size = "md" }: DealScoreBadgeProps) {
  const configs = {
    steal: {
      label: `STEAL • ${Math.abs(discountPercent)}% Murah`,
      icon: Sparkles,
      color: "var(--tier-steal)",
      bg: "var(--tier-steal-bg)",
      border: "rgba(16, 185, 129, 0.35)",
    },
    fair: {
      label: "FAIR MARKET",
      icon: CheckCircle2,
      color: "var(--tier-fair)",
      bg: "var(--tier-fair-bg)",
      border: "rgba(245, 158, 11, 0.35)",
    },
    overpriced: {
      label: `PREMIUM • +${Math.abs(discountPercent)}%`,
      icon: AlertTriangle,
      color: "var(--tier-overpriced)",
      bg: "var(--tier-overpriced-bg)",
      border: "rgba(239, 68, 68, 0.35)",
    },
  };

  const config = configs[tier] || configs.fair;
  const Icon = config.icon;

  const fontSizes = {
    sm: "0.68rem",
    md: "0.75rem",
    lg: "0.85rem",
  };

  const padding = {
    sm: "0.2rem 0.5rem",
    md: "0.3rem 0.65rem",
    lg: "0.4rem 0.85rem",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        fontSize: fontSizes[size],
        padding: padding[size],
        fontWeight: 700,
        borderRadius: "999px",
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
      }}
    >
      <Icon size={size === "sm" ? 11 : size === "md" ? 13 : 15} />
      <span>{config.label}</span>
    </span>
  );
}
