import * as THREE from 'three';

// Peinture carrosserie : MeshPhysicalMaterial + clearcoat.
// La rugosité passe de 0.6 (mat) à 0.34 (satiné) derrière la bande lumineuse.
// La position est calculée dans l'espace de la voiture (uCarInv), donc ça marche
// quel que soit le découpage en meshes du .glb.
export function createPolishPaint(color = '#23262c') {
  const uniforms = {
    uSweep: { value: 3.0 },
    uCarInv: { value: new THREE.Matrix4() },
  };
  const material = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.45,
    roughness: 0.6,
    clearcoat: 1,
    clearcoatRoughness: 0.4,
    envMapIntensity: 1.0,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSweep = uniforms.uSweep;
    shader.uniforms.uCarInv = uniforms.uCarInv;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform mat4 uCarInv;\nvarying float vCarX;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvCarX = (uCarInv * modelMatrix * vec4(transformed, 1.0)).x;'
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uSweep;\nvarying float vCarX;')
      .replace(
        '#include <roughnessmap_fragment>',
        '#include <roughnessmap_fragment>\nfloat polish = smoothstep(uSweep - 0.35, uSweep + 0.35, vCarX);\nroughnessFactor = mix(0.6, 0.34, polish);'
      )
      .replace(
        '#include <lights_physical_fragment>',
        '#include <lights_physical_fragment>\n#ifdef USE_CLEARCOAT\nmaterial.clearcoat = mix(0.1, 0.35, polish);\nmaterial.clearcoatRoughness = clamp(mix(0.6, 0.3, polish), 0.0001, 1.0);\n#endif'
      );
  };
  return { material, uniforms };
}
