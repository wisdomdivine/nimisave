import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CarModelProps {
  progress: number;
}

export const CarModel: React.FC<CarModelProps> = ({ progress }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const showChassis = progress > 0;
  const showInterior = progress >= 25;
  const showBody = progress >= 50;
  const showWheelsAndFinish = progress >= 75;

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
      {/* Ground platform */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.1, 4.2]} />
        <meshStandardMaterial color="#141414" roughness={0.9} />
      </mesh>

      {/* Stage 1: Chassis floor and battery pack */}
      {showChassis && (
        <group>
          {/* Main chassis platform */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.5, 0.1, 3.0]} />
            <meshStandardMaterial color="#2b2b2b" roughness={0.6} />
          </mesh>
          {/* Front axle */}
          <mesh position={[0, 0.2, 1.0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 1.6, 12]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
          {/* Rear axle */}
          <mesh position={[0, 0.2, -1.0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 1.6, 12]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
          {/* Battery module block */}
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[1.1, 0.12, 1.6]} />
            <meshStandardMaterial color="#3b3b3b" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* Stage 2: Seating interior and console */}
      {showInterior && (
        <group>
          {/* Left sport seat */}
          <mesh position={[-0.35, 0.5, 0.0]}>
            <boxGeometry args={[0.4, 0.45, 0.4]} />
            <meshStandardMaterial color="#222222" roughness={0.8} />
          </mesh>
          {/* Right sport seat */}
          <mesh position={[0.35, 0.5, 0.0]}>
            <boxGeometry args={[0.4, 0.45, 0.4]} />
            <meshStandardMaterial color="#222222" roughness={0.8} />
          </mesh>
          {/* Steering wheel stalk */}
          <mesh position={[-0.35, 0.65, 0.5]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
        </group>
      )}

      {/* Stage 3: Outer body panels and roof */}
      {showBody && (
        <group>
          {/* Main lower hull */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.56, 0.35, 3.2]} />
            <meshStandardMaterial color="#e5e5e5" metalness={0.3} roughness={0.3} />
          </mesh>
          {/* Cabin glass dome */}
          <mesh position={[0, 0.72, -0.1]}>
            <boxGeometry args={[1.25, 0.38, 1.6]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.1} />
          </mesh>
          {/* Front hood slope */}
          <mesh position={[0, 0.48, 1.0]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[1.4, 0.1, 1.0]} />
            <meshStandardMaterial color="#d4d4d4" metalness={0.4} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* Stage 4: 4 Wheels with rims and headlights */}
      {showWheelsAndFinish && (
        <group>
          {/* Front Left Wheel */}
          <mesh position={[-0.82, 0.28, 1.0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.18, 24]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          {/* Front Right Wheel */}
          <mesh position={[0.82, 0.28, 1.0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.18, 24]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          {/* Rear Left Wheel */}
          <mesh position={[-0.82, 0.28, -1.0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.18, 24]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          {/* Rear Right Wheel */}
          <mesh position={[0.82, 0.28, -1.0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.18, 24]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>

          {/* Front LED light bar */}
          <mesh position={[0, 0.42, 1.61]}>
            <boxGeometry args={[1.2, 0.05, 0.02]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
          {/* Rear light strip */}
          <mesh position={[0, 0.46, -1.61]}>
            <boxGeometry args={[1.2, 0.05, 0.02]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
};

