import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

// The share image for every page (pages without their own inherit the root one).
// Colours are the dark theme's tokens from globals.css; ImageResponse can't read CSS variables.
export const alt = `${site.name}: interfaces for AI tools, with the thinking shown.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const color = {
  background: "#09090b",
  surface: "#131316",
  border: "#2a2a30",
  foreground: "#f4f4f5",
  muted: "#a1a1aa",
  accent: "#818cf8",
};

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: color.background,
        color: color.foreground,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 26,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: color.accent,
        }}
      >
        Design engineering
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 600, lineHeight: 1.08 }}>
          Interfaces for AI tools, with the thinking shown.
        </div>
        <div style={{ display: "flex", fontSize: 32, color: color.muted }}>
          Run explorer · Returns assistant · Design system
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignSelf: "flex-start",
          padding: "12px 24px",
          borderRadius: 999,
          border: `2px solid ${color.border}`,
          background: color.surface,
          fontSize: 26,
          color: color.muted,
        }}
      >
        playground.jun-liu.net
      </div>
    </div>,
    size,
  );
}
