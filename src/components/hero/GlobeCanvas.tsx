"use client";

import { Canvas } from "@react-three/fiber";
import { MeshDistortMaterial, OrbitControls, Sphere } from "@react-three/drei";

function EnergyGlobe() {
  return (
    <Sphere args={[1.65, 64, 64]} scale={1}>
      <MeshDistortMaterial
        color="#00F0FF"
        emissive="#8A2BE2"
        emissiveIntensity={0.45}
        roughness={0.25}
        metalness={0.88}
        distort={0.38}
        speed={2.4}
      />
    </Sphere>
  );
}

export function GlobeCanvas() {
  return (
    <div className="h-[min(52vh,420px)] w-full md:h-[460px]">
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[8, 6, 8]} intensity={1.4} color="#00F0FF" />
        <pointLight position={[-6, -4, -4]} intensity={0.8} color="#FF007F" />
        <EnergyGlobe />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.85}
        />
      </Canvas>
    </div>
  );
}
