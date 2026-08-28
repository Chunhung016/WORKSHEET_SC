import React, { useState, useRef } from 'react';
import { Sparkles, CheckCircle2, RotateCcw, HelpCircle, Orbit, Sun, ArrowRight } from 'lucide-react';
import { PlanetData } from '../../types';
import { sounds } from '../../utils/audio';

const PLANETS: PlanetData[] = [
  { id: 'P', nameZh: '行星 P', nameEn: 'Planet P (水星)', distanceMillionKm: 58, color: '#94a3b8', accentColor: '#cbd5e1', radius: 14, orbitIndex: 0, realPlanet: '水星 (Mercury)' },
  { id: 'R', nameZh: '行星 R', nameEn: 'Planet R (地球)', distanceMillionKm: 150, color: '#38bdf8', accentColor: '#22c55e', radius: 18, orbitIndex: 1, realPlanet: '地球 (Earth)' },
  { id: 'Q', nameZh: '行星 Q', nameEn: 'Planet Q (木星)', distanceMillionKm: 778, color: '#fb923c', accentColor: '#f97316', radius: 26, orbitIndex: 2, realPlanet: '木星 (Jupiter)' },
  { id: 'S', nameZh: '行星 S', nameEn: 'Planet S (海王星)', distanceMillionKm: 4495, color: '#818cf8', accentColor: '#6366f1', radius: 22, orbitIndex: 3, realPlanet: '海王星 (Neptune)' },
];

const ORBIT_RADII = [80, 130, 190, 260];
const ORBIT_SPEEDS = [6, 12, 24, 45]; // seconds per revolution

interface SolarSystemRaceProps {
  onComplete?: (score: number) => void;
}

export const SolarSystemRace: React.FC<SolarSystemRaceProps> = ({ onComplete }) => {
  // Snapped status for each orbit: orbit index -> planet id or null
  const [snappedOrbits, setSnappedOrbits] = useState<(string | null)[]>([null, null, null, null]);
  const [draggingPlanet, setDraggingPlanet] = useState<PlanetData | null>(null);
  
  // Question 1(a) sequence arrangement state [slot0, slot1, slot2, slot3]
  const [arrangedOrder, setArrangedOrder] = useState<(string | null)[]>([null, null, null, null]);
  
  // Question 1(b) checkbox choices
  const [checkedOptions, setCheckedOptions] = useState<{ [key: string]: boolean }>({
    opt1: false, // 行星 X 离太阳最近。(True)
    opt2: false, // 行星 Z 的公转轨道最短。(False)
    opt3: false, // 行星离太阳越远，公转一周所需时间越长。(True)
    opt4: false, // 行星 Y 的表面温度一定比 X 高。(False)
  });

  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const universeSvgRef = useRef<SVGSVGElement | null>(null);

  // Determine highlighted rows in Table 2 based on hovered or checked options
  const isRowHighlighted = (planet: 'X' | 'Y' | 'Z') => {
    if (hoveredOption === 'opt3' || checkedOptions.opt3) {
      // Highlights X (58) and Z (778) to compare distance vs revolution time
      return planet === 'X' || planet === 'Z';
    }
    if (hoveredOption === 'opt1' || checkedOptions.opt1) {
      return planet === 'X';
    }
    if (hoveredOption === 'opt2' || checkedOptions.opt2) {
      return planet === 'Z';
    }
    return false;
  };

  // Drag handling from tray onto orbits
  const handleDragStart = (planet: PlanetData) => {
    setDraggingPlanet(planet);
    sounds.playPop();
  };

  const handleDropOnSvg = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!draggingPlanet || !universeSvgRef.current) return;

    const rect = universeSvgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Center of orbits in SVG viewbox (cx: 40, cy: 300)
    const scaleX = 600 / rect.width;
    const scaleY = 600 / rect.height;
    const svgX = x * scaleX;
    const svgY = y * scaleY;

    const distFromCenter = Math.hypot(svgX - 40, svgY - 300);

    // Find nearest orbit
    let closestOrbit = -1;
    let minDiff = 999;

    ORBIT_RADII.forEach((r, idx) => {
      const diff = Math.abs(distFromCenter - r);
      if (diff < minDiff && diff < 55) {
        minDiff = diff;
        closestOrbit = idx;
      }
    });

    if (closestOrbit !== -1) {
      // Check if this orbit matches the planet's actual distance rank
      if (closestOrbit === draggingPlanet.orbitIndex) {
        const next = [...snappedOrbits];
        // Remove planet from any previous orbit
        for (let i = 0; i < next.length; i++) {
          if (next[i] === draggingPlanet.id) next[i] = null;
        }
        next[closestOrbit] = draggingPlanet.id;
        setSnappedOrbits(next);
        sounds.playSnap();

        // Auto populate question 1(a) slot if matching
        const nextArranged = [...arrangedOrder];
        nextArranged[closestOrbit] = draggingPlanet.id;
        setArrangedOrder(nextArranged);
      } else {
        sounds.playError();
      }
    }
    setDraggingPlanet(null);
  };

  // Handle slot clicking in 1(a)
  const handleSlotPlace = (planetId: string) => {
    const emptyIndex = arrangedOrder.findIndex((s) => s === null);
    if (emptyIndex !== -1 && !arrangedOrder.includes(planetId)) {
      const next = [...arrangedOrder];
      next[emptyIndex] = planetId;
      setArrangedOrder(next);
      sounds.playPop();

      // Also snap to orbit
      const p = PLANETS.find(item => item.id === planetId);
      if (p && p.orbitIndex === emptyIndex) {
        const nextOrbits = [...snappedOrbits];
        nextOrbits[emptyIndex] = planetId;
        setSnappedOrbits(nextOrbits);
      }
    }
  };

  const handleRemoveFromOrder = (index: number) => {
    const removedPlanet = arrangedOrder[index];
    const next = [...arrangedOrder];
    next[index] = null;
    setArrangedOrder(next);
    sounds.playPop();

    if (removedPlanet) {
      const nextOrbits = [...snappedOrbits];
      for (let i = 0; i < nextOrbits.length; i++) {
        if (nextOrbits[i] === removedPlanet) nextOrbits[i] = null;
      }
      setSnappedOrbits(nextOrbits);
    }
  };

  const toggleOption = (key: string) => {
    sounds.playPop();
    setCheckedOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check answers
  const isOrderCorrect = arrangedOrder[0] === 'P' && arrangedOrder[1] === 'R' && arrangedOrder[2] === 'Q' && arrangedOrder[3] === 'S';
  const isOptionsCorrect = checkedOptions.opt1 && !checkedOptions.opt2 && checkedOptions.opt3 && !checkedOptions.opt4;
  const allCompleted = isOrderCorrect && isOptionsCorrect;

  const handleValidate = () => {
    setShowResult(true);
    if (allCompleted) {
      sounds.playSuccess();
      onComplete?.(4); // 2 pts for 1a, 2 pts for 1b
    } else {
      sounds.playError();
    }
  };

  const handleReset = () => {
    setSnappedOrbits([null, null, null, null]);
    setArrangedOrder([null, null, null, null]);
    setCheckedOptions({ opt1: false, opt2: false, opt3: false, opt4: false });
    setShowResult(false);
    setShowHint(false);
    sounds.playPop();
  };

  return (
    <div className="space-y-6" id="solar-system-race-module">
      {/* Module Title Banner */}
      <div className="glass-panel p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-semibold uppercase tracking-wider border border-yellow-500/30">
              Bahagian B · 试题 1 [4分]
            </span>
            <span className="text-xs text-slate-400">提示词 1：太阳系竞速赛 · Frosted Glass</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Orbit className="w-6 h-6 text-yellow-400 animate-spin" style={{ animationDuration: '20s' }} />
            太阳系行星距离与公转规律探索
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            拖拽行星吸附同心轨道触发公转，利用数据联动高亮验证公转周期与距离的因果关系。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHint(!showHint)}
            className="px-4 py-2 rounded-xl glass-panel hover:bg-white/10 text-slate-200 text-sm font-medium transition flex items-center gap-1.5 border border-white/10"
            id="hint-btn-mod1"
          >
            <HelpCircle className="w-4 h-4 text-yellow-400" />
            探究提示
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl glass-panel hover:bg-white/10 text-slate-200 text-sm font-medium transition flex items-center gap-1.5 border border-white/10"
            id="reset-btn-mod1"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      {showHint && (
        <div className="glass-panel p-4 border border-yellow-500/30 text-sm text-yellow-200 bg-yellow-500/10 animate-fadeIn">
          <p className="font-semibold flex items-center gap-2 mb-1 text-yellow-300">
            <Sparkles className="w-4 h-4 text-yellow-400" /> 科学侦探小窍门：
          </p>
          <p className="text-slate-300 leading-relaxed">
            1. 行星距离太阳由近到远排列：<strong className="text-yellow-300">P (58百万km) → R (150百万km) → Q (778百万km) → S (4495百万km)</strong>。<br />
            2. 观察表2中的数据：行星离太阳越远，公转轨道越长，公转一周所需时间越长（88天 → 365天 → 12年）。
          </p>
        </div>
      )}

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Universe (SVG Canvas & Orbits) */}
        <div className="lg:col-span-7 glass-panel p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-sm font-semibold text-slate-200">互动宇宙模拟器 (拖拽星球至对应轨道)</span>
            </div>
            <span className="text-xs text-yellow-400 font-mono">已吸附公转: {snappedOrbits.filter(Boolean).length} / 4</span>
          </div>

          {/* SVG Concentric Orbit Simulation */}
          <div className="relative w-full aspect-square max-h-[440px] flex items-center justify-center">
            <svg
              ref={universeSvgRef}
              viewBox="0 0 600 600"
              className="w-full h-full select-none"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnSvg}
            >
              <defs>
                {/* Sun Radiant Glow */}
                <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fff7ed" />
                  <stop offset="25%" stopColor="#fde047" />
                  <stop offset="60%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="sun-core" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#dc2626" />
                </radialGradient>
              </defs>

              {/* Distant background stars */}
              <circle cx="120" cy="80" r="1.5" fill="#ffffff" opacity="0.6" />
              <circle cx="480" cy="90" r="1.2" fill="#ffffff" opacity="0.5" />
              <circle cx="320" cy="40" r="1.8" fill="#ffffff" opacity="0.7" />
              <circle cx="520" cy="380" r="1.5" fill="#ffffff" opacity="0.6" />
              <circle cx="420" cy="520" r="1.2" fill="#ffffff" opacity="0.4" />
              <circle cx="180" cy="500" r="1.5" fill="#ffffff" opacity="0.6" />

              {/* Sun Flare Atmosphere */}
              <circle cx="40" cy="300" r="70" fill="url(#sun-glow)" className="animate-pulse" />
              {/* Sun Core */}
              <circle cx="40" cy="300" r="36" fill="url(#sun-core)" className="shadow-lg planet-glow" style={{ color: '#facc15' }} />
              <text x="40" y="305" textAnchor="middle" fill="#000000" fontSize="12" fontWeight="900" pointerEvents="none">
                太阳
              </text>

              {/* 4 Concentric Semi-Circles / Orbit Lines */}
              {ORBIT_RADII.map((radius, idx) => {
                const isTargetForDragging = draggingPlanet?.orbitIndex === idx;
                const isOccupied = snappedOrbits[idx] !== null;

                return (
                  <g key={`orbit-${idx}`}>
                    {/* Orbit Guideline Arc */}
                    <path
                      d={`M 40 ${300 - radius} A ${radius} ${radius} 0 0 1 40 ${300 + radius}`}
                      fill="none"
                      stroke={isTargetForDragging ? '#facc15' : isOccupied ? '#38bdf8' : 'rgba(255,255,255,0.15)'}
                      strokeWidth={isTargetForDragging ? '3.5' : '1.5'}
                      strokeDasharray={isOccupied ? 'none' : '4 4'}
                      className="transition-all duration-300"
                    />

                    {/* Orbit Distance Indicator Tag */}
                    <rect
                      x={40 + radius - 24}
                      y="292"
                      width="48"
                      height="16"
                      rx="8"
                      fill="rgba(5, 7, 10, 0.85)"
                      stroke={isOccupied ? '#38bdf8' : 'rgba(255,255,255,0.2)'}
                      strokeWidth="1"
                    />
                    <text
                      x={40 + radius}
                      y="303"
                      textAnchor="middle"
                      fill={isOccupied ? '#38bdf8' : '#94a3b8'}
                      fontSize="9"
                      fontWeight="600"
                    >
                      {idx === 0 ? '58M' : idx === 1 ? '150M' : idx === 2 ? '778M' : '4495M'}
                    </text>

                    {/* Snapped Planet Orbiting Animation */}
                    {snappedOrbits[idx] && (
                      <g
                        style={{
                          transformOrigin: '40px 300px',
                          animation: `orbit-cw ${ORBIT_SPEEDS[idx]}s linear infinite`,
                        }}
                      >
                        {(() => {
                          const planet = PLANETS.find((p) => p.id === snappedOrbits[idx])!;
                          return (
                            <g transform={`translate(${40 + radius}, 300)`}>
                              {/* Planet Aura */}
                              <circle cx="0" cy="0" r={planet.radius + 5} fill={planet.color} opacity="0.35" className="animate-ping" style={{ animationDuration: '3s' }} />
                              {/* Planet Body */}
                              <circle cx="0" cy="0" r={planet.radius} fill={planet.color} stroke="#ffffff" strokeWidth="2" className="planet-glow" style={{ color: planet.color }} />
                              {/* Planet Features / Rings for Jupiter/Saturn */}
                              {planet.id === 'Q' && (
                                <ellipse cx="0" cy="0" rx={planet.radius + 8} ry="4" fill="none" stroke="#fed7aa" strokeWidth="2" opacity="0.8" transform="rotate(-20)" />
                              )}
                              {/* Planet Label */}
                              <text
                                cx="0"
                                y="4"
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="12"
                                fontWeight="bold"
                                filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.8))"
                              >
                                {planet.id}
                              </text>
                            </g>
                          );
                        })()}
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Planet Tray (Bottom of Universe Canvas) */}
          <div className="glass-panel p-3.5 border border-white/10 mt-2 bg-black/40">
            <div className="text-xs text-slate-400 mb-2.5 flex items-center justify-between font-medium">
              <span>待部署行星库 (可拖拽或点击填入序列)：</span>
              <span className="text-yellow-400 text-[11px] font-semibold">按平均距离远近吸附</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {PLANETS.map((planet) => {
                const isPlaced = snappedOrbits.includes(planet.id);
                return (
                  <div
                    key={planet.id}
                    draggable={!isPlaced}
                    onDragStart={() => handleDragStart(planet)}
                    onClick={() => !isPlaced && handleSlotPlace(planet.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all select-none cursor-pointer ${
                      isPlaced
                        ? 'bg-white/[0.02] border-white/5 opacity-30 cursor-default'
                        : 'glass-card hover:bg-white/10 border-white/15 hover:border-yellow-400 hover:scale-105 shadow-md active:scale-95'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner mb-1 relative planet-glow"
                      style={{ backgroundColor: planet.color, color: planet.color }}
                    >
                      <span className="text-white drop-shadow">{planet.id}</span>
                      {isPlaced && (
                        <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{planet.nameZh}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{planet.distanceMillionKm} 百万km</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Data Tables & Exam Questions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
          {/* Question 1(a): Planetary Distance Order */}
          <div className="glass-panel p-5 border border-white/10 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center text-xs font-bold">1</span>
                1 (a). 行星与太阳平均距离排列 [2分]
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                最靠近 → 最远离
              </span>
            </div>
            <p className="text-xs text-slate-400">
              表格显示太阳系中四颗行星与太阳的平均距离。根据资料，从最近至最远排列。
            </p>

            {/* Table 1: Planetary Distance Data */}
            <div className="overflow-hidden rounded-xl border border-white/10 text-xs">
              <table className="w-full text-center border-collapse">
                <thead className="bg-white/5 text-slate-300 font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-3 text-left border-r border-white/10 text-slate-400">行星</th>
                    <th className="py-2.5 px-2 border-r border-white/10 font-bold text-yellow-400">P</th>
                    <th className="py-2.5 px-2 border-r border-white/10 font-bold text-orange-400">Q</th>
                    <th className="py-2.5 px-2 border-r border-white/10 font-bold text-sky-400">R</th>
                    <th className="py-2.5 px-2 font-bold text-indigo-400">S</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="bg-white/[0.02]">
                    <td className="py-2.5 px-3 text-left font-medium text-slate-400 border-r border-white/10">
                      平均距离 (百万公里)
                    </td>
                    <td className="py-2.5 px-2 font-mono font-bold text-slate-200 border-r border-white/10">58</td>
                    <td className="py-2.5 px-2 font-mono font-bold text-slate-200 border-r border-white/10">778</td>
                    <td className="py-2.5 px-2 font-mono font-bold text-slate-200 border-r border-white/10">150</td>
                    <td className="py-2.5 px-2 font-mono font-bold text-slate-200">4495</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Ordering Sequence Slots */}
            <div className="flex items-center justify-between gap-1.5 bg-black/40 p-3 rounded-xl border border-white/10">
              {[0, 1, 2, 3].map((slotIdx) => {
                const planetId = arrangedOrder[slotIdx];
                const planet = PLANETS.find((p) => p.id === planetId);

                return (
                  <React.Fragment key={`slot-${slotIdx}`}>
                    <div
                      onClick={() => planetId && handleRemoveFromOrder(slotIdx)}
                      className={`flex-1 min-h-[54px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition p-1 cursor-pointer ${
                        planet
                          ? 'border-yellow-500/70 bg-yellow-500/10 shadow-[0_0_12px_rgba(234,179,8,0.2)] hover:border-rose-400'
                          : 'border-white/20 bg-white/[0.03] hover:border-yellow-400/50'
                      }`}
                    >
                      {planet ? (
                        <>
                          <span className="text-sm font-black text-yellow-300">{planet.id}</span>
                          <span className="text-[10px] text-yellow-400/80 font-medium">{planet.distanceMillionKm}M</span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">第 {slotIdx + 1} 位</span>
                      )}
                    </div>

                    {slotIdx < 3 && <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />}
                  </React.Fragment>
                );
              })}
            </div>

            {showResult && (
              <div className={`text-xs font-semibold p-2.5 rounded-xl border ${isOrderCorrect ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'}`}>
                {isOrderCorrect ? '✓ 1(a) 排列完全正确！(P → R → Q → S)' : '✗ 1(a) 顺序有误，请按 58 → 150 → 778 → 4495 重新调整。'}
              </div>
            )}
          </div>

          {/* Question 1(b): Revolution Time & Statements */}
          <div className="glass-panel p-5 border border-white/10 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center text-xs font-bold">2</span>
                1 (b). 公转时间与规律判断 [2分]
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                勾选 2 个正确说明
              </span>
            </div>
            <p className="text-xs text-slate-400">
              表格显示行星 X、Y 和 Z 绕太阳公转一周所需的时间。在两个正确说明旁画 √。
            </p>

            {/* Table 2: Data Binding Highlight Table */}
            <div className="overflow-hidden rounded-xl border border-white/10 text-xs">
              <table className="w-full text-center border-collapse">
                <thead className="bg-white/5 text-slate-300 font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-3 text-left border-r border-white/10 text-slate-400">行星</th>
                    <th className="py-2.5 px-3 border-r border-white/10 text-slate-400">与太阳的距离 (百万公里)</th>
                    <th className="py-2.5 px-3 text-slate-400">公转一周所需时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className={`transition-all duration-300 ${isRowHighlighted('X') ? 'highlight-glow font-bold' : 'bg-white/[0.02]'}`}>
                    <td className="py-2.5 px-3 text-left font-bold text-yellow-300 border-r border-white/10">X (水星)</td>
                    <td className="py-2.5 px-3 font-mono border-r border-white/10 text-slate-300">58</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-400">88 天</td>
                  </tr>
                  <tr className={`transition-all duration-300 ${isRowHighlighted('Y') ? 'highlight-glow font-bold' : 'bg-white/[0.02]'}`}>
                    <td className="py-2.5 px-3 text-left font-bold text-yellow-300 border-r border-white/10">Y (地球)</td>
                    <td className="py-2.5 px-3 font-mono border-r border-white/10 text-slate-300">150</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-400">365 天</td>
                  </tr>
                  <tr className={`transition-all duration-300 ${isRowHighlighted('Z') ? 'highlight-glow font-bold' : 'bg-white/[0.02]'}`}>
                    <td className="py-2.5 px-3 text-left font-bold text-yellow-300 border-r border-white/10">Z (木星)</td>
                    <td className="py-2.5 px-3 font-mono border-r border-white/10 text-slate-300">778</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-400">约 12 年</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Checkbox Statements */}
            <div className="space-y-2 text-xs">
              {[
                { id: 'opt1', text: '行星 X 离太阳最近。', isCorrect: true },
                { id: 'opt2', text: '行星 Z 的公转轨道最短。', isCorrect: false },
                { id: 'opt3', text: '行星离太阳越远，公转一周所需时间越长。', isCorrect: true },
                { id: 'opt4', text: '行星 Y 的表面温度一定比 X 高。', isCorrect: false },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onMouseEnter={() => setHoveredOption(opt.id)}
                  onMouseLeave={() => setHoveredOption(null)}
                  onClick={() => toggleOption(opt.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                    checkedOptions[opt.id]
                      ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-200 font-medium shadow-[0_0_12px_rgba(234,179,8,0.1)]'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checkedOptions[opt.id]}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-yellow-500 accent-yellow-500 focus:ring-yellow-500 border-white/20"
                    />
                    {opt.text}
                  </span>
                  {showResult && (
                    <span className={`text-[11px] font-bold ${opt.isCorrect === checkedOptions[opt.id] ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {opt.isCorrect ? '✓ 正确答案' : checkedOptions[opt.id] ? '✗ 错误选择' : ''}
                    </span>
                  )}
                </label>
              ))}
            </div>

            {showResult && (
              <div className={`text-xs font-semibold p-2.5 rounded-xl border ${isOptionsCorrect ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'}`}>
                {isOptionsCorrect ? '✓ 1(b) 勾选完全正确！' : '✗ 1(b) 需勾选第 1 项与第 3 项。'}
              </div>
            )}
          </div>

          {/* Validation Action Button */}
          <button
            onClick={handleValidate}
            className="w-full py-3.5 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-sm shadow-[0_0_18px_rgba(234,179,8,0.35)] transition flex items-center justify-center gap-2 active:scale-[0.98]"
            id="validate-mod1-btn"
          >
            <Sparkles className="w-4 h-4" />
            提交核对本题答案 (验证 4 分)
          </button>
        </div>
      </div>
    </div>
  );
};
