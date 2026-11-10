import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VaultModelProps {
  progress: number;
}

export const VaultModel: React.FC<VaultModelProps> = ({ progress }) => {
  const groupRef = useRef<THREE.Group>(null);
  const dialRef = useRef<THREE.Group>(null);
  const doorRef = useRef<THREE.Group>(null);

  // Door opens progressively as savings reach 50% or above
  const doorTargetAngle = progress >= 50 ? Math.min(1.4, ((progress - 50) / 50) * 1.4) : 0;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
    if (dialRef.current) {
      dialRef.current.rotation.z += delta * 0.8;
    }
    if (doorRef.current) {
      doorRef.current.rotation.y = THREE.MathUtils.lerp(
        doorRef.current.rotation.y,
        -doorTargetAngle,
        0.05
      );
    }
  });

  const showSafeBody = progress >= 15;
  const showDoorAndBolts = progress >= 35;
  const showInteriorTokens = progress >= 50;
  const showTreasureOverflow = progress >= 75;

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* Heavy base pedestal */}
      <mesh position={[0, -0.85, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.2, 0.1, 32]} />
        <meshStandardMaterial color="#141414" roughness={0.9} />
      </mesh>

      {/* Blueprint wireframe ghost vault */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[2.1, 2.1, 2.1]} />
        <meshBasicMaterial
          color="#525252"
          wireframe
          transparent
          opacity={progress < 25 ? 0.35 : 0.06}
        />
      </mesh>

      {/* Stage 1: Reinforced Heavy Steel Vault Enclosure */}
      {showSafeBody && (
        <group>
          {/* Back wall */}
          <mesh position={[0, 0.2, -0.95]}>
            <boxGeometry args={[1.9, 1.9, 0.1]} />
            <meshStandardMaterial color="#262626" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Left wall */}
          <mesh position={[-0.95, 0.2, 0]}>
            <boxGeometry args={[0.1, 1.9, 1.9]} />
            <meshStandardMaterial color="#262626" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Right wall */}
          <mesh position={[0.95, 0.2, 0]}>
            <boxGeometry args={[0.1, 1.9, 1.9]} />
            <meshStandardMaterial color="#262626" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Top wall */}
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[2.0, 0.1, 2.0]} />
            <meshStandardMaterial color="#1f1f1f" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Bottom floor */}
          <mesh position={[0, -0.75, 0]}>
            <boxGeometry args={[2.0, 0.1, 2.0]} />
            <meshStandardMaterial color="#1f1f1f" metalness={0.7} roughness={0.4} />
          </mesh>

          {/* Reinforced corner bevel pillars */}
          {[
            [-0.95, -0.95],
            [0.95, -0.95],
            [-0.95, 0.95],
            [0.95, 0.95],
          ].map(([x, z], idx) => (
            <mesh key={`col_${idx}`} position={[x, 0.2, z]}>
              <cylinderGeometry args={[0.07, 0.07, 1.9, 12]} />
              <meshStandardMaterial color="#404040" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {/* Stage 2: Heavy Vault Door with Combination Dial & Radial Spokes */}
      {showDoorAndBolts && (
        <group position={[-0.95, 0.2, 0.95]}>
          {/* Heavy hinge pivot group */}
          <group ref={doorRef} position={[0, 0, 0]}>
            {/* Main circular / square door slab */}
            <mesh position={[0.95, 0, 0]}>
              <boxGeometry args={[1.8, 1.8, 0.12]} />
              <meshStandardMaterial color="#303030" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Circular center lock rim */}
            <mesh position={[0.95, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.55, 0.55, 0.05, 32]} />
              <meshStandardMaterial color="#1c1c1c" metalness={0.6} roughness={0.3} />
            </mesh>

            {/* Spinning combination wheel and spoke handles */}
            <group ref={dialRef} position={[0.95, 0, 0.13]}>
              {/* Center dial hub */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.06, 24]} />
                <meshStandardMaterial color="#e5e5e5" metalness={0.9} roughness={0.2} />
              </mesh>

              {/* 4 Radial steering spokes */}
              {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
                <group key={`spoke_${idx}`} rotation={[0, 0, angle]}>
                  <mesh position={[0, 0.3, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.35, 8]} />
                    <meshStandardMaterial color="#e5e5e5" metalness={0.9} roughness={0.2} />
                  </mesh>
                  <mesh position={[0, 0.48, 0]}>
                    <sphereGeometry args={[0.045, 12, 12]} />
                    <meshStandardMaterial color="#d4d4d4" metalness={0.8} roughness={0.3} />
                  </mesh>
                </group>
              ))}
            </group>

            {/* Biometric keypad indicator */}
            <mesh position={[1.6, 0.4, 0.08]}>
              <boxGeometry args={[0.16, 0.26, 0.04]} />
              <meshBasicMaterial color={progress >= 50 ? '#22c55e' : '#3b82f6'} />
            </mesh>
          </group>
        </group>
      )}

      {/* Stage 3: Interior Chamber & Golden Nimiq Stacks */}
      {showInteriorTokens && (
        <group position={[0, 0.1, 0]}>
          {/* Warm internal vault ambient light */}
          <pointLight position={[0, 0.5, 0]} intensity={1.8} color="#fbbf24" distance={3} />

          {/* Stacks of gold bullion bars */}
          {[-0.35, 0, 0.35].map((x, rowIdx) => (
            <group key={`gold_row_${rowIdx}`} position={[x, -0.65, -0.2]}>
              <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[0.28, 0.1, 0.5]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[0.24, 0.1, 0.45]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
              </mesh>
            </group>
          ))}

          {/* Stacks of golden hexagonal Nimiq tokens */}
          {[-0.3, 0.3].map((x, tIdx) => (
            <group key={`token_stack_${tIdx}`} position={[x, -0.4, 0.2]}>
              {[0, 0.07, 0.14, 0.21].map((y, cIdx) => (
                <mesh key={`coin_${cIdx}`} position={[0, y, 0]} rotation={[0, (cIdx * Math.PI) / 6, 0]}>
                  <cylinderGeometry args={[0.18, 0.18, 0.05, 6]} />
                  <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {/* Stage 4: High Growth Overflow & Complete Vault Protection */}
      {showTreasureOverflow && (
        <group position={[0, 0.1, 0]}>
          {/* Top layer gold stacks */}
          <mesh position={[0, -0.3, -0.2]}>
            <boxGeometry args={[0.4, 0.1, 0.4]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.15} />
          </mesh>

          {/* Gleaming center Nimiq diamond token */}
          <mesh position={[0, -0.1, 0.2]} rotation={[0, Math.PI / 4, 0]}>
            <octahedronGeometry args={[0.16]} />
            <meshStandardMaterial color="#fde047" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      )}
    </group>
  );
};
