import React, { useMemo } from "react";
import * as THREE from "three";

// ============================================================================
// «Радиевые девушки» — 3D-мир в стиле 2D-персонажей поверх яркого мультяшного 3D.
// Всё строится кодом: цех, стол, банка с радием, свет, тени, пыль в луче.
// Персонажи — отдельные спрайты (см. Sprite.tsx), вставляются в 3D как PlaneGeometry.
// ============================================================================

export const PAL = {
  wallTop: "#3f5a44",
  wallLow: "#22392c",
  floor: "#8a5a2f",
  floorDark: "#5e3a1c",
  desk: "#b5803f",
  deskTop: "#d9a55e",
  metal: "#8d99a4",
  brass: "#c9a34a",
  glow: "#8bff5a",
  night: "#0a1a2a",
  lamp: "#ffe6a8",
};

const toonMat = (color: string, opts: any = {}) =>
  new THREE.MeshToonMaterial({ color: new THREE.Color(color), ...opts });

// ---------- текстура дерева (процедурная, без внешних файлов) ----------
const woodTexture = (base: string, dark: string, lines = 26) => {
  const w = 512, h = 512;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, base); grad.addColorStop(1, dark);
  g.fillStyle = grad; g.fillRect(0, 0, w, h);
  let seed = 1337;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < lines; i++) {
    const y = (i / lines) * h + rnd() * 6;
    g.strokeStyle = `rgba(0,0,0,${0.05 + rnd() * 0.12})`;
    g.lineWidth = 1 + rnd() * 3;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin((x / w) * Math.PI * 2 + i) * 4 + rnd() * 2);
    g.stroke();
  }
  for (let i = 0; i < 60; i++) {
    g.fillStyle = `rgba(0,0,0,${rnd() * 0.06})`;
    g.beginPath();
    g.ellipse(rnd() * w, rnd() * h, 6 + rnd() * 40, 2 + rnd() * 8, rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
};

// ---------- цех ----------
export const Workshop: React.FC<{ paintDark?: number; deskShift?: number }> = ({ paintDark = 0, deskShift = 0 }) => {
  const wood = useMemo(() => woodTexture(PAL.floor, PAL.floorDark, 30), []);
  const deskWood = useMemo(() => woodTexture(PAL.desk, "#6d4522", 18), []);
  return (
    <group>
      {/* пол */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <meshToonMaterial map={wood} color="#cfa06a" />
      </mesh>
      {/* задняя стена с панелями */}
      <mesh position={[0, 4.2, -6]} receiveShadow>
        <planeGeometry args={[26, 9]} />
        <meshToonMaterial color={new THREE.Color(PAL.wallTop).lerp(new THREE.Color("#050a06"), paintDark)} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-8 + i * 2, 4.2, -5.94]} receiveShadow castShadow>
          <boxGeometry args={[1.86, 8.4, 0.16]} />
          <meshToonMaterial color={i % 2 ? "#2b4231" : "#334d38"} />
        </mesh>
      ))}
      {/* плинтус и балка */}
      <mesh position={[0, 0.22, -5.9]} castShadow receiveShadow>
        <boxGeometry args={[26, 0.44, 0.3]} />
        <meshToonMaterial color="#1b2a20" />
      </mesh>
      <mesh position={[0, 8.1, -5.7]} castShadow>
        <boxGeometry args={[26, 0.5, 0.7]} />
        <meshToonMaterial color="#26382a" />
      </mesh>
      {/* ночные окна */}
      {[-4.2, 1.6].map((x, i) => (
        <group key={i} position={[x, 4.6, -5.86]}>
          <mesh>
            <boxGeometry args={[2.6, 3.4, 0.1]} />
            <meshBasicMaterial color={PAL.night} />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <boxGeometry args={[2.7, 3.5, 0.04]} />
            <meshToonMaterial color="#20302a" wireframe />
          </mesh>
          {[[-0.62, 0], [0, 0], [0.62, 0], [0, 0.82], [0, -0.82]].map(([dx, dy], k) => (
            <mesh key={k} position={[dx, dy, 0.08]}>
              <boxGeometry args={[k < 3 ? 0.1 : 2.6, k < 3 ? 3.4 : 0.1, 0.08]} />
              <meshToonMaterial color="#23332c" />
            </mesh>
          ))}
        </group>
      ))}
      {/* рабочий стол */}
      <group position={[0, 0, -0.6 - deskShift]}>
        <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.6, 0.18, 2.6]} />
          <meshToonMaterial map={deskWood} color="#e0b477" />
        </mesh>
        {[[-3.5, -1.1], [3.5, -1.1], [-3.5, 1.1], [3.5, 1.1]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.5, z]} castShadow>
            <boxGeometry args={[0.18, 1, 0.18]} />
            <meshToonMaterial color="#7a4a24" />
          </mesh>
        ))}
        {/* банка с радиевой краской */}
        <group position={[1.7, 1.11, 0.35]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.86, 28]} />
            <meshPhysicalMaterial color="#0d2a18" transmission={0.75} roughness={0.15} thickness={0.6} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.4, 24]} />
            <meshBasicMaterial color="#5cff6a" />
          </mesh>
          <pointLight color="#8bff5a" intensity={2.2} distance={4.2} position={[0, 0.1, 0]} />
          <mesh position={[0, 0.52, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.1, 24]} />
            <meshToonMaterial color={PAL.metal} />
          </mesh>
        </group>
        {/* палитра/баночки */}
        {[-1.9, -2.6].map((x, i) => (
          <mesh key={i} position={[x, 1.16, 0.5]} castShadow>
            <cylinderGeometry args={[0.16, 0.13, 0.24, 18]} />
            <meshToonMaterial color={i ? "#7a8a95" : "#8fa3ae"} />
          </mesh>
        ))}
      </group>
      {/* кисти в стакане */}
      <group position={[-2.4, 1.1, -0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.5, 20]} />
          <meshPhysicalMaterial color="#20303a" transmission={0.6} roughness={0.2} transparent opacity={0.85} />
        </mesh>
        {[-0.06, 0.05, 0.14].map((dx, i) => (
          <mesh key={i} position={[dx, 0.55, i * 0.03]} rotation={[0, 0, -0.2 + i * 0.18]} castShadow>
            <cylinderGeometry args={[0.028, 0.034, 0.9, 10]} />
            <meshToonMaterial color={i ? "#c9a34a" : "#a8763a"} />
          </mesh>
        ))}
      </group>
      {/* лампы */}
      {[-3.4, 0, 3.4].map((x, i) => (
        <group key={i} position={[x, 7.2, -2.4]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 3.2, 6]} />
            <meshToonMaterial color="#1c2a22" />
          </mesh>
          <mesh position={[0, -1.7, 0]} castShadow>
            <coneGeometry args={[0.62, 0.5, 24, 1, true]} />
            <meshToonMaterial color="#d9c48a" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -1.92, 0]}>
            <sphereGeometry args={[0.18, 16, 12]} />
            <meshBasicMaterial color="#fff6cf" />
          </mesh>
          <spotLight
            color={PAL.lamp} intensity={26} distance={16} angle={0.72} penumbra={0.55} decay={1.6}
            position={[0, -1.95, 0]} target-position={[x, 0, -0.6]} castShadow
            shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0006}
          />
        </group>
      ))}
      {/* пыль в воздухе */}
      <Dust />
    </group>
  );
};

const Dust: React.FC = () => {
  const geo = useMemo(() => {
    const n = 260;
    const pos = new Float32Array(n * 3);
    let s = 7;
    const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (r() - 0.5) * 12;
      pos[i * 3 + 1] = r() * 6.2 + 0.4;
      pos[i * 3 + 2] = (r() - 0.5) * 8;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffeec2" size={0.035} transparent opacity={0.5} depthWrite={false} sizeAttenuation />
    </points>
  );
};

// ---------- мягкая тень под персонажем ----------
const shadowTex = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const rg = g.createRadialGradient(128, 128, 4, 128, 128, 124);
  rg.addColorStop(0, "rgba(0,0,0,0.62)");
  rg.addColorStop(0.55, "rgba(0,0,0,0.28)");
  rg.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = rg; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  return t;
};

export const ContactShadow: React.FC<{ x: number; z: number; r?: number; opacity?: number }> = ({ x, z, r = 0.62, opacity = 1 }) => {
  const t = useMemo(() => shadowTex(), []);
  return (
    <mesh position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[r * 2.6, r * 1.5]} />
      <meshBasicMaterial map={t} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
};

// ---------- спрайт-персонаж в 3D (плоскость, всегда лицом к камере) ----------
export const Sprite: React.FC<{
  texture: THREE.Texture;
  position: [number, number, number];
  height?: number;
  opacity?: number;
  tint?: string;
}> = ({ texture, position, height = 2.4, opacity = 1, tint }) => {
  const img = texture.image as { width?: number; height?: number } | undefined;
  const aspect = img && img.width && img.height ? img.width / img.height : 0.54;
  return (
    <mesh position={position}>
      <planeGeometry args={[height * aspect, height]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} color={tint || "#ffffff"} alphaTest={0.35} toneMapped={false} depthWrite />
    </mesh>
  );
};
