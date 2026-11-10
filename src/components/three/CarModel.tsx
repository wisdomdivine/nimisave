import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CarModelProps {
  progress: number;
}

export const CarModel: React.FC<CarModelProps> = ({ progress }) => {
  const groupRef = useRef<THREE.Group>(null);
  const frontLeftWheel = useRef<THREE.Mesh>(null);
  const frontRightWheel = useRef<THREE.Mesh>(null);
  const rearLeftWheel = useRef<THREE.Mesh>(null);
  const rearRightWheel = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
    // Rotate wheels gently when assembled
    if (progress >= 80) {
      const wheelSpeed = delta * 2.5;
      if (frontLeftWheel.current) frontLeftWheel.current.rotation.x += wheelSpeed;
      if (frontRightWheel.current) frontRightWheel.current.rotation.x += wheelSpeed;
      if (rearLeftWheel.current) rearLeftWheel.current.rotation.x += wheelSpeed;
      if (rearRightWheel.current) rearRightWheel.current.rotation.x += wheelSpeed;
    }
  });

  const showChassisAndBase = progress >= 15;
  const showCockpit = progress >= 40;
  const showBodyShell = progress >= 65;
  const showWheelsAndLights = progress >= 85;

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* Ground platform */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.08, 4.2]} />
        <meshStandardMaterial color="#141414" roughness={0.9} />
      </mesh>

      {/* Elegant ghost wireframe contour representing the full silhouette */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.65, 0.75, 3.4]} />
        <meshBasicMaterial
          color="#525252"
          wireframe
          transparent
          opacity={progress < 25 ? 0.35 : 0.06}
        />
      </mesh>

      {/* Stage 1: Aerodynamic Platform & Battery Core */}
      {showChassisAndBase && (
        <group>
          {/* Main lower deck */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.5, 0.12, 3.1]} />
            <meshStandardMaterial color="#262626" roughness={0.6} metalness={0.4} />
          </mesh>

          {/* Underbody aero floor */}
          <mesh position={[0, 0.09, 0]}>
            <boxGeometry args={[1.56, 0.04, 3.15]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>

          {/* Battery pack cells */}
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[1.2, 0.08, 1.8]} />
            <meshStandardMaterial color="#3b3b3b" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* Stage 2: Sport Cockpit, Seating & Glass Canopy */}
      {showCockpit && (
        <group>
          {/* Left seat */}
          <mesh position={[-0.34, 0.45, -0.1]}>
            <boxGeometry args={[0.38, 0.45, 0.45]} />
            <meshStandardMaterial color="#222222" roughness={0.8} />
          </mesh>

          {/* Right seat */}
          <mesh position={[0.34, 0.45, -0.1]}>
            <boxGeometry args={[0.38, 0.45, 0.45]} />
            <meshStandardMaterial color="#222222" roughness={0.8} />
          </mesh>

          {/* Dashboard console & HUD */}
          <mesh position={[0, 0.52, 0.45]}>
            <boxGeometry args={[1.1, 0.2, 0.25]} />
            <meshStandardMaterial color="#171717" roughness={0.5} />
          </mesh>

          {/* Steering wheel */}
          <mesh position={[-0.34, 0.62, 0.35]} rotation={[0.4, 0, 0]}>
            <torusGeometry args={[0.1, 0.02, 8, 16]} />
            <meshStandardMaterial color="#e5e5e5" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Panoramic glass dome */}
          <mesh position={[0, 0.68, -0.1]}>
            <boxGeometry args={[1.3, 0.38, 1.7]} />
            <meshStandardMaterial color="#111111" roughness={0.1} />
          </mesh>
        </group>
      )}

      {/* Stage 3: Full Aerodynamic Sports Body Shell */}
      {showBodyShell && (
        <group>
          {/* Lower aerodynamic hull */}
          <mesh position={[0, 0.38, 0]}>
            <boxGeometry args={[1.62, 0.34, 3.3]} />
            <meshStandardMaterial color="#e5e5e5" metalness={0.4} roughness={0.25} />
          </mesh>

          {/* Sloped front hood */}
          <mesh position={[0, 0.44, 1.05]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[1.45, 0.1, 1.05]} />
            <meshStandardMaterial color="#f0f0f0" metalness={0.45} roughness={0.2} />
          </mesh>

          {/* Rear aerodynamic spoiler */}
          <mesh position={[0, 0.72, -1.5]}>
            <boxGeometry args={[1.4, 0.04, 0.25]} />
            <meshStandardMaterial color="#171717" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[-0.55, 0.64, -1.5]}>
            <boxGeometry args={[0.04, 0.16, 0.15]} />
            <meshStandardMaterial color="#171717" />
          </mesh>
          <mesh position={[0.55, 0.64, -1.5]}>
            <boxGeometry args={[0.04, 0.16, 0.15]} />
            <meshStandardMaterial color="#171717" />
          </mesh>
        </group>
      )}

      {/* Stage 4: 4 Alloy Wheels with Low Profile Tires & LED Lights */}
      {showWheelsAndLights && (
        <group>
          {/* Front Left Wheel */}
          <group position={[-0.85, 0.26, 0.95]}>
            <mesh ref={frontLeftWheel} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.26, 0.26, 0.16, 24]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
            <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
              <meshStandardMaterial color="#e5e5e5" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>

          {/* Front Right Wheel */}
          <group position={[0.85, 0.26, 0.95]}>
            <mesh ref={frontRightWheel} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.26, 0.26, 0.16, 24]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
            <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
              <meshStandardMaterial color="#e5e5e5" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>

          {/* Rear Left Wheel */}
          <group position={[-0.85, 0.26, -0.95]}>
            <mesh ref={rearLeftWheel} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.26, 0.26, 0.18, 24]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
            <mesh position={[-0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
              <meshStandardMaterial color="#e5e5e5" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>

          {/* Rear Right Wheel */}
          <group position={[0.85, 0.26, -0.95]}>
            <mesh ref={rearRightWheel} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.26, 0.26, 0.18, 24]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
            <mesh position={[0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
              <meshStandardMaterial color="#e5e5e5" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>

          {/* LED Headlights */}
          <mesh position={[-0.55, 0.42, 1.62]}>
            <boxGeometry args={[0.24, 0.06, 0.06]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.55, 0.42, 1.62]}>
            <boxGeometry args={[0.24, 0.06, 0.06]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Full-width LED Rear Light Strip */}
          <mesh position={[0, 0.48, -1.64]}>
            <boxGeometry args={[1.4, 0.05, 0.04]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}
    </group>
  );
};
