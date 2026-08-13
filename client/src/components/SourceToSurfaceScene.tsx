import { ContactShadows } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, MathUtils } from "three";

const surfaceTiles = [
  { position: [-1.55, 0.9, 0.18], rotation: -0.2, color: "#2454d7" },
  { position: [0, 1.18, 0.1], rotation: 0.08, color: "#f5f1e8" },
  { position: [1.48, 0.74, 0.2], rotation: 0.25, color: "#dc143c" },
  { position: [1.54, -0.78, 0.15], rotation: -0.16, color: "#2454d7" },
  { position: [0.04, -1.18, 0.22], rotation: 0.2, color: "#f5f1e8" },
  { position: [-1.52, -0.72, 0.12], rotation: -0.28, color: "#dc143c" },
] as const;

function SourceToSurfaceOrbit() {
  const assembly = useRef<Group>(null);

  useFrame(({ clock, pointer }, delta) => {
    if (!assembly.current) return;
    assembly.current.rotation.x = MathUtils.damp(assembly.current.rotation.x, -0.1 - pointer.y * 0.17, 5, delta);
    assembly.current.rotation.y = MathUtils.damp(assembly.current.rotation.y, pointer.x * 0.26, 5, delta);
    assembly.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.025;
  });

  return <group ref={assembly} rotation={[-0.1, 0, 0]}>
    <mesh position={[0, 0, -0.2]} rotation={[0, 0, -0.06]} castShadow>
      <boxGeometry args={[2.3, 2.82, 0.14]} />
      <meshStandardMaterial color="#151311" roughness={0.82} />
    </mesh>
    <mesh position={[0, 0, -0.08]} rotation={[0, 0, -0.06]} castShadow>
      <boxGeometry args={[1.95, 2.46, 0.13]} />
      <meshStandardMaterial color="#f6f1e7" roughness={0.9} />
    </mesh>
    {surfaceTiles.map((tile, index) => <mesh key={index} position={tile.position} rotation={[0, 0, tile.rotation]} castShadow>
      <boxGeometry args={[0.88, 0.56, 0.13]} />
      <meshStandardMaterial color={tile.color} roughness={0.72} />
    </mesh>)}
    <mesh position={[0, 0, 0.16]} castShadow>
      <circleGeometry args={[0.28, 40]} />
      <meshStandardMaterial color="#dc143c" roughness={0.68} />
    </mesh>
  </group>;
}

export default function SourceToSurfaceScene() {
  return <Canvas aria-hidden="true" camera={{ position: [0, 0.1, 6.1], fov: 33 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }} shadows>
    <ambientLight intensity={2.1} />
    <directionalLight castShadow intensity={2.5} position={[2.5, 4.2, 5]} shadow-mapSize={[512, 512]} />
    <SourceToSurfaceOrbit />
    <ContactShadows color="#151311" opacity={0.16} position={[0, -1.7, -0.8]} far={5} resolution={256} scale={6} />
  </Canvas>;
}
