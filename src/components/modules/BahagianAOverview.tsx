import React, { useState } from 'react';
import { Sparkles, CheckCircle2, RotateCcw, HelpCircle, BookOpen, ChevronRight } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
}

const QUESTIONS_A: QuizQuestion[] = [
  {
    id: 1,
    question: '哪种动物会产下大量的卵，以增加后代生存的机会？',
    options: ['A 青蛙 (Frog)', 'B 麻雀 (Sparrow)', 'C 兔 (Rabbit)', 'D 海豚 (Dolphin)'],
    correctIndex: 0,
    explanation: '青蛙是两栖动物，产下大量卵并包裹在卵胶中，因为卵容易被天敌捕食或冲走，大量产卵可确保后代物种延续。',
    category: '动物的繁殖与生命延续',
  },
  {
    id: 2,
    question: '哪种植物主要通过种子繁殖？',
    options: ['A 香蕉 (吸芽)', 'B 蕨 (孢子)', 'C 落地生根 (叶子)', 'D 西瓜 (种子)'],
    correctIndex: 3,
    explanation: '西瓜是有花植物，果实内部含有许多种子，主要依靠种子繁殖新植株。',
    category: '植物的繁殖方式',
  },
  {
    id: 3,
    question: '下图显示人类的消化系统。小肠与大肠的主要功能分别是什么？',
    options: [
      'A 小肠：吸收食物中的营养素 ；大肠：吸收食物中的水分',
      'B 小肠：将粪便排出体外 ；大肠：磨碎食物',
      'C 小肠：吸收食物中的水分 ；大肠：吸收食物中的营养素',
      'D 小肠：把食物变成粪便 ；大肠：把食物变成糊状',
    ],
    correctIndex: 0,
    explanation: '小肠是吸收食物中主要营养素的器官；大肠则主要吸收食物残渣中的多余水分和无机盐，形成粪便。',
    category: '人类的消化系统',
  },
  {
    id: 4,
    question: '咳嗽药水为什么附送有刻度的量杯？',
    options: ['A 让药水变得较稀', 'B 确保病人在饭后服用', 'C 确保每天服用三次', 'D 确保病人服用正确剂量'],
    correctIndex: 3,
    explanation: '量杯上的刻度可以准确量取液体体积（毫升 mL），确保病人服用医生建议的正确药物剂量。',
    category: '科学技能与测量',
  },
  {
    id: 5,
    question: '人类的肺部会排出哪些废物？',
    options: ['A 氧气和多余水分', 'B 氧气和二氧化碳', 'C 二氧化碳和多余水分', 'D 氮气和多余水分'],
    correctIndex: 2,
    explanation: '肺是人体的呼吸器官，呼气时排出细胞代谢产生的二氧化碳以及水蒸气（多余水分）。',
    category: '人类的排泄与排遗',
  },
  {
    id: 6,
    question: '地球由西向东自转会形成哪些自然现象？',
    options: ['A P 和 Q (昼夜交替 + 四季变化)', 'B P 和 S (昼夜交替 + 一天中影子的方向改变)', 'C Q 和 R (四季变化 + 重力)', 'D R 和 S (重力 + 影子方向)'],
    correctIndex: 1,
    explanation: '地球自转形成：P昼夜交替、太阳东升西落、S一天中物体影子的长度与方向改变。四季变化是由地球公转及地轴倾斜引起的。',
    category: '地球与宇宙',
  },
  {
    id: 7,
    question: '为了让前方司机能从后视镜读到 AMBULANCE，救护车前方的字母应如何排列？',
    options: ['A ECNALUBMA (左右镜像倒置)', 'B AMBULANCE', 'C ECNALUBMA（上下倒转）', 'D AMBULANCE（上下倒转）'],
    correctIndex: 0,
    explanation: '平面镜成像具有“左右相反（镜像反射）”的特点，因此救护车车头反写为 ECNALUBMA，司机从后视镜看刚好为正字 AMBULANCE。',
    category: '光的反射特性',
  },
  {
    id: 8,
    question: '四根不同材料的管子插入热水，图钉掉落所需时间如下（P:30s, Q:65s, R:100s, S:80s）。制作锅柄应选择哪种材料？',
    options: ['A P (导热最快)', 'B Q', 'C R (热的不良导体/掉落耗时100秒最慢)', 'D S'],
    correctIndex: 2,
    explanation: '图钉掉落所需时间越长，说明该材料导热越慢，属于热的不良导体（隔热材料）。材料 R 耗时100秒最慢，最适合制作防烫锅柄。',
    category: '热的传导与绝热材料',
  },
  {
    id: 9,
    question: '小番茄在清水中下沉。加入并搅拌盐后，小番茄浮起。哪项解释正确？',
    options: ['A 盐使番茄变轻', 'B 盐增加水的密度', 'C 盐减少水的体积', 'D 盐使番茄的密度变大'],
    correctIndex: 1,
    explanation: '往水里加盐溶解后，盐水的密度增加。当盐水的密度大于小番茄的密度时，小番茄便会浮在液面上。',
    category: '物质与密度',
  },
  {
    id: 10,
    question: '四名学生敲鼓，分贝仪读数记录显示 P=80dB, Q=50dB, R=65dB, S=45dB。哪项说明正确？',
    options: ['A 学生 P 用力最小', 'B 学生 S 产生的声音最大', 'C 学生 R 产生的声音比 Q 大 (65dB > 50dB)', 'D 只有学生 P 敲鼓时才听得到声音'],
    correctIndex: 2,
    explanation: '分贝（dB）是声音响度（音量）的测量单位。读数越大声音越响。学生R为65dB，大于学生Q的50dB，说明R敲鼓声音比Q大。',
    category: '声音的响度与分贝',
  },
];

export const BahagianAOverview: React.FC = () => {
  const [userAnswers, setUserAnswers] = useState<{ [qId: number]: number | null }>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectOption = (qId: number, optionIdx: number) => {
    sounds.playPop();
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const correctCount = QUESTIONS_A.filter(q => userAnswers[q.id] === q.correctIndex).length;

  const handleValidate = () => {
    setShowResults(true);
    if (correctCount === 10) {
      sounds.playSuccess();
    } else {
      sounds.playPop();
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setShowResults(false);
    sounds.playPop();
  };

  return (
    <div className="space-y-6" id="bahagian-a-quiz-module">
      {/* Title Header */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-500/30">
              Bahagian A · 客观选择题 [10分]
            </span>
            <span className="text-xs text-slate-400">试卷全景 1-10 题速练</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Bahagian A 科学概念精选 10 题全景特训
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            包含动物繁殖、植物繁衍、消化系统、排泄、地球自转、光学反射、热传导、浮沉密度与声学分贝等核心考点。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition flex items-center gap-1.5 border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            重置作答
          </button>
        </div>
      </div>

      {/* 10 Questions Cards Grid */}
      <div className="space-y-4">
        {QUESTIONS_A.map((q) => {
          const selected = userAnswers[q.id];
          const isAnswered = selected !== undefined && selected !== null;
          const isCorrect = selected === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-sm ${
                showResults
                  ? isCorrect
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-rose-300 bg-rose-50/30'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  第 {q.id} 题 · {q.category}
                </span>
                {showResults && (
                  <span className={`text-xs font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isCorrect ? '✓ 正确 (1分)' : '✗ 错误 (0分)'}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-3">{q.id}. {q.question}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {q.options.map((opt, optIdx) => {
                  const isThisSelected = selected === optIdx;
                  const isThisCorrect = q.correctIndex === optIdx;

                  let btnStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700';
                  if (showResults) {
                    if (isThisCorrect) {
                      btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                    } else if (isThisSelected && !isThisCorrect) {
                      btnStyle = 'bg-rose-100 border-rose-500 text-rose-950 font-bold';
                    }
                  } else if (isThisSelected) {
                    btnStyle = 'bg-blue-50 border-blue-500 text-blue-950 font-bold ring-1 ring-blue-400';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {showResults && isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {showResults && (
                <div className="mt-3 p-3 bg-white/80 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <strong className="text-slate-800">科学解析：</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Validate Button & Score Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">答题进度：{Object.keys(userAnswers).length} / 10</div>
          {showResults && (
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              总得分：<span className="text-blue-600 font-mono font-extrabold">{correctCount}</span> / 10 分
            </div>
          )}
        </div>

        <button
          onClick={handleValidate}
          className="w-full sm:w-auto py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          核对 Bahagian A 全部答案
        </button>
      </div>
    </div>
  );
};
