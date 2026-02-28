import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PC Bottleneck Analyzer - Free AI-Powered Hardware Analysis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0f",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(34,209,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,209,238,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Score circle */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            border: "5px solid rgba(34,209,238,0.25)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#22d1ee",
              lineHeight: 1,
            }}
          >
            72
          </span>
          <span style={{ fontSize: 18, color: "#8888a0", marginTop: 4 }}>
            / 100
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#e4e4ef",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          PC Bottleneck Analyzer
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 24,
            color: "#8888a0",
            margin: 0,
            marginTop: 12,
          }}
        >
          Free AI-Powered Hardware Analysis
        </p>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background:
              "linear-gradient(90deg, transparent, #22d1ee, transparent)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
