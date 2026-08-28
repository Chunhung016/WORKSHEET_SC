import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle2, RotateCcw, HelpCircle, FileSearch, Stamp, BookmarkCheck } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface PlantReproductionDetectiveProps {
  onComplete?: (score: number) => void;
}

interface PlantNode {
  id: string;
  name: string;
  correctMethod: string;
  imgDesc: string;
}

const PLANTS: PlantNode[] = [
  { id: 'chili', name: '情景 1: 辣椒 (Chili)', correctMethod: 'seed', imgDesc: '果实内部有许多细小的种子' },
  { id: 'sansevieria', name: '情景 2: 虎尾兰 (Snake Plant)', correctMethod: 'leaf', imgDesc: '切下叶片插入土中生根发芽' },
  { id: 'banana', name: '情景 3: 香蕉 (Banana)', correctMethod: 'sucker', imgDesc: '母株根部长出新的幼芽(吸芽)' },
  { id: 'potato', name: '情景 4: 马铃薯 (Potato)', correctMethod: 'stem', imgDesc: '地下块茎发芽长出新幼苗' },
];

const METHODS = [
  { id: 'seed', name: '种子 (Seed)', desc: '通过种子发育成幼苗' },
  { id: 'leaf', name: '叶子 (Leaf)', desc: '叶片边缘或基部长出新芽' },
  { id: 'sucker', name: '吸芽 (Sucker)', desc: '从母株基部长出的幼株' },
  { id: 'stem', name: '地下茎 (Underground Stem)', desc: '膨大的地下块茎发芽' },
];

interface Connection {
  plantId: string;
  methodId: string;
  isCorrect: boolean;
}

interface StampRecord {
  id: string;
  value: '是' | '不是';
  rotation: number;
  time: number;
}

export const PlantReproductionDetective: React.FC<PlantReproductionDetectiveProps> = ({ onComplete }) => {
  // Matching connections
  const [connections, setConnections] = useState<Connection[]>([
    { plantId: 'chili', methodId: 'seed', isCorrect: true }, // Default sample as given in exam
  ]);
  const [activePlantId, setActivePlantId] = useState<string | null>(null);
  const [dragLineEnd, setDragLineEnd] = useState<{ x: number; y: number } | null>(null);

  // Detective Stamps for 1(d)
  const [stamps, setStamps] = useState<{ [qId: string]: StampRecord | null }>({
    q_d1: null, // "在繁殖不同植物时，所使用的方法是不是一样的？" -> 不是
    q_d2: null, // "用叶子、地下茎或吸芽繁殖时，是不是也能长出新的植物？" -> 是
  });

  // Stamp selection in stamp pad
  const [activeStampTool, setActiveStampTool] = useState<'是' | '不是'>('不是');

  // 1(e)(i) conclusion choice
  const [conclusionChoice, setConclusionChoice] = useState<string | null>(null);

  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [animatingPlant, setAnimatingPlant] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const plantRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const methodRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handlePlantClick = (plantId: string) => {
    sounds.playPop();
    if (activePlantId === plantId) {
      setActivePlantId(null);
    } else {
      setActivePlantId(plantId);
    }
  };

  const handleMethodClick = (methodId: string) => {
    if (!activePlantId) return;

    const plant = PLANTS.find((p) => p.id === activePlantId);
    if (!plant) return;

    const isCorrect = plant.correctMethod === methodId;

    if (isCorrect) {
      sounds.playSnap();
      setAnimatingPlant(plant.id);
      setTimeout(() => setAnimatingPlant(null), 800);

      // Add or replace connection
      setConnections((prev) => {
        const filtered = prev.filter((c) => c.plantId !== activePlantId);
        return [...filtered, { plantId: activePlantId, methodId, isCorrect: true }];
      });
    } else {
      sounds.playError();
    }
    setActivePlantId(null);
  };

  // Stamp stamping action
  const handleApplyStamp = (qId: string) => {
    sounds.playStamp();
    const randomRot = Math.floor(Math.random() * 16) - 8; // -8 to +8 deg
    setStamps((prev) => ({
      ...prev,
      [qId]: {
        id: qId,
        value: activeStampTool,
        rotation: randomRot,
        time: Date.now(),
      },
    }));
  };

  // Validate results
  const correctMatchesCount = connections.filter((c) => c.isCorrect).length;
  const isAllMatched = correctMatchesCount === 4;
  const isD1Correct = stamps.q_d1?.value === '不是';
  const isD2Correct = stamps.q_d2?.value === '是';
  const isECorrect = conclusionChoice === 'opt1';

  const isAllCompleted = isAllMatched && isD1Correct && isD2Correct && isECorrect;

  const handleValidate = () => {
    setShowResult(true);
    if (isAllCompleted) {
      sounds.playSuccess();
      onComplete?.(6);
    } else {
      sounds.playError();
    }
  };

  const handleReset = () => {
    setConnections([{ plantId: 'chili', methodId: 'seed', isCorrect: true }]);
    setActivePlantId(null);
    setStamps({ q_d1: null, q_d2: null });
    setConclusionChoice(null);
    setShowResult(false);
    setShowHint(false);
    sounds.playPop();
  };

  return (
    <div className="space-y-6" id="plant-reproduction-module">
      {/* Title Header */}
      <div className="bg-amber-950 text-white p-5 rounded-2xl border border-amber-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/30">
              Bahagian C · 试题 1 [6分]
            </span>
            <span className="text-xs text-amber-400">提示词 3：探案系列：植物繁衍之谜</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-amber-400" />
            植物繁衍之谜 · 侦探连连看与报告盖章
          </h2>
          <p className="text-amber-200/90 text-sm mt-1">
            化身科学小侦探，观察植物繁殖情景进行连线配对，并使用红色印章完成案件调查结论。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHint(!showHint)}
            className="px-3.5 py-2 rounded-xl bg-amber-900/80 hover:bg-amber-850 text-amber-100 text-sm font-medium transition flex items-center gap-1.5 border border-amber-700"
            id="hint-btn-mod3"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            探案提示
          </button>
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-amber-900/80 hover:bg-amber-850 text-amber-100 text-sm font-medium transition flex items-center gap-1.5 border border-amber-700"
            id="reset-btn-mod3"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      {showHint && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm text-amber-950 animate-fadeIn">
          <p className="font-semibold flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-600" /> 侦探线索档案：
          </p>
          <p>
            - <strong>辣椒</strong>：果实内有种子 → <strong>种子 (Seed)</strong><br />
            - <strong>虎尾兰</strong>：叶片切段插入泥土生根发芽 → <strong>叶子 (Leaf)</strong><br />
            - <strong>香蕉</strong>：母株基部长出小苗 → <strong>吸芽 (Sucker)</strong><br />
            - <strong>马铃薯</strong>：长在泥土下的块茎发芽 → <strong>地下茎 (Underground Stem)</strong>
          </p>
        </div>
      )}

      {/* Main Section 1: Line Matching Interactive Area */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs">1</span>
            1 (c). 植物与繁殖方法配对连线 [3分]
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            已成功配对: {correctMatchesCount} / 4
          </span>
        </div>
        <p className="text-xs text-slate-500">
          点击左侧植物卡片，再点击右侧对应的繁殖方法进行连线配对。正确配对将触发放大弹跳并固定。
        </p>

        {/* 2-Column Matcher Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
          {/* Left Plants */}
          <div className="md:col-span-6 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">观察情景中的植物</div>
            {PLANTS.map((plant) => {
              const matchedConn = connections.find((c) => c.plantId === plant.id);
              const isSelected = activePlantId === plant.id;
              const isBounce = animatingPlant === plant.id;

              return (
                <div
                  key={plant.id}
                  onClick={() => handlePlantClick(plant.id)}
                  className={`p-3 rounded-xl border-2 transition cursor-pointer select-none flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-300'
                      : matchedConn
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950'
                      : 'border-slate-200 bg-white hover:border-amber-300'
                  } ${isBounce ? 'scale-105 transition-transform' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {/* SVG Illustration Icon */}
                    <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 shadow-sm shrink-0">
                      {plant.id === 'chili' && (
                        <svg viewBox="0 0 40 40" className="w-8 h-8">
                          <path d="M 28 8 Q 32 4 35 3" stroke="#15803d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          <path d="M 28 8 C 30 18 26 30 15 35 C 10 32 14 22 22 12 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
                          <circle cx="22" cy="18" r="1.5" fill="#fef08a" />
                          <circle cx="18" cy="24" r="1.5" fill="#fef08a" />
                        </svg>
                      )}
                      {plant.id === 'sansevieria' && (
                        <svg viewBox="0 0 40 40" className="w-8 h-8">
                          <polygon points="12,32 28,32 25,38 15,38" fill="#ca8a04" />
                          <path d="M 16 32 C 14 20 16 10 18 4 C 20 10 22 20 20 32 Z" fill="#15803d" stroke="#166534" strokeWidth="1" />
                          <path d="M 21 32 C 22 24 26 16 28 8 C 28 16 26 24 24 32 Z" fill="#16a34a" stroke="#166534" strokeWidth="1" />
                        </svg>
                      )}
                      {plant.id === 'banana' && (
                        <svg viewBox="0 0 40 40" className="w-8 h-8">
                          <path d="M 20 38 L 20 15" stroke="#a16207" strokeWidth="3" />
                          <path d="M 20 18 C 10 12 5 18 4 12 C 10 24 16 22 20 20" fill="#22c55e" stroke="#166534" strokeWidth="1" />
                          <path d="M 20 18 C 30 12 35 18 36 12 C 30 24 24 22 20 20" fill="#22c55e" stroke="#166534" strokeWidth="1" />
                          {/* Sucker baby plant */}
                          <path d="M 12 38 Q 10 28 7 24 C 12 30 15 32 14 38" fill="#4ade80" />
                        </svg>
                      )}
                      {plant.id === 'potato' && (
                        <svg viewBox="0 0 40 40" className="w-8 h-8">
                          <path d="M 20 26 L 20 8" stroke="#15803d" strokeWidth="2.5" />
                          <circle cx="15" cy="12" r="4" fill="#22c55e" />
                          <circle cx="25" cy="12" r="4" fill="#22c55e" />
                          {/* Underground Tubers */}
                          <ellipse cx="14" cy="32" rx="7" ry="5" fill="#ca8a04" stroke="#854d0e" strokeWidth="1" />
                          <ellipse cx="26" cy="34" rx="6" ry="4.5" fill="#ca8a04" stroke="#854d0e" strokeWidth="1" />
                        </svg>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900">{plant.name}</div>
                      <div className="text-[11px] text-slate-500">{plant.imgDesc}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {matchedConn && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        已配对: {METHODS.find((m) => m.id === matchedConn.methodId)?.name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Target Methods */}
          <div className="md:col-span-6 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">目标繁殖方法</div>
            {METHODS.map((method) => {
              const matchedConns = connections.filter((c) => c.methodId === method.id);

              return (
                <div
                  key={method.id}
                  onClick={() => handleMethodClick(method.id)}
                  className={`p-3 rounded-xl border-2 transition cursor-pointer select-none flex items-center justify-between ${
                    matchedConns.length > 0
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                      : activePlantId
                      ? 'border-amber-400 bg-amber-50/50 hover:bg-amber-100 hover:border-amber-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                      {method.name}
                    </div>
                    <div className="text-[11px] text-slate-500">{method.desc}</div>
                  </div>

                  {matchedConns.length > 0 && (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Section 2: Detective Investigation Report & Stamp Pad */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs">2</span>
            1 (d) & 1 (e). 侦探调查报告与虚拟印章 [3分]
          </h3>
          <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            虚拟红色印泥已就绪
          </span>
        </div>

        {/* Stamp Inkpad Bar */}
        <div className="p-3 bg-red-950 text-white rounded-xl flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2">
            <Stamp className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-bold">侦探印章工具箱：</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveStampTool('是');
                sounds.playPop();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                activeStampTool === '是'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-lg ring-2 ring-rose-400'
                  : 'bg-red-900 text-rose-200 border-red-800 hover:bg-red-850'
              }`}
            >
              印章：【是】
            </button>
            <button
              onClick={() => {
                setActiveStampTool('不是');
                sounds.playPop();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                activeStampTool === '不是'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-lg ring-2 ring-rose-400'
                  : 'bg-red-900 text-rose-200 border-red-800 hover:bg-red-850'
              }`}
            >
              印章：【不是】
            </button>
          </div>
        </div>

        {/* 1(d) Stamp Questions */}
        <div className="space-y-3 bg-amber-50/40 p-4 rounded-xl border border-amber-200/80">
          <div className="text-xs font-bold text-amber-950 mb-1">
            1 (d). 宇轩想要知道不同植物的繁殖方法是否会影响新植物产生的方式。请点击下方盖章判定：
          </div>

          {/* Question (i) */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-xs text-slate-800">
              <strong>(i)</strong> 在繁殖不同植物时，所使用的方法是不是一样的？
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleApplyStamp('q_d1')}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              >
                <Stamp className="w-3.5 h-3.5" />
                盖上【{activeStampTool}】印
              </button>

              {stamps.q_d1 ? (
                <div
                  className="px-3 py-1 rounded border-2 border-rose-600 text-rose-700 font-extrabold text-xs uppercase tracking-widest bg-rose-50/90 shadow-sm animate-stamp select-none"
                  style={{ transform: `rotate(${stamps.q_d1.rotation}deg)` }}
                >
                  【{stamps.q_d1.value}】
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 italic">待盖章</span>
              )}
            </div>
          </div>

          {/* Question (ii) */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-xs text-slate-800">
              <strong>(ii)</strong> 用叶子、地下茎或吸芽繁殖时，是不是也能长出新的植物？
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleApplyStamp('q_d2')}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              >
                <Stamp className="w-3.5 h-3.5" />
                盖上【{activeStampTool}】印
              </button>

              {stamps.q_d2 ? (
                <div
                  className="px-3 py-1 rounded border-2 border-rose-600 text-rose-700 font-extrabold text-xs uppercase tracking-widest bg-rose-50/90 shadow-sm animate-stamp select-none"
                  style={{ transform: `rotate(${stamps.q_d2.rotation}deg)` }}
                >
                  【{stamps.q_d2.value}】
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 italic">待盖章</span>
              )}
            </div>
          </div>
        </div>

        {/* 1(e) Conclusion */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-800">
            1 (e)(i). 勾选 (✓) 一个与植物繁殖有关的正确结论 [1分]：
          </div>

          <div className="space-y-2 text-xs">
            {[
              { id: 'opt1', text: '有些植物可以用不只一种方法繁殖', isCorrect: true },
              { id: 'opt2', text: '所有植物都只能靠果实繁殖', isCorrect: false },
              { id: 'opt3', text: '叶子、地下茎和吸芽都不能用来繁殖植物', isCorrect: false },
            ].map((opt) => (
              <label
                key={opt.id}
                onClick={() => {
                  sounds.playPop();
                  setConclusionChoice(opt.id);
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                  conclusionChoice === opt.id
                    ? 'bg-amber-50 border-amber-500 text-amber-950 font-semibold'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="reproduction-conclusion"
                    checked={conclusionChoice === opt.id}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                  />
                  {opt.text}
                </span>

                {showResult && (
                  <span className={`text-[11px] font-bold ${opt.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {opt.isCorrect ? '✓ 正确结论' : ''}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {showResult && (
          <div className={`p-2.5 rounded-lg text-xs font-semibold ${isAllCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {isAllCompleted
              ? '✓ 探案完成！所有连线、盖章与科学结论均完全正确！(获得满分 6 分)'
              : '✗ 尚有未完全正确的项，请检查植物配对或印章盖印结论。'}
          </div>
        )}

        <button
          onClick={handleValidate}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-[0.98]"
          id="validate-mod3-btn"
        >
          <Sparkles className="w-4 h-4" />
          提交侦探报告与答案核对 (验证 6 分)
        </button>
      </div>
    </div>
  );
};
