import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlaneModelProps {
  progress: number;
}

export const PlaneModel: React.FC<PlaneModelProps> = ({ progress }) => {
  const groupRef = useRef<THREE.Group>(null);
  const propellerRef1 = useRef<THREE.Mesh>(null);
  const propellerRef2 = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.18;
      // Gentle bank oscillation
      groupRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.04;
    }
    if (propellerRef1.current) {
      propellerRef1.current.rotation.z += delta * 12;
    }
    if (propellerRef2.current) {
      propellerRef2.current.rotation.z += delta * 12;
    }
  });

  const showFuselage = progress >= 20;
  const showWingsAndEngines = progress >= 45;
  const showTailAndWindows = progress >= 70;
  const showFullFinish = progress >= 90;

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Runway / cloud platform */}
      <mesh position={[0, -0.9, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.08, 36]} />
        <meshStandardMaterial color="#171717" roughness={0.9} />
      </mesh>

      {/* Subtle landing / flight guidance ring */}
      <mesh position={[0, -0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.1, 2.18, 36]} />
        <meshBasicMaterial color="#333333" transparent opacity={0.6} />
      </mesh>

      {/* Ghost blueprint wireframe always present to show the aircraft's cohesive form */}
      <group>
        {/* Wireframe fuselage */}
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 3.2, 16]} />
          <meshBasicMaterial
            color="#525252"
            wireframe
            transparent
            opacity={progress < 20 ? 0.35 : 0.08}
          />
        </mesh>
        {/* Wireframe wings */}
        <mesh position={[0, 0.2, 0.1]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.04, 3.4, 0.8]} />
          <meshBasicMaterial
            color="#525252"
            wireframe
            transparent
            opacity={progress < 45 ? 0.3 : 0.06}
          />
        </mesh>
      </group>

      {/* Stage 1: Main Aerodynamic Fuselage & Cockpit Glass */}
      {showFuselage && (
        <group>
          {/* Main cylindrical fuselage */}
          <mesh position={[0, 0.2, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.3, 2.4, 24]} />
            <meshStandardMaterial
              color="#e5e5e5"
              metalness={0.2}
              roughness={0.3}
            />
          </mesh>

          {/* Aerodynamic nose cone */}
          <mesh position={[0, 0.2, 1.35]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.32, 0.7, 24]} />
            <meshStandardMaterial
              color="#d4d4d4"
              metalness={0.25}
              roughness={0.3}
            />
          </mesh>

          {/* Cockpit dark canopy visor */}
          <mesh position={[0, 0.36, 1.05]} rotation={[0.45, 0, 0]}>
            <boxGeometry args={[0.36, 0.14, 0.38]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.1} />
          </mesh>

          {/* Tail cone taper */}
          <mesh position={[0, 0.23, -1.55]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.3, 0.65, 24]} />
            <meshStandardMaterial
              color="#d4d4d4"
              metalness={0.25}
              roughness={0.3}
            />
          </mesh>
        </group>
      )}

      {/* Stage 2: Swept Wings and Twin Turbofan Jet Engines */}
      {showWingsAndEngines && (
        <group>
          {/* Left swept main wing */}
          <mesh position={[-1.0, 0.18, 0.05]} rotation={[0, -0.22, -0.04]}>
            <boxGeometry args={[1.5, 0.04, 0.7]} />
            <meshStandardMaterial
              color="#f5f5f5"
              metalness={0.3}
              roughness={0.3}
            />
          </mesh>

          {/* Right swept main wing */}
          <mesh position={[1.0, 0.18, 0.05]} rotation={[0, 0.22, 0.04]}>
            <boxGeometry args={[1.5, 0.04, 0.7]} />
            <meshStandardMaterial
              color="#f5f5f5"
              metalness={0.3}
              roughness={0.3}
            />
          </mesh>

          {/* Left winglet */}
          <mesh position={[-1.76, 0.3, 0.18]} rotation={[0, -0.22, 0.5]}>
            <boxGeometry args={[0.04, 0.24, 0.35]} />
            <meshStandardMaterial color="#171717" />
          </mesh>

          {/* Right winglet */}
          <mesh position={[1.76, 0.3, 0.18]} rotation={[0, 0.22, -0.5]}>
            <boxGeometry args={[0.04, 0.24, 0.35]} />
            <meshStandardMaterial color="#171717" />
          </mesh>

          {/* Left turbofan engine nacelle */}
          <mesh position={[-0.7, 0.05, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.65, 16]} />
            <meshStandardMaterial
              color="#333333"
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>

          {/* Left engine intake fan disk */}
          <mesh
            ref={propellerRef1}
            position={[-0.7, 0.05, 0.48]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.11, 0.11, 0.02, 8]} />
            <meshBasicMaterial color="#e5e5e5" />
          </mesh>

          {/* Right turbofan engine nacelle */}
          <mesh position={[0.7, 0.05, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.65, 16]} />
            <meshStandardMaterial
              color="#333333"
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>

          {/* Right engine intake fan disk */}
          <mesh
            ref={propellerRef2}
            position={[0.7, 0.05, 0.48]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.11, 0.11, 0.02, 8]} />
            <meshBasicMaterial color="#e5e5e5" />
          </mesh>
        </group>
      )}

      {/* Stage 3: Vertical Tail Fin, Stabilizers & Cabin Windows */}
      {showTailAndWindows && (
        <group>
          {/* Vertical tail fin */}
          <mesh position={[0, 0.65, -1.5]} rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[0.04, 0.7, 0.6]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>

          {/* Left horizontal stabilizer */}
          <mesh position={[-0.45, 0.35, -1.6]} rotation={[0, -0.2, 0]}>
            <boxGeometry args={[0.65, 0.03, 0.3]} />
            <meshStandardMaterial color="#e5e5e5" />
          </mesh>

          {/* Right horizontal stabilizer */}
          <mesh position={[0.45, 0.35, -1.6]} rotation={[0, 0.2, 0]}>
            <boxGeometry args={[0.65, 0.03, 0.3]} />
            <meshStandardMaterial color="#e5e5e5" />
          </mesh>

          {/* Left cabin window strip */}
          {[-0.5, -0.2, 0.1, 0.4, 0.7].map((z, idx) => (
            <mesh key={`lw_${idx}`} position={[-0.31, 0.24, z]}>
              <boxGeometry args={[0.03, 0.07, 0.14]} />
              <meshBasicMaterial color="#171717" />
            </mesh>
          ))}

          {/* Right cabin window strip */}
          {[-0.5, -0.2, 0.1, 0.4, 0.7].map((z, idx) => (
            <mesh key={`rw_${idx}`} position={[0.31, 0.24, z]}>
              <boxGeometry args={[0.03, 0.07, 0.14]} />
              <meshBasicMaterial color="#171717" />
            </mesh>
          ))}
        </group>
      )}

      {/* Stage 4: High Altitude Contrails, Wing Lights and Polish */}
      {showFullFinish && (
        <group>
          {/* Wingtip navigation lights */}
          <mesh position={[-1.76, 0.38, 0.18]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[1.76, 0.38, 0.18]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>

          {/* Twin engine contrails streaming behind */}
          <mesh position={[-0.7, 0.05, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.02, 1.2, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
          </mesh>
          <mesh position={[0.7, 0.05, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.02, 1.2, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
          </mesh>
        </group>
      )}
    </group>
  );
};
