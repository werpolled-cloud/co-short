import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useGirlTexture } from "./Sprite";
import { Sprite } from "./Workshop";
import { useThree } from "@react-three/fiber";

const LookAt: React.FC = () => {
  const { camera } = useThree();
  camera.lookAt(0, 1.15, 0);
  return null;
};

// Диагностика: только спрайт + свет + стена. Без стола, без теней.
export const Isolate: React.FC = () => {
  const { width, height } = useVideoConfig();
  const tex = useGirlTexture({ brush: true, glow: 0.9, eyes: "happy", mouth: 0.7, armR: 0.75 });
  return (
    <AbsoluteFill style={{ background: "#101a12" }}>
      <ThreeCanvas width={width} height={height} shadows={false} camera={{ fov: 42, position: [0, 1.3, 4] }} style={{ background: "#101a12" }}>
        <color attach="background" args={["#101a12"]} />
        <ambientLight intensity={0.8} />
        <mesh position={[0, 2, -2]}>
          <planeGeometry args={[12, 8]} />
          <meshToonMaterial color="#2c4433" />
        </mesh>
        <Sprite texture={tex} position={[0, 1.15, 0]} height={2.3} />
        <LookAt />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
