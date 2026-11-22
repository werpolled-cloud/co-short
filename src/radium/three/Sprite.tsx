import React, { useMemo } from "react";
import * as THREE from "three";

// ============================================================================
// «Радиевая девушка» — рисованный 2D-персонаж (1920-е, завод U.S. Radium).
// Порядок слоёв строгий: задние волосы → ноги → юбка → корпус → фартук →
// воротник → руки → шея → лицо → чёлка → черты лица → кисть.
// Координаты: холст 560×1040, фигура стоит на y=1010.
// ============================================================================

export type GirlPose = {
  lean?: number;
  headTilt?: number;
  armL?: number;   // 0 = вниз, 1 = вверх
  armR?: number;
  mouth?: number;  // 0 = линия, 1 = открыт
  eyes?: "open" | "happy" | "worried" | "down";
  brush?: boolean;
  glow?: number;
  hairStyle?: 0 | 1 | 2;
  hairColor?: string;
  dress?: string;
  apron?: string;
  skin?: string;
  brow?: number;
  brushToMouth?: boolean; // ворс уходит к губам
};

const INK = "#2b2337";
const W = 560, H = 1040;

const circle = (x: number, y: number, r: number) => {
  const p = new Path2D();
  p.arc(x, y, r, 0, Math.PI * 2);
  return p;
};

const limb = (x1: number, y1: number, x2: number, y2: number, r: number) => {
  const p = new Path2D();
  const a = Math.atan2(y2 - y1, x2 - x1);
  const nx = Math.cos(a + Math.PI / 2) * r, ny = Math.sin(a + Math.PI / 2) * r;
  p.moveTo(x1 + nx, y1 + ny);
  p.lineTo(x2 + nx, y2 + ny);
  p.arc(x2, y2, r, a + Math.PI / 2, a - Math.PI / 2, true);
  p.lineTo(x1 - nx, y1 - ny);
  p.arc(x1, y1, r, a - Math.PI / 2, a + Math.PI / 2, true);
  p.closePath();
  return p;
};

export const drawGirl = (c: HTMLCanvasElement, pose: GirlPose = {}) => {
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, W, H);
  g.lineJoin = "round"; g.lineCap = "round";

  const skin = pose.skin || "#ffd8b6";
  const dress = pose.dress || "#5c7cad";
  const apron = pose.apron || "#f6f3ea";
  const hair = pose.hairColor || "#5c3b27";
  const eyes = pose.eyes || "open";
  const mouth = pose.mouth ?? 0.4;

  const cx = W / 2 + (pose.lean ?? 0) * 16;
  const tilt = (pose.headTilt ?? 0);

  // ключевые уровни
  const headCY = 196;         // центр головы
  const headRX = 86, headRY = 96;
  const neckY = 292;
  const shoulderY = 336;
  const waistY = 556;
  const hemY = 852;
  const footY = 1006;

  const fill = (path: Path2D, color: string, lineW = 9) => {
    g.fillStyle = color; g.fill(path);
    g.strokeStyle = INK; g.lineWidth = lineW; g.stroke(path);
  };

  // ---------- 1. задние волосы ----------
  const hairLen = (pose.hairStyle ?? 1) === 1 ? 250 : pose.hairStyle === 2 ? 130 : 380;
  const back = new Path2D();
  back.moveTo(cx - headRX + 6, headCY - 30);
  back.bezierCurveTo(cx - headRX - 8, headCY + hairLen * 0.45, cx - 62, headCY + hairLen * 0.95, cx - 40, headCY + hairLen + 10);
  back.quadraticCurveTo(cx, headCY + hairLen + 36, cx + 40, headCY + hairLen + 10);
  back.bezierCurveTo(cx + 62, headCY + hairLen * 0.95, cx + headRX + 8, headCY + hairLen * 0.45, cx + headRX - 6, headCY - 30);
  back.closePath();
  g.fillStyle = hair; g.fill(back);
  g.strokeStyle = INK; g.lineWidth = 9; g.stroke(back);

  // ---------- 2. ноги и туфли ----------
  [-1, 1].forEach((s) => {
    const x = cx + s * 40;
    fill(limb(x, hemY - 30, x + s * 6, footY - 26, 20), "#f0e0cc");
    const shoe = new Path2D();
    shoe.ellipse(x + s * 12, footY - 12, 42, 21, 0, 0, Math.PI * 2);
    fill(shoe, "#3a2c2c");
  });

  // ---------- 3. юбка ----------
  const skirt = new Path2D();
  skirt.moveTo(cx - 62, waistY - 40);
  skirt.bezierCurveTo(cx - 86, waistY + 120, cx - 128, hemY - 60, cx - 134, hemY);
  skirt.quadraticCurveTo(cx, hemY + 34, cx + 134, hemY);
  skirt.bezierCurveTo(cx + 128, hemY - 60, cx + 86, waistY + 120, cx + 62, waistY - 40);
  skirt.closePath();
  fill(skirt, dress);

  // ---------- 4. корпус ----------
  const torso = new Path2D();
  torso.moveTo(cx - 72, shoulderY);
  torso.quadraticCurveTo(cx, shoulderY - 40, cx + 72, shoulderY);
  torso.bezierCurveTo(cx + 78, 420, cx + 70, 490, cx + 62, waistY - 10);
  torso.quadraticCurveTo(cx, waistY + 20, cx - 62, waistY - 10);
  torso.bezierCurveTo(cx - 70, 490, cx - 78, 420, cx - 72, shoulderY);
  torso.closePath();
  fill(torso, dress);

  // ---------- 5. фартук ----------
  const ap = new Path2D();
  ap.moveTo(cx - 46, shoulderY + 74);
  ap.lineTo(cx + 46, shoulderY + 74);
  ap.quadraticCurveTo(cx + 54, 470, cx + 62, 590);
  ap.quadraticCurveTo(cx, 614, cx - 62, 590);
  ap.quadraticCurveTo(cx - 54, 470, cx - 46, shoulderY + 74);
  ap.closePath();
  fill(ap, apron, 7);
  // эмблема
  const badge = circle(cx + 18, shoulderY + 116, 13);
  fill(badge, "#8ec86a", 5);

  // ---------- 6. воротник ----------
  const collar = new Path2D();
  collar.moveTo(cx - 32, shoulderY + 2);
  collar.quadraticCurveTo(cx, shoulderY + 46, cx + 32, shoulderY + 2);
  collar.quadraticCurveTo(cx, shoulderY + 70, cx - 32, shoulderY + 2);
  collar.closePath();
  fill(collar, "#fbf9f2", 7);

  // ---------- 7. руки ----------
  const drawArm = (s: -1 | 1, up: number) => {
    const sx = cx + s * 66, sy = shoulderY + 34;
    // вниз: локоть почти под плечом; вверх: рука уходит вверх и в сторону/к лицу
    const elbowX = sx + s * (18 + up * 34);
    const elbowY = sy + 96 - up * 54;
    const hx = sx + s * (24 + up * 46) + (up > 0.6 ? s * -6 : 0);
    const hy = sy + 176 - up * 176;
    fill(limb(sx, sy, hx, hy, 15), skin);
    // короткий рукав
    const sleeveX = sx + (hx - sx) * 0.34, sleeveY = sy + (hy - sy) * 0.34;
    fill(limb(sx - s * 2, sy - 6, sleeveX, sleeveY, 20), dress);
    fill(circle(hx, hy, 16), skin, 8);
    return { x: hx, y: hy };
  };
  const handL = drawArm(-1, pose.armL ?? 0.06);
  const handR = drawArm(1, pose.armR ?? 0.06);

  // ---------- 8. шея ----------
  fill(limb(cx, neckY - 10, cx, shoulderY + 8, 22), skin);

  // ---------- 9. лицо ----------
  const hx = cx + tilt * 30;
  const face = new Path2D();
  face.moveTo(hx, headCY - headRY);
  face.bezierCurveTo(hx + headRX * 0.92, headCY - headRY, hx + headRX, headCY - 20, hx + headRX * 0.92, headCY + 34);
  face.bezierCurveTo(hx + headRX * 0.82, headCY + headRY * 0.92, hx + 44, headCY + headRY, hx, headCY + headRY);
  face.bezierCurveTo(hx - 44, headCY + headRY, hx - headRX * 0.82, headCY + headRY * 0.92, hx - headRX * 0.92, headCY + 34);
  face.bezierCurveTo(hx - headRX, headCY - 20, hx - headRX * 0.92, headCY - headRY, hx, headCY - headRY);
  face.closePath();
  fill(face, skin, 10);

  // ---------- 10. чёлка ----------
  const bangs = new Path2D();
  bangs.moveTo(hx - headRX - 2, headCY - 6);
  bangs.bezierCurveTo(hx - headRX - 6, headCY - headRY - 6, hx - 40, headCY - headRY - 16, hx, headCY - headRY - 14);
  bangs.bezierCurveTo(hx + 40, headCY - headRY - 16, hx + headRX + 6, headCY - headRY - 6, hx + headRX + 2, headCY - 6);
  bangs.bezierCurveTo(hx + 66, headCY - 40, hx + 30, headCY - 62, hx + 6, headCY - 50);
  bangs.bezierCurveTo(hx - 24, headCY - 74, hx - 56, headCY - 52, hx - headRX - 2, headCY - 6);
  bangs.closePath();
  fill(bangs, hair);

  // ---------- 11. черты лица ----------
  const eyeY = headCY + 12;
  const eyeDX = 34;
  [-1, 1].forEach((s) => {
    const ex = hx + s * eyeDX;
    if (eyes === "happy") {
      g.beginPath(); g.strokeStyle = INK; g.lineWidth = 8;
      g.arc(ex, eyeY + 4, 14, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    } else {
      g.beginPath(); g.ellipse(ex, eyeY, 15, 18, 0, 0, Math.PI * 2);
      g.fillStyle = "#ffffff"; g.fill();
      g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
      const py = eyeY + (eyes === "down" ? 6 : 1);
      g.beginPath(); g.arc(ex, py, 7.5, 0, Math.PI * 2); g.fillStyle = INK; g.fill();
      g.beginPath(); g.arc(ex - 2.6, py - 3, 2.4, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    }
  });

  // брови
  const browUp = pose.brow ?? 0;
  g.strokeStyle = hair; g.lineWidth = 6; g.lineCap = "round";
  g.beginPath();
  if (eyes === "worried") {
    g.moveTo(hx - 50, eyeY - 26); g.quadraticCurveTo(hx - 34, eyeY - 38, hx - 18, eyeY - 22);
    g.moveTo(hx + 18, eyeY - 22); g.quadraticCurveTo(hx + 34, eyeY - 38, hx + 50, eyeY - 26);
  } else {
    g.moveTo(hx - 50, eyeY - 26 - browUp); g.quadraticCurveTo(hx - 34, eyeY - 36 - browUp, hx - 18, eyeY - 27 - browUp);
    g.moveTo(hx + 18, eyeY - 27 - browUp); g.quadraticCurveTo(hx + 34, eyeY - 36 - browUp, hx + 50, eyeY - 26 - browUp);
  }
  g.stroke();

  // румянец
  [-1, 1].forEach((s) => {
    const rg = g.createRadialGradient(hx + s * 54, eyeY + 34, 1, hx + s * 54, eyeY + 34, 24);
    rg.addColorStop(0, "rgba(238,124,124,0.32)");
    rg.addColorStop(1, "rgba(238,124,124,0)");
    g.fillStyle = rg;
    g.beginPath(); g.ellipse(hx + s * 54, eyeY + 34, 24, 15, 0, 0, Math.PI * 2); g.fill();
  });

  // нос
  g.strokeStyle = "rgba(150,88,66,0.8)"; g.lineWidth = 5;
  g.beginPath(); g.moveTo(hx, eyeY + 18); g.quadraticCurveTo(hx + 6, eyeY + 30, hx - 2, eyeY + 32); g.stroke();

  // рот
  g.strokeStyle = INK; g.lineWidth = 7;
  if (mouth > 0.55) {
    const open = 5 + (mouth - 0.55) * 40;
    const m = new Path2D();
    m.moveTo(hx - 20, eyeY + 52);
    m.quadraticCurveTo(hx, eyeY + 52 + open * 1.7, hx + 20, eyeY + 52);
    m.quadraticCurveTo(hx, eyeY + 52 + open * 0.4, hx - 20, eyeY + 52);
    g.fillStyle = "#8c3a48"; g.fill(m); g.stroke(m);
  } else {
    g.beginPath();
    g.moveTo(hx - 18, eyeY + 52);
    g.quadraticCurveTo(hx, eyeY + 52 + mouth * 22, hx + 18, eyeY + 52);
    g.stroke();
  }

  // ---------- 12. кисть в правой руке ----------
  if (pose.brush) {
    const bx = handR.x, by = handR.y;
    // ворс у губ (слева от рта), ручка — от кисти к ворсу
    const tipX = pose.brushToMouth ? hx - 26 : bx - 12;
    const tipY = pose.brushToMouth ? eyeY + 46 : by - 118;
    g.strokeStyle = INK; g.lineWidth = 22;
    g.beginPath(); g.moveTo(bx, by); g.lineTo(tipX, tipY); g.stroke();
    g.strokeStyle = "#a8703a"; g.lineWidth = 14;
    g.beginPath(); g.moveTo(bx, by); g.lineTo(tipX, tipY); g.stroke();

    const ferrule = new Path2D();
    ferrule.moveTo(tipX - 9, tipY + 12); ferrule.lineTo(tipX + 9, tipY + 12);
    ferrule.lineTo(tipX + 6, tipY - 16); ferrule.lineTo(tipX - 6, tipY - 16);
    ferrule.closePath();
    g.fillStyle = "#c6cad1"; g.fill(ferrule);
    g.strokeStyle = INK; g.lineWidth = 6; g.stroke(ferrule);

    const bristle = new Path2D();
    bristle.moveTo(tipX - 7, tipY - 15); bristle.lineTo(tipX + 7, tipY - 15);
    bristle.lineTo(tipX + 3, tipY - 48); bristle.lineTo(tipX - 3, tipY - 48);
    bristle.closePath();
    g.fillStyle = "#f8f1df"; g.fill(bristle);
    g.strokeStyle = INK; g.lineWidth = 6; g.stroke(bristle);

    const glow = pose.glow ?? 0.8;
    const gr = g.createRadialGradient(tipX, tipY - 44, 1, tipX, tipY - 44, 66);
    gr.addColorStop(0, `rgba(200,255,160,${0.95 * glow})`);
    gr.addColorStop(0.32, `rgba(140,255,90,${0.4 * glow})`);
    gr.addColorStop(1, "rgba(140,255,90,0)");
    g.fillStyle = gr;
    g.beginPath(); g.arc(tipX, tipY - 44, 66, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(tipX, tipY - 42, 8, 0, Math.PI * 2);
    g.fillStyle = `rgba(238,255,220,${glow})`; g.fill();
  }

  return { handL, handR, head: { x: hx, y: headCY } };
};

export const useGirlTexture = (pose: GirlPose) =>
  useMemo(() => {
    const c = document.createElement("canvas");
    drawGirl(c, pose);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.needsUpdate = true;
    return t;
  }, [JSON.stringify(pose)]);

export const GIRL_ASPECT = W / H;
