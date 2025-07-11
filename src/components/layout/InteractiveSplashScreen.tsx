// src/components/layout/InteractiveSplashScreen.tsx

'use client';

import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points as DreiPoints, PointMaterial } from '@react-three/drei';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

function Starfield(props: any) {
  const ref = useRef<THREE.Points>(null);
  const [sphere] = useState(() => {
    const positions = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      const r = 1.5;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions.set([x, y, z], i * 3);
    }
    return positions;
  });

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
      const { pointer } = state;
      ref.current.rotation.y += pointer.x * 0.01;
      ref.current.rotation.x -= pointer.y * 0.01;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <DreiPoints ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#6699ff"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </DreiPoints>
    </group>
  );
}

// CORREÇÃO: O componente agora não recebe mais a prop 'onAnimationComplete'.
// A sua responsabilidade é apenas visual.
export function InteractiveSplashScreen() {
  return (
    <motion.div
      key="splash"
      className="fixed inset-0 z-50 bg-black"
      // A animação de saída continua aqui, será ativada pelo AnimatePresence quando o componente for removido.
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      <Canvas camera={{ position: [0, 0, 2] }}>
        <ambientLight intensity={0.5} />
        <Starfield />
      </Canvas>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.h1
          className="text-white text-5xl md:text-7xl font-bold tracking-tighter"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 1, delay: 0.5 } }}
        >
          B2Y Business 2 You
        </motion.h1>
      </div>
    </motion.div>
  );
}