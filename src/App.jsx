import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StepNavigation from './components/StepNavigation';
import CarVisualizer from './components/Visualizer/CarVisualizer';
import StepModelSelect from './components/Steps/StepModelSelect';
import StepRoof from './components/Steps/StepRoof';
import StepDoors from './components/Steps/StepDoors';
import StepSteeringWheel from './components/Steps/StepSteeringWheel';
import StepTint from './components/Steps/StepTint';
import StepColor from './components/Steps/StepColor';
import StepFinalize from './components/Steps/StepFinalize';
import GarageModal from './components/GarageModal';
import ExportCardModal from './components/ExportCardModal';
import { INITIAL_CAR_STATE, CAR_MODELS } from './types/car';
import { getGarageCars, deleteCarFromGarage } from './utils/storage';

export default function App() {
  const [carConfig, setCarConfig] = useState(INITIAL_CAR_STATE);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [garageCars, setGarageCars] = useState([]);
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [isExportCardOpen, setIsExportCardOpen] = useState(false);

  // Load saved cars from localStorage on mount
  useEffect(() => {
    setGarageCars(getGarageCars());
  }, []);

  const updateCarConfig = (updates) => {
    setCarConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleResetCar = () => {
    setCarConfig(INITIAL_CAR_STATE);
    setCurrentStepIndex(0);
  };

  const handleLoadCarFromGarage = (savedCar) => {
    setCarConfig(savedCar);
    setCurrentStepIndex(6); // Go to finalize step to admire the loaded car
  };

  const handleDeleteCarFromGarage = (carId) => {
    const updated = deleteCarFromGarage(carId);
    setGarageCars(updated);
  };

  const refreshGarage = () => {
    setGarageCars(getGarageCars());
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenGarage={() => {
          refreshGarage();
          setIsGarageOpen(true);
        }}
        onResetCar={handleResetCar}
        garageCount={garageCars.length}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Step-by-Step Navigation Bar */}
        <StepNavigation
          currentStepIndex={currentStepIndex}
          setCurrentStepIndex={setCurrentStepIndex}
        />

        {/* Dynamic Interactive Visualizer (Showroom) */}
        <div className="w-full">
          <CarVisualizer
            carConfig={carConfig}
            updateCarConfig={updateCarConfig}
          />
        </div>

        {/* Step Customization Controls Panel */}
        <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
          {currentStepIndex === 0 && (
            <StepModelSelect
              carConfig={carConfig}
              updateCarConfig={updateCarConfig}
              onNext={() => setCurrentStepIndex(1)}
            />
          )}

          {currentStepIndex === 1 && (
            <StepRoof
              carConfig={carConfig}
              updateCarConfig={updateCarConfig}
              onNext={() => setCurrentStepIndex(2)}
              onPrev={() => setCurrentStepIndex(0)}
            />
          )}

          {currentStepIndex === 2 && (
            <StepDoors
              carConfig={carConfig}
              updateCarConfig={updateCarConfig}
              onNext={() => setCurrentStepIndex(3)}
              onPrev={() => setCurrentStepIndex(1)}
            />
          )}

          {currentStepIndex === 3 && (
            <StepSteeringWheel
              carConfig={carConfig}
              updateCarConfig={updateCarConfig}
              onNext={() => setCurrentStepIndex(4)}
              onPrev={() => setCurrentStepIndex(2)}
            />
          )}

          {currentStepIndex === 4 && (
            <StepTint
              carConfig={carConfig}
              updateCarConfig={updateCarConfig}
              onNext={() => setCurrentStepIndex(5)}
              onPrev={() => setCurrentStepIndex(3)}
            />
          )}

          {currentStepIndex === 5 && (
            <StepColor
              carConfig={carConfig}
              updateCarConfig={updateCarConfig}
              onNext={() => setCurrentStepIndex(6)}
              onPrev={() => setCurrentStepIndex(4)}
            />
          )}

          {currentStepIndex === 6 && (
            <StepFinalize
              carConfig={carConfig}
              updateCarConfig={updateCarConfig}
              onPrev={() => setCurrentStepIndex(5)}
              onOpenGarage={() => {
                refreshGarage();
                setIsGarageOpen(true);
              }}
              onOpenExportCard={() => setIsExportCardOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-slate-900 text-center text-xs text-slate-500">
        Авто-Конфігуратор 2026 • Створюйте та тюнінгуйте авто вашої мрії (Tesla, Бусик, BMW, Спорткари)
      </footer>

      {/* Modals */}
      <GarageModal
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        garageCars={garageCars}
        onLoadCar={handleLoadCarFromGarage}
        onDeleteCar={handleDeleteCarFromGarage}
      />

      <ExportCardModal
        isOpen={isExportCardOpen}
        onClose={() => setIsExportCardOpen(false)}
        carConfig={carConfig}
      />
    </div>
  );
}
