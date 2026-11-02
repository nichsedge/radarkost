import React from "react";
import { ShieldCheck, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--border-subtle)",
      marginTop: "4rem",
      padding: "2.5rem 1.5rem",
      color: "var(--text-muted)",
      fontSize: "0.82rem",
      background: "rgba(11, 15, 23, 0.95)"
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1.5rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <ShieldCheck size={18} color="var(--accent-radar)" />
          <span>
            <strong>RadarKost</strong> — Direct-from-owner data with hedonic fair-value scoring. No broker fees.
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Cpu size={14} /> Powered by Bun & Next.js 16
          </span>
          <span>•</span>
          <span>Integrated with <code>indoscraping</code></span>
        </div>
      </div>
    </footer>
  );
}
