import { ImageResponse } from "next/og";
import { getResults } from "../../../lib/pipeline.js";
import { topQuestions } from "../../../lib/export.js";

export const runtime = "nodejs";

// Per-keyword social card. Server-rendered (Satori) so shared links always look
// intentional — the highest-leverage share artifact, independent of the browser.
export async function GET(req) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();

  let total = 0;
  let samples = [];
  if (q) {
    try {
      const r = await getResults(q);
      total = r?.total || 0;
      samples = topQuestions(r, 5);
    } catch {
      /* fall through to default card */
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fffdf8",
          padding: "64px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#d8442f" }}>
          Ask<span style={{ color: "#1b1813" }}>TheCrowd</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: "#6b6358" }}>What people ask about</div>
          <div style={{ fontSize: 76, fontWeight: 800, color: "#1b1813", lineHeight: 1.05, marginTop: 8 }}>
            “{q || "any keyword"}”
          </div>
          {total > 0 && (
            <div style={{ fontSize: 30, color: "#d8442f", marginTop: 14 }}>
              {total} questions & searches people make
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", marginTop: 26 }}>
            {samples.map((s, i) => (
              <div key={i} style={{ fontSize: 26, color: "#3a352d", marginTop: 6 }}>
                • {s.length > 64 ? s.slice(0, 63) + "…" : s}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "#9a917f" }}>
          Free · open-source · no login — askthecrowd
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
