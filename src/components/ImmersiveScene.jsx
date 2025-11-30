import React, { Suspense, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Caustics,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  GodRays,
} from "@react-three/postprocessing";
import * as THREE from "three";

// === LIGHT SYNC ===
function useLightingSync(uniforms) {
  useFrame(({ clock }) => {
    if (!uniforms) return;
    const time = clock.elapsedTime;
    const shimmer = 0.5 + 0.5 * Math.sin(time * 1.2);
    const color = uniforms?.uColor?.value ?? new THREE.Color("#0077b6");
    const cssColor = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;
    document.documentElement.style.setProperty("--scene-color", cssColor);
    document.documentElement.style.setProperty("--scene-shimmer", shimmer.toString());
  });
}

// === WATER SHADER ===
const WaterShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uColor: { value: new THREE.Color("#0077b6") },
  },
  vertexShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uMouse;

    void main() {
      vUv = uv;
      vec3 pos = position;

      float wave1 = sin(pos.x * 1.5 + uTime * 1.2) * 0.1;
      float wave2 = cos(pos.y * 2.0 + uTime * 1.4) * 0.1;
      float dist = distance(uv, uMouse);
      float ripple = 0.1 * sin(dist * 25.0 - uTime * 3.0) / (dist * 25.0 + 1.0);
      pos.z += (wave1 + wave2 + ripple) * 0.8;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform vec3 uColor;
    uniform float uTime;

    void main() {
      float brightness = 0.4 + 0.4 * sin(vUv.x * 10.0 + uTime * 0.5) * cos(vUv.y * 10.0 - uTime * 0.7);
      float depthFade = smoothstep(0.0, 1.0, vUv.y);
      vec3 deepColor = mix(vec3(0.0, 0.1, 0.2), uColor, depthFade);
      vec3 color = deepColor * brightness;
      gl_FragColor = vec4(color, 0.9);
    }
  `,
};

// === WATER SURFACE ===
// === WATER SURFACE (Interactive Ripples) ===
function WaterSurface() {
  const mesh = useRef();
  const { mouse, viewport, gl } = useThree();
  const uniforms = useMemo(() => ({
    ...THREE.UniformsUtils.clone(WaterShader.uniforms),
    uRippleOrigin: { value: new THREE.Vector2(-10, -10) },
    uRippleTime: { value: -1000 },
  }), []);

  useLightingSync(uniforms);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uMouse.value.set((mouse.x + 1) / 2, (mouse.y + 1) / 2);
  });

  // Convert click/tap to UV coordinates
  const handlePointerDown = (e) => {
    e.stopPropagation();
    const uv = e.uv;
    if (!uv) return;
    uniforms.uRippleOrigin.value.copy(uv);
    uniforms.uRippleTime.value = e.clock ? e.clock.elapsedTime : performance.now() / 1000;
  };

  useEffect(() => {
    const el = gl.domElement;
    el.addEventListener("pointerdown", handlePointerDown);
    return () => el.removeEventListener("pointerdown", handlePointerDown);
  }, [gl]);

  return (
    <mesh
      ref={mesh}
      rotation-x={-Math.PI / 2}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[50, 50, 256, 256]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          uniform float uTime;
          uniform vec2 uMouse;
          uniform vec2 uRippleOrigin;
          uniform float uRippleTime;

          void main() {
            vUv = uv;
            vec3 pos = position;

            float wave1 = sin(pos.x * 1.5 + uTime * 1.2) * 0.1;
            float wave2 = cos(pos.y * 2.0 + uTime * 1.4) * 0.1;

            // Ripple from user interaction
            float rippleElapsed = uTime - uRippleTime;
            float dist = distance(uv, uRippleOrigin);
            float ripple = 0.0;
            if (rippleElapsed < 5.0) {
              ripple = 0.08 * sin(20.0 * dist - rippleElapsed * 6.0) * exp(-3.0 * dist * rippleElapsed);
            }

            pos.z += (wave1 + wave2 + ripple) * 0.8;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={WaterShader.fragmentShader}
        transparent
      />
    </mesh>
  );
}


// === FLOATING LIGHT PARTICLES ===
function LightParticles() {
  const mesh = useRef();
  const count = 400;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 40,
        y: Math.random() * 8 - 6,
        z: (Math.random() - 0.5) * 40,
        speed: 0.1 + Math.random() * 0.1,
        scale: 0.03 + Math.random() * 0.05,
      });
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    particles.forEach((p, i) => {
      const y = ((p.y + t * p.speed) % 8) - 6;
      dummy.position.set(p.x, y, p.z);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#5ad1ff" transparent opacity={0.4} />
    </instancedMesh>
  );
}

// === BUBBLES ===
function Bubbles() {
  const mesh = useRef();
  const count = 120;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bubbles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 20,
        z: (Math.random() - 0.5) * 20,
        y: Math.random() * -15 - 3,
        speed: 0.05 + Math.random() * 0.08,
        scale: 0.03 + Math.random() * 0.05,
        wobble: Math.random() * 0.02,
        delay: Math.random() * 10,
      });
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    bubbles.forEach((b, i) => {
      let y = b.y + (t - b.delay) * b.speed;
      if (y > 1.5) {
        y = b.y - 15;
        b.delay = t;
      }
      const wobble = Math.sin(t * 2 + i) * b.wobble;
      dummy.position.set(b.x + wobble, y, b.z + wobble * 0.5);
      dummy.scale.setScalar(b.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshPhysicalMaterial
        color="#9ce8ff"
        roughness={0.05}
        metalness={0.2}
        transmission={1.0}
        ior={1.33}
        thickness={0.3}
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  );
}

// === LIGHT SOURCE (SUN) ===
function SunLightSource({ sunRef }) {
  return (
    <mesh ref={sunRef} position={[0, 5, -5]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial color="#b6f5ff" />
    </mesh>
  );
}

// === CAMERA PARALLAX ===
function ParallaxCamera() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 1.5, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2 + mouse.y * 1.5, 0.03);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// === MAIN SCENE ===
export default function ImmersiveScene() {
  const sunRef = useRef();

  return (
    <Canvas
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        background: "radial-gradient(circle at 50% 20%, #013a63 0%, #001219 100%)",
        cursor: "crosshair",
      }}
      camera={{ position: [0, 2.5, 6], fov: 45 }}
    >
      <fog attach="fog" args={["#002b36", 2, 18]} />
      <ambientLight intensity={0.25} color="#1a5276" />
      <directionalLight position={[3, 6, 2]} intensity={0.5} color="#8ddaf5" />
      <pointLight position={[0, 4, 0]} intensity={0.3} color="#4db8ff" />

      <Suspense fallback={null}>
        <Environment preset="night" />
        <Caustics
          worldRadius={0.6}
          ior={1.1}
          backfaces
          intensity={0.3}
          color="#4fc3f7"
          lightSource={[5, 5, -5]}
        />
        <SunLightSource sunRef={sunRef} />
        <WaterSurface />
        <LightParticles />
        <Bubbles />
      </Suspense>

      <ParallaxCamera />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.15} />

      {/* Render postprocessing only once the sun mesh exists */}
      {sunRef.current && (
        <EffectComposer>
          <GodRays
            sun={sunRef}
            samples={80}
            density={0.9}
            decay={0.95}
            weight={0.7}
            exposure={0.9}
            clampMax={1.0}
          />
          <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.1} luminanceSmoothing={0.8} />
          <DepthOfField focusDistance={0.03} focalLength={0.03} bokehScale={2} height={480} />
          <Vignette eskil={false} offset={0.4} darkness={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
