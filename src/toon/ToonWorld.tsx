import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// ---------- мир в стиле «2D-персонажи в ярком 3D» ----------
export const TOON = {
  sky1: "#8fd8ff",
  sky2: "#d7f2ff",
  grass1: "#5fd06a",
  grass2: "#3aa84e",
  road: "#6a6f7a",
  ink: "#232a33",
  skin: "#ffcf9e",
  cloth: "#3f7fd0",
  wood: "#c88a4a",
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Камера: плавный проезд по сцене (доли экрана)
export const lerpCam = (f: number, from: [number, number, number], to: [number, number, number], dur = 75) => {
  const p = interpolate(f, [0, dur], [0, 1], clamp);
  const e = p * p * (3 - 2 * p);
  return [from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e, from[2] + (to[2] - from[2]) * e] as [number, number, number];
};

// ---------- фон: небо, солнце, холмы, дорога ----------
export const ToonWorld: React.FC<{ cam?: [number, number, number]; night?: boolean; road?: boolean }> = ({
  cam = [0, 0, 1], night = false, road = true,
}) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [cx, cy, cz] = cam;
  const sky = night ? ["#0b1a2e", "#16324f"] : [TOON.sky1, TOON.sky2];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 62%, ${TOON.grass2} 62%, ${TOON.grass1} 100%)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${cz}) translate(${cx * 40}%, ${cy * 40}%)`, transformOrigin: "50% 60%" }}>
        {/* солнце / луна */}
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
          <circle cx={width * 0.78} cy={height * 0.17} r={110} fill={night ? "#dfe9ff" : "#fff3b0"} opacity={0.95} />
          <circle cx={width * 0.78} cy={height * 0.17} r={190} fill={night ? "#dfe9ff" : "#fff3b0"} opacity={0.22} />
          {/* облака */}
          {[0.18, 0.44, 0.62].map((x, i) => (
            <g key={i} transform={`translate(${width * x + Math.sin((f + i * 40) / 60) * 16} ${height * (0.1 + i * 0.05)})`} opacity={night ? 0.35 : 0.92}>
              <ellipse cx={0} cy={0} rx={86} ry={34} fill="#ffffff" />
              <ellipse cx={-54} cy={10} rx={54} ry={26} fill="#ffffff" />
              <ellipse cx={58} cy={8} rx={48} ry={24} fill="#ffffff" />
            </g>
          ))}
          {/* холмы */}
          <path d={`M0 ${height * 0.62} Q ${width * 0.22} ${height * 0.5} ${width * 0.45} ${height * 0.62} T ${width} ${height * 0.6} L ${width} ${height} L 0 ${height} Z`} fill={night ? "#12301f" : "#54c163"} />
          <path d={`M0 ${height * 0.66} Q ${width * 0.3} ${height * 0.56} ${width * 0.62} ${height * 0.67} T ${width} ${height * 0.64} L ${width} ${height} L 0 ${height} Z`} fill={night ? "#0c2217" : "#3fae52"} />
          {road && (
            <>
              <path d={`M ${width * 0.34} ${height * 0.64} L ${width * 0.66} ${height * 0.64} L ${width * 0.95} ${height} L ${width * 0.05} ${height} Z`} fill={TOON.road} opacity={night ? 0.5 : 1} />
              {[0, 1, 2, 3, 4].map((i) => {
                const p = (i + (f % 30) / 30) / 5;
                const y = height * 0.64 + p * height * 0.36;
                const w = 10 + p * 46;
                return <rect key={i} x={width / 2 - w / 2} y={y} width={w} height={8 + p * 30} rx={4} fill="#f2f2e8" opacity={0.85} />;
              })}
            </>
          )}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ---------- персонаж: 2D-контурная фигура, ставится в любую точку кадра ----------
export type ToonGuyProps = {
  x?: number; // 0..1 по ширине экрана
  y?: number; // доля высоты (низ фигуры)
  scale?: number;
  mood?: "happy" | "worried" | "shock" | "sad" | "smug";
  look?: number; // -1 влево, 1 вправо
  arm?: "none" | "point" | "raise" | "hold";
  shirt?: string;
  skin?: string;
  hair?: string;
  talk?: number; // 0..1 открытость рта
  flip?: boolean;
  skirt?: boolean; // платье вместо брюк
  longHair?: boolean; // длинные волосы
};

export const ToonGuy: React.FC<ToonGuyProps> = ({
  x = 0.5, y = 0.9, scale = 1, mood = "happy", look = 0, arm = "none",
  shirt = TOON.cloth, skin = TOON.skin, hair = "#6b3f2a", talk = 0, flip = false,
  skirt = false, longHair = false,
}) => {
  const ink = TOON.ink;
  const eyeY = 150;
  const browY = mood === "shock" ? 124 : 130;
  const mouth =
    mood === "shock" ? `M172 196 q28 ${14 + talk * 30} 56 0 q-28 ${-10 - talk * 12} -56 0`
      : mood === "sad" ? `M176 204 q24 -14 48 0`
        : mood === "smug" ? `M172 198 q28 14 56 -2`
          : `M174 194 q26 ${8 + talk * 26} 52 0`;
  const armPath =
    arm === "point"
      ? "M158 300 q-56 6 -86 -44 q-8 -14 6 -20 q14 -6 22 8 q20 34 58 26 Z"
      : arm === "raise"
        ? "M158 300 q-44 -46 -26 -92 q6 -16 22 -10 q14 6 8 22 q-12 32 12 62 Z"
        : "M162 296 q-26 54 -14 118 q2 14 18 14 q16 0 16 -16 q0 -60 6 -104 Z";
  return (
    <div style={{ position: "absolute", left: `${x * 100}%`, top: `${y * 100}%`, transform: `translate(-50%, -100%) scale(${(flip ? -1 : 1) * scale}, ${scale})`, transformOrigin: "50% 100%" }}>
      <svg width={400} height={660} viewBox="0 0 400 660">
        <ellipse cx={200} cy={648} rx={112} ry={16} fill="rgba(20,25,35,0.18)" />
        {/* ноги */}
        <path d="M168 452 L166 630 q0 12 14 12 q14 0 14 -12 L194 452 Z" fill="#2c3a52" stroke={ink} strokeWidth={7} strokeLinejoin="round" />
        <path d="M206 452 L208 630 q0 12 14 12 q14 0 14 -12 L232 452 Z" fill="#2c3a52" stroke={ink} strokeWidth={7} strokeLinejoin="round" />
        <path d="M148 626 q22 -8 44 0 q8 16 -6 18 l-36 0 q-14 -2 -2 -18 Z" fill="#20222b" stroke={ink} strokeWidth={6} />
        <path d="M208 626 q22 -8 44 0 q12 16 -2 18 l-36 0 q-14 -2 -6 -18 Z" fill="#20222b" stroke={ink} strokeWidth={6} />
        {/* платье */}
        {skirt && <path d="M150 396 q50 18 100 0 l40 92 q-90 26 -180 0 Z" fill={shirt} stroke={ink} strokeWidth={8} strokeLinejoin="round" />}
        {/* туловище */}
        <path d="M156 250 q44 -22 88 0 l16 168 q-60 22 -120 0 Z" fill={shirt} stroke={ink} strokeWidth={8} strokeLinejoin="round" />
        {/* руки */}
        <path d={armPath} fill={shirt} stroke={ink} strokeWidth={8} strokeLinejoin="round" />
        <path d="M238 296 q26 54 14 118 q-2 14 -18 14 q-16 0 -16 -16 q0 -60 -6 -104 Z" fill={shirt} stroke={ink} strokeWidth={8} strokeLinejoin="round" />
        <circle cx={arm === "point" ? 74 : arm === "raise" ? 138 : 158} cy={arm === "point" ? 254 : arm === "raise" ? 202 : 428} r={16} fill={skin} stroke={ink} strokeWidth={7} />
        <circle cx={252} cy={428} r={16} fill={skin} stroke={ink} strokeWidth={7} />
        {/* длинные волосы (сзади) */}
        {longHair && <path d="M104 130 q-22 150 6 240 q26 26 52 4 l-4 -150 Z M296 130 q22 150 -6 240 q-26 26 -52 4 l4 -150 Z" fill={hair} stroke={ink} strokeWidth={8} strokeLinejoin="round" />}
        {/* шея */}
        <rect x={184} y={222} width={32} height={40} rx={10} fill={skin} stroke={ink} strokeWidth={7} />
        {/* голова */}
        <path d="M200 40 q84 0 88 94 q4 92 -88 96 q-92 -4 -88 -96 q4 -94 88 -94 Z" fill={skin} stroke={ink} strokeWidth={9} />
        {/* волосы */}
        <path d="M112 128 q4 -86 88 -88 q84 2 88 88 q-28 -38 -88 -38 q-60 0 -88 38 Z" fill={hair} stroke={ink} strokeWidth={8} strokeLinejoin="round" />
        {/* глаза */}
        <ellipse cx={200 + look * 10 - 32} cy={eyeY} rx={20} ry={23} fill="#ffffff" stroke={ink} strokeWidth={7} />
        <ellipse cx={200 + look * 10 + 32} cy={eyeY} rx={20} ry={23} fill="#ffffff" stroke={ink} strokeWidth={7} />
        <circle cx={200 + look * 10 - 32 + look * 7} cy={eyeY + 3} r={mood === "shock" ? 7 : 10} fill={ink} />
        <circle cx={200 + look * 10 + 32 + look * 7} cy={eyeY + 3} r={mood === "shock" ? 7 : 10} fill={ink} />
        {/* брови */}
        <path d={`M${200 + look * 10 - 52} ${browY} q20 -8 40 -2`} stroke={ink} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d={`M${200 + look * 10 + 12} ${browY} q20 -6 40 2`} stroke={ink} strokeWidth={7} fill="none" strokeLinecap="round" />
        {/* рот */}
        <path d={mouth} stroke={ink} strokeWidth={8} fill={mood === "shock" ? "#7a2b2b" : "none"} strokeLinecap="round" />
      </svg>
    </div>
  );
};

