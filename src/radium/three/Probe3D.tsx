import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Workshop, Sprite, PAL, ContactShadow } from "./Workshop";
import { useGirlTexture, GirlPose } from "./Sprite";

// ============================================================================
// ПРОБА: три сцены в новом качестве.
//   1) цех, крупный план — девушка обмакивает кисть в радий
//   2) она подносит кисть к губам, кончик светится
//   3) отъезд: три девушки за столом, свет гаснет, они светятся
// Камера двигается по-настоящему (позиция + цель), свет и тени считаются.
// ============================================================================

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const smooth = (t: number) => t * t * (3 - 2 * t);

const GirlPos: React.FC<{ pose: GirlPose; position: [number, number, number]; height?: number; opacity?: number }> = ({
  pose, position, height = 2.35, opacity = 1,
}) => {
  const tex = useGirlTexture(pose);
  return <Sprite texture={tex} position={position} height={height} opacity={opacity} />;
};

// ---------- сцены ----------
const SceneDip: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 90; // 0..1
  const camZ = 4.9 - smooth(Math.min(1, t * 1.4)) * 0.9;
  const camX = -0.6 + Math.sin(f / 40) * 0.12;
  const tex = useGirlTexture({
    lean: -0.15, headTilt: -4, armL: 0.12, armR: 0.72 - 0.25 * Math.sin(t * Math.PI),
    mouth: 0.25, eyes: "down", hairStyle: 1, hairColor: "#5a3a26", dress: "#6d86b8",
    brush: false,
  });
  return (
    <>
      <PerspCam pos={[camX + 0.1, 1.45, camZ + 1.8]} target={[0.15, 1.05, 1.5]} fov={42} />
      <Workshop deskShift={1.1} />
      <><ContactShadow x={0.1} z={1.5} r={0.66} /><Sprite texture={tex} position={[0.1, 1.18, 1.5]} height={2.36} /></>
      {/* вторая девушка дальше, размыта расстоянием */}
      <GirlPos
        pose={{ lean: 0.1, headTilt: 6, armL: 0.2, armR: 0.3, mouth: 0.6, eyes: "happy", hairStyle: 2, hairColor: "#2e2620", dress: "#b8695a" }}
        position={[-2.0, 1.16, 0.9]} height={2.32}
      />
    </>
  );
};

const SceneLick: React.FC<{ f: number }> = ({ f }) => {
  const t = Math.min(1, f / 90);
  const lift = smooth(Math.min(1, t * 1.6));
  const glow = 0.35 + lift * 0.65;
  const camZ = 4.1 - lift * 0.55;
  const tex = useGirlTexture({
    lean: 0.05, headTilt: -6 + lift * 3, armL: 0.1, armR: 0.34 + lift * 0.3,
    mouth: 0.15 + lift * 0.5, eyes: "down", hairStyle: 1, hairColor: "#5a3a26", dress: "#6d86b8",
    brush: true, brushToMouth: true, glow,
  });
  return (
    <>
      <PerspCam pos={[0.12, 1.45, camZ + 2.1]} target={[0.1, 1.12, 1.5]} fov={40} />
      <Workshop paintDark={0.25} deskShift={1.1} />
      <><ContactShadow x={0.05} z={1.5} r={0.64} /><Sprite texture={tex} position={[0.05, 1.18, 1.5]} height={2.36} /></>
      <pointLight color="#8bff5a" intensity={4.2 * glow} distance={2.4} position={[0.5, 1.9, 1.6]} />
    </>
  );
};

const SceneGlow: React.FC<{ f: number }> = ({ f }) => {
  const t = Math.min(1, f / 110);
  const back = smooth(t);
  const tex1 = useGirlTexture({ lean: -0.08, headTilt: -5, armL: 0.1, armR: 0.2, mouth: 0.75, eyes: "happy", hairStyle: 1, hairColor: "#5a3a26", dress: "#6d86b8", brush: true, glow: 0.9 });
  const tex2 = useGirlTexture({ lean: 0.1, headTilt: 7, armL: 0.15, armR: 0.25, mouth: 0.8, eyes: "happy", hairStyle: 2, hairColor: "#2e2620", dress: "#b8695a", brush: true, glow: 0.85 });
  const tex3 = useGirlTexture({ lean: -0.05, headTilt: -2, armL: 0.12, armR: 0.2, mouth: 0.55, eyes: "happy", hairStyle: 0, hairColor: "#7a5230", dress: "#6f9a68", brush: true, glow: 0.8 });
  return (
    <>
      <PerspCam pos={[0 + back * 0.4, 1.7 + back * 0.2, 7.2 + back * 3.0]} target={[0, 1.05, 0.75]} fov={42} />
      <Workshop paintDark={0.55} deskShift={1.5} />
      <ambientLight intensity={0.16} />
      <><ContactShadow x={-1.5} z={1.2} r={0.6} /><Sprite texture={tex1} position={[-1.25, 1.16, 1.2]} height={2.32} /></>
      <><ContactShadow x={0.1} z={0.7} r={0.58} /><Sprite texture={tex2} position={[0.1, 1.14, 0.7]} height={2.28} /></>
      <><ContactShadow x={1.6} z={0.2} r={0.56} /><Sprite texture={tex3} position={[1.45, 1.12, 0.35]} height={2.24} /></>
      {[-1.35, 0.05, 1.45].map((x, i) => (
        <pointLight key={i} color="#8bff5a" intensity={3.4} distance={3.2} position={[x + 0.4, 1.85, 1.2 - i * 0.5]} />
      ))}
    </>
  );
};

// ---------- камера с настоящим перспективным проездом ----------
import { useThree } from "@react-three/fiber";
const PerspCam: React.FC<{ pos: [number, number, number]; target: [number, number, number]; fov?: number }> = ({ pos, target, fov = 42 }) => {
  const { camera } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(pos[0], pos[1], pos[2]);
  c.lookAt(target[0], target[1], target[2]);
  if (c.fov !== fov) { c.fov = fov; c.updateProjectionMatrix(); }
  return null;
};

// ---------- сборка пробы ----------
export const Radium3DProbe: React.FC<{ scene: "dip" | "lick" | "glow"; dark?: boolean }> = ({ scene, dark = false }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#050a06" }}>
      <ThreeCanvas
        width={width} height={height}
        shadows
        gl={{ antialias: true, alpha: false }}
        camera={{ fov: 42, near: 0.1, far: 60, position: [0, 1.7, 5] }}
        style={{ background: "#050a06" }}
      >
        <color attach="background" args={[dark ? "#050a06" : "#0e1a12"]} />
        <ambientLight intensity={dark ? 0.14 : 0.42} />
        <hemisphereLight args={["#cfe8ff", "#2a1a0e", dark ? 0.12 : 0.5]} />
        {scene === "dip" && <SceneDip f={f} />}
        {scene === "lick" && <SceneLick f={f} />}
        {scene === "glow" && <SceneGlow f={f} />}
      </ThreeCanvas>
      {/* мягкая виньетка и лёгкое зерно, чтобы не было «пластика» */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
