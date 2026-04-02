import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MIP-3: Linear Memory";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  // Simplified cost curve bars
  const bars = [
    { label: "32B", quadratic: 10, linear: 10 },
    { label: "1KB", quadratic: 20, linear: 15 },
    { label: "32KB", quadratic: 50, linear: 25 },
    { label: "1MB", quadratic: 90, linear: 40 },
    { label: "4MB", quadratic: 100, linear: 55 },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          background: "#f8f6f3",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "18px",
            fontWeight: 500,
            color: "#c4653a",
            fontFamily: "monospace",
            letterSpacing: "2px",
            marginBottom: "20px",
          }}
        >
          MIP-3
        </div>
        <div
          style={{
            fontSize: "56px",
            fontWeight: 300,
            color: "#1a1714",
            letterSpacing: "-1px",
            marginBottom: "16px",
          }}
        >
          Linear Memory
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 300,
            color: "#6b6259",
            marginBottom: "40px",
            maxWidth: "700px",
            textAlign: "center",
            lineHeight: "1.4",
          }}
        >
          Replacing quadratic memory costs with a linear model
        </div>
        {/* Mini bar chart */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "24px",
            height: "120px",
          }}
        >
          {bars.map((bar) => (
            <div
              key={bar.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-end", gap: "4px" }}>
                <div
                  style={{
                    width: "24px",
                    height: `${bar.quadratic}px`,
                    borderRadius: "4px 4px 0 0",
                    background: "#c4653a",
                  }}
                />
                <div
                  style={{
                    width: "24px",
                    height: `${bar.linear}px`,
                    borderRadius: "4px 4px 0 0",
                    background: "#2a7d6a",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#9b9084",
                  fontFamily: "monospace",
                }}
              >
                {bar.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
