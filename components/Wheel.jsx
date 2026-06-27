"use client";
import { useRef } from "react";

// ponytail: SVG + trig radial, no D3. Add d3-shape only if the layout fights back.
// Palette harmonised with the vermilion accent — warm-leaning, distinct hues.
const COLORS = [
  "#e0533a", "#e08a2e", "#cf9b3a", "#6ba368", "#3fa392", "#3d87c9",
  "#5b6ee0", "#8a63d2", "#c75ca6", "#d6517a", "#c2563f", "#4a9d7f", "#7d8cc4",
];
const LABEL_FONT = "Inter, ui-sans-serif, system-ui, sans-serif";
const PAPER = "#ffffff";
const INK = "#2a241f";
const SIZE = 1000;
const CX = SIZE / 2;
const CY = SIZE / 2;
const WORD_R = 165;
const LEAF_R0 = 275;
const LEAF_STEP = 50;
const MAX_LEAVES = 3; // wheel is the gestalt; full lists live in the columns below
// Horizontal padding so long leaf labels never clip at the frame edge.
const PAD = 175;
const VBX = -PAD;
const VBW = SIZE + PAD * 2;

const clip = (s, n = 26) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export default function Wheel({ seed, questions }) {
  const ref = useRef(null);

  const entries = Object.entries(questions).filter(([, v]) => v.length);
  const nodes = entries.map(([word, items], i) => {
    const a = (i / entries.length) * 2 * Math.PI - Math.PI / 2;
    const wx = CX + Math.cos(a) * WORD_R;
    const wy = CY + Math.sin(a) * WORD_R;
    const shown = items.slice(0, MAX_LEAVES);
    const rOffset = (i % 2) * 30; // stagger alternating spokes so neighbours interleave
    const leaves = shown.map((t, j) => {
      const r = LEAF_R0 + rOffset + j * LEAF_STEP;
      const spread = (j - (shown.length - 1) / 2) * 0.26;
      const la = a + spread;
      const x = CX + Math.cos(la) * r;
      const y = CY + Math.sin(la) * r;
      return { t, x, y, right: x >= CX };
    });
    return { word, color: COLORS[i % COLORS.length], wx, wy, leaves };
  });

  function exportPng() {
    const svg = ref.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const src = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(src);
      const c = document.createElement("canvas");
      c.width = VBW;
      c.height = SIZE;
      const ctx = c.getContext("2d");
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, VBW, SIZE);
      ctx.drawImage(img, 0, 0, VBW, SIZE);
      const a = document.createElement("a");
      a.download = `askthecrowd-${seed.replace(/\s+/g, "-")}.png`;
      a.href = c.toDataURL("image/png");
      a.click();
    };
    img.src = src;
  }

  function exportSvg() {
    const svg = ref.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `askthecrowd-${seed.replace(/\s+/g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="wheelwrap">
      <div className="wheelbar">
        <h2>The question wheel</h2>
        <div className="btnrow">
          <button type="button" aria-label="Download wheel as SVG" className="ghost small" onClick={exportSvg}>
            ↓ SVG
          </button>
          <button type="button" aria-label="Download wheel as PNG" className="ghost" onClick={exportPng}>
            ↓ PNG
          </button>
        </div>
      </div>
      <div className="wheelscroll">
        <svg
          ref={ref}
          viewBox={`${VBX} 0 ${VBW} ${SIZE}`}
          className="wheel"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-labelledby="wheel-title"
        >
          <title id="wheel-title">{`Question wheel for "${seed}"`}</title>
          <rect x={VBX} y={0} width={VBW} height={SIZE} fill={PAPER} />

          {/* faint concentric guide rings for depth */}
          <circle cx={CX} cy={CY} r={WORD_R + 8} fill="none" stroke="#efe9e0" strokeWidth="1" />
          <circle cx={CX} cy={CY} r={LEAF_R0 + LEAF_STEP} fill="none" stroke="#f3ede4" strokeWidth="1" />

          {nodes.map((n, i) => (
            <g key={"s" + i}>
              <line x1={CX} y1={CY} x2={n.wx} y2={n.wy} stroke={n.color} strokeWidth="2.5" opacity="0.5" />
              {n.leaves.map((l, j) => (
                <g key={j}>
                  <line x1={n.wx} y1={n.wy} x2={l.x} y2={l.y} stroke={n.color} strokeWidth="1.2" opacity="0.32" />
                  <circle cx={l.x} cy={l.y} r="4" fill={n.color} />
                  <text
                    x={l.x}
                    y={l.y}
                    dx={l.right ? 8 : -8}
                    dy="4"
                    fontSize="13"
                    fontFamily={LABEL_FONT}
                    textAnchor={l.right ? "start" : "end"}
                    fill={INK}
                  >
                    {clip(l.t)}
                  </text>
                </g>
              ))}
            </g>
          ))}

          {nodes.map((n, i) => (
            <g key={"w" + i}>
              <circle cx={n.wx} cy={n.wy} r="34" fill={n.color} opacity="0.16" />
              <circle cx={n.wx} cy={n.wy} r="27" fill={n.color} />
              <text
                x={n.wx}
                y={n.wy}
                dy="4.5"
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fontFamily={LABEL_FONT}
                fill="#fff"
              >
                {n.word}
              </text>
            </g>
          ))}

          <circle cx={CX} cy={CY} r="62" fill={INK} opacity="0.1" />
          <circle cx={CX} cy={CY} r="54" fill={INK} />
          <text
            x={CX}
            y={CY}
            dy="5"
            textAnchor="middle"
            fontSize="17"
            fontWeight="800"
            fontFamily={LABEL_FONT}
            fill="#fff"
          >
            {clip(seed, 14)}
          </text>
          <text x={VBX + VBW - 14} y={SIZE - 14} textAnchor="end" fontSize="12" fill="#c4bdb0">
            made with AskTheCrowd
          </text>
        </svg>
      </div>
    </div>
  );
}
