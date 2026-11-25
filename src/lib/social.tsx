import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { cohortMarks, type Tone } from "@/lib/cohort-marks";
import type { TrackSlug } from "@/lib/world";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const colors: Record<Tone, string> = { line: "#ffffff", soft: "#808080", accent: "#bb0000", deep: "#8b0000" };

/** A social preview: the page's title, and a track's logo where it has one. */
export function socialImage(title: string, note: string, slug?: TrackSlug) {
  const art = cohortMarks[slug ?? "research"]
    .map((s) =>
      "points" in s
        ? `<polygon points="${s.points}" fill="${colors[s.tone]}"/>`
        : `<path d="${s.path}" stroke="${colors[s.tone]}" stroke-width="${s.width}" fill="none"/>`,
    )
    .join("");
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${art}</svg>`)}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "64px 72px",
          color: "#fff",
          background: "radial-gradient(circle at 84% 100%, #8b0000, #000 62%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", width: slug ? 700 : 760 }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 30 }}>
            <div style={{ width: 20, height: 20, background: "#bb0000", marginRight: 18 }} />
            {site.name}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: title.length > 24 ? 80 : 104, lineHeight: 1, letterSpacing: "-0.04em" }}>{title}</div>
            <div style={{ fontSize: 30, marginTop: 28, color: "#c3cace", lineHeight: 1.35 }}>{note}</div>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={300} height={300} alt="" />
      </div>
    ),
    size,
  );
}
