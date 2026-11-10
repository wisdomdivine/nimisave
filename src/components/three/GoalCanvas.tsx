import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { HouseModel } from './HouseModel';
import { CarModel } from './CarModel';
import { PlaneModel } from './PlaneModel';
import { VaultModel } from './VaultModel';
import { GoalCategory } from '../../types';

interface GoalCanvasProps {
  category: GoalCategory;
  progress: number;
}

export const GoalCanvas: React.FC<GoalCanvasProps> = ({ category, progress }) => {
  const renderModel = () => {
    switch (category) {
      case 'car':
        return <CarModel progress={progress} />;
      case 'trip':
        return <PlaneModel progress={progress} />;
      case 'emergency':
        return <VaultModel progress={progress} />;
      case 'house':
      default:
        return <HouseModel progress={progress} />;
    }
  };

  return (
    <div className="w-full h-96 sm:h-[460px] lg:h-[500px] bg-neutral-925 relative overflow-hidden rounded-2xl flex items-center justify-center">
      <Canvas
        camera={{ position: [4.5, 3.2, 4.5], fov: 42 }}
        className="cursor-grab active:cursor-grabbing w-full h-full"
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 10, 6]} intensity={1.4} />
        <directionalLight position={[-6, 4, -4]} intensity={0.5} />

        <Suspense fallback={null}>
          {renderModel()}
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3.5}
          maxDistance={8.5}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate={false}
        />
      </Canvas>

      <div className="absolute bottom-4 left-6 pointer-events-none">
        <span className="text-xs text-neutral-400">
          Rotate to explore 3D stage
        </span>
      </div>
    </div>
  );
};
