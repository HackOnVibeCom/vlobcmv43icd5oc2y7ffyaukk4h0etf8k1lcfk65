/**
 * ForgeScene — plays during content generation.
 * A glowing crimson orb that pulses and fragments into 6 platform tiles,
 * representing one source becoming six surfaces.
 *
 * Desktop fine-pointer only. Falls back to CSS pulse ring on mobile / reduced-motion.
 */
import { ContactShadows, MeshDistortMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group, MathUtils, Vector3 } from "three";

// Six surface tile endpoints — bloom outward from center
const TILE_TARGETS: [number, number, number][] = [
  [-1.6, 0.8, 0.1],
  [0, 1.1, 0.15],
  [1.6, 0.8, 0.1],
  [-1.6, -0.8, 0.1],
  [0, -1.1, 0.15],
  [1.6, -0.8, 0.1],
];

const TILE_COLORS = ["#2454d7", "#f5f1e8", "#dc143c", "#dc143c", "#f5f1e8", "#2454d7"];

function CoreOrb({ active }: { active: boolean }) {
  const mesh = useRef<Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (!mesh.current) return;
    const pulse = Math.sin(t.current * 3.8) * 0.04;
    const target = active ? 1 + pulse : 0.001;
    const cur = mesh.current.scale.x;
    const next = MathUtils.damp(cur, target, active ? 6 : 14, delta);
    mesh.current.scale.setScalar(next);
    mesh.current.rotation.y = t.current * 0.6;
    mesh.current.rotation.z = Math.sin(t.current * 0.9) * 0.2;
  });

  return (
    <group ref={mesh}>
      <mesh>
        <sphereGeometry args={[0.42, 32, 32]} />
        <MeshDistortMaterial
          color="#dc143c"
          distort={0.38}
          speed={4}
          roughness={0.14}
          metalness={0.6}
        />
      </mesh>
      {/* inner glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.012, 8, 48]} />
        <meshStandardMaterial color="#dc143c" emissive="#dc143c" emissiveIntensity={1.4} roughness={0.3} />
      </mesh>
    </group>
  );
}

function SurfaceTile({
  index,
  active,
  target,
  color,
}: {
  index: number;
  active: boolean;
  target: [number, number, number];
  color: string;
}) {
  const mesh = useRef<Group>(null);
  const pos = useRef(new Vector3(0, 0, 0));
  const delay = index * 0.07;
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (!mesh.current) return;
    const progress = Math.max(0, t.current - delay);
    const ease = active ? Math.min(1, progress * 2.2) : 0;
    pos.current.lerp(
      active ? new Vector3(...target) : new Vector3(0, 0, 0),
      delta * (active ? 5 : 9)
    );
    mesh.current.position.copy(pos.current);
    const scale = MathUtils.damp(mesh.current.scale.x, active ? ease * 0.9 : 0.001, 7, delta);
    mesh.current.scale.setScalar(scale);
    mesh.current.rotation.z = Math.sin(t.current * 0.8 + index) * 0.12;
  });

  return (
    <group ref={mesh}>
      <mesh castShadow>
        <boxGeometry args={[0.78, 0.5, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
    </group>
  );
}

function ForgeAssembly({ active }: { active: boolean }) {
  return (
    <group>
      <CoreOrb active={active} />
      {TILE_TARGETS.map((target, i) => (
        <SurfaceTile key={i} index={i} active={active} target={target} color={TILE_COLORS[i]} />
      ))}
    </group>
  );
}

export function ForgeScene({ active }: { active: boolean }) {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(min-width: 640px)");
    setCanRender(!noMotion.matches && fine.matches);
    const update = () => setCanRender(!noMotion.matches && fine.matches);
    noMotion.addEventListener("change", update);
    fine.addEventListener("change", update);
    return () => {
      noMotion.removeEventListener("change", update);
      fine.removeEventListener("change", update);
    };
  }, []);

  if (!canRender) {
    return (
      <div className="forge-scene-fallback" aria-hidden="true" data-active={active}>
        <span />
      </div>
    );
  }

  return (
    <div className="forge-scene-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 36 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        shadows
      >
        <ambientLight intensity={1.8} />
        <pointLight position={[0, 0, 2]} color="#dc143c" intensity={active ? 3.2 : 0} decay={2} />
        <directionalLight castShadow intensity={2.2} position={[3, 4, 5]} shadow-mapSize={[256, 256]} />
        <ForgeAssembly active={active} />
        <ContactShadows
          color="#151311"
          opacity={0.12}
          position={[0, -1.8, -0.5]}
          far={4}
          resolution={128}
          scale={5}
        />
      </Canvas>
    </div>
  );
}
