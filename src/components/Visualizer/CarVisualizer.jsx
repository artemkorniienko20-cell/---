import React, { useState } from 'react';
import RealPhotoShowroom from './RealPhotoShowroom';
import ThreeCarShowroom from './ThreeCarShowroom';
import ExteriorRenderer from './ExteriorRenderer';
import CarControlsOverlay from './CarControlsOverlay';
import TestDriveArena from '../Drive/TestDriveArena';

export default function CarVisualizer({ carConfig, updateCarConfig }) {
  const [isRevving, setIsRevving] = useState(false);
  const [showroomTheme, setShowroomTheme] = useState('neon');
  const [isDriving, setIsDriving] = useState(false);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Driving Simulation Mode vs Showroom Mode */}
      {isDriving ? (
        <TestDriveArena
          carConfig={carConfig}
          onExitDrive={() => setIsDriving(false)}
        />
      ) : carConfig.viewMode === '3d' ? (
        <ThreeCarShowroom
          carConfig={carConfig}
          showroomTheme={showroomTheme}
          isRevving={isRevving}
        />
      ) : carConfig.viewMode === 'vector' ? (
        <div className="relative w-full h-[520px] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden bg-slate-950 flex items-center justify-center p-4">
          <ExteriorRenderer
            modelId={carConfig.modelId}
            roofId={carConfig.roofId}
            doorId={carConfig.doorId}
            tintId={carConfig.tintId}
            colorHex={carConfig.colorHex}
            colorFinish={carConfig.colorFinish}
            secondaryColorHex={carConfig.secondaryColorHex}
            licensePlate={carConfig.licensePlate}
            underglowId={carConfig.underglowId}
            headlightsOn={carConfig.headlightsOn}
            doorsOpen={carConfig.doorsOpen}
            isRevving={isRevving}
          />
        </div>
      ) : (
        /* Default: Real-life 8K Photographic Showroom with 360 rotation */
        <RealPhotoShowroom
          carConfig={carConfig}
          isRevving={isRevving}
          onStartDrive={() => setIsDriving(true)}
          onSwitchTo3D={() => updateCarConfig({ viewMode: '3d' })}
        />
      )}

      {/* Control Bar (Doors, Lights, Sounds, Views, and Drive Mode trigger) */}
      {!isDriving && (
        <CarControlsOverlay
          carConfig={carConfig}
          updateCarConfig={updateCarConfig}
          isRevving={isRevving}
          setIsRevving={setIsRevving}
          showroomTheme={showroomTheme}
          setShowroomTheme={setShowroomTheme}
          onStartDrive={() => setIsDriving(true)}
        />
      )}
    </div>
  );
}
