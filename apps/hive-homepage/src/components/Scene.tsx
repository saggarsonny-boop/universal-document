"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Sphere, PointMaterial, Points } from "@react-three/drei";
import * as THREE from "three";

function Network() {
  const ref = useRef<THREE.Points>(null);
  const count = 300;

  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 3 + Math.random() * 2;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;
    }
    return p;
  }, [count]);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x -= 0.001;
      ref.current.rotation.y -= 0.002;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#D4AF37" size={0.05} sizeAttenuation={true} depthWrite={false} />
      </Points>
      <Sphere args={[1.5, 32, 32]}>
        <meshBasicMaterial color="#D4AF37" wireframe transparent opacity={0.1} />
      </Sphere>
      <pointLight position={[0, 0, 0]} intensity={50} color="#D4AF37" distance={10} />
    </group>
  );
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 8] }}>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Network />
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        minDistance={4} 
        maxDistance={15}
        autoRotate 
        autoRotateSpeed={0.5} 
      />
    </Canvas>
  );
}
