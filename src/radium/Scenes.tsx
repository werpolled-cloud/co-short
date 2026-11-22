import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { TOON, ToonGuy } from "../toon/ToonWorld";

// Палитра ролика: радиевое зелёное свечение + тёмный фон ночи
export const RAD = "#8bff5a";
export const RAD_DEEP = "#2fbf4a";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const ink = TOON.ink;

const Glow: React.FC<{ x: number; y: number; r?: number; o?: number; c?: string }> = ({ x, y, r = 420, o = 0.5, c = RAD }) => (
  <div style={{ position: "absolute", left: `${x * 100}%`, top: `${y * 100}%`, width: r * 2, height: r * 2, transform: "translate(-50%,-50%)", borderRadius: "50%", background: `radial-gradient(circle, ${c}${Math.round(Math.min(1, Math.max(0, o)) * 255).toString(16).padStart(2, "0")} 0%, transparent 68%)`, pointerEvents: "none" }} />
);

const MB: React.CSSProperties = { fontFamily: "Montserrat, Inter, sans-serif" };

// ---------- 0. титул ----------
export const Title: React.FC<{ f: number; kicker: string; title: string; sub: string }> = ({ f, kicker, title, sub }) => {
  const p = interpolate(f, [0, 16], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 38%, #16321f 0%, #040b06 72%)" }}>
      <Glow x={0.5} y={0.42} r={620} o={0.16 + p * 0.1} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 70px" }}>
        <div style={{ ...MB, color: RAD, fontWeight: 800, letterSpacing: 10, fontSize: 44, opacity: p }}>{kicker}</div>
        <div style={{ ...MB, color: "#f4fff2", fontWeight: 900, fontSize: 118, lineHeight: 0.92, textAlign: "center", marginTop: 26, transform: `scale(${0.94 + p * 0.06})`, textShadow: `0 0 40px ${RAD}55` }}>{title}</div>
        <div style={{ ...MB, color: "#cfe9c9", fontWeight: 700, fontSize: 62, marginTop: 18, opacity: p }}>{sub}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- цех: панели, ночное окно, лампы ----------
const Interior: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#20301f 0%,#16231a 58%,#101a13 100%)" }} />
    {Array.from({ length: 9 }, (_, i) => (
      <div key={i} style={{ position: "absolute", left: `${i * 11.6}%`, top: 0, width: "10.6%", height: "62%", background: i % 2 ? "#243524" : "#1e2e20", borderRight: "4px solid #16221a" }} />
    ))}
    {/* окна в ночь */}
    {[0.2, 0.52].map((x, k) => (
      <div key={k} style={{ position: "absolute", left: `${x * 100}%`, top: "14%", width: 150, height: 260, background: "linear-gradient(180deg,#0b1a2a,#122a3a)", border: "10px solid #2b3d2b", borderRadius: 4 }}>
        {[0, 1].map((c) => [0, 1].map((r) => (
          <div key={`${c}${r}`} style={{ position: "absolute", left: c ? "52%" : "4%", top: r ? "52%" : "4%", width: "44%", height: "44%", background: "radial-gradient(circle at 50% 50%, #16364d, #0a1622)" }} />
        )))}
      </div>
    ))}
    {/* лампы */}
    {[0.16, 0.42, 0.68, 0.9].map((x, i) => (
      <div key={i} style={{ position: "absolute", left: `${x * 100}%`, top: 0, width: 4, height: `calc(14% + ${i % 2 ? 22 : 0}px)`, background: "#3a4a3a" }}>
        <div style={{ position: "absolute", left: -34, bottom: -22, width: 72, height: 30, borderRadius: "50% 50% 40% 40%", background: "#d9c48a", boxShadow: `0 30px 90px 30px ${RAD}22` }} />
      </div>
    ))}
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, transparent 20%, #050b07 96%)" }} />
  </AbsoluteFill>
);

// ---------- 1-2, 22. кисть у губ ----------
export const Brush: React.FC<{ f: number; bar: number; girls: number; lips?: boolean; jar?: boolean; glow?: number; callback?: boolean }> = ({ f, girls, lips = false, jar = false, glow = 0.5 }) => {
  const zoom = interpolate(f, [0, 75], [1.03, 1.1], clamp);
  const lift = lips ? interpolate(f, [6, 26, 52, 75], [0, 120, 120, 30], clamp) : 0;
  const sc = girls === 1 ? 1.35 : 1.05;
  const mouthX = 540, mouthY = 0.96 * 1920 - (660 - 194) * sc;
  return (
    <AbsoluteFill style={{ background: "#16201b" }}>
      <Interior f={f} />
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <div style={{ position: "absolute", left: "-6%", top: "60%", width: "112%", height: "46%", background: "linear-gradient(180deg,#b98a52,#8a5a2f)", borderTop: "10px solid #6d4423" }} />
        <div style={{ position: "absolute", left: "-6%", top: "57.4%", width: "112%", height: "3%", background: "#d9a86a", opacity: 0.6 }} />
        {jar && (
          <div style={{ position: "absolute", left: "68%", top: "44%", width: 170, height: 220, borderRadius: 26, background: "rgba(40,70,50,0.55)", border: "9px solid #3d5a44", boxShadow: `0 0 90px ${RAD}99` }}>
            <div style={{ position: "absolute", inset: 20, borderRadius: 18, background: `radial-gradient(circle at 50% 74%, ${RAD}, ${RAD_DEEP}66 58%, transparent 76%)` }} />
            <div style={{ position: "absolute", left: 26, top: 30, width: 22, height: 130, borderRadius: 12, background: "#ffffff44" }} />
          </div>
        )}
        {Array.from({ length: girls }, (_, i) => {
          const x = girls === 1 ? 0.5 : [0.22, 0.5, 0.78][i];
          return (
            <ToonGuy key={i} x={x} y={0.96} scale={sc} mood={lips ? "happy" : "worried"} look={i === 1 || girls === 1 ? 0 : i ? -1 : 1} skirt longHair
              shirt={["#3b6ea8", "#c0563f", "#5b8f5b"][i % 3]} hair={["#3a2a20", "#7a4a2a", "#241f1c"][i % 3]} talk={0.15} />
          );
        })}
        {lips && (
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <g transform={`translate(${mouthX} ${mouthY - lift}) rotate(14)`}>
              <path d="M0 8 L18 -34 L44 -26 L34 14 Z" fill="#f2ead6" stroke="#8a6a3c" strokeWidth={5} strokeLinejoin="round" />
              <circle cx={22} cy={-16} r={16} fill={RAD} opacity={0.95} />
              <circle cx={22} cy={-16} r={54} fill={RAD} opacity={0.18} />
              <path d="M26 6 L120 250" stroke="#7a4a24" strokeWidth={22} strokeLinecap="round" />
              <path d="M26 6 L120 250" stroke="#b07a3c" strokeWidth={9} strokeLinecap="round" opacity={0.75} />
              <path d="M46 70 q28 -14 44 26" stroke="#e8c48a" strokeWidth={5} fill="none" opacity={0.6} />
            </g>
          </svg>
        )}
      </AbsoluteFill>
      <Glow x={0.5} y={0.42} r={560} o={glow * 0.45} />
    </AbsoluteFill>
  );
};

// ---------- 3-4. девушки светятся в темноте ----------
export const Party: React.FC<{ f: number; glow: number; laugh?: boolean; close?: boolean }> = ({ f, glow, laugh = false, close = false }) => {
  const z = close ? 0.16 : 0.02;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #0d2416 0%, #030a06 72%)" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + z})`, transformOrigin: "50% 62%" }}>
        {[0.22, 0.5, 0.78].map((x, i) => (
          <div key={i} style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 0 24px ${RAD}) drop-shadow(0 0 64px ${RAD}77)`, opacity: 0.6 + glow * 0.4 }}>
            <ToonGuy x={close ? 0.5 + (i - 1) * 0.52 : x} y={0.99} scale={close ? 1.55 : 1.35} mood="happy" skirt longHair
              shirt={i === 1 ? "#d8f7c0" : i ? "#c8efb0" : "#bfe9a8"} hair={["#3a2a20", "#7a4a2a", "#241f1c"][i]}
              talk={laugh ? 0.55 + Math.sin(f / 5 + i) * 0.3 : 0.1} look={i === 1 ? 0 : i ? -1 : 1} />
          </div>
        ))}
      </AbsoluteFill>
      {Array.from({ length: 16 }, (_, i) => (
        <Glow key={i} x={0.18 + (i % 8) * 0.09} y={0.62 + Math.floor(i / 8) * 0.08} r={34} o={(0.5 + Math.sin(f / 9 + i) * 0.3) * glow} />
      ))}
      <AbsoluteFill style={{ opacity: 0.35, background: "radial-gradient(ellipse at 50% 50%, transparent 30%, #000 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- 5-6. кость, радий внутри ----------
export const Bone: React.FC<{ f: number; depth: number; glow: number; freeze?: boolean }> = ({ f, depth, glow, freeze = false }) => {
  const d = interpolate(f, [0, 70], [depth * 0.55, depth], clamp);
  const pulse = freeze ? 0.9 : 0.7 + Math.sin(f / 9) * 0.2;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #21321f 0%, #050c06 74%)" }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(540 960) scale(${1 + d * 0.8}) rotate(${-6 + d * 4})`}>
          <g stroke="#b9ae97" strokeWidth={10} strokeLinejoin="round">
            <path d="M-46 -470 q-6 250 -4 470 q2 240 6 470 l92 0 q4 -230 6 -470 q2 -220 -4 -470 Z" fill="#efe9d8" />
            <circle cx={-70} cy={-508} r={96} fill="#efe9d8" />
            <circle cx={72} cy={-516} r={82} fill="#efe9d8" />
            <circle cx={-62} cy={512} r={88} fill="#efe9d8" />
            <circle cx={76} cy={520} r={80} fill="#efe9d8" />
          </g>
          {[-470, 470].map((cy, k) =>
            Array.from({ length: 26 }, (_, i) => {
              const ang = (i / 26) * Math.PI * 2;
              const rr = 40 + (i % 4) * 16;
              return <circle key={`${k}-${i}`} cx={Math.cos(ang) * rr + (k ? 6 : 0)} cy={cy + Math.sin(ang) * rr * 0.9} r={11} fill="none" stroke="#cfc5ae" strokeWidth={4} opacity={0.75} />;
            })
          )}
          {Array.from({ length: 34 }, (_, i) => {
            const y = -560 + ((i * 47 + f * 0.7) % 1120);
            const nearEnd = Math.abs(Math.abs(y) - 480) < 180 ? 1 : 0.45;
            const x = Math.sin(i * 1.9 + f / 90) * (44 + nearEnd * 34);
            return (
              <circle key={i} cx={x} cy={y} r={(5 + (i % 4)) * (1 + nearEnd * 0.5)} fill={RAD}
                opacity={(0.35 + (i % 5) / 6) * glow * pulse} style={{ filter: `drop-shadow(0 0 12px ${RAD})` }} />
            );
          })}
          <path d="M-30 -260 q22 40 -6 78 q-26 40 4 74" stroke="#9a8f7b" strokeWidth={5} fill="none" opacity={0.5} />
          <path d="M34 60 q-24 46 2 84 q24 36 -2 70" stroke="#9a8f7b" strokeWidth={5} fill="none" opacity={0.5} />
        </g>
        <rect width="1080" height="1920" fill={RAD} opacity={0.05 * pulse} />
      </svg>
      {freeze && <AbsoluteFill style={{ background: "rgba(0,0,0,0.32)" }} />}
    </AbsoluteFill>
  );
};

// ---------- 7. карточка 1600 лет ----------
export const Half: React.FC<{ f: number; years: string; glow?: number }> = ({ f, years, glow = 1 }) => {
  const p = interpolate(f, [0, 18], [0, 1], clamp);
  const ticks = 20;
  const lit = Math.round(p * ticks);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, #10281a, #030805 76%)", alignItems: "center", justifyContent: "center" }}>
      <Glow x={0.5} y={0.42} r={620} o={0.2 * glow} />
      <div style={{ ...MB, color: RAD, fontWeight: 900, fontSize: 260, letterSpacing: -8, textShadow: `0 0 60px ${RAD}88`, transform: `scale(${0.9 + p * 0.1})` }}>{years}</div>
      <div style={{ ...MB, color: "#e7ffe1", fontWeight: 800, fontSize: 54, marginTop: 8, letterSpacing: 2 }}>YEARS — HALF OF IT IS STILL THERE</div>
      <div style={{ display: "flex", gap: 14, marginTop: 90 }}>
        {Array.from({ length: ticks }, (_, i) => (
          <div key={i} style={{ width: 22, height: 96, borderRadius: 6, background: i < lit ? RAD : "#1d3324", boxShadow: i < lit ? `0 0 22px ${RAD}` : "none" }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 8. атом: кальций против радия ----------
export const Atom: React.FC<{ f: number; swap: number }> = ({ f, swap }) => {
  const AtomIcon: React.FC<{ x: number; c: string; label: string }> = ({ x, c, label }) => (
    <g transform={`translate(${x} 900)`}>
      <ellipse rx={190} ry={74} fill="none" stroke={c} strokeWidth={7} opacity={0.8} transform={`rotate(${f * 0.7})`} />
      <ellipse rx={74} ry={190} fill="none" stroke={c} strokeWidth={7} opacity={0.6} transform={`rotate(${-f * 0.5})`} />
      <circle r={62} fill={c} opacity={0.9} />
      <circle r={92} fill={c} opacity={0.2} />
      <text y={230} textAnchor="middle" fontFamily="Montserrat" fontSize={58} fontWeight={900} fill={c}>{label}</text>
    </g>
  );
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #12202c, #04080c 76%)" }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <AtomIcon x={320} c="#dfe7ee" label="Ca" />
        <AtomIcon x={760} c={RAD} label="Ra" />
        <text x={540} y={1420} textAnchor="middle" fontFamily="Montserrat" fontSize={44} fontWeight={800} fill="#bcd2c4">SAME SIZE. SAME CHARGE.</text>
        <text x={540} y={1500} textAnchor="middle" fontFamily="Montserrat" fontSize={44} fontWeight={800} fill="#7d9c8a">YOUR BODY CAN'T TELL THEM APART</text>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 9-10. стена из «кальция», трещины ----------
export const Wall: React.FC<{ f: number; built: number; cracks?: number }> = ({ f, built, cracks = 0 }) => {
  const rows = 5, cols = 5;
  const total = rows * cols;
  const n = Math.round(built * total);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1c2a1a, #050a05 78%)" }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: total }, (_, i) => {
          const r = Math.floor(i / cols), c = i % cols;
          const x = 250 + c * 120, y = 620 + r * 96;
          return <rect key={i} x={x} y={y} width={104} height={80} rx={8} fill={i < n ? RAD : "#cfd6cc"} opacity={i < n ? 0.9 : 0.8} stroke="#0d150c" strokeWidth={5} />;
        })}
        {cracks > 0 && (
          <>
            <path d={`M250 620 q120 60 -20 140 q-140 ${80 * cracks} 60 ${160 * cracks} q200 ${60 * cracks} 40 200`} stroke="#0a0f0a" strokeWidth={9} fill="none" opacity={0.9} />
            <path d={`M730 716 q-120 80 40 ${140 * cracks} q160 ${60 * cracks} -20 ${180 * cracks}`} stroke="#0a0f0a" strokeWidth={9} fill="none" opacity={0.9} />
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 11. челюсть ----------
export const Jaw: React.FC<{ f: number; teeth: number }> = ({ f, teeth }) => {
  const row = 9;
  const fallFrom = Math.floor(teeth * row);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #3a2a44, #0a0710 74%)" }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <path d="M150 700 q390 -150 780 0 q40 190 -90 250 q-300 90 -600 0 q-130 -60 -90 -250 Z" fill="#c05a68" stroke="#7d2b38" strokeWidth={10} strokeLinejoin="round" />
        <path d="M210 742 q330 -110 660 0 q26 120 -70 166 q-260 66 -520 0 q-96 -46 -70 -166 Z" fill="#d97a86" stroke="#a44552" strokeWidth={6} />
        <path d="M120 640 q420 -120 840 0 q-60 -110 -200 -126 q-220 -70 -440 0 q-140 16 -200 126 Z" fill="#9c3446" stroke="#631f2b" strokeWidth={9} strokeLinejoin="round" />
        <path d="M120 940 q420 130 840 0 q-90 120 -420 120 q-330 0 -420 -120 Z" fill="#a83c4e" stroke="#631f2b" strokeWidth={9} strokeLinejoin="round" />
        {Array.from({ length: row }, (_, i) => {
          const cx = 540 + (i - 4) * 74;
          const top = 806 + Math.pow(Math.abs(i - 4) / 4, 2) * 34;
          const missing = i >= fallFrom;
          const p = interpolate(f, [10 + i * 4, 55], [0, 1], clamp);
          const dy = missing ? p * 620 : 0;
          const rot = missing ? p * (i - 4) * 22 : 0;
          const w = i === 4 ? 62 : 58, h = i === 4 ? 132 : 118;
          return (
            <g key={i} transform={`translate(${cx} ${top + dy}) rotate(${rot})`} opacity={missing ? 1 - p * 0.35 : 1}>
              <path d={`M${-w / 2} 0 q${w * 0.06} ${-h * 0.16} ${w * 0.4} ${-h * 0.1} q${w * 0.14} ${h * 0.14} ${w * 0.1} ${h * 0.34} q0 ${h * 0.5} ${-w * 0.5} ${h * 0.72} q${-w * 0.5} ${-h * 0.22} ${-w * 0.5} ${-h * 0.72} q${-w * 0.04} ${-h * 0.2} ${w * 0.1} ${-h * 0.34} Z`}
                fill="#fffaf0" stroke="#d3c5b0" strokeWidth={7} strokeLinejoin="round" />
              {[1, 2, 5, 6].includes(i) && (
                <g>
                  <circle cx={0} cy={h * 0.18} r={15} fill={RAD} opacity={0.92} style={{ filter: `drop-shadow(0 0 16px ${RAD})` }} />
                  <path d={`M0 ${h * 0.18 + 10} l0 -34 M0 ${h * 0.14} l-14 -18 M0 ${h * 0.14} l14 -18`} stroke={RAD_DEEP} strokeWidth={5} fill="none" opacity={0.75} />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 12. пустые стулья ----------
export const Graves: React.FC<{ f: number; count: number }> = ({ f, count }) => {
  const n = Math.min(count, Math.floor(interpolate(f, [0, 26], [0, count], clamp)));
  const rows = [12, 11, 10, 9, 8];
  let idx = 0;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #1d2a36, #04070b 78%)" }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={1280} width={1080} height={640} fill="#080d12" />
        {rows.map((cnt, r) => {
          const sc = 0.6 + r * 0.19;
          const step = 1010 / cnt;
          const y = 330 + r * 288;
          return Array.from({ length: cnt }, (_, c) => {
            const show = idx++ < n;
            const x = 540 + (c - (cnt - 1) / 2) * step - 48 * sc;
            return (
              <g key={`${r}-${c}`} transform={`translate(${x} ${y}) scale(${sc})`} opacity={show ? 0.4 + Math.min(0.6, idx / 34) : 0}>
                <rect x={0} y={0} width={96} height={104} rx={12} fill="#1a2632" stroke="#4a6b80" strokeWidth={6} />
                <rect x={10} y={-14} width={76} height={18} rx={7} fill="#243441" stroke="#4a6b80" strokeWidth={5} />
                <rect x={12} y={92} width={10} height={44} fill="#243441" stroke="#4a6b80" strokeWidth={4} />
                <rect x={74} y={92} width={10} height={44} fill="#243441" stroke="#4a6b80" strokeWidth={4} />
                <circle cx={48} cy={44} r={5} fill={RAD} opacity={0.7} />
              </g>
            );
          });
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 13-14. суд ----------
export const Court: React.FC<{ f: number; sign: string; lawyers?: boolean; women?: number }> = ({ f, sign, lawyers = false, women = 0 }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#3b3128 0%,#2a231c 55%,#191410 100%)" }}>
    {Array.from({ length: 7 }, (_, i) => (
      <div key={i} style={{ position: "absolute", left: `${i * 14.5}%`, top: "8%", width: "14%", height: "62%", background: i % 2 ? "#4a3b2c" : "#54432f", border: "3px solid #2b2118" }} />
    ))}
    <div style={{ position: "absolute", left: "-4%", top: "70%", width: "108%", height: "12%", background: "linear-gradient(180deg,#6b4a2f,#3f2a19)", borderTop: "8px solid #8a5a2f" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: "13%", textAlign: "center", ...MB, fontWeight: 900, fontSize: 56, color: "#f4e3c8", letterSpacing: 3 }}>{sign}</div>
    {(women ? Array.from({ length: women }) : []).map((_, i) => (
      <ToonGuy key={i} x={0.14 + i * 0.18} y={0.9} scale={0.86} mood="sad" look={0} arm="none"
        shirt={["#4b5a6b", "#6b4b58", "#5a6b4b"][i % 3]} hair={["#2f2a28", "#4a3a2c", "#1f1d1c"][i % 3]} />
    ))}
    {lawyers && (
      <div style={{ position: "absolute", right: "6%", bottom: "26%", width: 360, height: 210, background: "linear-gradient(180deg,#7a5230,#4a2f1a)", border: "8px solid #2b1c11", transform: `translateX(${interpolate(f, [0, 75], [70, 0], clamp)}px)` }}>
        <div style={{ position: "absolute", left: "50%", top: -96, marginLeft: -54, width: 108, height: 108, borderRadius: "50%", background: "#e8bf94", border: "7px solid #2b1c11" }} />
        <div style={{ position: "absolute", left: "50%", top: -20, marginLeft: -84, width: 168, height: 96, borderRadius: "40px 40px 0 0", background: "#15161a", border: "7px solid #2b1c11" }} />
        <div style={{ position: "absolute", left: 24, right: 24, top: 40, height: 14, background: "#d9a86a", opacity: 0.7 }} />
        <div style={{ position: "absolute", left: 24, right: 24, top: 110, height: 14, background: "#d9a86a", opacity: 0.5 }} />
      </div>
    )}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 10%, rgba(255,220,160,0.18), rgba(0,0,0,0.6) 70%)" }} />
  </AbsoluteFill>
);

// ---------- 15. календарь ----------
export const Calendar: React.FC<{ f: number; flip: number }> = ({ f }) => {
  const p = interpolate(f, [8, 50], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1a2430, #04070a 76%)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 620, height: 780, background: "#f4f1e6", borderRadius: 22, boxShadow: "0 40px 90px rgba(0,0,0,0.6)", transform: `rotate(${-3 + p * 6}deg)`, overflow: "hidden" }}>
        <div style={{ height: 150, background: "#c23b30", color: "#fff", ...MB, fontWeight: 900, fontSize: 92, display: "flex", alignItems: "center", justifyContent: "center" }}>1927</div>
        <div style={{ padding: 34, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 14 }}>
          {Array.from({ length: 28 }, (_, i) => (
            <div key={i} style={{ height: 62, borderRadius: 6, background: i < Math.round(p * 28) ? "#c23b30" : "#e2dcc9" }} />
          ))}
        </div>
      </div>
      <div style={{ ...MB, marginTop: 70, color: "#ffd000", fontWeight: 900, fontSize: 56 }}>NO LAWYER YET</div>
    </AbsoluteFill>
  );
};

// ---------- 16. клятва: рука не поднимается ----------
export const Oath: React.FC<{ f: number; hand: number }> = ({ f, hand }) => {
  const raise = interpolate(f, [10, 45], [0, 1], clamp) * hand;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#2f2a26 0%,#1a1714 72%)" }}>
      {/* пол */}
      <div style={{ position: "absolute", left: 0, right: 0, top: "78%", bottom: 0, background: "linear-gradient(180deg,#5a422c,#31241a)" }} />
      {/* судейская трибуна */}
      <div style={{ position: "absolute", left: "8%", right: "8%", top: "12%", height: "34%", background: "linear-gradient(180deg,#7a5230,#43290f)", border: "10px solid #241609", borderRadius: 6 }}>
        <div style={{ position: "absolute", left: "50%", top: -104, marginLeft: -58, width: 116, height: 116, borderRadius: "50%", background: "#e8bf94", border: "8px solid #241609" }} />
        <div style={{ position: "absolute", left: "50%", top: -18, marginLeft: -96, width: 192, height: 100, borderRadius: "44px 44px 0 0", background: "#14161a", border: "8px solid #241609" }} />
        <div style={{ position: "absolute", left: "50%", top: 26, marginLeft: -34, width: 68, height: 68, borderRadius: 8, background: "#c9a15c", border: "6px solid #241609" }} />
        <div style={{ position: "absolute", left: 30, right: 30, top: "62%", height: 12, background: "#c08d4e", opacity: 0.6 }} />
      </div>
      {/* свидетельница */}
      <ToonGuy x={0.5} y={0.99} scale={1.45} mood="sad" arm={raise > 0.3 ? "raise" : "none"} shirt="#4b5a6b" skin="#e8c7a8" hair="#2f2a28" skirt longHair />
      <div style={{ position: "absolute", left: "50%", top: "46%", width: 70, height: 70, marginLeft: -35, borderRadius: "50%", background: RAD, opacity: 0.1 + raise * 0.16 }} />
    </AbsoluteFill>
  );
};

// ---------- 17. часы ----------
export const Clock: React.FC<{ f: number; wait?: boolean }> = ({ f, wait = false }) => {
  const a = (f / 75) * 360 * (wait ? 0.06 : 1);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #1c1c22, #05050a 76%)", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="-160 -160 320 320" width={620} height={620}>
        <circle r={150} fill="#f2ecd8" stroke="#d9a86a" strokeWidth={12} />
        {Array.from({ length: 12 }, (_, i) => {
          const ang = (i / 12) * Math.PI * 2;
          return <line key={i} x1={Math.sin(ang) * 118} y1={-Math.cos(ang) * 118} x2={Math.sin(ang) * 138} y2={-Math.cos(ang) * 138} stroke="#3a3630" strokeWidth={7} strokeLinecap="round" />;
        })}
        <line x1={0} y1={0} x2={0} y2={-96} stroke="#2a2620" strokeWidth={11} strokeLinecap="round" transform={`rotate(${a})`} />
        <line x1={0} y1={0} x2={0} y2={-66} stroke="#c23b30" strokeWidth={8} strokeLinecap="round" transform={`rotate(${a * 1.4 + 40})`} />
        <circle r={10} fill="#2a2620" />
      </svg>
      <div style={{ ...MB, marginTop: 50, color: "#ffd000", fontWeight: 900, fontSize: 46, textAlign: "center" }}>THE COMPANY JUST WAITED</div>
    </AbsoluteFill>
  );
};

// ---------- 18. газета ----------
export const News: React.FC<{ f: number; headline: string; sum: string }> = ({ f, headline, sum }) => {
  const p = interpolate(f, [0, 22], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1d1a16, #060505 76%)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 780, background: "#efe7d2", padding: "34px 40px 48px", boxShadow: "0 40px 80px rgba(0,0,0,0.65)", transform: `rotate(${-2 + p}deg) scale(${0.94 + p * 0.06})`, fontFamily: "Georgia, serif", color: "#1a1712" }}>
        <div style={{ textAlign: "center", borderBottom: "4px solid #1a1712", paddingBottom: 14, fontFamily: "Georgia, serif", letterSpacing: 3, fontSize: 30 }}>THE NEW YORK TIMES</div>
        <div style={{ marginTop: 22, fontSize: 54, fontWeight: 700, lineHeight: 1.04, textAlign: "center" }}>{headline}</div>
        <div style={{ margin: "26px 0 20px", height: 3, background: "#1a1712", opacity: 0.5 }} />
        <div style={{ columns: 2, columnGap: 26, fontSize: 17, lineHeight: 1.45, opacity: 0.85 }}>
          {Array.from({ length: 26 }, (_, i) => (
            <div key={i} style={{ height: 9, marginBottom: 7, background: "#1a1712", opacity: 0.18, width: `${70 + (i % 4) * 8}%` }} />
          ))}
        </div>
        <div style={{ marginTop: 24, textAlign: "center", background: "#c23b30", color: "#fff", fontSize: 74, fontWeight: 700, padding: "6px 0", letterSpacing: 2 }}>{sum}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 19. палата ----------
export const Ward: React.FC<{ f: number; months: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#dfe9f0 0%,#c7d6e0 60%,#aebfcc 100%)" }}>
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <rect width="1080" height="1920" fill="#e8f0f5" />
      <rect x={80} y={300} width={330} height={300} rx={10} fill="#cfe3f2" stroke="#9fb4c0" strokeWidth={9} />
      <line x1={245} y1={300} x2={245} y2={600} stroke="#9fb4c0" strokeWidth={9} />
      <line x1={80} y1={450} x2={410} y2={450} stroke="#9fb4c0" strokeWidth={9} />
      <rect x={200} y={1080} width={620} height={210} rx={18} fill="#ffffff" stroke="#9fb4c0" strokeWidth={9} />
      <rect x={160} y={990} width={130} height={120} rx={16} fill="#f4f8fa" stroke="#9fb4c0" strokeWidth={8} />
      <ellipse cx={430} cy={1215} rx={96} ry={78} fill="#ffd6b0" stroke="#8a97a4" strokeWidth={8} />
      <path d="M300 1290 q130 -40 260 0 l0 190 q-130 30 -260 0 Z" fill="#dfeaf2" stroke="#b7c4ce" strokeWidth={8} />
      <path d="M356 1196 q18 -14 36 0" stroke="#22303a" strokeWidth={6} fill="none" />
      <path d="M432 1196 q18 -14 36 0" stroke="#22303a" strokeWidth={6} fill="none" />
      <path d="M384 1252 q34 16 68 0" stroke="#22303a" strokeWidth={6} fill="none" />
      <rect x={880} y={700} width={12} height={520} fill="#b7c4ce" />
      <path d="M892 760 q-120 120 -260 400" stroke="#9fd8f0" strokeWidth={6} fill="none" opacity={0.9} />
      <rect x={860} y={690} width={54} height={96} rx={14} fill="#e8f4fa" stroke="#9fb4c0" strokeWidth={5} />
      <ellipse cx={900} cy={1560} rx={110} ry={26} fill="rgba(0,0,0,0.18)" />
      <path d="M840 1240 q60 -30 120 0 l16 250 q-76 26 -152 0 Z" fill="#f4f7f8" stroke="#b7c4ce" strokeWidth={8} />
      <circle cx={900} cy={1180} r={62} fill="#ffd6b0" stroke="#8a97a4" strokeWidth={8} />
      <path d="M840 1160 q60 -50 120 0" stroke="#3a3a3a" strokeWidth={12} fill="none" />
    </svg>
  </AbsoluteFill>
);

// ---------- 20. циферблаты до сих пор светятся ----------
export const Dials: React.FC<{ f: number; glow?: number }> = ({ f, glow = 1 }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #0c1a10, #020603 76%)" }}>
    {Array.from({ length: 6 }, (_, i) => {
      const x = 0.24 + (i % 2) * 0.52, y = 0.22 + Math.floor(i / 2) * 0.24;
      const p = 0.6 + Math.sin(f / 12 + i) * 0.4;
      return (
        <div key={i} style={{ position: "absolute", left: `${x * 100}%`, top: `${y * 100}%`, width: 210, height: 210, marginLeft: -105, marginTop: -105, borderRadius: "50%", background: "radial-gradient(circle, #16241a, #060c08 70%)", border: `5px solid #2f4a34`, boxShadow: `0 0 ${60 * p * glow}px ${RAD}66`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="-100 -100 200 200" width={210} height={210}>
            {Array.from({ length: 12 }, (_, k) => {
              const a = (k / 12) * Math.PI * 2;
              return <circle key={k} cx={Math.sin(a) * 72} cy={-Math.cos(a) * 72} r={7} fill={RAD} opacity={0.5 + p * 0.5} style={{ filter: `drop-shadow(0 0 8px ${RAD})` }} />;
            })}
            <circle r={14} fill={RAD} opacity={0.7 + p * 0.3} />
          </svg>
        </div>
      );
    })}
  </AbsoluteFill>
);

// ---------- 21. закон 1928 ----------
export const Law: React.FC<{ f: number; year: string }> = ({ f, year }) => {
  const p = interpolate(f, [0, 20], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, #101f2c, #03070b 78%)", alignItems: "center", justifyContent: "center", padding: "0 80px" }}>
      <Glow x={0.5} y={0.4} r={520} o={0.18} />
      <div style={{ ...MB, color: "#f4f8ff", fontWeight: 900, fontSize: 210, letterSpacing: -6, opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>{year}</div>
      <div style={{ ...MB, color: RAD, fontWeight: 900, fontSize: 52, textAlign: "center", marginTop: 22, lineHeight: 1.15 }}>RADIUM POISONING BECOMES A COMPENSABLE DISEASE</div>
      <div style={{ ...MB, color: "#ff6a4a", fontWeight: 800, fontSize: 44, textAlign: "center", marginTop: 34, opacity: p }}>BUT THE 2-YEAR LIMIT HAD ALREADY RUN OUT</div>
    </AbsoluteFill>
  );
};

// ---------- маршрутизация: id такта → сцена ----------
export const SceneByKind: React.FC<{ kind: string; f: number; bar: number; shot: any }> = ({ kind, f, bar, shot }) => {
  switch (kind) {
    case "title": return <Title f={f} kicker={shot.kicker} title={shot.title} sub={shot.sub} />;
    case "brush": return <Brush f={f} bar={bar} girls={shot.girls} lips={shot.lips} jar={shot.jar} glow={shot.glow} callback={shot.callback} />;
    case "party": return <Party f={f} glow={shot.glow} laugh={shot.laugh} close={shot.close} />;
    case "bone": return <Bone f={f} depth={shot.depth} glow={shot.glow} freeze={shot.freeze} />;
    case "half": return <Half f={f} years={shot.years} glow={shot.glow} />;
    case "atom": return <Atom f={f} swap={shot.swap} />;
    case "wall": return <Wall f={f} built={shot.built} cracks={shot.cracks} />;
    case "jaw": return <Jaw f={f} teeth={shot.teeth} />;
    case "graves": return <Graves f={f} count={shot.count} />;
    case "court": return <Court f={f} sign={shot.sign} lawyers={shot.lawyers} women={shot.women} />;
    case "calendar": return <Calendar f={f} flip={shot.flip} />;
    case "oath": return <Oath f={f} hand={shot.hand} />;
    case "clock": return <Clock f={f} wait={shot.wait} />;
    case "news": return <News f={f} headline={shot.headline} sum={shot.sum} />;
    case "ward": return <Ward f={f} months={shot.months} />;
    case "dials": return <Dials f={f} glow={shot.glow} />;
    case "law": return <Law f={f} year={shot.year} />;
    default: return <AbsoluteFill style={{ background: "#000" }} />;
  }
};
