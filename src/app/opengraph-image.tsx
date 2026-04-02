import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MIP Land — Interactive Monad Improvement Proposals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: 300,
              color: "#1a1714",
              letterSpacing: "-2px",
            }}
          >
            MIP Land
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 300,
              color: "#6b6259",
              maxWidth: "700px",
              textAlign: "center",
              lineHeight: "1.4",
            }}
          >
            Interactive explainers for Monad Improvement Proposals
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "24px",
            }}
          >
            {["MIP-3", "MIP-4", "MIP-8"].map((mip) => (
              <div
                key={mip}
                style={{
                  padding: "12px 32px",
                  borderRadius: "12px",
                  border: "2px solid #e2ddd7",
                  fontSize: "20px",
                  fontWeight: 500,
                  color: "#1a1714",
                  fontFamily: "monospace",
                }}
              >
                {mip}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
