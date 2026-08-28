import React, { useState } from 'react';
import { Sparkles, CheckCircle2, RotateCcw, HelpCircle, Sun, AlertTriangle, Leaf, Zap } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface PhotosynthesisLabProps {
  onComplete?: (score: number) => void;
}

export const PhotosynthesisLab: React.FC<PhotosynthesisLabProps> = ({ onComplete }) => {
  // Slots for Equation: P (needs CO2) and Q (needs O2)
  const [slotP, setSlotP] = useState<string | null>(null);
  const [slotQ, setSlotQ] = useState<string | null>(null);
  const [draggingGas, setDraggingGas] = useState<string | null>(null);

  // Animation trigger when equation is complete & correct
  const [isEquationMagicActive, setIsEquationMagicActive] = useState(false);
  const [wrongDropFlash, setWrongDropFlash] = useState<'P' | 'Q' | null>(null);

  // Part 2(b) Checkbox limit mechanism (Max 2 allowed)
  const [checkedOptions, setCheckedOptions] = useState<{ [key: string]: boolean }>({
    opt1: false, // 植物 P 没有叶绿素 (False)
    opt2: false, // 植物 Q 获得较充足的阳光 (True)
    opt3: false, // 阳光是植物良好生长所需的条件之一 (True)
    opt4: false, // 两盆植物接受的水分不同 (False)
  });

  const [isShaking, setIsShaking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const totalCheckedCount = Object.values(checkedOptions).filter(Boolean).length;

  const handleGasDragStart = (gas: string) => {
    setDraggingGas(gas);
    sounds.playPop();
  };

  const handleDropOnSlot = (slot: 'P' | 'Q') => {
    if (!draggingGas) return;

    if (slot === 'P') {
      if (draggingGas === 'co2') {
        setSlotP('co2');
        sounds.playSnap();
        checkAndTriggerMagic('co2', slotQ);
      } else {
        // Wrong gas dropped into P
        triggerWrongFeedback('P');
      }
    } else if (slot === 'Q') {
      if (draggingGas === 'o2') {
        setSlotQ('o2');
        sounds.playSnap();
        checkAndTriggerMagic(slotP, 'o2');
      } else {
        // Wrong gas dropped into Q
        triggerWrongFeedback('Q');
      }
    }
    setDraggingGas(null);
  };

  const triggerWrongFeedback = (slot: 'P' | 'Q') => {
    sounds.playError();
    setWrongDropFlash(slot);
    setTimeout(() => setWrongDropFlash(null), 600);
  };

  const checkAndTriggerMagic = (pVal: string | null, qVal: string | null) => {
    if (pVal === 'co2' && qVal === 'o2') {
      setIsEquationMagicActive(true);
      sounds.playPhotosynthesis();
    }
  };

  const handleGasClickToSlot = (gas: string) => {
    sounds.playPop();
    if (gas === 'co2') {
      setSlotP('co2');
      checkAndTriggerMagic('co2', slotQ);
    } else if (gas === 'o2') {
      setSlotQ('o2');
      checkAndTriggerMagic(slotP, 'o2');
    }
  };

  // Checkbox toggle with strict anti-guessing limit of 2
  const handleCheckboxToggle = (key: string) => {
    if (checkedOptions[key]) {
      // Uncheck is always permitted
      sounds.playPop();
      setCheckedOptions(prev => ({ ...prev, [key]: false }));
    } else {
      if (totalCheckedCount >= 2) {
        // Limit reached: trigger shake animation and sound
        sounds.playError();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      } else {
        sounds.playPop();
        setCheckedOptions(prev => ({ ...prev, [key]: true }));
      }
    }
  };

  const isEquationCorrect = slotP === 'co2' && slotQ === 'o2';
  const isCheckboxesCorrect = !checkedOptions.opt1 && checkedOptions.opt2 && checkedOptions.opt3 && !checkedOptions.opt4;
  const isAllValid = isEquationCorrect && isCheckboxesCorrect;

  const handleValidate = () => {
    setShowResult(true);
    if (isAllValid) {
      sounds.playSuccess();
      onComplete?.(4); // 2 + 2 = 4 pts
    } else {
      sounds.playError();
    }
  };

  const handleReset = () => {
    setSlotP(null);
    setSlotQ(null);
    setIsEquationMagicActive(false);
    setCheckedOptions({ opt1: false, opt2: false, opt3: false, opt4: false });
    setShowResult(false);
    setShowHint(false);
    sounds.playPop();
  };

  return (
    <div className="space-y-6" id="photosynthesis-lab-module">
      {/* Title Header */}
      <div className="glass-panel p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              Bahagian B · 试题 2 [4分]
            </span>
            <span className="text-xs text-slate-400">提示词 2：光合作用方程式与温室实验 · Frosted Glass</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Leaf className="w-6 h-6 text-emerald-400" />
            植物光合作用模拟器与生长对比实验室
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            拼合光合作用气体方程式，观察温室日照时间对比，探究植物能量转化。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHint(!showHint)}
            className="px-4 py-2 rounded-xl glass-panel hover:bg-white/10 text-slate-200 text-sm font-medium transition flex items-center gap-1.5 border border-white/10"
            id="hint-btn-mod2"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            探究提示
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl glass-panel hover:bg-white/10 text-slate-200 text-sm font-medium transition flex items-center gap-1.5 border border-white/10"
            id="reset-btn-mod2"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      {showHint && (
        <div className="glass-panel p-4 border border-emerald-500/30 text-sm text-emerald-200 bg-emerald-500/10 animate-fadeIn">
          <p className="font-semibold flex items-center gap-2 mb-1 text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400" /> 科学侦探小窍门：
          </p>
          <p className="text-slate-300 leading-relaxed">
            1. 光合作用方程式：<strong className="text-emerald-300">水 + 二氧化碳 (CO₂) ──(阳光、叶绿素)→ 糖 + 氧气 (O₂)</strong>。<br />
            2. 温室对比：植物Q每天获得10小时阳光，叶绿素充分合成养分，长势良好；说明阳光是植物生存的重要基本需求。
          </p>
        </div>
      )}

      {/* Part 1: Top Section (Photosynthesis Equation Puzzle with SVG Plant & Sunlight) */}
      <div className="glass-panel p-6 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">1</span>
            2 (a). 光合作用方程式拼图 [2分]
          </h3>
          <span className="text-xs text-slate-400">将正确的反应物与生成物拖入虚线槽</span>
        </div>

        {/* SVG Plant Illustration & Equation Builder */}
        <div className="glass-panel p-5 border border-white/10 bg-black/40 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* SVG Plant Interactive Visual */}
            <div className="md:col-span-5 flex items-center justify-center relative min-h-[220px]">
              <svg viewBox="0 0 300 240" className="w-full max-h-[220px]">
                <defs>
                  <radialGradient id="sun-glow-lab" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#eab308" stopOpacity="0.2" />
                  </radialGradient>
                </defs>

                {/* Sun with Rays */}
                <g className={isEquationMagicActive ? 'animate-pulse' : ''}>
                  <circle cx="50" cy="40" r="30" fill="url(#sun-glow-lab)" />
                  <circle cx="50" cy="40" r="18" fill="#f59e0b" className="planet-glow" style={{ color: '#f59e0b' }} />
                  {/* Sun rays */}
                  <line x1="50" y1="12" x2="50" y2="4" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="72" y1="20" x2="78" y2="14" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="78" y1="40" x2="86" y2="40" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="28" y1="20" x2="22" y2="14" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="22" y1="40" x2="14" y2="40" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                </g>

                {/* Light Ray Stream to Leaf when Equation Magic is Active */}
                {isEquationMagicActive && (
                  <path
                    d="M 55 45 Q 110 80 145 120"
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="4"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                )}

                {/* Plant Pot */}
                <polygon points="120,180 180,180 170,225 130,225" fill="#92400e" stroke="#78350f" strokeWidth="2" />
                <rect x="115" y="174" width="70" height="8" rx="2" fill="#b45309" />

                {/* Soil & Roots */}
                <ellipse cx="150" cy="180" rx="25" ry="4" fill="#451a03" />
                <path d="M 150 182 Q 140 200 135 215" stroke="#78350f" strokeWidth="2" fill="none" />
                <path d="M 150 182 Q 160 200 165 218" stroke="#78350f" strokeWidth="2" fill="none" />
                <path d="M 150 182 L 150 220" stroke="#78350f" strokeWidth="2" fill="none" />

                {/* Plant Stem */}
                <path d="M 150 178 Q 148 130 150 90" stroke="#16a34a" strokeWidth="5" fill="none" strokeLinecap="round" />

                {/* Leaves */}
                <path d="M 150 140 C 120 125 105 135 95 125 C 105 155 125 155 150 145" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
                <path d="M 150 130 C 180 115 195 125 205 115 C 195 145 175 145 150 135" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
                <path d="M 150 100 C 130 80 120 85 110 75 C 125 105 140 105 150 105" fill="#16a34a" stroke="#15803d" strokeWidth="1.5" />
                <path d="M 150 90 C 170 70 180 75 190 65 C 175 95 160 95 150 95" fill="#16a34a" stroke="#15803d" strokeWidth="1.5" />

                {/* Water arrows up */}
                <path d="M 130 205 L 130 190" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arrow)" strokeDasharray="3 3" />
                <text x="110" y="210" fontSize="10" fill="#38bdf8" fontWeight="bold">水 (H₂O)</text>

                {/* Magic Oxygen & Glucose Particle Emission */}
                {isEquationMagicActive && (
                  <g>
                    <circle cx="190" cy="85" r="5" fill="#22c55e" className="animate-ping" />
                    <circle cx="215" cy="110" r="4" fill="#38bdf8" className="animate-ping" style={{ animationDelay: '0.2s' }} />
                    <circle cx="90" cy="115" r="5" fill="#facc15" className="animate-ping" style={{ animationDelay: '0.4s' }} />
                    <text x="180" y="55" fontSize="11" fill="#4ade80" fontWeight="bold">释放 O₂ 气泡 ✨</text>
                    <text x="185" y="140" fontSize="11" fill="#fde047" fontWeight="bold">制造糖 (葡萄糖) 🍯</text>
                  </g>
                )}
              </svg>
            </div>

            {/* Equation Sentence & Drop Targets */}
            <div className="md:col-span-7 space-y-4">
              <div className="p-4 glass-panel border border-white/10 bg-black/40 flex flex-wrap items-center justify-center gap-2.5 text-sm font-semibold text-slate-200">
                <span className="px-3 py-1.5 bg-cyan-500/15 text-cyan-300 rounded-xl border border-cyan-500/30">
                  水 (Water)
                </span>
                <span className="text-slate-400 font-bold text-lg">+</span>

                {/* Slot P Drop Target */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnSlot('P')}
                  onClick={() => slotP && setSlotP(null)}
                  className={`min-w-[130px] px-3 py-2 rounded-xl border-2 border-dashed flex items-center justify-center gap-1.5 transition cursor-pointer select-none ${
                    slotP === 'co2'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] font-bold'
                      : wrongDropFlash === 'P'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-shake'
                      : 'bg-white/[0.03] border-white/20 text-slate-400 hover:border-emerald-400'
                  }`}
                >
                  {slotP === 'co2' ? (
                    <>
                      <span>二氧化碳 (CO₂)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">[ 空槽位 P ]</span>
                  )}
                </div>

                <div className="flex flex-col items-center px-1">
                  <span className="text-[10px] text-yellow-400 font-bold tracking-tight">阳光 + 叶绿素</span>
                  <span className="text-slate-400 font-bold text-lg">──→</span>
                </div>

                <span className="px-3 py-1.5 bg-yellow-500/15 text-yellow-300 rounded-xl border border-yellow-500/30">
                  糖 (Glucose)
                </span>
                <span className="text-slate-400 font-bold text-lg">+</span>

                {/* Slot Q Drop Target */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnSlot('Q')}
                  onClick={() => slotQ && setSlotQ(null)}
                  className={`min-w-[130px] px-3 py-2 rounded-xl border-2 border-dashed flex items-center justify-center gap-1.5 transition cursor-pointer select-none ${
                    slotQ === 'o2'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] font-bold'
                      : wrongDropFlash === 'Q'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-shake'
                      : 'bg-white/[0.03] border-white/20 text-slate-400 hover:border-emerald-400'
                  }`}
                >
                  {slotQ === 'o2' ? (
                    <>
                      <span>氧气 (O₂)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">[ 空槽位 Q ]</span>
                  )}
                </div>
              </div>

              {/* Draggable Gas Bubble Choices */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <span className="text-xs text-slate-400 font-medium">可用气体气泡 (拖入或点击)：</span>

                <div
                  draggable={slotP !== 'co2'}
                  onDragStart={() => handleGasDragStart('co2')}
                  onClick={() => handleGasClickToSlot('co2')}
                  className={`px-4 py-2.5 rounded-full border flex items-center gap-2 cursor-grab active:cursor-grabbing transition shadow-sm select-none ${
                    slotP === 'co2'
                      ? 'opacity-30 bg-white/5 border-white/10 cursor-default'
                      : 'bg-emerald-600/80 hover:bg-emerald-500 text-white border-emerald-400 hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span className="text-xs font-bold">二氧化碳 (CO₂)</span>
                </div>

                <div
                  draggable={slotQ !== 'o2'}
                  onDragStart={() => handleGasDragStart('o2')}
                  onClick={() => handleGasClickToSlot('o2')}
                  className={`px-4 py-2.5 rounded-full border flex items-center gap-2 cursor-grab active:cursor-grabbing transition shadow-sm select-none ${
                    slotQ === 'o2'
                      ? 'opacity-30 bg-white/5 border-white/10 cursor-default'
                      : 'bg-cyan-600/80 hover:bg-cyan-500 text-white border-cyan-400 hover:scale-105 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span className="text-xs font-bold">氧气 (O₂)</span>
                </div>
              </div>

              {isEquationMagicActive && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-fadeIn shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                  ✨ 光合作用反应成功！水 + 二氧化碳 转化成 糖 + 氧气！
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Lower Section (Greenhouse P vs Q Experiment & Checkboxes) */}
      <div className="glass-panel p-6 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">2</span>
            2 (b). 温室日照对比实验与结论 [2分]
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            最多勾选 2 项 · 已选 ({totalCheckedCount}/2)
          </span>
        </div>

        <p className="text-xs text-slate-400">
          两盆相同植物每天都浇 200 毫升水，但接受阳光的时间不同。根据资料，在两个正确说明旁画 √。
        </p>

        {/* 2 Greenhouses Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Greenhouse P */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center gap-4">
            <div className="w-28 h-36 bg-black/40 rounded-xl border border-white/10 relative flex flex-col items-center justify-end p-2 shadow-inner overflow-hidden">
              <div className="absolute top-1 right-1 text-[10px] font-mono text-slate-400">温室 P</div>
              <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] text-amber-300 font-semibold bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded">
                <Sun className="w-3 h-3 text-amber-400" /> 1小时/天
              </div>
              {/* Drooping Yellow Plant SVG */}
              <svg viewBox="0 0 100 100" className="w-20 h-20">
                <polygon points="35,80 65,80 60,98 40,98" fill="#78350f" />
                <path d="M 50 80 Q 48 55 45 40" stroke="#ca8a04" strokeWidth="3" fill="none" />
                {/* Yellow drooping wilted leaves */}
                <path d="M 47 60 Q 30 70 25 80" stroke="#ca8a04" strokeWidth="2.5" fill="#fef08a" />
                <path d="M 46 45 Q 65 55 70 65" stroke="#ca8a04" strokeWidth="2.5" fill="#fde047" />
              </svg>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-amber-300">植物 P (弱光组)</div>
              <div className="text-slate-300">每天日照时间：<strong className="text-white">1 小时</strong></div>
              <div className="text-slate-400">每日浇水量：200 毫升</div>
              <div className="text-rose-300 font-semibold bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded inline-block">
                一个星期后：叶片发黄、长势弱
              </div>
            </div>
          </div>

          {/* Greenhouse Q */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center gap-4">
            <div className="w-28 h-36 bg-black/40 rounded-xl border border-white/10 relative flex flex-col items-center justify-end p-2 shadow-inner overflow-hidden">
              <div className="absolute top-1 right-1 text-[10px] font-mono text-slate-400">温室 Q</div>
              <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] text-emerald-300 font-semibold bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                <Sun className="w-3 h-3 text-amber-400" /> 10小时/天
              </div>
              {/* Thriving Lush Green Plant SVG */}
              <svg viewBox="0 0 100 100" className="w-20 h-20">
                <polygon points="35,80 65,80 60,98 40,98" fill="#15803d" />
                <path d="M 50 80 Q 50 45 50 25" stroke="#166534" strokeWidth="3" fill="none" />
                {/* Lush green upright leaves */}
                <path d="M 50 65 C 25 50 20 60 15 50 C 25 75 40 75 50 68" fill="#22c55e" />
                <path d="M 50 50 C 75 35 80 45 85 35 C 75 60 60 60 50 53" fill="#22c55e" />
                <path d="M 50 30 C 35 15 30 25 25 15 C 35 40 45 40 50 33" fill="#16a34a" />
              </svg>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-emerald-300">植物 Q (充足光照组)</div>
              <div className="text-slate-300">每天日照时间：<strong className="text-white">10 小时</strong></div>
              <div className="text-slate-400">每日浇水量：200 毫升</div>
              <div className="text-emerald-300 font-semibold bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded inline-block">
                一个星期后：叶片青绿、长势良好
              </div>
            </div>
          </div>
        </div>

        {/* Anti-Guessing Checkbox Group */}
        <div className={`space-y-2 text-xs transition-transform ${isShaking ? 'animate-shake' : ''}`}>
          {totalCheckedCount >= 2 && (
            <div className="text-[11px] text-yellow-300 font-medium flex items-center gap-1.5 bg-yellow-500/10 p-2.5 rounded-xl border border-yellow-500/30">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              已达勾选上限 (2/2)！若要改选其他项，请先取消现有勾选。（防瞎猜机制启动）
            </div>
          )}

          {[
            { id: 'opt1', text: '植物 P 没有叶绿素。', isCorrect: false },
            { id: 'opt2', text: '植物 Q 获得较充足的阳光。', isCorrect: true },
            { id: 'opt3', text: '阳光是植物良好生长所需的条件之一。', isCorrect: true },
            { id: 'opt4', text: '两盆植物接受的水分不同。', isCorrect: false },
          ].map((opt) => {
            const isChecked = checkedOptions[opt.id];
            const isDisabled = !isChecked && totalCheckedCount >= 2;

            return (
              <label
                key={opt.id}
                onClick={() => handleCheckboxToggle(opt.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer select-none ${
                  isChecked
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-medium shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : isDisabled
                    ? 'bg-white/[0.01] border-white/5 text-slate-500 cursor-not-allowed'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 focus:ring-emerald-500 border-white/20"
                  />
                  {opt.text}
                </span>

                {showResult && (
                  <span className={`text-xs font-bold ${opt.isCorrect === isChecked ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {opt.isCorrect ? '✓ 正确结论' : isChecked ? '✗ 错误结论' : ''}
                  </span>
                )}
              </label>
            );
          })}
        </div>

        {showResult && (
          <div className={`text-xs font-semibold p-2.5 rounded-xl border ${isCheckboxesCorrect ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'}`}>
            {isCheckboxesCorrect
              ? '✓ 2(b) 结论选择完全正确！(植物Q获得充足阳光，阳光为植物良好生长条件)'
              : '✗ 2(b) 需勾选第 2 项与第 3 项。两盆植物浇水相同且均有叶绿素。'}
          </div>
        )}

        <button
          onClick={handleValidate}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-[0_0_18px_rgba(16,185,129,0.35)] transition flex items-center justify-center gap-2 active:scale-[0.98]"
          id="validate-mod2-btn"
        >
          <Sparkles className="w-4 h-4" />
          提交核对光合作用实验答案 (验证 4 分)
        </button>
      </div>
    </div>
  );
};
