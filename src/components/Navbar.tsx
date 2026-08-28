import React, { useState } from 'react';
import { Orbit, Leaf, FileSearch, FlaskConical, Scan, Volume2, VolumeX, Award, BookOpen, Sparkles } from 'lucide-react';
import { ModuleId, ModuleMeta } from '../types';
import { sounds } from '../utils/audio';

export const MODULE_LIST: ModuleMeta[] = [
  {
    id: 'module1',
    promptNum: 1,
    title: '太阳系竞速赛',
    subTitle: '行星距离与公转',
    sourceExam: 'Bahagian B 题1',
    iconName: 'Orbit',
    badge: '4分',
    points: 4,
  },
  {
    id: 'module2',
    promptNum: 2,
    title: '光合作用实验室',
    subTitle: '方程式拼图与温室',
    sourceExam: 'Bahagian B 题2',
    iconName: 'Leaf',
    badge: '4分',
    points: 4,
  },
  {
    id: 'module3',
    promptNum: 3,
    title: '植物繁衍之谜',
    subTitle: '探案连线与盖章',
    sourceExam: 'Bahagian C 题1',
    iconName: 'FileSearch',
    badge: '6分',
    points: 6,
  },
  {
    id: 'module4',
    promptNum: 4,
    title: '神奇试纸实验室',
    subTitle: '石蕊变色与托盘',
    sourceExam: 'Bahagian C 题2',
    iconName: 'FlaskConical',
    badge: '6分',
    points: 6,
  },
  {
    id: 'module5',
    promptNum: 5,
    title: 'X光营养扫描仪',
    subTitle: '透视营养与均衡',
    sourceExam: 'Bahagian C 题3',
    iconName: 'Scan',
    badge: '6分',
    points: 6,
  },
  {
    id: 'overview',
    promptNum: 0,
    title: 'Bahagian A 题库',
    subTitle: '10题全景特训',
    sourceExam: '选择题 1-10',
    iconName: 'BookOpen',
    badge: '10分',
    points: 10,
  },
];

interface NavbarProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  scores: { [key in ModuleId]?: number };
}

export const Navbar: React.FC<NavbarProps> = ({ activeModule, onSelectModule, scores }) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const handleToggleMute = () => {
    const nextMute = sounds.toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) {
      sounds.playPop();
    }
  };

  const totalEarnedPoints = (Object.values(scores) as (number | undefined)[]).reduce<number>(
    (sum, val) => sum + (val || 0),
    0
  );
  const totalMaxPoints = 26; // 4+4+6+6+6 = 26 pts for Bahagian B & C

  return (
    <header className="bg-black/40 border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-500 flex items-center justify-center text-black font-extrabold text-sm shadow-[0_0_12px_rgba(234,179,8,0.4)]">
              Sci
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  UASA 小学科学 <span className="text-yellow-400">互动探案实验室</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-extrabold bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/30">
                  KSSR Semakan
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                UPSR / UASA 考题高阶思维与沉浸式物理、生物、化学、天文实验套件
              </p>
            </div>
          </div>

          {/* Right Action Tools: Score & Sound Toggle */}
          <div className="flex items-center gap-3">
            {/* Real-time Explorer Score Badge */}
            <div className="flex items-center gap-2 glass-panel px-3.5 py-1.5 text-xs text-slate-300 shadow-inner">
              <Award className="w-4 h-4 text-yellow-400 shrink-0" />
              <div>
                <span>探究得分: </span>
                <span className="font-mono font-black text-yellow-400 text-sm">{totalEarnedPoints}</span>
                <span className="text-[10px] text-slate-400">/{totalMaxPoints}</span>
              </div>
            </div>

            {/* Mute Toggle Button */}
            <button
              onClick={handleToggleMute}
              aria-label="Toggle Sound"
              className="p-2 rounded-xl glass-panel hover:bg-white/10 text-slate-300 hover:text-white transition border border-white/10 shadow-sm"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Module Switcher Tabs Scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {MODULE_LIST.map((mod) => {
            const isActive = activeModule === mod.id;
            const earned = scores[mod.id] || 0;

            return (
              <button
                key={mod.id}
                onClick={() => {
                  sounds.playPop();
                  onSelectModule(mod.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-left transition shrink-0 flex items-center gap-2.5 border ${
                  isActive
                    ? 'bg-yellow-500/15 border-yellow-500/80 text-white shadow-[0_0_15px_rgba(234,179,8,0.25)] backdrop-blur-md'
                    : 'glass-panel hover:bg-white/[0.07] border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-yellow-500 text-slate-950 font-bold' : 'bg-white/5 text-slate-400 border border-white/5'}`}>
                  {mod.id === 'module1' && <Orbit className="w-4 h-4" />}
                  {mod.id === 'module2' && <Leaf className="w-4 h-4" />}
                  {mod.id === 'module3' && <FileSearch className="w-4 h-4" />}
                  {mod.id === 'module4' && <FlaskConical className="w-4 h-4" />}
                  {mod.id === 'module5' && <Scan className="w-4 h-4" />}
                  {mod.id === 'overview' && <BookOpen className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold whitespace-nowrap">{mod.title}</span>
                    {earned > 0 && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-1.5 py-0.2 rounded">
                        +{earned}分
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                    <span>{mod.sourceExam}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
