import React, { useState } from 'react';
import { Sparkles, CheckCircle2, RotateCcw, HelpCircle, Scan, Heart, AlertTriangle, Utensils, PieChart, ShieldCheck } from 'lucide-react';
import { MealPlate } from '../../types';
import { sounds } from '../../utils/audio';

const MEAL_PLATES: MealPlate[] = [
  {
    id: 'meal1',
    title: '餐点 1: 饭、鱼、蔬菜与白开水',
    contents: ['米饭 (碳水化合物)', '清蒸鱼 (优质蛋白质)', '炒青菜 (维生素 & 纤维)', '白开水 (水分)'],
    balanced: true,
    carbs: 35,
    protein: 30,
    vitamins: 25,
    fat: 7,
    sugar: 3,
    explanation: '符合健康餐盘黄金法则：主食、蛋白质与蔬菜均衡搭配，多喝白开水。',
  },
  {
    id: 'meal2',
    title: '餐点 2: 炸鸡、炸薯条与含糖汽水',
    contents: ['炸鸡 (高油脂)', '炸薯条 (高脂肪/高盐)', '含糖汽水 (高精制糖)'],
    balanced: false,
    carbs: 20,
    protein: 15,
    vitamins: 3,
    fat: 42,
    sugar: 20,
    explanation: '缺乏蔬菜水果和维生素，油脂与糖分严重超标（脂肪与糖分占比超60%）。',
  },
  {
    id: 'meal3',
    title: '餐点 3: 汤面、青菜与水煮蛋',
    contents: ['面条 (碳水化合物)', '绿叶蔬菜 (维生素 & 矿物质)', '水煮鸡蛋 (优质蛋白质)'],
    balanced: true,
    carbs: 40,
    protein: 28,
    vitamins: 22,
    fat: 8,
    sugar: 2,
    explanation: '包含谷类、蛋白质与蔬菜，少油烹饪，营养素搭配合理均衡。',
  },
  {
    id: 'meal4',
    title: '餐点 4: 白面包与高糖奶茶饮料',
    contents: ['白面包 (精制碳水)', '高糖加糖奶茶 (高糖/植脂末)'],
    balanced: false,
    carbs: 45,
    protein: 6,
    vitamins: 2,
    fat: 15,
    sugar: 32,
    explanation: '缺乏蛋白质与新鲜蔬果纤维，单一碳水与高糖分会导致血糖剧烈波动。',
  },
];

interface XRayNutritionScannerProps {
  onComplete?: (score: number) => void;
}

export const XRayNutritionScanner: React.FC<XRayNutritionScannerProps> = ({ onComplete }) => {
  // Scanned active meal id
  const [activeScannedMealId, setActiveScannedMealId] = useState<string>('meal1');
  
  // Tag evaluations: mealId -> 'balanced' | 'unbalanced' | null
  const [mealEvaluations, setMealEvaluations] = useState<{ [mealId: string]: 'balanced' | 'unbalanced' | null }>({
    meal1: null,
    meal2: null,
    meal3: null,
    meal4: null,
  });

  // 3(b) Checkboxes
  const [checkedOptions, setCheckedOptions] = useState<{ [key: string]: boolean }>({
    opt1: false, // 每餐搭配谷类、蛋白质和蔬果 (True)
    opt2: false, // 只吃炸鸡和汽水 (False)
    opt3: false, // 多喝白开水 (True)
    opt4: false, // 每天只吃一种食物 (False)
  });

  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const scannedMeal = MEAL_PLATES.find(m => m.id === activeScannedMealId) || MEAL_PLATES[0];

  const handleSelectMealToScan = (mealId: string) => {
    sounds.playScanBeep();
    setActiveScannedMealId(mealId);
  };

  const handleAssignTag = (mealId: string, tag: 'balanced' | 'unbalanced') => {
    sounds.playSnap();
    setMealEvaluations(prev => ({
      ...prev,
      [mealId]: tag,
    }));
  };

  // Validation
  const isMeal1Correct = mealEvaluations.meal1 === 'balanced';
  const isMeal2Correct = mealEvaluations.meal2 === 'unbalanced';
  const isMeal3Correct = mealEvaluations.meal3 === 'balanced';
  const isMeal4Correct = mealEvaluations.meal4 === 'unbalanced';
  const isAllMealsEvaluatedCorrectly = isMeal1Correct && isMeal2Correct && isMeal3Correct && isMeal4Correct;

  const isCheckboxesCorrect = checkedOptions.opt1 && !checkedOptions.opt2 && checkedOptions.opt3 && !checkedOptions.opt4;
  const isAllValid = isAllMealsEvaluatedCorrectly && isCheckboxesCorrect;

  const handleValidate = () => {
    setShowResult(true);
    if (isAllValid) {
      sounds.playSuccess();
      onComplete?.(6);
    } else {
      sounds.playError();
    }
  };

  const handleReset = () => {
    setActiveScannedMealId('meal1');
    setMealEvaluations({ meal1: null, meal2: null, meal3: null, meal4: null });
    setCheckedOptions({ opt1: false, opt2: false, opt3: false, opt4: false });
    setShowResult(false);
    setShowHint(false);
    sounds.playPop();
  };

  return (
    <div className="space-y-6" id="xray-nutrition-module">
      {/* Title Header */}
      <div className="bg-cyan-950 text-white p-5 rounded-2xl border border-cyan-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider border border-cyan-500/30">
              Bahagian C · 试题 3 [6分]
            </span>
            <span className="text-xs text-cyan-400">提示词 5：探案系列：X光营养扫描仪</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Scan className="w-6 h-6 text-cyan-400" />
            X光营养透视扫描仪 & 饮食均衡性智能判定
          </h2>
          <p className="text-cyan-200/90 text-sm mt-1">
            移动发光X光扫描透视框照射餐盘，实时生成营养成分饼图，判定均衡与不均衡饮食。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHint(!showHint)}
            className="px-3.5 py-2 rounded-xl bg-cyan-900/80 hover:bg-cyan-850 text-cyan-100 text-sm font-medium transition flex items-center gap-1.5 border border-cyan-700"
            id="hint-btn-mod5"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            营养提示
          </button>
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-cyan-900/80 hover:bg-cyan-850 text-cyan-100 text-sm font-medium transition flex items-center gap-1.5 border border-cyan-700"
            id="reset-btn-mod5"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      {showHint && (
        <div className="bg-cyan-50 border border-cyan-300 rounded-xl p-4 text-sm text-cyan-950 animate-fadeIn">
          <p className="font-semibold flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-cyan-600" /> 营养侦探小宝典：
          </p>
          <p>
            - <strong>均衡饮食 (Balanced)</strong>：包含适量谷类 (碳水)、鱼蛋肉 (蛋白质) 和蔬菜水果 (维生素/矿物质/纤维)，搭配充足水分。<br />
            - <strong>餐 1</strong> 与 <strong>餐 3</strong> 属于均衡餐点；<strong>餐 2 (高油炸)</strong> 与 <strong>餐 4 (高糖精制)</strong> 属于不均衡餐点。
          </p>
        </div>
      )}

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 4 Meal Plates with X-Ray Scanner Beam */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-slate-200">点击餐盘开启 X光 透视扫描</span>
            </div>
            <span className="text-xs text-cyan-400 font-mono">SCANNER v3.8 ACTIVE</span>
          </div>

          {/* 4 Meal Plates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MEAL_PLATES.map((plate) => {
              const isSelected = activeScannedMealId === plate.id;
              const evaluation = mealEvaluations[plate.id];

              return (
                <div
                  key={plate.id}
                  onClick={() => handleSelectMealToScan(plate.id)}
                  className={`bg-slate-900/90 rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden cursor-pointer select-none ${
                    isSelected
                      ? 'border-cyan-400 ring-2 ring-cyan-500/40 shadow-xl scale-[1.02]'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Active Scanning Laser Line Effect */}
                  {isSelected && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-scanner-line" />
                      <div className="absolute inset-0 bg-cyan-500/10 backdrop-brightness-110" />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">{plate.title.split(':')[0]}</span>
                    {isSelected && (
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700 animate-pulse">
                        [ 扫描中 ]
                      </span>
                    )}
                  </div>

                  {/* SVG Plate Visual */}
                  <div className="w-full aspect-[4/3] rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2 relative">
                    {plate.id === 'meal1' && (
                      <svg viewBox="0 0 160 120" className="w-full h-full">
                        {/* Plate rim */}
                        <ellipse cx="80" cy="60" rx="70" ry="50" fill="#1e293b" stroke="#475569" strokeWidth="3" />
                        <ellipse cx="80" cy="60" rx="60" ry="42" fill="#0f172a" />
                        {/* Rice Bowl */}
                        <ellipse cx="50" cy="45" rx="18" ry="12" fill="#f8fafc" />
                        <text x="50" y="48" fontSize="8" textAnchor="middle" fill="#334155" fontWeight="bold">米饭</text>
                        {/* Steamed Fish */}
                        <path d="M 85 45 Q 115 35 125 45 Q 115 55 85 45 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
                        <polygon points="125,45 135,40 135,50" fill="#94a3b8" />
                        <text x="105" y="47" fontSize="8" textAnchor="middle" fill="#0f172a" fontWeight="bold">鱼肉</text>
                        {/* Veggies */}
                        <circle cx="55" cy="75" r="10" fill="#22c55e" />
                        <circle cx="68" cy="78" r="8" fill="#16a34a" />
                        <text x="60" y="78" fontSize="8" textAnchor="middle" fill="#ffffff" fontWeight="bold">蔬菜</text>
                        {/* Glass of Water */}
                        <rect x="105" y="65" width="16" height="22" rx="2" fill="#38bdf8" opacity="0.8" stroke="#e0f2fe" strokeWidth="1" />
                        <text x="113" y="79" fontSize="7" textAnchor="middle" fill="#0369a1" fontWeight="bold">水</text>
                      </svg>
                    )}

                    {plate.id === 'meal2' && (
                      <svg viewBox="0 0 160 120" className="w-full h-full">
                        <ellipse cx="80" cy="60" rx="70" ry="50" fill="#1e293b" stroke="#475569" strokeWidth="3" />
                        <ellipse cx="80" cy="60" rx="60" ry="42" fill="#0f172a" />
                        {/* Fried Chicken */}
                        <ellipse cx="55" cy="50" rx="20" ry="14" fill="#d97706" stroke="#b45309" strokeWidth="1.5" />
                        <text x="55" y="53" fontSize="8" textAnchor="middle" fill="#ffffff" fontWeight="bold">炸鸡</text>
                        {/* French Fries Box */}
                        <rect x="85" y="42" width="22" height="24" rx="2" fill="#dc2626" />
                        <line x1="88" y1="36" x2="88" y2="42" stroke="#facc15" strokeWidth="3" />
                        <line x1="94" y1="34" x2="94" y2="42" stroke="#facc15" strokeWidth="3" />
                        <line x1="100" y1="35" x2="100" y2="42" stroke="#facc15" strokeWidth="3" />
                        <text x="96" y="55" fontSize="7" textAnchor="middle" fill="#ffffff" fontWeight="bold">薯条</text>
                        {/* Soda Cup with Straw */}
                        <polygon points="120,45 135,45 132,80 123,80" fill="#78350f" stroke="#9a3412" strokeWidth="1" />
                        <line x1="128" y1="35" x2="128" y2="45" stroke="#ef4444" strokeWidth="2" />
                        <text x="128" y="65" fontSize="7" textAnchor="middle" fill="#ffffff" fontWeight="bold">汽水</text>
                      </svg>
                    )}

                    {plate.id === 'meal3' && (
                      <svg viewBox="0 0 160 120" className="w-full h-full">
                        <ellipse cx="80" cy="60" rx="70" ry="50" fill="#1e293b" stroke="#475569" strokeWidth="3" />
                        <ellipse cx="80" cy="60" rx="60" ry="42" fill="#0f172a" />
                        {/* Noodle Bowl */}
                        <ellipse cx="65" cy="55" rx="26" ry="18" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
                        <text x="65" y="58" fontSize="8" textAnchor="middle" fill="#713f12" fontWeight="bold">汤面</text>
                        {/* Egg */}
                        <ellipse cx="110" cy="48" rx="12" ry="9" fill="#f8fafc" />
                        <circle cx="110" cy="48" r="5" fill="#f59e0b" />
                        <text x="110" y="50" fontSize="7" textAnchor="middle" fill="#78350f" fontWeight="bold">蛋</text>
                        {/* Veggies */}
                        <circle cx="110" cy="72" r="10" fill="#22c55e" />
                        <text x="110" y="75" fontSize="7" textAnchor="middle" fill="#ffffff" fontWeight="bold">菜</text>
                      </svg>
                    )}

                    {plate.id === 'meal4' && (
                      <svg viewBox="0 0 160 120" className="w-full h-full">
                        <ellipse cx="80" cy="60" rx="70" ry="50" fill="#1e293b" stroke="#475569" strokeWidth="3" />
                        <ellipse cx="80" cy="60" rx="60" ry="42" fill="#0f172a" />
                        {/* White Bread slice */}
                        <rect x="45" y="40" width="30" height="32" rx="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
                        <text x="60" y="58" fontSize="8" textAnchor="middle" fill="#854d0e" fontWeight="bold">白面包</text>
                        {/* Bubble Tea cup */}
                        <polygon points="100,42 120,42 116,80 104,80" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
                        <line x1="110" y1="32" x2="110" y2="42" stroke="#6366f1" strokeWidth="3" />
                        <circle cx="107" cy="74" r="2" fill="#1e1b4b" />
                        <circle cx="113" cy="73" r="2" fill="#1e1b4b" />
                        <text x="110" y="60" fontSize="7" textAnchor="middle" fill="#ffffff" fontWeight="bold">奶茶</text>
                      </svg>
                    )}

                    {/* Reaction Badges on Plate */}
                    {evaluation && (
                      <div className="absolute bottom-1 right-2 z-20 flex items-center gap-1">
                        {evaluation === 'balanced' ? (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold shadow-md animate-bounce">
                            <Heart className="w-3 h-3 fill-white" /> 判定: 均衡
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[10px] font-bold shadow-md animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> 判定: 不均衡
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Meal Contents Text */}
                  <div className="text-[11px] text-slate-400 mt-2 line-clamp-1">
                    {plate.contents.join(' · ')}
                  </div>

                  {/* Tag Assignment Buttons */}
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignTag(plate.id, 'balanced');
                      }}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                        evaluation === 'balanced'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      均衡
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignTag(plate.id, 'unbalanced');
                      }}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                        evaluation === 'unbalanced'
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800 hover:bg-rose-900'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      不均衡
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Real-time SVG Nutrition Pie Chart & Exam Questions */}
        <div className="lg:col-span-5 space-y-4">
          {/* Real-time SVG Nutrition Breakdown Radar / Pie Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-cyan-600" />
                X光透视分析报告 · {scannedMeal.title.split(':')[0]}
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${scannedMeal.balanced ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {scannedMeal.balanced ? '黄金营养配比' : '结构严重失衡'}
              </span>
            </div>

            <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              {scannedMeal.explanation}
            </p>

            {/* Nutrition Percentage Bar Distribution */}
            <div className="space-y-2 text-xs pt-1">
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 碳水化合物 (Carbs)</span>
                  <span className="font-mono font-bold">{scannedMeal.carbs}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${scannedMeal.carbs}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> 优质蛋白质 (Protein)</span>
                  <span className="font-mono font-bold">{scannedMeal.protein}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${scannedMeal.protein}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 维生素 & 矿物质纤维 (Vitamins)</span>
                  <span className="font-mono font-bold">{scannedMeal.vitamins}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${scannedMeal.vitamins}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> 脂肪 & 超量油脂 (Fats)</span>
                  <span className="font-mono font-bold">{scannedMeal.fat}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${scannedMeal.fat}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500" /> 精制糖分 (Sugar)</span>
                  <span className="font-mono font-bold">{scannedMeal.sugar}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${scannedMeal.sugar}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* 3(b) Checkbox Question */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center text-xs">1</span>
              3 (b). 均衡饮食正确做法勾选 [2分]
            </h3>
            <p className="text-xs text-slate-500">
              勾选 (✓) 两个均衡饮食的正确做法：
            </p>

            <div className="space-y-2 text-xs">
              {[
                { id: 'opt1', text: '每餐搭配谷类、蛋白质和蔬果', isCorrect: true },
                { id: 'opt2', text: '只吃炸鸡和汽水', isCorrect: false },
                { id: 'opt3', text: '多喝白开水', isCorrect: true },
                { id: 'opt4', text: '每天只吃一种食物', isCorrect: false },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => {
                    sounds.playPop();
                    setCheckedOptions(prev => ({ ...prev, [opt.id]: !prev[opt.id] }));
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                    checkedOptions[opt.id]
                      ? 'bg-cyan-50 border-cyan-400 text-cyan-950 font-medium'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checkedOptions[opt.id]}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
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
                {isCheckboxesCorrect ? '✓ 3(b) 勾选完全正确！' : '✗ 3(b) 正确项为第 1 项与第 3 项。'}
              </div>
            )}
          </div>

          {showResult && (
            <div className={`p-2.5 rounded-xl text-xs font-semibold ${isAllMealsEvaluatedCorrectly ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {isAllMealsEvaluatedCorrectly
                ? '✓ 4份餐点营养判定全部正确！(餐1与餐3均衡，餐2与餐4不均衡)'
                : '✗ 餐点判定有误：请根据X光成分分析重新分配标签。'}
            </div>
          )}

          <button
            onClick={handleValidate}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-[0.98]"
            id="validate-mod5-btn"
          >
            <Sparkles className="w-4 h-4" />
            提交核对营养扫描与判定答案 (验证 6 分)
          </button>
        </div>
      </div>
    </div>
  );
};
