import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, RotateCcw, HelpCircle, FlaskConical, Beaker, Layers } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface LitmusPaperLabProps {
  onComplete?: (score: number) => void;
}

interface BeakerData {
  id: string;
  name: string;
  nameEn: string;
  liquidColor: string;
  liquidBg: string;
  type: 'acid' | 'neutral' | 'alkali';
  redTestResult: 'red' | 'blue'; // what happens when dipped with red litmus
  blueTestResult: 'red' | 'blue'; // what happens when dipped with blue litmus
  description: string;
  isRedTested: boolean;
  isBlueTested: boolean;
}

const INITIAL_BEAKERS: BeakerData[] = [
  {
    id: 'lemon',
    name: '物质 1: 柠檬汁',
    nameEn: 'Lemon Juice',
    liquidColor: '#facc15',
    liquidBg: 'rgba(250, 204, 21, 0.45)',
    type: 'acid',
    redTestResult: 'red', // stays red
    blueTestResult: 'red', // turns red!
    description: '富含有机柠檬酸',
    isRedTested: false,
    isBlueTested: false,
  },
  {
    id: 'water',
    name: '物质 2: 蒸馏水',
    nameEn: 'Distilled Water',
    liquidColor: '#bae6fd',
    liquidBg: 'rgba(186, 230, 253, 0.3)',
    type: 'neutral',
    redTestResult: 'red', // stays red
    blueTestResult: 'blue', // stays blue
    description: '纯净中性液体，pH约7.0',
    isRedTested: false,
    isBlueTested: false,
  },
  {
    id: 'soap',
    name: '物质 3: 肥皂水',
    nameEn: 'Soap Water',
    liquidColor: '#93c5fd',
    liquidBg: 'rgba(147, 197, 253, 0.4)',
    type: 'alkali',
    redTestResult: 'blue', // turns blue!
    blueTestResult: 'blue', // stays blue
    description: '含有皂化脂肪酸钠，呈弱碱性',
    isRedTested: false,
    isBlueTested: false,
  },
  {
    id: 'soda',
    name: '物质 4: 汽水',
    nameEn: 'Carbonated Soda',
    liquidColor: '#78350f',
    liquidBg: 'rgba(120, 53, 15, 0.5)',
    type: 'acid',
    redTestResult: 'red', // stays red
    blueTestResult: 'red', // turns red!
    description: '含有溶解碳酸与糖浆',
    isRedTested: false,
    isBlueTested: false,
  },
];

export const LitmusPaperLab: React.FC<LitmusPaperLabProps> = ({ onComplete }) => {
  const [beakers, setBeakers] = useState<BeakerData[]>(INITIAL_BEAKERS);
  
  // Currently held/dragging paper: 'red' | 'blue' | null
  const [heldPaper, setHeldPaper] = useState<'red' | 'blue' | null>(null);
  
  // Dipping animation active state for visual feedback on a beaker
  const [activeDippingBeakerId, setActiveDippingBeakerId] = useState<string | null>(null);
  const [dippedPaperColor, setDippedPaperColor] = useState<'red' | 'blue' | null>(null);

  // Sorting tray placements: trayId ('acid' | 'neutral' | 'alkali') -> beakerIds[]
  const [trayPlacements, setTrayPlacements] = useState<{ [tray: string]: string[] }>({
    acid: [],
    neutral: [],
    alkali: [],
  });

  // 2(b) Checkbox questions
  const [checkedOptions, setCheckedOptions] = useState<{ [key: string]: boolean }>({
    opt1: false, // 蓝色石蕊试纸遇酸会变红色 (True)
    opt2: false, // 红色石蕊试纸遇碱会变蓝色 (True)
    opt3: false, // 中性物质会使两种石蕊试纸都变色 (False)
    opt4: false, // 酸性物质会使红色石蕊试纸变蓝 (False)
  });

  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Pull paper from booklet
  const handlePullPaper = (color: 'red' | 'blue') => {
    setHeldPaper(color);
    sounds.playPop();
  };

  // Dip paper into a beaker
  const handleDipIntoBeaker = (beaker: BeakerData) => {
    if (!heldPaper) return;

    sounds.playLiquidDip();
    setActiveDippingBeakerId(beaker.id);

    const resultingColor = heldPaper === 'red' ? beaker.redTestResult : beaker.blueTestResult;
    setDippedPaperColor(resultingColor);

    // Update beaker tested status
    setBeakers(prev =>
      prev.map(b => {
        if (b.id === beaker.id) {
          return {
            ...b,
            isRedTested: heldPaper === 'red' ? true : b.isRedTested,
            isBlueTested: heldPaper === 'blue' ? true : b.isBlueTested,
          };
        }
        return b;
      })
    );

    setTimeout(() => {
      setActiveDippingBeakerId(null);
    }, 1200);
  };

  // Drag beaker into sorting trays
  const handlePlaceBeakerInTray = (beakerId: string, targetTray: 'acid' | 'neutral' | 'alkali') => {
    sounds.playSnap();
    setTrayPlacements(prev => {
      const next = { ...prev };
      // Remove from any previous tray
      Object.keys(next).forEach(t => {
        next[t] = next[t].filter(id => id !== beakerId);
      });
      // Add to target tray
      next[targetTray] = [...next[targetTray], beakerId];
      return next;
    });
  };

  const handleRemoveFromTray = (beakerId: string) => {
    sounds.playPop();
    setTrayPlacements(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(t => {
        next[t] = next[t].filter(id => id !== beakerId);
      });
      return next;
    });
  };

  // Validate results
  const isAcidTrayCorrect =
    trayPlacements.acid.includes('lemon') &&
    trayPlacements.acid.includes('soda') &&
    trayPlacements.acid.length === 2;
  const isNeutralTrayCorrect =
    trayPlacements.neutral.includes('water') &&
    trayPlacements.neutral.length === 1;
  const isAlkaliTrayCorrect =
    trayPlacements.alkali.includes('soap') &&
    trayPlacements.alkali.length === 1;

  const isAllTraysCorrect = isAcidTrayCorrect && isNeutralTrayCorrect && isAlkaliTrayCorrect;
  const isCheckboxesCorrect = checkedOptions.opt1 && checkedOptions.opt2 && !checkedOptions.opt3 && !checkedOptions.opt4;
  const isFullyCompleted = isAllTraysCorrect && isCheckboxesCorrect;

  const handleValidate = () => {
    setShowResult(true);
    if (isFullyCompleted) {
      sounds.playSuccess();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      onComplete?.(6);
    } else {
      sounds.playError();
    }
  };

  const handleReset = () => {
    setBeakers(INITIAL_BEAKERS);
    setHeldPaper(null);
    setActiveDippingBeakerId(null);
    setTrayPlacements({ acid: [], neutral: [], alkali: [] });
    setCheckedOptions({ opt1: false, opt2: false, opt3: false, opt4: false });
    setShowResult(false);
    setShowHint(false);
    sounds.playPop();
  };

  return (
    <div className="space-y-6" id="litmus-paper-lab-module">
      {/* Title Header */}
      <div className="bg-indigo-950 text-white p-5 rounded-2xl border border-indigo-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              Bahagian C · 试题 2 [6分]
            </span>
            <span className="text-xs text-indigo-400">提示词 4：探案系列：神奇试纸实验室</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-indigo-400" />
            神奇石蕊试纸变色实验室 & 酸碱中性托盘分类
          </h2>
          <p className="text-indigo-200/90 text-sm mt-1">
            从试纸本抽出红蓝试纸浸入待测烧杯观察渐变变色，随后将4个烧杯归类至酸性、碱性与中性托盘。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHint(!showHint)}
            className="px-3.5 py-2 rounded-xl bg-indigo-900/80 hover:bg-indigo-850 text-indigo-100 text-sm font-medium transition flex items-center gap-1.5 border border-indigo-700"
            id="hint-btn-mod4"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            实验提示
          </button>
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-indigo-900/80 hover:bg-indigo-850 text-indigo-100 text-sm font-medium transition flex items-center gap-1.5 border border-indigo-700"
            id="reset-btn-mod4"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      {showHint && (
        <div className="bg-indigo-50 border border-indigo-300 rounded-xl p-4 text-sm text-indigo-950 animate-fadeIn">
          <p className="font-semibold flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-600" /> 化学实验探秘法则：
          </p>
          <p>
            - <strong>酸性物质 (Acidic)</strong>：使<strong>蓝色石蕊试纸变红</strong>，红色试纸保持红色（如柠檬汁、汽水）。<br />
            - <strong>碱性物质 (Alkaline)</strong>：使<strong>红色石蕊试纸变蓝</strong>，蓝色试纸保持蓝色（如肥皂水）。<br />
            - <strong>中性物质 (Neutral)</strong>：红色和蓝色试纸都<strong>不发生变色</strong>（如纯净蒸馏水）。
          </p>
        </div>
      )}

      {/* Main Interactive Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Beakers & Dipping Experiment Area */}
        <div className="lg:col-span-8 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-bold text-slate-200">实验操作台 · 浸入试纸检测变色</span>
            </div>

            {/* Litmus Paper Infinite Booklet */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">试纸本：</span>
              <button
                onClick={() => handlePullPaper('red')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                  heldPaper === 'red'
                    ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow-lg'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                }`}
              >
                <div className="w-2 h-3.5 bg-rose-500 rounded-xs" />
                抽红色试纸
              </button>
              <button
                onClick={() => handlePullPaper('blue')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                  heldPaper === 'blue'
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-lg'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30'
                }`}
              >
                <div className="w-2 h-3.5 bg-blue-500 rounded-xs" />
                抽蓝色试纸
              </button>
            </div>
          </div>

          {heldPaper && (
            <div className="p-2.5 bg-indigo-950/70 border border-indigo-500/40 rounded-xl text-xs text-indigo-200 flex items-center justify-between animate-fadeIn">
              <span className="flex items-center gap-2">
                <div className={`w-3 h-5 rounded-xs ${heldPaper === 'red' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                当前手持：<strong>{heldPaper === 'red' ? '红色石蕊试纸' : '蓝色石蕊试纸'}</strong>
                （点击下方任意烧杯进行浸液测试）
              </span>
              <button
                onClick={() => setHeldPaper(null)}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                放下试纸
              </button>
            </div>
          )}

          {/* 4 SVG Beakers Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {beakers.map((beaker) => {
              const isDipping = activeDippingBeakerId === beaker.id;
              const isAssigned = Object.values(trayPlacements).some((list: string[]) => list.includes(beaker.id));

              return (
                <div
                  key={beaker.id}
                  onClick={() => heldPaper && handleDipIntoBeaker(beaker)}
                  className={`bg-slate-950/90 rounded-2xl p-3 border transition-all duration-300 flex flex-col items-center justify-between text-center select-none relative group ${
                    heldPaper
                      ? 'cursor-pointer hover:border-indigo-400 hover:scale-105 ring-1 ring-indigo-500/20'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-200 mb-1">{beaker.name}</div>
                  <div className="text-[10px] text-slate-400">{beaker.nameEn}</div>

                  {/* SVG Transparent Beaker Container */}
                  <div className="relative w-28 h-36 my-2 flex items-center justify-center">
                    <svg viewBox="0 0 100 130" className="w-full h-full">
                      <defs>
                        {/* Glass Reflections */}
                        <linearGradient id={`grad-${beaker.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={beaker.liquidColor} stopOpacity="0.8" />
                          <stop offset="100%" stopColor={beaker.liquidColor} stopOpacity="0.4" />
                        </linearGradient>
                      </defs>

                      {/* Beaker Glass Body */}
                      <path
                        d="M 20 15 L 20 115 Q 20 125 30 125 L 70 125 Q 80 125 80 115 L 80 15 L 85 15 L 85 10 L 15 10 L 15 15 Z"
                        fill="rgba(255,255,255,0.04)"
                        stroke="#64748b"
                        strokeWidth="2"
                      />

                      {/* Liquid Content in Beaker */}
                      <path
                        d="M 22 55 Q 50 50 78 55 L 78 115 Q 78 123 70 123 L 30 123 Q 22 123 22 115 Z"
                        fill={`url(#grad-${beaker.id})`}
                      />

                      {/* Measurement scale lines on beaker */}
                      <line x1="22" y1="40" x2="35" y2="40" stroke="#94a3b8" strokeWidth="1" strokeDasharray="1 1" />
                      <line x1="22" y1="60" x2="30" y2="60" stroke="#94a3b8" strokeWidth="1" strokeDasharray="1 1" />
                      <line x1="22" y1="80" x2="35" y2="80" stroke="#94a3b8" strokeWidth="1" strokeDasharray="1 1" />
                      <line x1="22" y1="100" x2="30" y2="100" stroke="#94a3b8" strokeWidth="1" strokeDasharray="1 1" />

                      {/* Soda bubbles */}
                      {beaker.id === 'soda' && (
                        <g className="animate-pulse">
                          <circle cx="35" cy="70" r="1.5" fill="#fde047" opacity="0.6" />
                          <circle cx="55" cy="90" r="2" fill="#fde047" opacity="0.7" />
                          <circle cx="65" cy="65" r="1.5" fill="#fde047" opacity="0.6" />
                        </g>
                      )}

                      {/* Soap froth */}
                      {beaker.id === 'soap' && (
                        <g>
                          <circle cx="30" cy="52" r="4" fill="#ffffff" opacity="0.4" />
                          <circle cx="50" cy="50" r="5" fill="#ffffff" opacity="0.5" />
                          <circle cx="70" cy="52" r="4" fill="#ffffff" opacity="0.4" />
                        </g>
                      )}

                      {/* Dipping Litmus Paper Active Animation */}
                      {isDipping && heldPaper && (
                        <g className="animate-float">
                          {/* Upper un-dipped dry part */}
                          <rect
                            x="44"
                            y="15"
                            width="12"
                            height="50"
                            fill={heldPaper === 'red' ? '#ef4444' : '#3b82f6'}
                            stroke="#ffffff"
                            strokeWidth="0.5"
                          />
                          {/* Immersed wet tipped part with smooth color morph transition */}
                          <rect
                            x="44"
                            y="65"
                            width="12"
                            height="30"
                            fill={dippedPaperColor === 'red' ? '#ef4444' : '#3b82f6'}
                            style={{ transition: 'fill 0.5s ease-in-out' }}
                            stroke="#ffffff"
                            strokeWidth="0.5"
                          />
                        </g>
                      )}
                    </svg>
                  </div>

                  {/* Tested Status Tags */}
                  <div className="w-full space-y-1 text-[11px] pt-1">
                    <div className="flex items-center justify-between px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                      <span>红试纸测试：</span>
                      <span className={`font-bold ${beaker.isRedTested ? (beaker.redTestResult === 'blue' ? 'text-blue-400' : 'text-rose-400') : 'text-slate-500'}`}>
                        {beaker.isRedTested ? (beaker.redTestResult === 'blue' ? '变蓝色 🔵' : '保持红 🔴') : '未测试'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                      <span>蓝试纸测试：</span>
                      <span className={`font-bold ${beaker.isBlueTested ? (beaker.blueTestResult === 'red' ? 'text-rose-400' : 'text-blue-400') : 'text-slate-500'}`}>
                        {beaker.isBlueTested ? (beaker.blueTestResult === 'red' ? '变红色 🔴' : '保持蓝 🔵') : '未测试'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Classification Action Buttons */}
                  <div className="w-full mt-2 pt-2 border-t border-slate-800 flex items-center justify-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaceBeakerInTray(beaker.id, 'acid');
                      }}
                      className="px-1.5 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 text-[10px] font-bold border border-rose-800 transition"
                    >
                      → 酸性
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaceBeakerInTray(beaker.id, 'neutral');
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 transition"
                    >
                      → 中性
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaceBeakerInTray(beaker.id, 'alkali');
                      }}
                      className="px-1.5 py-0.5 rounded bg-blue-950 hover:bg-blue-900 text-blue-300 text-[10px] font-bold border border-blue-800 transition"
                    >
                      → 碱性
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom 3 Sorting Categorization Trays */}
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              三大性质分类托盘 (将烧杯放入相应托盘)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Acid Tray */}
              <div className="bg-rose-950/40 border-2 border-dashed border-rose-500/50 rounded-xl p-3 min-h-[90px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-rose-300 mb-1">
                  <span>酸性托盘 (Acidic)</span>
                  <span className="text-[10px] bg-rose-900/60 px-1.5 py-0.5 rounded text-rose-200">蓝试纸变红</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {trayPlacements.acid.map((id) => (
                    <span
                      key={id}
                      onClick={() => handleRemoveFromTray(id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-sm flex items-center gap-1 cursor-pointer hover:bg-rose-700"
                    >
                      {beakers.find((b) => b.id === id)?.name.split(':')[1]} ✕
                    </span>
                  ))}
                  {trayPlacements.acid.length === 0 && (
                    <span className="text-[11px] text-rose-300/40 italic py-2">待放入酸性烧杯</span>
                  )}
                </div>
              </div>

              {/* Neutral Tray */}
              <div className="bg-slate-800/40 border-2 border-dashed border-slate-600 rounded-xl p-3 min-h-[90px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>中性托盘 (Neutral)</span>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">均不变色</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {trayPlacements.neutral.map((id) => (
                    <span
                      key={id}
                      onClick={() => handleRemoveFromTray(id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-600 text-white text-xs font-bold shadow-sm flex items-center gap-1 cursor-pointer hover:bg-slate-700"
                    >
                      {beakers.find((b) => b.id === id)?.name.split(':')[1]} ✕
                    </span>
                  ))}
                  {trayPlacements.neutral.length === 0 && (
                    <span className="text-[11px] text-slate-400/40 italic py-2">待放入中性烧杯</span>
                  )}
                </div>
              </div>

              {/* Alkali Tray */}
              <div className="bg-blue-950/40 border-2 border-dashed border-blue-500/50 rounded-xl p-3 min-h-[90px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-blue-300 mb-1">
                  <span>碱性托盘 (Alkaline)</span>
                  <span className="text-[10px] bg-blue-900/60 px-1.5 py-0.5 rounded text-blue-200">红试纸变蓝</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {trayPlacements.alkali.map((id) => (
                    <span
                      key={id}
                      onClick={() => handleRemoveFromTray(id)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm flex items-center gap-1 cursor-pointer hover:bg-blue-700"
                    >
                      {beakers.find((b) => b.id === id)?.name.split(':')[1]} ✕
                    </span>
                  ))}
                  {trayPlacements.alkali.length === 0 && (
                    <span className="text-[11px] text-blue-300/40 italic py-2">待放入碱性烧杯</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Exam Questions 2(b) & Validation */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs">1</span>
              2 (b). 石蕊试纸变色规律勾选题 [2分]
            </h3>
            <p className="text-xs text-slate-500">
              勾选 (✓) 两个有关石蕊试纸变化的正确说法：
            </p>

            <div className="space-y-2 text-xs">
              {[
                { id: 'opt1', text: '蓝色石蕊试纸遇酸会变红色', isCorrect: true },
                { id: 'opt2', text: '红色石蕊试纸遇碱会变蓝色', isCorrect: true },
                { id: 'opt3', text: '中性物质会使两种石蕊试纸都变色', isCorrect: false },
                { id: 'opt4', text: '酸性物质会使红色石蕊试纸变蓝', isCorrect: false },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => {
                    sounds.playPop();
                    setCheckedOptions(prev => ({ ...prev, [opt.id]: !prev[opt.id] }));
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                    checkedOptions[opt.id]
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-medium'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checkedOptions[opt.id]}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    {opt.text}
                  </span>
                  {showResult && (
                    <span className={`text-[11px] font-bold ${opt.isCorrect === checkedOptions[opt.id] ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {opt.isCorrect ? '✓' : checkedOptions[opt.id] ? '✗' : ''}
                    </span>
                  )}
                </label>
              ))}
            </div>

            {showResult && (
              <div className={`p-2 rounded-lg text-xs font-semibold ${isCheckboxesCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {isCheckboxesCorrect ? '✓ 2(b) 勾选完全正确！' : '✗ 2(b) 正确项为第 1 项与第 2 项。'}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs">2</span>
              2 (c). 物质性质判定核算 [4分]
            </h3>
            <div className="text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>柠檬汁 (Lemon Juice):</span>
                <span className="font-bold text-rose-600">酸性 (Acidic)</span>
              </div>
              <div className="flex justify-between">
                <span>蒸馏水 (Distilled Water):</span>
                <span className="font-bold text-slate-600">中性 (Neutral)</span>
              </div>
              <div className="flex justify-between">
                <span>肥皂水 (Soap Water):</span>
                <span className="font-bold text-blue-600">碱性 (Alkaline)</span>
              </div>
              <div className="flex justify-between">
                <span>汽水 (Carbonated Soda):</span>
                <span className="font-bold text-rose-600">酸性 (Acidic)</span>
              </div>
            </div>

            {showResult && (
              <div className={`p-2 rounded-lg text-xs font-semibold ${isAllTraysCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {isAllTraysCorrect
                  ? '✓ 托盘分类完全正确！全屏彩纸屑庆祝已触发！'
                  : '✗ 托盘分类尚有误：柠檬汁与汽水放入酸性托盘，蒸馏水放入中性，肥皂水放入碱性。'}
              </div>
            )}
          </div>

          <button
            onClick={handleValidate}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-[0.98]"
            id="validate-mod4-btn"
          >
            <Sparkles className="w-4 h-4" />
            提交核对化学实验全部答案 (验证 6 分)
          </button>
        </div>
      </div>
    </div>
  );
};
