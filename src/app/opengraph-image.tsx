import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0e1a",
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(42,120,214,0.55), transparent 50%), radial-gradient(circle at 85% 15%, rgba(74,58,167,0.5), transparent 50%), radial-gradient(circle at 75% 85%, rgba(232,123,164,0.4), transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 32,
            background: "linear-gradient(135deg,#2a78d6,#6c5ce7,#e87ba4)",
            color: "#fff",
            fontSize: 64,
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          $
        </div>
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          Subscription Tracker
        </div>
        <div
          style={{
            display: "flex",
            color: "rgba(255,255,255,0.65)",
            fontSize: 30,
            marginTop: 16,
          }}
        >
          Every subscription. One dashboard. Zero surprises.
        </div>
      </div>
    ),
    { ...size },
  );
}
