import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import DATA from "./shots.json";
import { FaceOld } from "./FaceOld";
import { Neurons } from "../components/three/Neurons";
import { Vessel } from "../components/three/Vessel";
import { WarmPortraitBG, DeepBG } from "../components/Backgrounds";
import { Grain } from "../components/Film";
import { HUD, Note } from "../components/HUD";
import { Caption } from "../components/Caption";
import { StatCard, EmberBG } from "../components/StatCard";
import { C, grid } from "../style/tokens";
import { Monitor } from "./Props";
import { EyeMacro, BedTop } from "./Variety";
import { HeartPaper } from "../components/HeartPaper";
import { XrayShot } from "../xray3d/XrayShot";
import { Coals, BloodFlow, GemTrap, O2Curve, HouseWinter, Shutter, Garage, CherryLips } from "./CoScenes";

// Ролик 02 «Угарный газ»: 36 тактов @96 BPM = 90 с, у каждого такта свой план.
const g = grid(DATA.bpm);
const B = g.bar; // 75 кадров
export const CO_FRAMES = DATA.bars * B;

type Shot = (typeof DATA.shots)[number] & Record<string, any>;
const SHOTS = DATA.shots as any as Shot[];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- лицо: те же состояния, плюс «вишнёвые» губы при отравлении ----------
const faceProps = (s: Shot, f: number) => {
  const p: any = s.face || {};
  const blinkBase = p.blink === 1 ? 0.34 : f % 96 >= 40 && f % 96 <= 46 ? Math.sin(((f % 96 - 40) / 6) * Math.PI) : 0;
  let blink = Math.max(p.blink === 1 ? 0.34 : p.blink || 0, blinkBase);
  let spasm = p.spasm || 0;
  if (p.spasmPulse) spasm = Math.max(0, Math.sin((f / B) * Math.PI * 6)) * 0.85;
  let pallor = p.pallor || 0;
  let erase = 0;
  if (p.dying) {
    pallor = Math.max(pallor, interpolate(f, [0, B], [0.55, 1], clamp));
    blink = 0.34;
    erase = interpolate(f, [50, B], [0, 0.16], clamp);
  }
  return {
    frame: f, blink, spasm, pallor, erase, cherry: p.cherry || 0,
    mouth: p.mouth || 0, look: p.look || 0, fear: p.fear || 0, pupil: p.pupil || 0,
    redEye: p.redEye || 0, sweat: p.sweat || 0, flush: p.flush || 0, drool: p.drool || 0,
  };
};

const FaceShot: React.FC<{ s: Shot; f: number }> = ({ s, f }) => {
  const fp = faceProps(s, f);
  const mouth = s.kind === "mouth";
  const scale = mouth
    ? interpolate(f, [0, B], [2.4, 2.6])
    : s.close
      ? interpolate(f, [0, B], [1.36, 1.48])
      : interpolate(f, [0, B], [1.0, 1.06]);
  const origin = mouth ? "50% 61%" : s.close ? "50% 50%" : "50% 58%";
  const rew = s.rewind ? interpolate(f, [0, B * 0.7], [1, 0], clamp) : 1;
  return (
    <>
      <WarmPortraitBG />
      <AbsoluteFill style={{ transform: `scale(${scale * (1 + Math.sin(f / 22) * 0.004)})`, transformOrigin: origin, filter: rew < 1 ? `saturate(${0.4 + 0.6 * rew}) brightness(${0.82 + 0.18 * rew})` : undefined }}>
        <FaceOld {...(fp as any)} />
      </AbsoluteFill>
    </>
  );
};

// ---------- кровь: 2D-поток эритроцитов (такты 7, 11, 19) ----------
const BloodShot: React.FC<{ s: Shot; f: number }> = ({ s, f }) => {
  const b: any = s.blood || {};
  return (
    <>
      <BloodFlow frame={f} co={b.co || 0} empty={b.empty || 0} thick={b.thick || 0} />
      <Note text={b.empty > 0.8 ? "КИСЛОРОД ТКАНЯМ: 12 %" : b.empty > 0.5 ? "ПУСТЫХ ГЕМОГЛОБИНОВ: 6 ИЗ 10" : "МОЛЕКУЛ ГАЗА В КРОВИ: 840"} y={1690} color={b.empty > 0.5 ? C.red : C.yellow} size={40} />
    </>
  );
};

// ---------- 3D-сосуд с кровью (такт-вставка) ----------
const VesselShot: React.FC<{ f: number }> = ({ f }) => {
  const { width, height } = useVideoConfig();
  return (
    <>
      <DeepBG center="#1a0b10" />
      <ThreeCanvas width={width} height={height} camera={{ fov: 60, near: 0.05, far: 120, position: [0, 0, 9] }}>
        <fog attach="fog" args={["#1a0b10", 8, 34]} />
        <group rotation={[0.2, (f / 30) * 0.12, Math.sin(f / 90) * 0.04]}>
          <Vessel t={f / 30} progress={0.3 + (f / B) * 0.3} thick={0.2} />
        </group>
      </ThreeCanvas>
    </>
  );
};

// ---------- нейроны: гипоксия, нейрон за нейроном гаснет (такты 15, 16, 21) ----------
const NEURO_BARS = SHOTS.filter((s) => s.kind === "neuro").map((s) => s.bar);
const NeuroShot: React.FC<{ s: Shot; f: number }> = ({ s, f }) => {
  const { width, height } = useVideoConfig();
  const idx = NEURO_BARS.indexOf(s.bar);
  const T = idx * B + f;
  const dark = s.dark ? 1 : 0;
  return (
    <>
      <DeepBG center={dark ? "#04070c" : "#0d2238"} />
      <ThreeCanvas width={width} height={height} camera={{ fov: 50, position: [idx ? 2.0 : 0, idx ? -1.6 : 0, interpolate(T, [0, 2 * B], [dark ? 12 : 15.5, dark ? 8.5 : 10.5])], near: 0.1, far: 100 }}>
        <fog attach="fog" args={["#050b16", 20, 40]} />
        <group rotation={[idx ? 0.22 : 0, (T / 30) * 0.08, Math.sin(T / 100) * 0.03]}>
          <Neurons t={T / 30} plaque={interpolate(T, [0, B], [dark ? 0.1 : 0.05, dark ? 0.4 : 0.75], clamp)} loss={interpolate(T, [6, 2 * B], [0.1, dark ? 1 : 0.86], clamp)} seed={dark ? 11 : 4} virus={false} />
        </group>
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(10,40,70,0) 30%, rgba(2,8,18,0.9) 100%)", opacity: dark ? 0.9 : 0.45 }} />
      <Note text={dark ? "БЕЗ КИСЛОРОДА НЕЙРОНЫ ГИБНУТ" : `ПОГАСЛО НЕЙРОНОВ: ${Math.round(interpolate(T, [6, 2 * B], [4, dark ? 96 : 71], clamp))}%`} y={1680} color={dark ? C.red : C.yellow} size={40} />
    </>
  );
};

// ---------- рентген: путь газа по крови к сердцу и мозгу ----------
const XrayView: React.FC<{ s: Shot; f: number }> = ({ s, f }) => {
  const [a, b] = s.xray;
  const p = interpolate(f, [0, B], [a, b], clamp);
  return (
    <>
      <XrayShot frame={f} p={p} brainHit={interpolate(f, [B - 26, B - 6], [0, 0.7], clamp)} />
    </>
  );
};

// ---------- монитор: ЭКГ встаёт в линию ----------
const MonitorShot: React.FC<{ f: number }> = ({ f }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "#020604" }} />
    <Monitor frame={f} amp={interpolate(f, [0, B * 0.5], [1, 0], clamp)} bpm={118} />
    <Note text={f > B * 0.5 ? "ПУЛЬС: 0" : `ПУЛЬС: ${Math.round(interpolate(f, [0, B * 0.5], [118, 18], clamp))}`} y={1420} color={f > B * 0.5 ? C.red : "#3dff8a"} size={52} />
  </>
);

// ---------- бумажное сердце (такт 17): сокращается, потом сбивается ----------
const HeartShot: React.FC<{ f: number }> = ({ f }) => {
  // к концу такта сердце сбивается: удары чаще и рванее, штриховка «растягивается»
  const beat = Math.abs(Math.sin((f / B) * Math.PI * (5.5 + (f / B) * 3)));
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 78% 62% at 50% 52%, #2b1708 0%, #120a04 55%, #050302 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.5, mixBlendMode: "screen", background: "radial-gradient(circle 420px at 50% 44%, rgba(255,140,40,0.28), rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", inset: 0, filter: "saturate(0.62) brightness(0.78) contrast(1.12)", transformOrigin: "50% 46%", transform: `scale(${1.1 + Math.sin(f / 9) * 0.014}) translateY(${interpolate(f, [0, B], [-10, 26], clamp)}px)` }}>
        <HeartPaper beat={beat} strain={f / B} cracks={interpolate(f, [B * 0.55, B], [0, 0.6], clamp)} />
      </div>
      <Note text={`ПУЛЬС: ${Math.round(interpolate(f, [0, B], [84, 138], clamp))}`} y={1690} color={f > B * 0.6 ? C.red : C.yellow} size={44} />
    </>
  );
};

// ---------- телефон 103 (такт 29) ----------
const PhoneShot: React.FC<{ f: number }> = ({ f }) => {
  const glow = interpolate(f, [10, 26], [0, 1], clamp);
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="phRoom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1420" />
          <stop offset="100%" stopColor="#02060a" />
        </linearGradient>
        <radialGradient id="phGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#7ad8ff" stopOpacity={String(glow)} />
          <stop offset="100%" stopColor="#0a3a5a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#phRoom)" />
      {/* окно настежь: морозный воздух */}
      <rect x={120} y={420} width={150} height={1240} rx={20} fill="#1a3450" stroke="#3a5a7a" strokeWidth={10} />
      <rect x={810} y={420} width={150} height={1240} rx={20} fill="#1a3450" stroke="#3a5a7a" strokeWidth={10} />
      <rect x={300} y={420} width={480} height={1240} fill="#071626" stroke="#3a5a7a" strokeWidth={10} />
      {Array.from({ length: 8 }, (_, i) => {
        const y = 500 + ((f * 8 + i * 160) % 1100);
        return <ellipse key={i} cx={540 + Math.sin(f / 20 + i) * 160} cy={y} rx={190} ry={70} fill="#9ac8e8" opacity={0.09} />;
      })}
      <rect x={120} y={420} width={150} height={1240} rx={20} fill="#cfe6ff" opacity={0.08} />
      <rect x={810} y={420} width={150} height={1240} rx={20} fill="#cfe6ff" opacity={0.08} />
      {/* телефон в руке */}
      <g transform={`translate(540 1430) rotate(-8)`}>
        <rect x={-170} y={-300} width={340} height={640} rx={54} fill="#0a0f16" stroke="#3a4a5a" strokeWidth={8} />
        <rect x={-146} y={-266} width={292} height={560} rx={34} fill="url(#phGlow)" />
        <text x={0} y={-60} textAnchor="middle" fontSize={86} fontWeight={900} fill="#e8f8ff" fontFamily="Montserrat, sans-serif" opacity={glow}>103</text>
        <text x={0} y={30} textAnchor="middle" fontSize={34} fontWeight={800} fill="#9ad8f0" fontFamily="Montserrat, sans-serif" opacity={glow}>ВЫЗОВ</text>
        <circle cx={0} cy={200} r={54} fill="#2fe07a" opacity={0.85 * glow} />
        <text x={0} y={214} textAnchor="middle" fontSize={40} fontWeight={900} fill="#04220f" fontFamily="Montserrat, sans-serif" opacity={glow}>OK</text>
      </g>
      {/* ладонь и пальцы на корпусе */}
      <path d="M430 1500 C372 1520 344 1584 356 1660 C368 1740 430 1796 512 1802 C566 1806 596 1770 596 1720 L596 1516 C560 1490 486 1486 430 1500 Z" fill="#c99179" stroke="#5d3327" strokeWidth={7} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${372 + i * 6} ${1508 + i * 74} C${412 + i * 4} ${1488 + i * 74} ${470 + i * 3} ${1492 + i * 74} ${506 + i * 2} ${1512 + i * 74} C${520 + i * 2} ${1534 + i * 74} ${502 + i * 3} ${1552 + i * 74} ${470 + i * 3} ${1548 + i * 74} C${432 + i * 4} ${1544 + i * 74} ${396 + i * 5} ${1540 + i * 74} ${372 + i * 6} ${1508 + i * 74} Z`} fill="#d9a189" stroke="#5d3327" strokeWidth={5} />
      ))}
      <path d="M596 1600 C648 1596 690 1636 690 1690 C690 1748 648 1782 600 1776" fill="#c99179" stroke="#5d3327" strokeWidth={7} />
      <path d="M470 1830 C452 1888 452 1904 456 1920 L640 1920 C650 1872 648 1846 632 1820 Z" fill="#1e2430" stroke="#101620" strokeWidth={7} />
    </svg>
  );
};

// ---------- фон карточки: размытая сцена из этого же ролика ----------
const CardBG: React.FC<{ kind: string; f: number }> = ({ kind, f }) => (
  <>
    <AbsoluteFill style={{ filter: "blur(14px) brightness(0.75) saturate(0.85)", transform: `scale(${interpolate(f, [0, B], [1.12, 1.2])})` }}>
      {kind === "coals" && <Coals frame={f} gas={1} />}
      {kind === "gem" && <GemTrap frame={f} />}
      {kind === "blood" && <BloodFlow frame={f} co={1} />}
      {kind === "house" && <HouseWinter frame={f} />}
      {kind === "lips" && <CherryLips frame={f} />}
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 50% 47%, rgba(0,0,0,0.55), rgba(40,4,0,0.35))" }} />
    <AbsoluteFill style={{ opacity: 0.45, mixBlendMode: "screen" }}><EmberBG /></AbsoluteFill>
  </>
);

// ---------- диспетчер сцен ----------
const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const hud = s.hud as [string, number, number] | undefined;
  const k = s.kind;
  const coals = s.coals as { gas?: number; draft?: number } | undefined;
  return (
    <AbsoluteFill>
      {(k === "face" || k === "hook" || k === "mouth") && <FaceShot s={s} f={f} />}
      {k === "house" && <HouseWinter frame={f} />}
      {k === "coals" && <Coals frame={f} gas={coals?.gas ?? 0.35} draft={coals?.draft ?? 0} dying={s.dying ? 1 : 0} />}
      {k === "shutter" && <Shutter frame={f} open={s.open ? 1 : 0} />}
      {k === "blood" && <BloodShot s={s} f={f} />}
      {k === "vessel" && <VesselShot f={f} />}
      {k === "gem" && <GemTrap frame={f} />}
      {k === "curve" && <O2Curve frame={f} />}
      {k === "garage" && <Garage frame={f} />}
      {k === "lips" && <CherryLips frame={f} />}
      {k === "phone" && <PhoneShot f={f} />}
      {k === "heart" && <HeartShot f={f} />}
      {k === "xray" && <XrayView s={s} f={f} />}
      {k === "neuro" && <NeuroShot s={s} f={f} />}
      {k === "bed" && <BedTop frame={f} face={faceProps(s, f)} thermo={s.thermo} breath={s.breath ?? 1} />}
      {k === "eye" && <EyeMacro frame={f} pupil={interpolate(f, [0, 50], [0.3, 1], clamp)} red={0.6} dart={1} />}
      {k === "monitor" && <MonitorShot f={f} />}
      {k === "card" && <CardBG kind={s.cardBg} f={f} />}
      <Grain amount={k === "xray" || k === "neuro" || k === "gem" || k === "curve" ? 0.07 : 0.1} vignette={0.6} />
      {hud && <HUD left={hud[0]} label="КИСЛОРОД" value={interpolate(f, [0, B], [hud[1], hud[2]], clamp)} />}
      {s.note && <Note text={s.note[0]} y={1690} color={s.note[1] === "r" ? C.red : C.yellow} size={40} />}
      {s.cap && <Caption text={s.cap} from={2} dur={B - 2} top={262} base={s.cap.length > 26 ? 74 : 90} />}
      {s.card && <StatCard big={s.card[0]} sub={s.card[1]} src={s.card[2]} color={s.card[3] as "y" | "r"} from={0} dur={B} />}
    </AbsoluteFill>
  );
};

// ---------- удары, тряска, пульсация, вспышки, отмотка ----------
const RED_HITS = [
  ...SHOTS.filter((s) => s.cap && s.cap.includes("[")).map((s) => s.bar * B + 2 + s.cap.split(/\s+/).findIndex((w: string) => w.includes("[")) * 3 + 3),
  ...SHOTS.filter((s) => s.kind === "mouth" || s.bar === 14).map((s) => s.bar * B + 3),
];
const shake = (frame: number) => {
  for (const h of RED_HITS) {
    const d = frame - h;
    if (d >= 0 && d < 9) { const a = 14 * Math.exp(-d * 0.45); return `translate(${Math.sin(d * 2.7) * a}px, ${Math.cos(d * 3.3) * a * 0.6}px)`; }
  }
  return undefined;
};
const RedPulse: React.FC<{ frame: number }> = ({ frame }) => {
  let o = 0;
  for (const h of RED_HITS) { const d = frame - h; if (d >= 0 && d < 14) o = Math.max(o, 0.5 * Math.exp(-d * 0.25)); }
  return <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0) 40%, rgba(200,10,0,1) 100%)", opacity: o, mixBlendMode: "screen" }} />;
};
const Flash: React.FC<{ frame: number; at: number; color?: string }> = ({ frame, at, color = "#fff" }) =>
  frame >= at && frame < at + 4 ? <AbsoluteFill style={{ background: color, opacity: interpolate(frame, [at, at + 3], [0.85, 0], clamp), pointerEvents: "none" }} /> : null;

// «Газ в комнате»: после дропа к кадру подмешивается холодная дымка, к смерти — почти чёрный
const GasHaze: React.FC<{ frame: number }> = ({ frame }) => {
  const a = interpolate(frame, [B * 5.5, B * 12], [0, 0.22], clamp) + interpolate(frame, [B * 14, B * 26], [0, 0.3], clamp);
  return <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse 80% 60% at 50% 55%, rgba(20,30,40,0) 20%, rgba(8,14,20,1) 100%)", opacity: a }} />;
};

export const CoVideo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* голос: с 0-го кадра (Леонид Воробьев, freetts.ru) */}
      <Audio src={staticFile("co_voice.wav")} volume={1.25} />
      {/* музыка: мрачная часть 0–27 такт и светлая 27–35 такт — двумя окнами, чтобы не уехать по фазе */}
      <Sequence from={0} durationInFrames={B * 27}>
        <Audio src={staticFile("co_music_v2.wav")} volume={0.62} />
      </Sequence>
      <Sequence from={B * 27} durationInFrames={B * 9}>
        <Audio src={staticFile("co_music_v2.wav")} volume={0.62} startFrom={B * 27} />
      </Sequence>
      <AbsoluteFill style={{ transform: shake(frame) }}>
        {SHOTS.map((s) => (
          <Sequence key={s.bar} from={s.bar * B} durationInFrames={B}>
            <ShotView s={s} />
          </Sequence>
        ))}
      </AbsoluteFill>
      <GasHaze frame={frame} />
      <RedPulse frame={frame} />
      <Flash frame={frame} at={DATA.dropBar * B} />
      <Flash frame={frame} at={DATA.secondDrop * B} />
    </AbsoluteFill>
  );
};
