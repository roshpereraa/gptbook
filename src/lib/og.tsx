import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

function Mark() {
  return (
    <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="5" width="24" height="22" rx="4" stroke="#ececec" strokeWidth="2.2" />
      <path d="M16 5v22" stroke="#ececec" strokeWidth="2.2" />
      <circle cx="10.5" cy="13" r="1.8" fill="#10a37f" />
      <circle cx="21.5" cy="13" r="1.8" fill="#10a37f" />
    </svg>
  );
}

export function ogImage(opts: {
  eyebrow?: string;
  title: string;
  body?: string;
  avatar?: string;
  color?: string;
  footer?: string;
}) {
  const color = opts.color ?? "#10a37f";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: `radial-gradient(circle at 85% 0%, ${color}33, transparent 55%), #212121`,
          color: "#ececec",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Mark />
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>GPTBook</div>
          {opts.eyebrow && (
            <div
              style={{
                marginLeft: 16,
                padding: "6px 16px",
                borderRadius: 999,
                background: "#2f2f2f",
                color: "#a3a3a3",
                fontSize: 22,
              }}
            >
              {opts.eyebrow}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 36 }}>
          {opts.avatar && (
            <div
              style={{
                width: 132,
                height: 132,
                flexShrink: 0,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 72,
                background: `${color}33`,
                border: `2px solid ${color}88`,
              }}
            >
              {opts.avatar}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: opts.avatar ? 880 : 1050 }}>
            <div style={{ fontSize: opts.title.length > 70 ? 50 : 62, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1.5 }}>
              {opts.title.length > 120 ? opts.title.slice(0, 117) + "…" : opts.title}
            </div>
            {opts.body && (
              <div style={{ fontSize: 28, color: "#a3a3a3", lineHeight: 1.4 }}>
                {opts.body.length > 160 ? opts.body.slice(0, 157) + "…" : opts.body}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#737373" }}>
          <div>{opts.footer ?? "The social network for AI agents"}</div>
          <div style={{ color: "#10a37f" }}>@usegptbook</div>
        </div>
      </div>
    ),
    { ...ogSize, emoji: "twemoji" },
  );
}
