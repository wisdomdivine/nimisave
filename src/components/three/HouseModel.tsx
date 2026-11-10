import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HouseModelProps {
  progress: number; // 0 to 100
}

export const HouseModel: React.FC<HouseModelProps> = ({ progress }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Slow continuous ambient turn
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const showFoundation = progress > 0;
  const showColumns = progress >= 20;
  const showWalls = progress >= 40;
  const showRoof = progress >= 60;
  const showDetails = progress >= 80;

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      {/* Ground platform */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.1, 4.2]} />
        <meshStandardMaterial color="#141414" roughness={0.9} />
      </mesh>

      {/* Stage 1: Foundation slab */}
      {showFoundation && (
        <group>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[2.6, 0.2, 2.2]} />
            <meshStandardMaterial color="#2d2d2d" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.02, 1.3]}>
            <boxGeometry args={[0.8, 0.05, 0.4]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* Stage 2: Framing and Columns */}
      {showColumns && (
        <group>
          {/* 4 Corner columns */}
          <mesh position={[-1.2, 0.8, -1.0]}>
            <boxGeometry args={[0.1, 1.2, 0.1]} />
            <meshStandardMaterial color="#525252" roughness={0.6} />
          </mesh>
          <mesh position={[1.2, 0.8, -1.0]}>
            <boxGeometry args={[0.1, 1.2, 0.1]} />
            <meshStandardMaterial color="#525252" roughness={0.6} />
          </mesh>
          <mesh position={[-1.2, 0.8, 1.0]}>
            <boxGeometry args={[0.1, 1.2, 0.1]} />
            <meshStandardMaterial color="#525252" roughness={0.6} />
          </mesh>
          <mesh position={[1.2, 0.8, 1.0]}>
            <boxGeometry args={[0.1, 1.2, 0.1]} />
            <meshStandardMaterial color="#525252" roughness={0.6} />
          </mesh>
          {/* Top perimeter beam */}
          <mesh position={[0, 1.45, 0]}>
            <boxGeometry args={[2.5, 0.1, 2.1]} />
            <meshStandardMaterial color="#404040" roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* Stage 3: Solid walls and entrance */}
      {showWalls && (
        <group>
          {/* Back wall */}
          <mesh position={[0, 0.8, -0.98]}>
            <boxGeometry args={[2.3, 1.2, 0.08]} />
            <meshStandardMaterial color="#d4d4d4" roughness={0.4} />
          </mesh>
          {/* Left wall */}
          <mesh position={[-1.18, 0.8, 0]}>
            <boxGeometry args={[0.08, 1.2, 1.9]} />
            <meshStandardMaterial color="#d4d4d4" roughness={0.4} />
          </mesh>
          {/* Right wall */}
          <mesh position={[1.18, 0.8, 0]}>
            <boxGeometry args={[0.08, 1.2, 1.9]} />
            <meshStandardMaterial color="#d4d4d4" roughness={0.4} />
          </mesh>
          {/* Front wall left side */}
          <mesh position={[-0.7, 0.8, 0.98]}>
            <boxGeometry args={[0.9, 1.2, 0.08]} />
            <meshStandardMaterial color="#d4d4d4" roughness={0.4} />
          </mesh>
          {/* Front wall right side */}
          <mesh position={[0.7, 0.8, 0.98]}>
            <boxGeometry args={[0.9, 1.2, 0.08]} />
            <meshStandardMaterial color="#d4d4d4" roughness={0.4} />
          </mesh>
          {/* Front lintel above door */}
          <mesh position={[0, 1.25, 0.98]}>
            <boxGeometry args={[0.6, 0.3, 0.08]} />
            <meshStandardMaterial color="#d4d4d4" roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* Stage 4: Pitched roof structure */}
      {showRoof && (
        <group>
          {/* Main roof slab angled */}
          <mesh position={[0, 1.9, 0]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[2.9, 0.12, 2.5]} />
            <meshStandardMaterial color="#262626" roughness={0.3} />
          </mesh>
          {/* Modern chimney */}
          <mesh position={[0.7, 2.2, -0.4]}>
            <boxGeometry args={[0.3, 0.8, 0.3]} />
            <meshStandardMaterial color="#525252" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* Stage 5: Windows, door, trees and finishing */}
      {showDetails && (
        <group>
          {/* Modern front door */}
          <mesh position={[0, 0.65, 0.99]}>
            <boxGeometry args={[0.48, 0.9, 0.04]} />
            <meshStandardMaterial color="#1f1f1f" roughness={0.5} />
          </mesh>
          {/* Door handle */}
          <mesh position={[0.16, 0.65, 1.02]}>
            <boxGeometry args={[0.04, 0.12, 0.02]} />
            <meshStandardMaterial color="#e5e5e5" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Window left */}
          <mesh position={[-0.7, 0.85, 1.01]}>
            <boxGeometry args={[0.45, 0.5, 0.02]} />
            <meshStandardMaterial color="#fef08a" roughness={0.1} emissive="#fef08a" emissiveIntensity={0.3} />
          </mesh>
          {/* Window right */}
          <mesh position={[0.7, 0.85, 1.01]}>
            <boxGeometry args={[0.45, 0.5, 0.02]} />
            <meshStandardMaterial color="#fef08a" roughness={0.1} emissive="#fef08a" emissiveIntensity={0.3} />
          </mesh>
          {/* Minimalist tree left */}
          <mesh position={[-1.7, 0.4, 0.8]}>
            <cylinderGeometry args={[0.06, 0.08, 0.8, 8]} />
            <meshStandardMaterial color="#404040" />
          </mesh>
          <mesh position={[-1.7, 1.0, 0.8]}>
            <coneGeometry args={[0.45, 1.1, 7]} />
            <meshStandardMaterial color="#1e3a1e" roughness={0.8} />
          </mesh>
          {/* Minimalist tree right */}
          <mesh position={[1.7, 0.3, -0.6]}>
            <cylinderGeometry args={[0.05, 0.07, 0.6, 8]} />
            <meshStandardMaterial color="#404040" />
          </mesh>
          <mesh position={[1.7, 0.8, -0.6]}>
            <coneGeometry args={[0.35, 0.9, 7]} />
            <meshStandardMaterial color="#2d4a2d" roughness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
};

