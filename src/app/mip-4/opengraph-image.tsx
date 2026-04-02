import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MIP-4: Reserve Balance Introspection";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const reserve = 33; // reserve line position as %
  const barHeight = 27; // balance below reserve

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
            color: "#2a7d6a",
            fontFamily: "monospace",
            letterSpacing: "2px",
            marginBottom: "20px",
          }}
        >
          MIP-4
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
          Reserve Balance Introspection
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
          Detect reserve violations mid-execution
        </div>
        {/* Balance bar with reserve line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              width: "120px",
              height: "120px",
              background: "#e2ddd7",
              borderRadius: "12px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                width: "100%",
                height: `${barHeight}%`,
                background: "#c4653a",
                borderRadius: "0 0 12px 12px",
              }}
            />
            {/* Reserve line indicator - positioned as a separate element */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: `${reserve}%`,
                height: "2px",
                background: "#c4653a",
                display: "flex",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "16px",
                color: "#c4653a",
                fontWeight: 600,
              }}
            >
              dippedIntoReserve() → true
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "14px",
                color: "#9b9084",
              }}
            >
              Balance below 10 MON reserve
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
