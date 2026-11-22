import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SceneByKind } from "./Scenes";

// Ролик 04 «The girls who glowed in the dark»: 60 с, 30 fps, 1080×1920.
// Таймлайн привязан к реальным стопам голоса (замер по radium_voice.wav), а не к тактам:
// каждая реплика = свой отрезок, поэтому картинка всегда совпадает со словом.
export const RADIUM_FRAMES = 1800;

export type Seg = { from: number; to: number; kind: string; shot?: any };

// начало каждой реплики в кадрах (30 fps, замер по волне)
const L = [157, 232, 307, 385, 460, 551, 607, 691, 833, 910, 944, 991, 1084, 1158, 1209, 1283, 1357, 1430, 1516, 1581, 1655, 1729];

export const CAPTIONS: { from: number; to: number; text: string }[] = [
  { from: L[0], to: L[1], text: "THESE WOMEN LICKED\nTHEIR PAINTBRUSHES." },
  { from: L[1], to: L[2], text: "THE PAINT WAS {RADIUM}." },
  { from: L[2], to: L[3], text: "LUCKILY, IT MADE\nTHEM [GLOW]." },
  { from: L[3], to: L[4], text: "THEY THOUGHT IT\nWAS [FUN]." },
  { from: L[4], to: L[5], text: "UNLUCKILY, RADIUM\nGOES INTO YOUR [BONES]." },
  { from: L[5], to: L[6], text: "FOREVER." },
  { from: L[6], to: L[7], text: "HALF LIFE:\n{YEARS}." },
  { from: L[7], to: L[8], text: "TO YOUR BODY IT LOOKS\nLIKE {CALCIUM}." },
  { from: L[8], to: L[9], text: "SO YOUR BONES\nBUILD IT IN." },
  { from: L[9], to: L[10], text: "THEN THEY START\nTO [FALL APART]." },
  { from: L[10], to: L[11], text: "THEIR [TEETH] FELL OUT." },
  { from: L[11], to: L[12], text: "BY 1927,\nFIFTY WERE [DEAD]." },
  { from: L[12], to: L[13], text: "THE COMPANY SAID:\n\"NOT OUR FAULT\"." },
  { from: L[13], to: L[14], text: "SO {FIVE} WOMEN SUED." },
  { from: L[14], to: L[15], text: "IT TOOK [TWO YEARS]\nJUST TO FIND A LAWYER." },
  { from: L[15], to: L[16], text: "IN COURT, THEY COULDN'T\n[RAISE A HAND]." },
  { from: L[16], to: L[17], text: "THE COMPANY\nSIMPLY {WAITED}." },
  { from: L[17], to: L[18], text: "THEY SETTLED:\n{$10 000} EACH." },
  { from: L[18], to: L[19], text: "DOCTORS GAVE THEM\n[{4 MONTHS}]." },
  { from: L[19], to: L[20], text: "EVERY DIAL\nSTILL [GLOWS]." },
  { from: L[20], to: L[21], text: "AND THEIR NAMES\nCHANGED THE {LAW}." },
  { from: L[21], to: 1800, text: "THEY WERE ONLY TOLD TO\n[LICK] THEIR PAINTBRUSHES." },
];

export const SEGMENTS: Seg[] = [
  { from: 0, to: 75, kind: "title", shot: { kicker: "1920s", title: "THE GIRLS WHO GLOWED", sub: "in the dark" } },
  { from: 75, to: L[0], kind: "brush", shot: { girls: 3, lips: false, glow: 0.3 } },
  { from: L[0], to: L[1], kind: "brush", shot: { girls: 3, lips: true, glow: 0.35 } },
  { from: L[1], to: L[2], kind: "brush", shot: { girls: 1, lips: false, jar: true, glow: 0.8 } },
  { from: L[2], to: L[3], kind: "party", shot: { glow: 0.9, laugh: true } },
  { from: L[3], to: L[4], kind: "party", shot: { glow: 1, laugh: true, close: true } },
  { from: L[4], to: L[5], kind: "bone", shot: { depth: 0.35, glow: 0.6 } },
  { from: L[5], to: L[6], kind: "bone", shot: { depth: 1, glow: 1, freeze: true } },
  { from: L[6], to: L[7], kind: "half", shot: { years: "1 600", glow: 1 } },
  { from: L[7], to: L[8], kind: "atom", shot: { swap: 0.5 } },
  { from: L[8], to: L[9], kind: "wall", shot: { built: 0.6 } },
  { from: L[9], to: L[10], kind: "wall", shot: { built: 1, cracks: 0.8 } },
  { from: L[10], to: L[11], kind: "jaw", shot: { teeth: 0.6 } },
  { from: L[11], to: L[12], kind: "graves", shot: { count: 50 } },
  { from: L[12], to: L[13], kind: "court", shot: { sign: "U.S. RADIUM CORPORATION", lawyers: true } },
  { from: L[13], to: L[14], kind: "court", shot: { sign: "SUPREME COURT", women: 5 } },
  { from: L[14], to: L[15], kind: "calendar", shot: { flip: 0.5 } },
  { from: L[15], to: L[16], kind: "oath", shot: { hand: 0.15 } },
  { from: L[16], to: L[17], kind: "clock", shot: { wait: true } },
  { from: L[17], to: L[18], kind: "news", shot: { headline: "RADIUM VICTIMS WIN $50,000", sum: "$10 000" } },
  { from: L[18], to: L[19], kind: "ward", shot: { months: 4 } },
  { from: L[19], to: L[20], kind: "dials", shot: { glow: 1 } },
  { from: L[20], to: L[21], kind: "law", shot: { year: "1928" } },
  { from: L[21], to: 1800, kind: "brush", shot: { girls: 1, lips: true, glow: 0.35, callback: true } },
];

// ---------- подпись: жирный капс с обводкой, акценты [красный] {жёлтый} ----------
const CAP_RED = "#ffd000";
const ACC = (text: string, size: number) => {
  const parts = text.split(/(\[[^\]]+\]|\{[^}]+\})/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith("[") && p.endsWith("]")) {
      return (
        <span key={i} style={{ color: "#ff4a2a", textShadow: "0 6px 0 #5a0d00" }}>
          {p.slice(1, -1)}
        </span>
      );
    }
    if (p.startsWith("{") && p.endsWith("}")) {
      return (
        <span key={i} style={{ color: "#ffd000", textShadow: "0 6px 0 #3a2a00" }}>
          {p.slice(1, -1)}
        </span>
      );
    }
    return <span key={i}>{p}</span>;
  });
};

const Caption: React.FC<{ from: number; to: number; text: string }> = ({ from, to, text }) => {
  const f = useCurrentFrame();
  const len = to - from;
  if (f < 0 || f > len) return null;
  const pop = Math.min(1, Math.max(0, f / 6));
  const fade = len - f < 5 ? Math.max(0, (len - f) / 5) : 1;
  const lines = text.split("\n");
  const size = lines.join(" ").length > 34 ? 58 : 70;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 260, display: "flex", justifyContent: "center" }}>
      <div style={{
        fontFamily: "Montserrat, Inter, sans-serif", fontWeight: 900, fontSize: size, lineHeight: 1.06,
        textAlign: "center", color: "#ffffff", letterSpacing: -0.5,
        WebkitTextStroke: "7px rgba(8,10,12,0.9)", paintOrder: "stroke fill" as any,
        transform: `scale(${0.94 + pop * 0.06})`, opacity: Math.min(1, f / 4) * fade,
      }}>
        {lines.map((line, i) => <div key={i}>{ACC(line, size)}</div>)}
      </div>
    </div>
  );
};

const SceneIn: React.FC<{ seg: Seg }> = ({ seg }) => {
  const f = useCurrentFrame();
  return <SceneByKind kind={seg.kind} f={f} bar={Math.floor(f / 75)} shot={seg.shot || {}} />;
};

export const RadiumVideo: React.FC = () => {
  const f = useCurrentFrame();
  const p = Math.min(1, f / RADIUM_FRAMES);
  return (
    <AbsoluteFill style={{ background: "#04070a" }}>
      <Audio src={staticFile("radium_voice.wav")} volume={1} />
      <Audio src={staticFile("radium_music.wav")} volume={0.42} />
      {SEGMENTS.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={Math.max(1, s.to - s.from)} name={`${i}:${s.kind}`}>
          <SceneIn seg={s} />
        </Sequence>
      ))}
      {CAPTIONS.map((c, i) => (
        <Sequence key={`c${i}`} from={c.from} durationInFrames={Math.min(c.to - c.from + 1, RADIUM_FRAMES - c.from)} name={`cap${i}`}>
          <Caption from={0} to={c.to - c.from} text={c.text} />
        </Sequence>
      ))}
      {/* виньетка + прогресс */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 10, width: `${p * 100}%`, background: "#8bff5a", boxShadow: "0 0 18px #8bff5a" }} />
    </AbsoluteFill>
  );
};

