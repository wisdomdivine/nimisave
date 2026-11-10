import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { HouseModel } from './HouseModel';
import { CarModel } from './CarModel';
import { PlaneModel } from './PlaneModel';
import { VaultModel } from './VaultModel';
import { GoalCategory } from '../../types';
import { Home01Icon, Car01Icon, Airplane01Icon, SafeIcon } from 'hugeicons-react';

interface GoalCanvasProps {
  category: GoalCategory;
  progress: number;
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext('experimental-webgl');
    return !!(gl && gl instanceof WebGLRenderingContext);
  } catch {
    return false;
  }
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  WebGLErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('GoalCanvas WebGL initialization notice:', error?.message || error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const GoalCanvas: React.FC<GoalCanvasProps> = ({ category, progress }) => {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setHasWebGL(checkWebGLSupport());
  }, []);

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

  const getCategoryIcon = () => {
    switch (category) {
      case 'car':
        return <Car01Icon size={44} className="text-neutral-300" />;
      case 'trip':
        return <Airplane01Icon size={44} className="text-neutral-300" />;
      case 'emergency':
        return <SafeIcon size={44} className="text-neutral-300" />;
      case 'house':
      default:
        return <Home01Icon size={44} className="text-neutral-300" />;
    }
  };

  const fallbackStage = (
    <div data-testid="goal-canvas-fallback" className="w-full h-full flex flex-col items-center justify-center gap-4 bg-neutral-900 p-8 select-none">
      <div className="w-24 h-24 rounded-full bg-neutral-950 flex items-center justify-center shadow-inner">
        {getCategoryIcon()}
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-neutral-200 font-medium capitalize">
          {category} Goal Stage
        </span>
        <span className="text-xs text-neutral-400 font-light">
          {progress}% Assembled
        </span>
      </div>
      <div className="w-48 h-1.5 bg-neutral-950 rounded-full overflow-hidden mt-2">
        <div
          className="h-full bg-neutral-200 transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  return (
    <div data-testid="goal-canvas-stage" className="w-full h-96 sm:h-[460px] lg:h-[500px] bg-neutral-900 relative overflow-hidden rounded-2xl flex items-center justify-center">
      {!hasWebGL ? (
        fallbackStage
      ) : (
        <WebGLErrorBoundary fallback={fallbackStage}>
          <Canvas
            camera={{ position: [4.5, 3.2, 4.5], fov: 42 }}
            className="cursor-grab active:cursor-grabbing w-full h-full"
            gl={{ powerPreference: 'low-power', antialias: true }}
          >
            <ambientLight intensity={0.9} />
            <directionalLight position={[6, 10, 6]} intensity={1.4} />
            <directionalLight position={[-6, 4, -4]} intensity={0.5} />

            <Suspense fallback={null}>{renderModel()}</Suspense>

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
        </WebGLErrorBoundary>
      )}
    </div>
  );
};
