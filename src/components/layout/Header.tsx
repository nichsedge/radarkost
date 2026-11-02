import React from "react";
import Link from "next/link";
import { Radar, Compass, Calculator } from "lucide-react";

export function Header() {
  return (
    <header style={{
      borderBottom: "1px solid var(--border-subtle)",
      background: "rgba(11, 15, 23, 0.8)",
      backdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      padding: "0.85rem 1.5rem"
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{
            background: "linear-gradient(135deg, #10B981, #059669)",
            padding: "0.45rem",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(16, 185, 129, 0.3)"
          }}>
            <Radar size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span>RADAR</span>
              <span style={{ color: "var(--accent-radar)" }}>KOST</span>
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", letterSpacing: "0.02em" }}>
              Jakarta Fair-Value Radar
            </div>
          </div>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "1.2rem", fontSize: "0.88rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-primary)", fontWeight: 500 }}>
            <Compass size={16} color="var(--accent-radar)" />
            <span>Hub Radar</span>
          </Link>
          <a
            href="#fair-value-calculator"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)" }}
          >
            <Calculator size={16} />
            <span>Valuation Model</span>
          </a>
          <span style={{
            padding: "0.25rem 0.6rem",
            fontSize: "0.72rem",
            fontWeight: 600,
            borderRadius: "999px",
            background: "rgba(16, 185, 129, 0.15)",
            color: "var(--accent-radar)",
            border: "1px solid rgba(16, 185, 129, 0.3)"
          }}>
            PORT 3005
          </span>
        </nav>
      </div>
    </header>
  );
}
