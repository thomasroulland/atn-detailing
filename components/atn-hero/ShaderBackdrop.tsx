'use client';

import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

// Fond animé ShaderGradient, volontairement très sombre : noir profond → graphite bleuté,
// une pointe d'Ice Blue à peine visible. Pas de glow criard.
// Pour l'ajuster : règle-le sur https://shadergradient.co puis recopie les valeurs ici.
// Le grain intégré de ShaderGradient rend une image noire ici : grain en CSS par-dessus à la place
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function ShaderBackdrop() {
  return (
    <>
    <ShaderGradientCanvas
      style={{ position: 'absolute', inset: 0 }}
      pixelDensity={1} // un dégradé flou n'a pas besoin de plus : on garde le GPU pour la voiture
      fov={40}
      pointerEvents="none"
      lazyLoad={false}
      powerPreference="low-power"
    >
      <ShaderGradient
        type="waterPlane"
        animate="on"
        uSpeed={0.06}
        uStrength={1.4}
        uDensity={1.1}
        uFrequency={3}
        uAmplitude={0}
        color1="#08090d"
        color2="#13263a"
        color3="#1a3a52"
        brightness={1.1}
        reflection={0.05}
        grain="off"
        lightType="3d"
        cAzimuthAngle={180}
        cPolarAngle={80}
        cDistance={3.6}
        cameraZoom={1}
        positionX={0}
        positionY={0}
        positionZ={0}
        rotationX={50}
        rotationY={0}
        rotationZ={-60}
      />
    </ShaderGradientCanvas>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: NOISE, opacity: 0.07, mixBlendMode: 'overlay' }} />
    </>
  );
}
