import { ContactShadows } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { type MutableRefObject, useRef } from "react";
import { Group, MathUtils } from "three";

function CampaignCollage({ scrollProgress }: { scrollProgress: MutableRefObject<number> }) {
  const collage = useRef<Group>(null);
  const materials = useRef<Group>(null);
  const orbit = useRef<Group>(null);

  useFrame(({ clock, pointer }, delta) => {
    const progress = scrollProgress.current;
    if (collage.current) {
      collage.current.rotation.x = MathUtils.damp(collage.current.rotation.x, -0.12 - pointer.y * 0.18 - progress * 0.42, 4.5, delta);
      collage.current.rotation.y = MathUtils.damp(collage.current.rotation.y, -0.2 + pointer.x * 0.3 + progress * 0.72, 4.5, delta);
      collage.current.rotation.z = MathUtils.damp(collage.current.rotation.z, Math.sin(clock.elapsedTime * 0.42) * 0.028 - progress * 0.13, 4.5, delta);
      collage.current.position.y = MathUtils.damp(collage.current.position.y, progress * 0.26, 4.5, delta);
      const scale = 1 - progress * 0.12;
      collage.current.scale.setScalar(MathUtils.damp(collage.current.scale.x, scale, 4.5, delta));
    }
    if (materials.current) {
      materials.current.rotation.z = clock.elapsedTime * 0.12 + progress * 0.38;
      materials.current.rotation.y = Math.sin(clock.elapsedTime * 0.24) * 0.08;
    }
    if (orbit.current) {
      orbit.current.rotation.z = -clock.elapsedTime * 0.28 + progress * 0.84;
      orbit.current.rotation.x = Math.sin(clock.elapsedTime * 0.36) * 0.11;
    }
  });

  return <group ref={collage} rotation={[-0.14, -0.22, 0]}>
    <mesh position={[-0.32, -0.07, -0.24]} rotation={[0.03, -0.04, -0.14]} castShadow>
      <boxGeometry args={[3.7, 2.56, 0.08]} /><meshStandardMaterial color="#171513" roughness={0.82} />
    </mesh>
    <mesh position={[0.25, 0.16, -0.03]} rotation={[-0.03, 0.03, 0.12]} castShadow>
      <boxGeometry args={[3.48, 2.44, 0.09]} /><meshStandardMaterial color="#f7f2e8" roughness={0.91} />
    </mesh>
    <group ref={materials}>
      <mesh position={[0.78, 0.1, 0.08]} rotation={[0, 0, -0.12]} castShadow>
        <boxGeometry args={[1.68, 1.82, 0.11]} /><meshStandardMaterial color="#2454d7" roughness={0.72} />
      </mesh>
      <mesh position={[-0.42, 0.36, 0.17]} rotation={[0, 0, 0.18]} castShadow>
        <boxGeometry args={[1.52, 0.96, 0.12]} /><meshStandardMaterial color="#f4efe4" roughness={0.88} />
      </mesh>
      <mesh position={[-0.94, -0.6, 0.25]} rotation={[0, 0, 0.33]} castShadow>
        <boxGeometry args={[0.75, 1.7, 0.14]} /><meshStandardMaterial color="#2454d7" roughness={0.7} />
      </mesh>
      <mesh position={[0.42, -0.57, 0.32]} rotation={[0, 0, -0.25]} castShadow>
        <boxGeometry args={[1.4, 0.48, 0.13]} /><meshStandardMaterial color="#dc143c" roughness={0.77} />
      </mesh>
    </group>
    <group ref={orbit} position={[1.2, 0.54, 0.24]}>
      <mesh rotation={[0, 0, -0.1]} castShadow><circleGeometry args={[0.58, 48]} /><meshStandardMaterial color="#dc143c" roughness={0.76} /></mesh>
      <mesh rotation={[0.64, 0.18, 0.04]}><torusGeometry args={[0.88, 0.018, 8, 48]} /><meshStandardMaterial color="#2454d7" roughness={0.5} metalness={0.18} /></mesh>
    </group>
  </group>;
}

export default function CampaignDeskScene({ scrollProgress }: { scrollProgress: MutableRefObject<number> }) {
  return <Canvas aria-hidden="true" camera={{ position: [0, 0.15, 6.2], fov: 33 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }} shadows>
    <ambientLight intensity={2.25} />
    <directionalLight castShadow intensity={2.7} position={[2.8, 4.3, 5.1]} shadow-mapSize={[512, 512]} />
    <CampaignCollage scrollProgress={scrollProgress} />
    <ContactShadows color="#151311" far={5} opacity={0.18} position={[0, -1.72, -0.85]} resolution={256} scale={6.1} />
  </Canvas>;
}
