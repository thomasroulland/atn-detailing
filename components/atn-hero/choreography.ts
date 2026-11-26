// Chorégraphie : scroll → pose de la voiture et de la caméra.
// Tous les mouvements dépendent uniquement du scroll ; le lissage est fait dans HeroScene.

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export type Pose = {
  yaw: number; // rotation Y de la voiture (degrés, cumulée)
  camY: number;
  camDist: number;
  targetY: number;
  slideX: number; // décalage horizontal de la voiture
  sweepLocal: number; // position du balayage le long de la voiture (+2.25 = avant, -2.25 = arrière)
  sweepBell: number; // 0 → 1 → 0 pendant le balayage
};

/** Hero : 3/4 avant → profil, puis balayage de polissage (pas de vue arrière). */
export function heroPose(p: number, mobile: boolean): Pose {
  const s1 = easeInOutCubic(clamp01(p / 0.4)); // 0 → 40 % : 3/4 avant → profil, la caméra recule
  const s2 = clamp01((p - 0.4) / 0.5); //          40 → 90 % : balayage lumineux avant → arrière
  const yaw = -135 - 45 * s1;
  const sweepLocal = p < 0.4 ? 3 : 3 - 6 * s2;
  if (mobile) return { yaw, camY: 0.5, camDist: 11.5, targetY: 0.55, slideX: 0, sweepLocal, sweepBell: 0 };
  return {
    yaw,
    camDist: 9.2 + 1.3 * s1,
    camY: 0.5,
    targetY: 1.02 + 0.05 * s1,
    slideX: 0,
    sweepLocal,
    sweepBell: s2 > 0 && s2 < 1 ? Math.sin(Math.PI * s2) : 0,
  };
}

/** Où se place la voiture dans une section : attribut data-car-pose="right" | "left" | "bottom". */
type Preset = { yaw: number; camDist: number; camY: number; targetY: number; slideX: number };
export const POSES: Record<string, { desktop: Preset; mobile: Preset }> = {
  // voiture à droite (3/4 avant tournée vers le texte), texte à gauche
  right: {
    desktop: { yaw: -155, camDist: 11.8, camY: 0.55, targetY: 1.0, slideX: 1.7 },
    mobile: { yaw: -155, camDist: 13, camY: 0.6, targetY: -0.1, slideX: 0 },
  },
  // voiture à gauche, texte à droite
  left: {
    desktop: { yaw: -205, camDist: 11.8, camY: 0.55, targetY: 1.0, slideX: -1.7 },
    mobile: { yaw: -205, camDist: 13, camY: 0.6, targetY: -0.1, slideX: 0 },
  },
  // voiture en bas, au centre, sous le texte : elle pivote en montrant l'avant et finit tournée de l'autre côté
  bottom: {
    desktop: { yaw: -15, camDist: 10.4, camY: 0.85, targetY: 1.5, slideX: 0 },
    mobile: { yaw: -15, camDist: 13, camY: 0.9, targetY: 1.9, slideX: 0 },
  },
};

export function blendPose(a: Pose, preset: Preset, k: number): Pose {
  if (k <= 0) return a;
  return {
    yaw: a.yaw + (preset.yaw - a.yaw) * k,
    camDist: a.camDist + (preset.camDist - a.camDist) * k,
    camY: a.camY + (preset.camY - a.camY) * k,
    targetY: a.targetY + (preset.targetY - a.targetY) * k,
    slideX: a.slideX + (preset.slideX - a.slideX) * k,
    sweepLocal: a.sweepLocal,
    sweepBell: a.sweepBell * (1 - k),
  };
}
