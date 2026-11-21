import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { mulberry } from "../components/rand";

// ---- Угарный газ: вставки «внутри тела» и печные/дворовые сцены ----
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const blur = (id: string, s: number) => (
  <filter id={id} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={s} /></filter>
);
const CARBON = "#171a1f";   // газ: почти чёрный, читается только по свечению
const CARBON_EDGE = "#4a5a6a";
const RBC = "#c8161c";
const O2 = "#22a9dc";

// ---------- 1. Печь изнутри: тлеющие угли, от них идёт бесцветная струя газа ----------
export const Coals: React.FC<{ frame: number; gas?: number; draft?: number; dying?: number }> = ({ frame, gas = 1, draft = 0, dying = 0 }) => {
  const R = mulberry(31);
  // угли: неровные комки, у каждого рваный контур и раскалённые трещины
  const coals = Array.from({ length: 34 }, () => {
    const cx = 150 + R() * 780, cy = 1240 + R() * 330;
    const rad = 30 + R() * 62;
    const pts = Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2;
      const rr = rad * (0.72 + R() * 0.5);
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.72];
    });
    const cracks = Array.from({ length: 3 }, () => {
      const a = R() * Math.PI * 2, l = rad * (0.4 + R() * 0.6);
      return { x1: cx - Math.cos(a) * l * 0.5, y1: cy - Math.sin(a) * l * 0.35, x2: cx + Math.cos(a) * l * 0.7, y2: cy + Math.sin(a) * l * 0.5 };
    });
    return { pts, cracks, hot: 0.4 + R() * 0.6, k: R() * 6.28, rad };
  });
  const embers = Array.from({ length: 46 }, () => ({ x: 170 + R() * 740, y: 1180 + R() * 330, s: 1.6 + R() * 4, sp: 0.3 + R() * 1.1, ph: R() * 100 }));
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        {blur("co40", 40)}
        {blur("co14", 14)}
        {blur("co5", 5)}
        <radialGradient id="coRoom" cx="50%" cy="74%" r="72%">
          <stop offset="0%" stopColor="#2e1708" />
          <stop offset="45%" stopColor="#140a05" />
          <stop offset="100%" stopColor="#060302" />
        </radialGradient>
        <linearGradient id="coBrick" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a1a12" />
          <stop offset="100%" stopColor="#160d08" />
        </linearGradient>
        <radialGradient id="coGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff8a2a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ff3a00" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#coRoom)" />
      {/* топка: свод и кирпичная кладка */}
      <path d="M96 1080 Q96 950 210 950 L870 950 Q984 950 984 1080 L984 1760 Q984 1830 910 1830 L170 1830 Q96 1830 96 1760 Z" fill="#0a0605" stroke="#2a1a12" strokeWidth={12} />
      {[0, 1, 2, 3, 4].map((row) => (
        <g key={row} opacity={0.85}>
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={104 + i * 148 + (row % 2) * 74} y={986 + row * 52} width={140} height={46} rx={6} fill="url(#coBrick)" stroke="#1a0e08" strokeWidth={3} />
          ))}
        </g>
      ))}
      {/* жар от поддувала */}
      <ellipse cx={540} cy={1500} rx={400} ry={240} fill="#ff5a10" opacity={0.2 + 0.07 * Math.sin(frame / 7)} filter="url(#co40)" />
      {/* колосник: чугунные прутья */}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={150} y={1610 + i * 26} width={780} height={11} rx={5} fill="#241812" stroke="#3a2820" strokeWidth={2} />
      ))}
      {/* угли */}
      {coals.map((c, i) => {
        const hot = c.hot * (0.5 + 0.5 * Math.sin(frame / (7 + (i % 5)) + c.k)) * (1 - dying * 0.9);
        const d = c.pts.map((p, j) => `${j ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") + " Z";
        return (
          <g key={i}>
            <ellipse cx={c.pts[0][0]} cy={c.pts[0][1] - c.rad * 0.2} rx={c.rad * 1.25} ry={c.rad * 0.8} fill="url(#coGlow)" opacity={0.2 + hot * 0.4} filter="url(#co14)" />
            <path d={d} fill="#180d09" stroke="#2a1810" strokeWidth={3} />
            <path d={d} fill={`rgba(255,${Math.round(70 + hot * 110)},24,${0.16 + hot * 0.32})`} filter="url(#co5)" />
            {c.cracks.map((k, j) => (
              <line key={j} x1={k.x1} y1={k.y1} x2={k.x2} y2={k.y2} stroke={`rgba(255,${Math.round(120 + hot * 120)},60,${0.35 + hot * 0.6})`} strokeWidth={3.4} strokeLinecap="round" />
            ))}
          </g>
        );
      })}
      {/* искры */}
      {embers.map((e, i) => {
        const y = e.y - ((frame * e.sp * 3 + e.ph * 12) % 760);
        return <circle key={i} cx={e.x + Math.sin(frame / 8 + i) * 14} cy={y} r={e.s} fill="#ffa040" opacity={0.6 * (1 - (e.y - y) / 760)} filter="url(#co5)" />;
      })}
      {/* газ: струя от углей вверх — дрожащая бесцветная дымка */}
      {gas > 0 && (
        <g opacity={0.55 * gas} filter="url(#co14)">
          {Array.from({ length: 11 }, (_, i) => {
            const x = 220 + i * 62 + Math.sin(frame / 13 + i) * 22;
            const h = 420 + 150 * Math.sin(frame / 22 + i * 1.6);
            return (
              <path key={i} d={`M${x} 1520 C${x - 26} ${1520 - h * 0.4} ${x + 30} ${1520 - h * 0.72} ${x + Math.sin(frame / 15 + i) * 36} ${1520 - h}`}
                stroke={draft > 0.5 ? "#9cc4d4" : "#6f8fa6"} strokeWidth={26 - i} fill="none" strokeLinecap="round" opacity={0.3 + 0.12 * Math.sin(frame / 10 + i)} />
            );
          })}
        </g>
      )}
      {/* молекулы газа: крошечные тёмные точки, поднимаются вместе со струёй */}
      {gas > 0 && Array.from({ length: 26 }, (_, i) => {
        const y = 1500 - ((frame * (2.2 + (i % 5) * 0.6) + i * 137) % 620);
        const x = 230 + ((i * 197) % 640) + Math.sin(frame / 14 + i) * 26;
        return <circle key={`m${i}`} cx={x} cy={y} r={5 + (i % 3) * 2} fill="#0b0f14" stroke="#5f7f96" strokeWidth={1.8} opacity={0.75} />;
      })}
      {/* при открытой заслонке: тяга, пламя поднимается */}
      {draft > 0.5 && (
        <g opacity={0.55} filter="url(#co14)">
          {Array.from({ length: 7 }, (_, i) => {
            const x = 300 + i * 80 + Math.sin(frame / 6 + i) * 18;
            const hh = 320 + 180 * Math.sin(frame / 9 + i * 2);
            return <path key={i} d={`M${x} 1560 C${x - 40} ${1560 - hh * 0.5} ${x + 40} ${1560 - hh * 0.6} ${x + Math.sin(frame / 7 + i) * 30} ${1560 - hh}`} stroke="#ff8a2a" strokeWidth={44 - i * 3} fill="none" strokeLinecap="round" opacity={0.5} />;
          })}
        </g>
      )}
      {/* дверца: рамка */}
      <rect x={70} y={906} width={940} height={34} rx={12} fill="#2a1a12" />
      <rect x={70} y={1826} width={940} height={44} rx={14} fill="#2a1a12" />
    </svg>
  );
};

// ---------- 2. Кровь в сосуде: эритроциты летят, газ садится на гемоглобин ----------
export const BloodFlow: React.FC<{ frame: number; co?: number; empty?: number; thick?: number }> = ({ frame, co = 0, empty = 0, thick = 0 }) => {
  const R = mulberry(77);
  const cells = Array.from({ length: 46 }, () => ({
    depth: R(), x0: R(), y0: R(), s: 0.5 + R() * 0.8, ph: R() * 6.28, coAt: R(), tilt: R(),
  }));
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        {blur("bf36", 36)}
        {blur("bf12", 12)}
        {blur("bf4", 4)}
        <radialGradient id="bfLumen" cx="50%" cy="46%" r="58%">
          <stop offset="0%" stopColor="#8a1620" />
          <stop offset="55%" stopColor="#5a0a12" />
          <stop offset="100%" stopColor="#22040a" />
        </radialGradient>
        <radialGradient id="bfCell" cx="40%" cy="34%" r="66%">
          <stop offset="0%" stopColor="#ff6a58" />
          <stop offset="42%" stopColor="#cf1a1e" />
          <stop offset="100%" stopColor="#5e0608" />
        </radialGradient>
        <radialGradient id="bfCellCO" cx="40%" cy="34%" r="66%">
          <stop offset="0%" stopColor="#8a94a0" />
          <stop offset="45%" stopColor="#2c3036" />
          <stop offset="100%" stopColor="#0a0b0d" />
        </radialGradient>
        <linearGradient id="bfWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8323c" />
          <stop offset="50%" stopColor="#8a141c" />
          <stop offset="100%" stopColor="#3a060a" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="#1a0306" />
      {/* просвет сосуда */}
      <path d="M-60 240 C300 60 780 60 1140 240 L1140 1680 C780 1860 300 1860 -60 1680 Z" fill="url(#bfLumen)" />
      {/* стенки: два слоя, внутренний светлый */}
      <path d="M-60 240 C300 60 780 60 1140 240 L1140 1680 C780 1860 300 1860 -60 1680 Z" fill="none" stroke="url(#bfWall)" strokeWidth={54} />
      <path d="M-60 240 C300 60 780 60 1140 240 L1140 1680 C780 1860 300 1860 -60 1680 Z" fill="none" stroke="#ff9a8a" strokeWidth={5} opacity={0.35} />
      {/* плазма: светящаяся дымка */}
      <ellipse cx={540} cy={960} rx={500} ry={740} fill="#ff3a2a" opacity={0.1 + thick * 0.06} filter="url(#bf36)" />
      {/* эритроциты: диски, у боковых — ребро, к центру — плоскость */}
      {cells.map((c, i) => {
        const speed = 1 + c.depth * 0.9;
        const y = ((c.y0 * 2100 + frame * 10 * speed) % 2200) - 140;
        const x = 130 + c.x0 * 820 + Math.sin(frame / 24 + c.ph) * 54 * (1 + c.depth);
        const s = 40 * c.s * (0.75 + c.depth * 0.6);
        // «ребро»: чем ближе к краю кадра, тем сильнее сплющивание
        const edge = Math.min(1, Math.abs(x - 540) / 470);
        const squash = 1 - edge * 0.58;
        const isCO = co > 0 && c.coAt < interpolate(frame, [0, 34], [0, 1], clamp);
        const tone = empty > 0.6 && !isCO ? 0.55 : 1;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(frame / 20 + c.ph) * 18})`} opacity={0.5 + c.depth * 0.5}>
            {/* смаз по движению */}
            <ellipse rx={s * 1.05} ry={s * 0.9} fill="#000" opacity={0.25} filter="url(#bf4)" transform="translate(0 -14)" />
            <ellipse rx={s} ry={s * 0.86 * squash} fill={isCO ? "url(#bfCellCO)" : "url(#bfCell)"} />
            {/* двояковогнутый центр */}
            <ellipse rx={s * 0.56} ry={s * 0.42 * squash} fill={isCO ? "#05060a" : `rgba(90,6,10,${0.5 * tone})`} opacity={isCO ? 0.75 : 1} />
            <ellipse rx={s * 0.96} ry={s * 0.82 * squash} fill="none" stroke={isCO ? "#7a8490" : "#ff8a7a"} strokeWidth={2} opacity={0.35} />
          </g>
        );
      })}
      {/* молекулы газа: тёмные, садятся на клетки */}
      {co > 0 && Array.from({ length: 30 }, (_, i) => {
        const y = ((i * 149 + frame * 5.5) % 1900) - 100;
        const x = 190 + ((i * 271) % 700) + Math.sin(frame / 16 + i) * 44;
        return <circle key={i} cx={x} cy={y} r={8 + (i % 3) * 3} fill={CARBON} stroke={CARBON_EDGE} strokeWidth={2.6} opacity={0.9} />;
      })}
      {/* кислородное голодание: холодный оттенок и тёмные края */}
      {empty > 0 && <ellipse cx={540} cy={960} rx={560} ry={820} fill="#12324e" opacity={0.4 * empty} filter="url(#bf36)" />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 62% 50% at 50% 50%, rgba(0,0,0,0) 40%, rgba(12,2,4,0.85) 100%)" }} />
    </svg>
  );
};

// ---------- 3. Капкан: гем гемоглобина, молекула газа входит и держит, кислород отталкивается ----------
export const GemTrap: React.FC<{ frame: number }> = ({ frame }) => {
  const feX = 540, feY = 1000;
  const inP = interpolate(frame, [6, 26], [0, 1], clamp);
  const o2P = interpolate(frame, [22, 46], [0, 1], clamp);
  const ring = 6;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        {blur("gt18", 18)}
        {blur("gt6", 6)}
        <radialGradient id="gtBg" cx="50%" cy="52%" r="65%">
          <stop offset="0%" stopColor="#1a2230" />
          <stop offset="100%" stopColor="#04070c" />
        </radialGradient>
        <radialGradient id="gtFe" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffd8a0" />
          <stop offset="60%" stopColor="#c8641a" />
          <stop offset="100%" stopColor="#5a2408" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#gtBg)" />
      <ellipse cx={540} cy={1000} rx={430} ry={430} fill="#22a9dc" opacity={0.06} filter="url(#gt18)" />
      {/* порфириновое кольцо — круг из атомов */}
      <circle cx={feX} cy={feY} r={300} fill="none" stroke="#d8b070" strokeWidth={4} opacity={0.35} />
      {Array.from({ length: 20 }, (_, i) => {
        const a = (i / 20) * Math.PI * 2 + Math.sin(frame / 40) * 0.04;
        const r = 300 + (i % 2 ? 26 : -18);
        return <circle key={i} cx={feX + Math.cos(a) * r} cy={feY + Math.sin(a) * r} r={i % 5 === 0 ? 16 : 10} fill={i % 5 === 0 ? "#7fd0ff" : "#3a5a78"} stroke="#9ac8e8" strokeWidth={2} opacity={0.9} />;
      })}
      {/* железо в центре */}
      <circle cx={feX} cy={feY} r={64} fill="url(#gtFe)" />
      <circle cx={feX} cy={feY} r={64} fill="none" stroke="#ffb060" strokeWidth={3} opacity={0.7} />
      <text x={feX} y={feY + 16} textAnchor="middle" fontSize={46} fontWeight={900} fill="#2a1004" fontFamily="Montserrat, sans-serif">Fe</text>
      {/* молекула газа подлетает сверху и щёлкает в железо */}
      {inP > 0 && (() => {
        const y = interpolate(inP, [0, 1], [feY - 420, feY - 96]);
        const snap = inP > 0.96 ? Math.sin(frame * 1.6) * 3 : 0;
        return (
          <g transform={`translate(${feX} ${y + snap})`}>
            <circle r={70} fill="none" stroke="#6a7a8a" strokeWidth={6} opacity={0.6} />
            <circle cx={-40} cy={0} r={30} fill={CARBON} stroke="#8a9aa8" strokeWidth={4} />
            <circle cx={40} cy={0} r={30} fill={CARBON} stroke="#8a9aa8" strokeWidth={4} />
            <text x={0} y={14} textAnchor="middle" fontSize={38} fontWeight={900} fill="#cfe0ea" fontFamily="Montserrat, sans-serif">CO</text>
          </g>
        );
      })()}
      {/* защёлка: дуги захлопываются */}
      {inP > 0.9 && (
        <g opacity={interpolate(inP, [0.9, 1], [0, 1], clamp)}>
          <path d={`M${feX - 200} ${feY - 120} Q${feX - 90} ${feY - 190} ${feX - 20} ${feY - 150}`} stroke="#ffd000" strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d={`M${feX + 200} ${feY - 120} Q${feX + 90} ${feY - 190} ${feX + 20} ${feY - 150}`} stroke="#ffd000" strokeWidth={10} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* кислород подлетает и отскакивает */}
      {o2P > 0 && (() => {
        const p = o2P < 0.5 ? o2P / 0.5 : 1 + (o2P - 0.5) * 1.6;
        const x = interpolate(p, [0, 1, 2.1], [feX + 520, feX + 170, feX + 620]);
        const y = interpolate(p, [0, 1, 2.1], [feY + 320, feY + 80, feY + 420]);
        return (
          <g transform={`translate(${x} ${y})`} opacity={0.95}>
            <circle cx={-34} cy={0} r={30} fill={O2} opacity={0.85} />
            <circle cx={34} cy={0} r={30} fill={O2} opacity={0.85} />
            <text x={0} y={14} textAnchor="middle" fontSize={36} fontWeight={900} fill="#012a3a" fontFamily="Montserrat, sans-serif">O₂</text>
          </g>
        );
      })()}
      <circle cx={feX} cy={feY} r={150} fill="#000" opacity={0.18} filter="url(#gt6)" />
    </svg>
  );
};

// ---------- 4. График кривой диссоциации: кислород не отдаётся тканям ----------
export const O2Curve: React.FC<{ frame: number }> = ({ frame }) => {
  const x0 = 170, y0 = 1450, w = 740, h = 820;
  const p = interpolate(frame, [0, 55], [0, 1], clamp);
  // кривая диссоциации: доля кислорода, отданного тканям, в зависимости от его давления в лёгких
  const curve = (k: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const px = i / 60;
      const y = Math.pow(px, k) / (Math.pow(px, k) + Math.pow(0.42, k));
      pts.push(`${(x0 + px * w).toFixed(1)} ${(y0 - y * h).toFixed(1)}`);
    }
    return "M" + pts.join(" L");
  };
  const atTissue = (k: number) => {
    const px = 0.32;
    return y0 - (Math.pow(px, k) / (Math.pow(px, k) + Math.pow(0.42, k))) * h;
  };
  const yT = interpolate(p, [0, 1], [atTissue(2.2), atTissue(4.4)]);
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        {blur("oc12", 12)}
        {blur("oc30", 30)}
        <linearGradient id="ocBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1a26" />
          <stop offset="100%" stopColor="#03070c" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#ocBg)" />
      {/* сетка */}
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={x0} y1={y0 - (i / 4) * h} x2={x0 + w} y2={y0 - (i / 4) * h} stroke="#16323f" strokeWidth={2} />)}
      {[0, 1, 2, 3, 4].map((i) => <line key={`v${i}`} x1={x0 + (i / 4) * w} y1={y0} x2={x0 + (i / 4) * w} y2={y0 - h} stroke="#122a36" strokeWidth={2} />)}
      <line x1={x0} y1={y0} x2={x0 + w} y2={y0} stroke="#3a6a80" strokeWidth={4} />
      <line x1={x0} y1={y0} x2={x0} y2={y0 - h} stroke="#3a6a80" strokeWidth={4} />
      <text x={x0 + w / 2} y={y0 + 66} textAnchor="middle" fontSize={32} fontWeight={800} fill="#7fa8bc" fontFamily="Montserrat, sans-serif">КИСЛОРОД В ЛЁГКИХ</text>
      <text x={x0 - 52} y={y0 - h / 2} textAnchor="middle" fontSize={32} fontWeight={800} fill="#7fa8bc" fontFamily="Montserrat, sans-serif" transform={`rotate(-90 ${x0 - 52} ${y0 - h / 2})`}>ДОХОДИТ ДО ТКАНЕЙ</text>
      {/* норма */}
      <path d={curve(2.2)} fill="none" stroke="#2fe07a" strokeWidth={10} opacity={0.9} />
      <text x={x0 + w - 20} y={y0 - h + 20} textAnchor="end" fontSize={30} fontWeight={800} fill="#2fe07a" fontFamily="Montserrat, sans-serif">НОРМА</text>
      {/* при отравлении кривая уезжает влево-вниз */}
      {p > 0 && (
        <>
          <path d={curve(interpolate(p, [0, 1], [2.2, 4.4]))} fill="none" stroke="#f42a10" strokeWidth={12} />
          <text x={x0 + 24} y={y0 - h + 30} fontSize={30} fontWeight={800} fill="#f42a10" fontFamily="Montserrat, sans-serif">С ГАЗОМ В КРОВИ</text>
        </>
      )}
      {/* вертикаль «ткани» и ползущая точка */}
      <line x1={x0 + w * 0.32} y1={y0} x2={x0 + w * 0.32} y2={y0 - h} stroke="#7fa8bc" strokeWidth={2} strokeDasharray="8 10" opacity={0.5} />
      <text x={x0 + w * 0.32 + 14} y={y0 + 34} fontSize={26} fontWeight={800} fill="#7fa8bc" fontFamily="Montserrat, sans-serif">ТКАНИ</text>
      <circle cx={x0 + w * 0.32} cy={yT} r={52} fill="#f42a10" opacity={0.18} filter="url(#oc30)" />
      <circle cx={x0 + w * 0.32} cy={yT} r={17} fill="#f42a10" />
      <text x={x0 + w * 0.32 + 40} y={yT + 10} fontSize={34} fontWeight={900} fill="#ffd000" fontFamily="Montserrat, sans-serif">{Math.round(interpolate(p, [0, 1], [97, 38]))}%</text>
    </svg>
  );
};

// ---------- 5. Дом снаружи зимой: ночь, −18, дым из трубы, тёплое окно ----------
export const HouseWinter: React.FC<{ frame: number }> = ({ frame }) => {
  const R = mulberry(53);
  const stars = Array.from({ length: 110 }, () => ({ x: R() * 1080, y: R() * 820, r: 1 + R() * 2, o: 0.3 + R() * 0.7 }));
  const flakes = Array.from({ length: 140 }, () => ({ x: R() * 1080, y: R() * 1920, r: 2 + R() * 5, sp: 0.6 + R() * 1.8, ph: R() * 6.28 }));
  const logs = Array.from({ length: 9 }, (_, i) => 980 + i * 46);
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        {blur("hw44", 44)}
        {blur("hw12", 12)}
        <linearGradient id="hwSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#040814" />
          <stop offset="50%" stopColor="#0a1730" />
          <stop offset="100%" stopColor="#1a3450" />
        </linearGradient>
        <linearGradient id="hwSnow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8c8e4" />
          <stop offset="55%" stopColor="#5a7898" />
          <stop offset="100%" stopColor="#22364c" />
        </linearGradient>
        <linearGradient id="hwLog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a3222" />
          <stop offset="100%" stopColor="#2a1c12" />
        </linearGradient>
        <radialGradient id="hwWin" cx="50%" cy="46%" r="62%">
          <stop offset="0%" stopColor="#ffe6b0" />
          <stop offset="70%" stopColor="#ff9a2a" />
          <stop offset="100%" stopColor="#c25a08" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#hwSky)" />
      {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#dfeaff" opacity={s.o * (0.7 + 0.3 * Math.sin(frame / 20 + i))} />)}
      {/* луна с гало */}
      <circle cx={880} cy={250} r={72} fill="#eef4ff" opacity={0.95} />
      <circle cx={880} cy={250} r={72} fill="#cfe0ff" opacity={0.12} filter="url(#hw12)" />
      <circle cx={880} cy={250} r={170} fill="#9ec8ff" opacity={0.1} filter="url(#hw44)" />
      {/* дальний лес */}
      {Array.from({ length: 16 }, (_, i) => {
        const x = i * 72 - 20, hh = 120 + ((i * 37) % 90);
        return <path key={i} d={`M${x} 1300 L${x + 34} ${1300 - hh} L${x + 68} 1300 Z`} fill="#0c1a2a" opacity={0.9} />;
      })}
      {/* дом: сруб из брёвен */}
      <g>
        <path d="M150 830 L540 560 L930 830 Z" fill="#3a2a1e" stroke="#1e140e" strokeWidth={7} />
        <path d="M150 830 L540 560 L930 830 Z" fill="none" stroke="#5a4230" strokeWidth={3} opacity={0.6} />
        {/* снег на скатах */}
        <path d="M132 836 L540 548 L948 836 L912 862 L540 596 L168 862 Z" fill="#dceaf8" opacity={0.92} />
        <path d="M300 760 L540 600 L780 760 L756 776 L540 640 L324 776 Z" fill="#eef6ff" opacity={0.5} />
        {/* сруб */}
        <rect x={190} y={830} width={700} height={520} fill="#241a12" />
        {logs.map((y, i) => (
          <g key={i}>
            <rect x={190} y={y} width={700} height={44} fill="url(#hwLog)" stroke="#160e08" strokeWidth={3} />
            <circle cx={192} cy={y + 22} r={22} fill="#3a2818" stroke="#160e08" strokeWidth={3} />
            <circle cx={888} cy={y + 22} r={22} fill="#3a2818" stroke="#160e08" strokeWidth={3} />
          </g>
        ))}
        {/* конёк и труба */}
        <rect x={716} y={620} width={84} height={160} fill="#3a2618" stroke="#160e08" strokeWidth={5} />
        <rect x={706} y={612} width={104} height={26} rx={4} fill="#dceaf8" opacity={0.95} />
        {/* дым из трубы */}
        {Array.from({ length: 9 }, (_, i) => {
          const t = (frame / 66 + i * 0.36) % 1;
          const y = 604 - t * 780;
          const x = 758 + Math.sin(t * 3.6 + i) * 80 + t * 220;
          const r = 26 + t * 150;
          return <circle key={i} cx={x} cy={y} r={r} fill="#93a3b4" opacity={(1 - t) * 0.32} filter="url(#hw12)" />;
        })}
        {/* окна и наличники */}
        {[280, 590].map((x) => (
          <g key={x}>
            <rect x={x - 16} y={980} width={212} height={220} fill="#5a3a24" />
            <rect x={x} y={996} width={180} height={188} fill="url(#hwWin)" stroke="#40281a" strokeWidth={8} />
            <rect x={x} y={996} width={180} height={188} fill="#ff9a2a" opacity={0.3} filter="url(#hw44)" />
            <line x1={x + 90} y1={996} x2={x + 90} y2={1184} stroke="#40281a" strokeWidth={8} />
            <line x1={x} y1={1090} x2={x + 180} y2={1090} stroke="#40281a" strokeWidth={8} />
            <path d={`M${x - 14} 1000 q10 90 -4 176`} stroke="#dceaf8" strokeWidth={5} fill="none" opacity={0.25} />
          </g>
        ))}
        {/* дверь с крыльцом */}
        <rect x={470} y={1090} width={140} height={260} fill="#1c120c" stroke="#40281a" strokeWidth={6} />
        <rect x={488} y={1110} width={104} height={220} fill="#33200f" />
        <circle cx={578} cy={1225} r={8} fill="#c8a868" />
        {/* забор справа, сугроб у стены */}
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <rect x={940 + i * 22} y={1180} width={14} height={200} fill="#2a1c12" />
            <circle cx={947 + i * 22} cy={1180} r={9} fill="#dceaf8" opacity={0.8} />
          </g>
        ))}
      </g>
      {/* сугробы */}
      <path d="M0 1370 Q220 1300 470 1352 Q700 1400 900 1340 Q1000 1310 1080 1330 L1080 1920 L0 1920 Z" fill="url(#hwSnow)" />
      <path d="M0 1560 Q300 1480 560 1556 Q820 1630 1080 1530 L1080 1920 L0 1920 Z" fill="#16273a" />
      {/* тёплый отсвет из окон на снег */}
      <ellipse cx={370} cy={1400} rx={230} ry={70} fill="#ff9a2a" opacity={0.16} filter="url(#hw44)" />
      <ellipse cx={680} cy={1390} rx={210} ry={64} fill="#ff9a2a" opacity={0.14} filter="url(#hw44)" />
      {flakes.map((s, i) => {
        const y = (s.y + frame * 2.2 * s.sp) % 1920;
        const x = s.x + Math.sin(frame / 30 + s.ph) * 30;
        return <circle key={i} cx={x} cy={y} r={s.r} fill="#e8f4ff" opacity={0.5 + 0.3 * Math.sin(frame / 12 + i)} />;
      })}
    </svg>
  );
};

// ---------- 6. Вьюшка/заслонка: рука закрывает или открывает ----------
export const Shutter: React.FC<{ frame: number; open?: number }> = ({ frame, open = 0 }) => {
  const closing = interpolate(frame, [10, 34], [0, 1], clamp);
  const opening = interpolate(frame, [6, 30], [0, 1], clamp);
  const pos = open > 0.5 ? 1 - opening : closing; // 0 — открыто, 1 — закрыто
  const ember = 0.5 + 0.5 * Math.sin(frame / 9);
  const discX = 560, discY = 1120;
  const travel = pos * 430;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        {blur("sh30", 30)}
        {blur("sh10", 10)}
        {blur("sh4", 4)}
        <radialGradient id="shBg" cx="50%" cy="58%" r="70%">
          <stop offset="0%" stopColor="#2a1508" />
          <stop offset="55%" stopColor="#120a05" />
          <stop offset="100%" stopColor="#050302" />
        </radialGradient>
        <linearGradient id="shIron" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6a6a70" />
          <stop offset="45%" stopColor="#2e2e34" />
          <stop offset="100%" stopColor="#16161a" />
        </linearGradient>
        <radialGradient id="shCoal" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb060" />
          <stop offset="55%" stopColor="#ff5a10" />
          <stop offset="100%" stopColor="#7a1a00" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#shBg)" />
      {/* кирпичный щит печи вокруг вьюшки */}
      {Array.from({ length: 10 }, (_, r) => (
        <g key={r}>
          {Array.from({ length: 4 }, (_, c) => (
            <rect key={c} x={-20 + c * 290 + (r % 2) * 145} y={620 + r * 118} width={282} height={110} rx={8} fill={r % 2 ? "#241610" : "#20130e"} stroke="#150c08" strokeWidth={5} />
          ))}
        </g>
      ))}
      {/* отверстие вьюшки: за ним угли */}
      <circle cx={discX} cy={discY} r={250} fill="#0a0503" />
      <circle cx={discX} cy={discY} r={210} fill="url(#shCoal)" opacity={0.55 + 0.2 * ember} filter="url(#sh10)" />
      <ellipse cx={discX - 30} cy={discY + 40} rx={120} ry={60} fill="#ffb060" opacity={0.35 * ember} filter="url(#sh10)" />
      {/* диск-заслонка: уезжает влево, открывая/закрывая отверстие */}
      <g transform={`translate(${-travel} 0)`}>
        <circle cx={discX} cy={discY} r={262} fill="url(#shIron)" stroke="#7a7a84" strokeWidth={9} />
        <circle cx={discX} cy={discY} r={226} fill="none" stroke="#8a8a94" strokeWidth={4} opacity={0.45} />
        <circle cx={discX} cy={discY} r={238} fill="none" stroke="#1a1a1e" strokeWidth={12} opacity={0.6} />
        {/* гнездо скобы */}
        <rect x={discX - 26} y={discY - 150} width={52} height={90} rx={16} fill="#2a2a30" stroke="#6a6a72" strokeWidth={4} opacity={0.8} />
        <circle cx={discX} cy={discY} r={44} fill="#3a3a40" stroke="#8c8c96" strokeWidth={5} />
        {/* копоть и ржавчина */}
        <ellipse cx={discX - 60} cy={discY + 90} rx={90} ry={50} fill="#4a2a14" opacity={0.25} filter="url(#sh10)" />
        <ellipse cx={discX + 90} cy={discY - 70} rx={60} ry={40} fill="#3a1e0e" opacity={0.3} filter="url(#sh10)" />
      </g>
      {/* рука: кисть хватает скобу и ведёт заслонку */}
      <g transform={`translate(${-travel} 0)`}>
        {/* предплечье в вязаном рукаве — справа снизу */}
        <path d="M1160 1500 C1050 1452 960 1360 906 1276 C880 1236 892 1196 934 1180 L1080 1148 L1160 1420 Z" fill="#2a2a3a" stroke="#14141c" strokeWidth={7} />
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${1030 - i * 8} ${1176 + i * 20} C${968 - i * 6} ${1220 + i * 18} ${926 - i * 5} ${1272 + i * 14} ${900 + i * 2} ${1330 + i * 10}`} stroke="#1a1a26" strokeWidth={4} opacity={0.55} fill="none" />)}
        <path d="M934 1180 C900 1168 872 1160 856 1170" stroke="#1a1a26" strokeWidth={16} fill="none" strokeLinecap="round" />
        {/* ладонь */}
        <path d="M900 1140 C846 1108 796 1096 762 1116 C736 1132 742 1172 776 1196 C812 1222 862 1234 906 1224 C930 1218 936 1160 900 1140 Z" fill="#cf9678" stroke="#6b3d2e" strokeWidth={4} />
        {/* пальцы, обхватывающие скобу */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <path d={`M${(800 + i * 26)} ${1122 + i * 14} C${(778 + i * 26)} ${1104 + i * 12} ${(756 + i * 26)} ${1108 + i * 12} ${(752 + i * 26)} ${1128 + i * 12} C${(750 + i * 26)} ${1148 + i * 12} ${(774 + i * 26)} ${1156 + i * 12} ${(800 + i * 26)} ${1146 + i * 12} Z`} fill="#cf9678" stroke="#6b3d2e" strokeWidth={3.2} />
          </g>
        ))}
        {/* большой палец */}
        <path d="M840 1200 C816 1216 800 1210 796 1192 C792 1174 812 1160 836 1162" fill="#c98e70" stroke="#6b3d2e" strokeWidth={3.2} />
        {/* скоба (ручка) заслонки — проходит между пальцами */}
        <rect x={748} y={1020} width={34} height={150} rx={17} fill="#6a6a72" stroke="#9a9aa4" strokeWidth={4} />
        <circle cx={765} cy={1176} r={20} fill="#4a4a52" stroke="#9a9aa4" strokeWidth={4} />
      </g>
      {/* тепло от открытого отверстия */}
      <ellipse cx={discX} cy={discY} rx={420} ry={420} fill="#ff6a1a" opacity={0.12 * (1 - pos)} filter="url(#sh30)" />
    </svg>
  );
};

// ---------- 7. Гараж: машина с работающим двигателем на снегу, выхлоп ----------
export const Garage: React.FC<{ frame: number }> = ({ frame }) => {
  const R = mulberry(91);
  const flakes = Array.from({ length: 90 }, () => ({ x: R() * 1200, y: R() * 1920, r: 1.6 + R() * 4, sp: 0.5 + R() * 1.3, ph: R() * 6.28, dx: (R() - 0.5) * 1.4 }));
  const snowOn = (yArr: number[]) => yArr;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        {blur("ga40", 40)}
        {blur("ga12", 12)}
        <linearGradient id="gaSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050a14" />
          <stop offset="62%" stopColor="#0b1828" />
          <stop offset="100%" stopColor="#1b3048" />
        </linearGradient>
        <linearGradient id="gaWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#26313f" />
          <stop offset="100%" stopColor="#10171f" />
        </linearGradient>
        <linearGradient id="gaGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a4258" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#0d1a26" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#3a5a74" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="gaSnow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a9c4de" />
          <stop offset="55%" stopColor="#e8f4ff" />
          <stop offset="100%" stopColor="#b6cfe6" />
        </linearGradient>
        <radialGradient id="gaLight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe0a0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffb040" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#gaSky)" />
      {/* дальний забор и сугробы за домом */}
      <path d="M0 700 Q180 660 360 706 Q540 748 760 700 Q920 662 1080 700 L1080 780 L0 780 Z" fill="#16273a" opacity={0.85} />
      {Array.from({ length: 22 }, (_, i) => <rect key={i} x={i * 52 - 6} y={640} width={16} height={120} fill="#0e1a26" opacity={0.7} />)}
      {/* дом слева, в отдалении, тёмный */}
      <path d="M-40 980 L150 830 L340 980 L340 1250 L-40 1250 Z" fill="#0c141c" stroke="#1a2732" strokeWidth={6} opacity={0.95} />
      <path d="M-70 990 L150 812 L372 990 L372 1016 L150 838 L-70 1016 Z" fill="url(#gaSnow)" opacity={0.5} />
      <circle cx={200} cy={1080} r={30} fill="#ffcf7a" opacity={0.22} filter="url(#ga12)" />
      {/* гараж: ворота-распашонки, приоткрыты */}
      <rect x={470} y={470} width={630} height={790} fill="url(#gaWall)" stroke="#3c4a58" strokeWidth={8} />
      <path d="M470 470 L1100 470 L1100 512 L470 512 Z" fill="url(#gaSnow)" opacity={0.7} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={486} y={556 + i * 118} width={598} height={8} fill="#1b2632" opacity={0.9} />)}
      {/* створка левая, отведена в сторону — видно тёмный проём */}
      <path d="M470 500 L360 540 L360 1210 L470 1250 Z" fill="#1a2430" stroke="#3c4a58" strokeWidth={7} />
      <path d="M470 500 L360 540 L360 572 L470 534 Z" fill="url(#gaSnow)" opacity={0.55} />
      <rect x={470} y={512} width={180} height={738} fill="#05090e" />
      {/* проём: холодный свет изнутри и пол */}
      <path d="M470 512 L650 512 L650 1250 L470 1250 Z" fill="#070c12" />
      <ellipse cx={560} cy={1180} rx={150} ry={90} fill="#12283c" opacity={0.6} />
      {/* створка правая, приоткрыта */}
      <path d="M1100 470 L1100 1258 L980 1220 L980 512 Z" fill="#151f29" stroke="#3c4a58" strokeWidth={7} />
      {/* машина: тёмный силуэт в проёме, снег на крыше */}
      <g>
        <path d="M300 1200 L360 1070 Q386 1016 460 1008 L800 1008 Q874 1016 902 1070 L962 1200 Z" fill="#0a1017" stroke="#46596c" strokeWidth={7} />
        <path d="M420 1040 L500 946 L700 946 L790 1040 Z" fill="url(#gaGlass)" />
        <path d="M420 1040 L500 946 L700 946 L790 1040 Z" fill="none" stroke="#4e6a84" strokeWidth={6} />
        <rect x={300} y={1200} width={662} height={150} rx={22} fill="#0c131a" stroke="#46596c" strokeWidth={7} />
        <circle cx={450} cy={1352} r={92} fill="#05080c" stroke="#3a4c5e" strokeWidth={12} />
        <circle cx={450} cy={1352} r={38} fill="#1c2836" stroke="#4e6a84" strokeWidth={6} />
        <circle cx={812} cy={1352} r={92} fill="#05080c" stroke="#3a4c5e" strokeWidth={12} />
        <circle cx={812} cy={1352} r={38} fill="#1c2836" stroke="#4e6a84" strokeWidth={6} />
        <path d="M400 1002 Q600 984 800 1002 L800 1024 Q600 1006 400 1024 Z" fill="url(#gaSnow)" opacity={0.85} />
        <path d="M496 950 Q600 940 700 950 L700 966 Q600 956 496 966 Z" fill="url(#gaSnow)" opacity={0.5} />
        <rect x={322} y={1108} width={54} height={34} rx={10} fill="#5a4a2a" opacity={0.5} />
      </g>
      {/* следы на снегу от гаража к дому */}
      {Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={300 - i * 46} cy={1240 + i * 26} rx={22} ry={9} fill="#0d1a26" opacity={0.55} />)}
      {/* земля: сугробы */}
      <path d="M0 1330 Q260 1250 520 1322 Q780 1394 1080 1300 L1080 1920 L0 1920 Z" fill="#122233" />
      <path d="M0 1360 Q300 1300 560 1358 Q820 1416 1080 1348 L1080 1920 L0 1920 Z" fill="url(#gaSnow)" opacity={0.32} />
      {/* оранжевое пятно от включённого света в доме */}
      <circle cx={210} cy={1080} r={190} fill="url(#gaLight)" opacity={0.35} />
      {/* выхлоп: струя из трубы */}
      {Array.from({ length: 9 }, (_, i) => {
        const t = (frame / 48 + i * 0.34) % 1;
        const x = 900 + t * 220;
        const y = 1420 - t * 160 + Math.sin(t * 6 + i) * 30;
        return <circle key={i} cx={x} cy={y} r={24 + t * 90} fill="#5a6a7a" opacity={(1 - t) * 0.3} filter="url(#ga14)" />;
      })}
      {flakes.map((s, i) => {
        const y = (s.y + frame * 1.8 * s.sp) % 1920;
        return <circle key={i} cx={s.x + Math.sin(frame / 26 + s.ph) * 24} cy={y} r={s.r} fill="#e8f4ff" opacity={0.45} />;
      })}
    </svg>
  );
};

// ---------- 8. Крупно: вишнёвые губы (поздний признак) ----------
export const CherryLips: React.FC<{ frame: number }> = ({ frame }) => {
  const R = mulberry(13);
  const cracks = Array.from({ length: 22 }, () => ({ x: 330 + R() * 420, y: 1040 + R() * 90, l: 30 + R() * 90, a: (R() - 0.5) * 0.9 }));
  const press = 0.5 + 0.5 * Math.sin(frame / 22);
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        {blur("cl30", 30)}
        {blur("cl10", 10)}
        <radialGradient id="clSkin" cx="50%" cy="46%" r="66%">
          <stop offset="0%" stopColor="#9a6a56" />
          <stop offset="55%" stopColor="#6a4436" />
          <stop offset="100%" stopColor="#1e120e" />
        </radialGradient>
        <linearGradient id="clUpper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8e1a28" />
          <stop offset="60%" stopColor="#70101c" />
          <stop offset="100%" stopColor="#4a0810" />
        </linearGradient>
        <linearGradient id="clLower" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a0a14" />
          <stop offset="45%" stopColor="#a01828" />
          <stop offset="100%" stopColor="#6a0c16" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="#160d0a" />
      {/* кожа крупным планом, тёмная: освещён только рот */}
      <ellipse cx={540} cy={980} rx={620} ry={700} fill="url(#clSkin)" />
      <ellipse cx={540} cy={1060} rx={430} ry={300} fill="#3a221a" opacity={0.55} filter="url(#cl30)" />
      {/* носогубные складки и тень носа сверху */}
      <path d="M400 900 C380 990 372 1030 380 1064" stroke="#4a2a20" strokeWidth={16} fill="none" opacity={0.45} filter="url(#cl10)" />
      <path d="M680 900 C700 990 708 1030 700 1064" stroke="#4a2a20" strokeWidth={16} fill="none" opacity={0.45} filter="url(#cl10)" />
      <ellipse cx={540} cy={860} rx={130} ry={70} fill="#3a2018" opacity={0.5} filter="url(#cl30)" />
      {/* верхняя губа с лук-стрелкой */}
      <path d="M282 1090 C360 1006 452 986 540 1036 C628 986 720 1006 798 1090 C720 1084 628 1070 540 1076 C452 1070 360 1084 282 1090 Z" fill="url(#clUpper)" stroke="#2e050a" strokeWidth={6} />
      {/* нижняя губа, полная */}
      <path d="M292 1096 C400 1088 500 1082 540 1084 C580 1082 680 1088 788 1096 C760 1200 660 1268 540 1276 C420 1268 320 1200 292 1096 Z" fill="url(#clLower)" stroke="#2e050a" strokeWidth={6} />
      {/* линия рта и блики */}
      <path d="M288 1092 C400 1080 500 1074 540 1076 C580 1074 680 1080 792 1092" stroke="#1a0206" strokeWidth={9} fill="none" opacity={0.95} />
      <ellipse cx={430} cy={1160} rx={96} ry={26} fill="#ff9aa0" opacity={0.2 + 0.12 * press} filter="url(#cl10)" />
      <ellipse cx={640} cy={1130} rx={50} ry={14} fill="#ffb0b0" opacity={0.16} filter="url(#cl10)" />
      {cracks.map((c, i) => (
        <line key={i} x1={c.x} y1={c.y} x2={c.x + Math.cos(c.a) * c.l} y2={c.y + Math.sin(c.a) * c.l * 0.3} stroke="#2a0308" strokeWidth={2.2} opacity={0.45} />
      ))}
      {/* обесцвеченная кожа вокруг — признак кислородного голода */}
      <ellipse cx={540} cy={980} rx={620} ry={700} fill="#7a7a8a" opacity={0.14} filter="url(#cl30)" />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 45% at 50% 55%, rgba(0,0,0,0) 40%, rgba(6,3,2,0.9) 100%)" }} />
    </svg>
  );
};
