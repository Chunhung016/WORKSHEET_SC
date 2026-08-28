import React, { useState } from 'react';
import { ModuleId } from './types';
import { Navbar, MODULE_LIST } from './components/Navbar';
import { SolarSystemRace } from './components/modules/SolarSystemRace';
import { PhotosynthesisLab } from './components/modules/PhotosynthesisLab';
import { PlantReproductionDetective } from './components/modules/PlantReproductionDetective';
import { LitmusPaperLab } from './components/modules/LitmusPaperLab';
import { XRayNutritionScanner } from './components/modules/XRayNutritionScanner';
import { BahagianAOverview } from './components/modules/BahagianAOverview';
import { Sparkles, Trophy, ChevronRight, Award, Compass } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('module1');
  const [scores, setScores] = useState<{ [key in ModuleId]?: number }>({
    module1: 0,
    module2: 0,
    module3: 0,
    module4: 0,
    module5: 0,
    overview: 0,
  });

  const handleScoreUpdate = (modId: ModuleId, earnedPoints: number) => {
    setScores((prev) => ({
      ...prev,
      [modId]: Math.max(prev[modId] || 0, earnedPoints),
    }));
  };

  const currentModMeta = MODULE_LIST.find((m) => m.id === activeModule) || MODULE_LIST[0];

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-200 font-sans flex flex-col relative overflow-x-hidden selection:bg-yellow-500/30 selection:text-yellow-200">
      {/* Ambient background light gradients for frosted glass depth */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Global Frosted Navigation Bar */}
      <div className="relative z-50">
        <Navbar
          activeModule={activeModule}
          onSelectModule={(id) => setActiveModule(id)}
          scores={scores}
        />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* Module Content Switcher */}
        <div className="transition-all duration-300">
          {activeModule === 'module1' && (
            <SolarSystemRace onComplete={(pts) => handleScoreUpdate('module1', pts)} />
          )}

          {activeModule === 'module2' && (
            <PhotosynthesisLab onComplete={(pts) => handleScoreUpdate('module2', pts)} />
          )}

          {activeModule === 'module3' && (
            <PlantReproductionDetective onComplete={(pts) => handleScoreUpdate('module3', pts)} />
          )}

          {activeModule === 'module4' && (
            <LitmusPaperLab onComplete={(pts) => handleScoreUpdate('module4', pts)} />
          )}

          {activeModule === 'module5' && (
            <XRayNutritionScanner onComplete={(pts) => handleScoreUpdate('module5', pts)} />
          )}

          {activeModule === 'overview' && (
            <BahagianAOverview />
          )}
        </div>
      </main>

      {/* Modern Frosted Footer */}
      <footer className="glass-panel border-t border-white/10 text-slate-400 text-xs py-5 mt-12 relative z-10 rounded-none border-x-0 border-b-0 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-slate-200">UASA 小学科学探究实验室 · KSSR Semakan 标准课程</span>
          </div>
          <div className="text-slate-500">
            包含 5 大核心考题互动模块与 Bahagian A 客观题特训 · 纯 SVG & Frosted Glass 沉浸交互
          </div>
        </div>
      </footer>
    </div>
  );
}
