import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

// The share image for every page (pages without their own inherit the root one).
// Colours are the light theme's tokens from globals.css; ImageResponse can't read CSS
// variables. The bars echo the home page trace: hue only where it means a kind of step.
export const alt = `${site.name}: interfaces for AI tools, with the thinking shown.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const color = {
  paper: "#f4f5f7",
  rule: "#d8dce3",
  ink: "#1a1f2b",
  slate: "#5b6272",
  llm: "#2a78d6",
  tool: "#eb6834",
  retrieval: "#1baf7a",
};

// A short run: start and width as fractions of the axis.
const bars = [
  { at: 0.0, w: 1.0, fill: "transparent", stroke: color.ink },
  { at: 0.01, w: 0.19, fill: color.llm },
  { at: 0.21, w: 0.07, fill: color.retrieval },
  { at: 0.29, w: 0.38, fill: color.tool },
  { at: 0.3, w: 0.37, fill: color.llm },
  { at: 0.3, w: 0.34, fill: color.tool },
  { at: 0.69, w: 0.31, fill: color.llm },
];

// The site's own typeface. The image renderer reads .woff but not variable fonts or .woff2,
// so these are Fontsource's static cuts (read at build time; the image is static).
const fontDir = join(process.cwd(), "node_modules/@fontsource/instrument-sans/files");
const fonts = Promise.all(
  ([500, 600] as const).map(async (weight) => ({
    name: "Instrument Sans",
    data: await readFile(join(fontDir, `instrument-sans-latin-${weight}-normal.woff`)),
    weight,
    style: "normal" as const,
  })),
);

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: color.paper,
        color: color.ink,
        fontFamily: "Instrument Sans",
        fontWeight: 500,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28 }}>
        <span style={{ fontWeight: 600 }}>Jun Liu</span>
        <span style={{ color: color.slate }}>Design engineer, Hong Kong</span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 88,
          fontWeight: 600,
          lineHeight: 1.0,
          letterSpacing: -3.5,
          maxWidth: 980,
        }}
      >
        Interfaces for AI tools, with the thinking shown.
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          borderTop: `2px solid ${color.rule}`,
          paddingTop: 22,
        }}
      >
        {bars.map((b, i) => (
          <div key={i} style={{ display: "flex", height: 14, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: `${b.at * 100}%`,
                width: `${b.w * 100}%`,
                height: 14,
                borderRadius: 3,
                background: b.fill,
                border: b.stroke ? `2px solid ${b.stroke}` : "none",
                opacity: b.stroke ? 0.35 : 1,
              }}
            />
          </div>
        ))}
      </div>
    </div>,
    { ...size, fonts: await fonts },
  );
}
