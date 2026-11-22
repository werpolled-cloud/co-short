import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { drawGirl, GirlPose } from "./Sprite";

// Быстрая проверка персонажа: 8 поз на одном кадре, без WebGL (рендерится за секунды).
const POSES: { label: string; p: GirlPose }[] = [
  { label: "base", p: { armL: 0.05, armR: 0.05, mouth: 0.4 } },
  { label: "smile", p: { armL: 0.05, armR: 0.05, mouth: 0.85, eyes: "happy" } },
  { label: "dip", p: { armR: 0.55, mouth: 0.3, eyes: "down", lean: -0.12 } },
  { label: "brush", p: { armR: 0.75, brush: true, glow: 0.9, mouth: 0.2, eyes: "down" } },
  { label: "worried", p: { eyes: "worried", mouth: 0.3, armL: 0.3, armR: 0.3 } },
  { label: "hand-up", p: { armR: 0.95, mouth: 0.7, eyes: "happy" } },
  { label: "tilt", p: { headTilt: 0.8, lean: 0.15, mouth: 0.6, eyes: "happy", hairStyle: 2, hairColor: "#2f2620" } },
  { label: "red", p: { dress: "#b8645a", hairStyle: 0, hairColor: "#8a5a30", mouth: 0.9, eyes: "happy" } },
];

const Girl: React.FC<{ p: GirlPose }> = ({ p }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    if (ref.current) drawGirl(ref.current, p);
  }, [JSON.stringify(p)]);
  return <canvas ref={ref} width={600} height={1080} style={{ width: 270, height: 486 }} />;
};

export const CharSheet: React.FC = () => {
  useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#15221a", display: "flex", flexWrap: "wrap", gap: 10, padding: 6 }}>
      {POSES.map((x, i) => (
        <div key={i} style={{ width: 270, position: "relative" }}>
          <Girl p={x.p} />
          <div style={{ position: "absolute", left: 4, top: 2, color: "#ff0", fontFamily: "monospace", fontSize: 16 }}>{x.label}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
