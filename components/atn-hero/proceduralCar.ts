// Voiture provisoire : coupé sportif générique construit en code (aucun design de marque).
// Sert de repli tant que /models/car.glb n'est pas fourni.
/* eslint-disable */
// @ts-nocheck
import * as THREE from 'three';

// ---- an original, generic sports coupe built from deformed boxes (no brand design) ----
export function buildProceduralCar(T: typeof THREE, opts: { lite?: boolean } = {}) {
  const lite = !!opts.lite;
  var g = new T.Group();
  var L = 4.5, hl = L / 2, PI = Math.PI;
  var uSweep = { value: 3.0 };
  var paint = new T.MeshPhysicalMaterial({ color: 0x23262c, metalness: 0.45, roughness: 0.6, clearcoat: 1, clearcoatRoughness: 0.4, envMapIntensity: 1.0, side: T.DoubleSide });
  paint.onBeforeCompile = function (sh: any) {
    sh.uniforms.uSweep = uSweep;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vLX;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLX = position.x;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vLX;\nuniform float uSweep;')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nfloat polish = smoothstep(uSweep - 0.35, uSweep + 0.35, vLX);\nroughnessFactor = mix(0.6, 0.34, polish);')
      .replace('#include <lights_physical_fragment>', '#include <lights_physical_fragment>\n#ifdef USE_CLEARCOAT\nmaterial.clearcoat = mix(0.1, 0.35, polish);\nmaterial.clearcoatRoughness = clamp(mix(0.6, 0.3, polish), 0.0001, 1.0);\n#endif');
  };
  var glass = new T.MeshPhysicalMaterial({ color: 0x05070a, metalness: 0.9, roughness: 0.04, envMapIntensity: 1.0, side: T.DoubleSide });
  var trim = new T.MeshPhysicalMaterial({ color: 0x0b0c0f, metalness: 0.3, roughness: 0.45, side: T.DoubleSide });
  var rimMat = new T.MeshPhysicalMaterial({ color: 0x24272d, metalness: 1, roughness: 0.28, side: T.DoubleSide });
  var tyreMat = new T.MeshStandardMaterial({ color: 0x0a0a0b, roughness: 0.85, side: T.DoubleSide });
  var discMat = new T.MeshStandardMaterial({ color: 0x3a3d42, metalness: 0.8, roughness: 0.5, side: T.DoubleSide });
  var headMat = new T.MeshBasicMaterial({ color: 0xeaf6ff, side: T.DoubleSide });
  var tailMat = new T.MeshBasicMaterial({ color: 0x6e1212, side: T.DoubleSide });

  function lerpKeys(t, k) {
    if (t <= k[0][0]) return k[0][1];
    for (var i = 1; i < k.length; i++) if (t <= k[i][0]) {
      var a = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); a = a * a * (3 - 2 * a);
      return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * a;
    }
    return k[k.length - 1][1];
  }
  var wheelsX = [1.42, -1.38], wr = 0.355, archR = 0.43;
  function top(x) { return lerpKeys((x + hl) / L, [[0, 0.8], [0.05, 0.95], [0.2, 1.0], [0.42, 0.97], [0.62, 0.9], [0.8, 0.86], [0.93, 0.74], [1, 0.56]]); }
  function half(x) {
    var a = Math.abs(x) / hl, w = 0.93 * Math.pow(Math.max(0, 1 - Math.pow(a, 5)), 0.2);
    for (var i = 0; i < 2; i++) { var d = x - wheelsX[i]; w += 0.06 * Math.exp(-d * d / 0.3); }
    return w;
  }
  function arch(x) {
    for (var i = 0; i < 2; i++) { var d = Math.abs(x - wheelsX[i]); if (d < archR) return wr + Math.sqrt(archR * archR - d * d); }
    return -1;
  }
  function superPt(vv, ww, n) {
    var r = Math.max(Math.abs(vv), Math.abs(ww)), a = Math.atan2(vv, ww), c = Math.cos(a), s = Math.sin(a);
    return [Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * r, Math.sign(s) * Math.pow(Math.abs(s), 2 / n) * r];
  }
  function smooth(e0, e1, x) { var t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }

  // body shell
  var bg = new T.BoxGeometry(2, 2, 2, lite ? 90 : 200, lite ? 14 : 30, lite ? 14 : 30), bp = bg.attributes.position;
  var BOT = 0.2;
  for (var i = 0; i < bp.count; i++) {
    var u = bp.getX(i), vv = bp.getY(i), ww = bp.getZ(i);
    var x = u * hl, sp = superPt(vv, ww, 4.2), cz = sp[0], cy = sp[1];
    var tp = top(x), y = BOT + (cy + 1) / 2 * (tp - BOT);
    var z = cz * half(x) * (1 - 0.1 * Math.max(0, cy));
    var ay = arch(x);
    if (ay > 0) { var s = smooth(0.5, 0.78, Math.abs(cz)); ay = Math.min(ay, tp - 0.1); y = y + (Math.max(y, ay) - y) * s; }
    bp.setXYZ(i, x, y, z);
  }
  bg.computeVertexNormals();
  var body = new T.Mesh(bg, paint); g.add(body);

  // cabin / greenhouse (dark glass canopy)
  var cg = new T.BoxGeometry(2, 2, 2, lite ? 40 : 90, lite ? 10 : 20, lite ? 10 : 20), cp = cg.attributes.position;
  var cx0 = -1.5, cx1 = 0.7;
  for (i = 0; i < cp.count; i++) {
    u = cp.getX(i); vv = cp.getY(i); ww = cp.getZ(i);
    var t = (u + 1) / 2; x = cx0 + t * (cx1 - cx0);
    var h = t < 0.42 ? 0.44 * Math.pow(Math.sin(t / 0.42 * PI / 2), 0.75) : 0.44 * Math.pow(Math.max(0, Math.cos((t - 0.42) / 0.58 * PI / 2)), 0.62);
    h = Math.max(h, 0.0);
    sp = superPt(vv, ww, 3.6); cz = sp[0]; cy = sp[1];
    var base = BOT + 0.62 * (top(x) - BOT), roof = top(x) + h;
    y = base + (cy + 1) / 2 * (roof - base);
    var k = (cy + 1) / 2, hw = half(x) * (0.86 - 0.26 * k * k);
    var endPinch = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 8)), 0.125);
    cp.setXYZ(i, x, y, cz * hw * endPinch);
  }
  cg.computeVertexNormals();
  g.add(new T.Mesh(cg, glass));

  // roof panel in paint (narrower, sits just over the canopy top)
  var rg = new T.BoxGeometry(2, 2, 2, 60, 6, 16), rp = rg.attributes.position;
  for (i = 0; i < rp.count; i++) {
    u = rp.getX(i); vv = rp.getY(i); ww = rp.getZ(i);
    t = 0.2 + (u + 1) / 2 * 0.42; x = cx0 + t * (cx1 - cx0);
    h = t < 0.42 ? 0.44 * Math.pow(Math.sin(t / 0.42 * PI / 2), 0.75) : 0.44 * Math.pow(Math.max(0, Math.cos((t - 0.42) / 0.58 * PI / 2)), 0.62);
    var ry = top(x) + h + 0.008 + vv * 0.012;
    var rw = half(x) * 0.5 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 6)), 0.16);
    rp.setXYZ(i, x, ry - Math.pow(Math.abs(ww), 2) * 0.05, ww * rw);
  }
  rg.computeVertexNormals();
  g.add(new T.Mesh(rg, paint));

  // rear wing
  var deck = top(-1.95);
  var blade = new T.Mesh(new T.BoxGeometry(0.3, 0.03, 1.62), trim); blade.position.set(-1.98, deck + 0.3, 0); blade.rotation.z = 0.06; g.add(blade);
  [-0.42, 0.42].forEach(function (z) { var st = new T.Mesh(new T.BoxGeometry(0.09, 0.3, 0.03), trim); st.position.set(-1.92, deck + 0.14, z); g.add(st); });
  [-0.81, 0.81].forEach(function (z) { var ep = new T.Mesh(new T.BoxGeometry(0.34, 0.11, 0.02), trim); ep.position.set(-1.98, deck + 0.28, z); g.add(ep); });

  // lights
  [-1, 1].forEach(function (sd) {
    var hlm = new T.Mesh(new T.BoxGeometry(0.34, 0.03, 0.05), headMat);
    hlm.position.set(1.98, 0.62, sd * 0.6); hlm.rotation.y = sd * 0.55; g.add(hlm);
    var drl = new T.Mesh(new T.BoxGeometry(0.03, 0.07, 0.05), headMat);
    drl.position.set(1.86, 0.58, sd * 0.74); g.add(drl);
  });
  var tail = new T.Mesh(new T.BoxGeometry(0.03, 0.02, 1.5), tailMat); tail.position.set(-2.2, 0.82, 0); g.add(tail);
  // side intake + sill in trim
  [-1, 1].forEach(function (sd) {
    var sill = new T.Mesh(new T.BoxGeometry(1.95, 0.06, 0.05), trim); sill.position.set(0.02, 0.27, sd * 0.9); g.add(sill);
  });

  // wheels
  var tyreGeo = new T.TorusGeometry(0.265, 0.09, 18, 56);
  var rimGeo = new T.CylinderGeometry(0.255, 0.255, 0.16, 48);
  var spokeGeo = new T.BoxGeometry(0.035, 0.2, 0.03);
  var discGeo = new T.CylinderGeometry(0.2, 0.2, 0.03, 40);
  var capGeo = new T.CylinderGeometry(0.045, 0.045, 0.04, 20);
  function wheel() {
    var w = new T.Group();
    var ty = new T.Mesh(tyreGeo, tyreMat); ty.scale.z = 1.55; w.add(ty);
    var rim = new T.Mesh(rimGeo, rimMat); rim.rotation.x = PI / 2; rim.scale.y = 0.9; w.add(rim);
    var disc = new T.Mesh(discGeo, discMat); disc.rotation.x = PI / 2; disc.position.z = -0.02; w.add(disc);
    for (var s = 0; s < 10; s++) {
      var sk = new T.Mesh(spokeGeo, rimMat); var a = s / 10 * PI * 2;
      sk.position.set(Math.sin(a) * 0.13, Math.cos(a) * 0.13, 0.085); sk.rotation.z = -a; w.add(sk);
    }
    var cap = new T.Mesh(capGeo, rimMat); cap.rotation.x = PI / 2; cap.position.z = 0.1; w.add(cap);
    return w;
  }
  wheelsX.forEach(function (wx) {
    [-1, 1].forEach(function (sd) {
      var w = wheel(); w.position.set(wx, wr, sd * 0.79); if (sd < 0) w.rotation.y = PI; g.add(w);
    });
  });
  // dark underbody to hide see-through
  var under = new T.Mesh(new T.BoxGeometry(3.9, 0.06, 1.5), trim); under.position.y = 0.22; g.add(under);

  return { group: g, paint: paint, uSweep: uSweep };
}

