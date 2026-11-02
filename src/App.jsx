import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Flame,
  Shield,
  Zap,
  Trophy,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  BookOpen,
  Sword,
  BarChart3,
  Volume2,
  VolumeX,
  Sparkles,
  Calendar,
  AlertCircle,
  Award,
  ChevronRight,
  Heart,
  RefreshCw
} from 'lucide-react';
import { sounds } from './utils/sound';
import {
  getRankInfo,
  INITIAL_QUESTS,
  INITIAL_REFLECTIONS,
  INITIAL_ACHIEVEMENTS,
} from './utils/ranks';

export default function App() {
  // Persistence state
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('ironwill_xp');
    return saved !== null ? Number(saved) : 480;
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('ironwill_streak');
    return saved !== null ? Number(saved) : 5;
  });

  const [hp, setHp] = useState(() => {
    const saved = localStorage.getItem('ironwill_hp');
    return saved !== null ? Number(saved) : 95;
  });

  const [quests, setQuests] = useState(() => {
    const saved = localStorage.getItem('ironwill_quests');
    return saved ? JSON.parse(saved) : INITIAL_QUESTS;
  });

  const [reflections, setReflections] = useState(() => {
    const saved = localStorage.getItem('ironwill_reflections');
    return saved ? JSON.parse(saved) : INITIAL_REFLECTIONS;
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('quests'); // 'quests' | 'reflection' | 'achievements' | 'stats'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal / Form state for new quest
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('core');
  const [newDifficulty, setNewDifficulty] = useState('normal');

  // Form state for reflection
  const [reflectionScore, setReflectionScore] = useState(8);
  const [reflectionWin, setReflectionWin] = useState('');
  const [reflectionDistraction, setReflectionDistraction] = useState('');
  const [reflectionCommit, setReflectionCommit] = useState('');
  const [reflectionSubmittedToday, setReflectionSubmittedToday] = useState(false);

  // Sync sounds state
  useEffect(() => {
    sounds.muted = !soundEnabled;
  }, [soundEnabled]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('ironwill_xp', xp.toString());
    localStorage.setItem('ironwill_streak', streak.toString());
    localStorage.setItem('ironwill_hp', hp.toString());
    localStorage.setItem('ironwill_quests', JSON.stringify(quests));
    localStorage.setItem('ironwill_reflections', JSON.stringify(reflections));
  }, [xp, streak, hp, quests, reflections]);

  const rank = getRankInfo(xp);

  // Trigger celebration confetti
  const triggerConfetti = (isBig = false) => {
    if (isBig) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
      });
    } else {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });
    }
  };

  // Toggle Quest Complete
  const toggleQuest = (id) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest) return;

    const willComplete = !quest.completed;
    sounds.playBlip();

    if (willComplete) {
      sounds.playSuccess();
      triggerConfetti(quest.difficulty === 'boss');
      
      const newXp = xp + quest.xp;
      setXp(newXp);
      setHp((prev) => Math.min(100, prev + 5));

      // Check level-up
      const oldRank = getRankInfo(xp);
      const newRank = getRankInfo(newXp);
      if (newRank.level > oldRank.level) {
        sounds.playLevelUp();
        triggerConfetti(true);
      }
    } else {
      setXp((prev) => Math.max(0, prev - quest.xp));
      setHp((prev) => Math.max(10, prev - 5));
    }

    setQuests((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              completed: willComplete,
              streakCount: willComplete ? q.streakCount + 1 : Math.max(0, q.streakCount - 1),
            }
          : q
      )
    );
  };

  // Add new quest
  const handleAddQuest = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let xpReward = 40;
    if (newDifficulty === 'hard') xpReward = 70;
    if (newDifficulty === 'boss') xpReward = 100;

    const newQuestItem = {
      id: 'q_' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      difficulty: newDifficulty,
      xp: xpReward,
      completed: false,
      streakCount: 0,
      time: 'Hôm nay',
    };

    setQuests([newQuestItem, ...quests]);
    setNewTitle('');
    setShowAddModal(false);
    sounds.playBlip();
  };

  // Delete quest
  const deleteQuest = (id) => {
    setQuests(quests.filter((q) => q.id !== id));
    sounds.playBlip();
  };

  // Submit Reflection
  const handleSubmitReflection = (e) => {
    e.preventDefault();
    if (!reflectionWin.trim() && !reflectionDistraction.trim() && !reflectionCommit.trim()) {
      alert('Hãy ghi lại ít nhất một trải nghiệm hôm nay của bạn!');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newReflectionItem = {
      id: 'r_' + Date.now(),
      date: todayStr,
      score: reflectionScore,
      victories: reflectionWin.trim() || 'Duy trì kỷ luật ổn định.',
      distractions: reflectionDistraction.trim() || 'Không có xao nhãng đáng kể.',
      commitments: reflectionCommit.trim() || 'Tiếp tục phát huy phong độ.',
      xpAwarded: 150,
    };

    const newXp = xp + 150;
    setXp(newXp);
    setHp(100); // Full recharge on reflection
    setReflections([newReflectionItem, ...reflections]);
    setReflectionSubmittedToday(true);
    setReflectionWin('');
    setReflectionDistraction('');
    setReflectionCommit('');

    sounds.playLevelUp();
    triggerConfetti(true);
  };

  // Reset to default initial data
  const handleResetDemoData = () => {
    if (window.confirm('Khôi phục lại dữ liệu mẫu ban đầu của IronWill?')) {
      setXp(480);
      setStreak(5);
      setHp(95);
      setQuests(INITIAL_QUESTS);
      setReflections(INITIAL_REFLECTIONS);
      localStorage.clear();
      sounds.playBlip();
    }
  };

  // Calculations
  const completedCount = quests.filter((q) => q.completed).length;
  const totalCount = quests.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredQuests = quests.filter((q) => {
    if (categoryFilter === 'all') return true;
    return q.category === categoryFilter;
  });

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-amber-500/30">
      {/* Top Banner / Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0d1322]/90 backdrop-blur sticky top-0 z-30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 p-[2px] shadow-lg shadow-orange-500/20">
              <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center text-xl font-black">
                ⚔️
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                  IRONWILL
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-semibold">
                  DISCIPLINE RPG
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Luyện Kỷ Luật • Đập Tan Trì Hoãn</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {soundEnabled ? <Volume2 size={18} className="text-amber-400" /> : <VolumeX size={18} />}
            </button>
            <button
              onClick={handleResetDemoData}
              title="Đặt lại dữ liệu mẫu"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-6">
        {/* PLAYER HUD / STATUS BAR */}
        <div className="bg-gradient-to-br from-[#12192c] via-[#0f172a] to-[#0d1322] border border-slate-700/60 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Player Info & Title */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/30">
                  {rank.icon}
                </div>
                <div className="absolute -bottom-2 -right-1 bg-amber-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full border-2 border-slate-900 shadow">
                  LV.{rank.level}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg text-white">Chiến Binh Kỷ Luật</h2>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono">
                    ONLINE
                  </span>
                </div>
                <p className={`font-semibold text-sm ${rank.color} flex items-center gap-1 mt-0.5`}>
                  <span>Danh hiệu:</span> {rank.title}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Mục tiêu tiếp theo: <span className="text-slate-300 font-medium">{rank.nextRank ? rank.nextRank.title : 'Bậc Thầy Tối Cao'}</span>
                </p>
              </div>
            </div>

            {/* EXP Bar & Willpower HP */}
            <div className="flex flex-col gap-3">
              {/* EXP Progress */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Sparkles size={14} /> EXP Kỷ Luật
                  </span>
                  <span className="font-mono text-slate-300">
                    {xp} XP {rank.nextRank && `(Cần ${rank.nextRank.minXp} XP)`}
                  </span>
                </div>
                <div className="w-full bg-slate-800/90 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className="bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 h-full rounded-full transition-all duration-500 ease-out shadow-sm shadow-amber-400/50"
                    style={{ width: `${rank.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Willpower HP */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="flex items-center gap-1 text-rose-400">
                    <Heart size={14} className="fill-rose-500/80" /> Ý Chí (Willpower HP)
                  </span>
                  <span className="font-mono text-slate-300">{hp} / 100</span>
                </div>
                <div className="w-full bg-slate-800/90 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${hp}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Streak & Daily Progress Quick View */}
            <div className="flex items-center justify-around bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-orange-400 font-extrabold text-2xl font-mono animate-pulse-subtle">
                  <Flame size={26} className="fill-orange-500" /> {streak}
                </div>
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                  Chuỗi Ngày 🔥
                </span>
              </div>

              <div className="h-10 w-[1px] bg-slate-700/60" />

              <div className="flex flex-col items-center">
                <div className="text-cyan-400 font-extrabold text-2xl font-mono">
                  {completedCount}/{totalCount}
                </div>
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                  Nhiệm Vụ Ngày
                </span>
              </div>

              <div className="h-10 w-[1px] bg-slate-700/60" />

              <div className="flex flex-col items-center">
                <div className="text-emerald-400 font-extrabold text-2xl font-mono">
                  {completionPercent}%
                </div>
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                  Hoàn Thành
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('quests');
                sounds.playBlip();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'quests'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Sword size={16} /> Nhiệm Vụ Hàng Ngày ({quests.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('reflection');
                sounds.playBlip();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'reflection'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <BookOpen size={16} /> Nhật Ký Soi Chiếu {reflections.length > 0 && `(${reflections.length})`}
            </button>

            <button
              onClick={() => {
                setActiveTab('achievements');
                sounds.playBlip();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'achievements'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Trophy size={16} /> Huy Hiệu Danh Vọng
            </button>

            <button
              onClick={() => {
                setActiveTab('stats');
                sounds.playBlip();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'stats'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <BarChart3 size={16} /> Thống Kê
            </button>
          </div>

          {activeTab === 'quests' && (
            <button
              onClick={() => {
                setShowAddModal(true);
                sounds.playBlip();
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm shadow-md shadow-orange-500/25 transition-all"
            >
              <Plus size={18} /> Thêm Nhiệm Vụ Mới
            </button>
          )}
        </div>

        {/* TAB 1: QUESTS (TO-DO LIST) */}
        {activeTab === 'quests' && (
          <div className="flex flex-col gap-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-slate-400 mr-1">Bộ lọc:</span>
              {[
                { id: 'all', label: 'Tất Cả' },
                { id: 'core', label: '🔥 Nhiệm Vụ Cốt Lõi (Boss)' },
                { id: 'habit', label: '⚡ Thói Quen' },
                { id: 'side', label: '🛡️ Việc Phụ' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    categoryFilter === f.id
                      ? 'bg-slate-800 border-amber-500/60 text-amber-300'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Quests List */}
            <div className="grid grid-cols-1 gap-3">
              {filteredQuests.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                  <p className="text-slate-400">Không có nhiệm vụ nào trong danh mục này.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-3 text-amber-400 hover:text-amber-300 text-sm font-semibold inline-flex items-center gap-1"
                  >
                    <Plus size={16} /> Tạo nhiệm vụ mới ngay
                  </button>
                </div>
              ) : (
                filteredQuests.map((quest) => {
                  const isBoss = quest.difficulty === 'boss';
                  const isHard = quest.difficulty === 'hard';

                  return (
                    <div
                      key={quest.id}
                      className={`group relative rounded-xl border transition-all duration-200 p-4 flex items-center justify-between gap-4 ${
                        quest.completed
                          ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                          : isBoss
                          ? 'bg-gradient-to-r from-red-950/20 via-slate-900/90 to-slate-900 border-red-500/40 hover:border-red-500/80 shadow-lg shadow-red-950/20'
                          : isHard
                          ? 'bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-slate-900 border-amber-500/30 hover:border-amber-500/60'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Left: Checkbox + Quest info */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <button
                          onClick={() => toggleQuest(quest.id)}
                          className="shrink-0 transition-transform active:scale-90"
                        >
                          {quest.completed ? (
                            <CheckCircle2 size={24} className="text-emerald-400 fill-emerald-500/20" />
                          ) : (
                            <Circle
                              size={24}
                              className={`transition-colors ${
                                isBoss
                                  ? 'text-red-400 hover:text-red-300'
                                  : isHard
                                  ? 'text-amber-400 hover:text-amber-300'
                                  : 'text-slate-500 hover:text-cyan-400'
                              }`}
                            />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {isBoss && (
                              <span className="text-[10px] px-2 py-0.5 rounded font-black tracking-wider uppercase bg-red-500/20 border border-red-500/40 text-red-400">
                                BOSS QUEST
                              </span>
                            )}
                            {isHard && (
                              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-amber-500/20 border border-amber-500/40 text-amber-400">
                                HARD
                              </span>
                            )}
                            {quest.category === 'habit' && (
                              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                                THÓI QUEN
                              </span>
                            )}
                            {quest.category === 'side' && (
                              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-purple-500/20 border border-purple-500/40 text-purple-400">
                                VIỆC PHỤ
                              </span>
                            )}

                            {quest.streakCount > 0 && (
                              <span className="text-[11px] text-orange-400 font-mono font-semibold flex items-center gap-0.5">
                                <Flame size={12} className="fill-orange-400" /> {quest.streakCount} ngày
                              </span>
                            )}
                          </div>

                          <p
                            className={`text-sm md:text-base font-medium break-words ${
                              quest.completed ? 'line-through text-slate-500' : 'text-slate-100'
                            }`}
                          >
                            {quest.title}
                          </p>
                        </div>
                      </div>

                      {/* Right: EXP Reward & Delete Action */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div
                          className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs flex items-center gap-1 ${
                            quest.completed
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          <Sparkles size={12} />+{quest.xp} XP
                        </div>

                        <button
                          onClick={() => deleteQuest(quest.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Xóa nhiệm vụ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DAILY REFLECTION */}
        {activeTab === 'reflection' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reflection Form */}
            <div className="lg:col-span-2 bg-[#0e1424] border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <BookOpen className="text-amber-400" size={20} /> Cuộn Sách Soi Chiếu Bản Thân
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mỗi tối 3 phút tự kiểm điểm để tích lũy ý chí thép (+150 XP & Hồi phục HP)
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 font-mono">
                  <Calendar size={14} className="text-amber-400" />
                  {new Date().toLocaleDateString('vi-VN')}
                </div>
              </div>

              <form onSubmit={handleSubmitReflection} className="flex flex-col gap-5">
                {/* Score Discipline Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-slate-200">
                      Hôm nay bạn chấm điểm kỷ luật bản thân mức nào?
                    </label>
                    <span className="font-extrabold text-amber-400 font-mono text-lg bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                      {reflectionScore} / 10 ⭐
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={reflectionScore}
                    onChange={(e) => setReflectionScore(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                    <span>1 (Lười biếng/Trì hoãn)</span>
                    <span>5 (Bình thường)</span>
                    <span>10 (Kỷ luật thép)</span>
                  </div>
                </div>

                {/* Question 1: Victories */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    Chiến tích lớn nhất hôm nay của bạn là gì? (Điều bạn tự hào)
                  </label>
                  <textarea
                    rows={2}
                    value={reflectionWin}
                    onChange={(e) => setReflectionWin(e.target.value)}
                    placeholder="Ví dụ: Tập thể dục đúng giờ, không chạm vào điện thoại lúc làm việc..."
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-500"
                  />
                </div>

                {/* Question 2: Distractions */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    "Quái vật xao nhãng" nào đã cản bước bạn?
                  </label>
                  <textarea
                    rows={2}
                    value={reflectionDistraction}
                    onChange={(e) => setReflectionDistraction(e.target.value)}
                    placeholder="Ví dụ: Lướt TikTok 40 phút, thức khuya xem phim..."
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-500"
                  />
                </div>

                {/* Question 3: Tomorrow's Commitment */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    Một cam kết thép bạn chắc chắn sẽ làm tốt hơn vào ngày mai?
                  </label>
                  <textarea
                    rows={2}
                    value={reflectionCommit}
                    onChange={(e) => setReflectionCommit(e.target.value)}
                    placeholder="Ví dụ: Đặt chuông báo thức ở xa giường, giải quyết việc khó nhất vào 8h sáng..."
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles size={18} /> Khắc Ghi Soi Chiếu (+150 XP & Hồi Full HP)
                </button>
              </form>
            </div>

            {/* Reflection History List */}
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-amber-400" /> Lịch Sử Soi Chiếu
              </h4>

              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                {reflections.length === 0 ? (
                  <p className="text-xs text-slate-500">Chưa có bản ghi nhật ký nào.</p>
                ) : (
                  reflections.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="font-mono text-xs text-amber-400 font-semibold">{item.date}</span>
                        <span className="text-xs bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                          Điểm: {item.score}/10 ⭐
                        </span>
                      </div>

                      <div className="text-xs space-y-1.5">
                        <p className="text-slate-300">
                          <strong className="text-emerald-400">Chiến tích:</strong> {item.victories}
                        </p>
                        <p className="text-slate-300">
                          <strong className="text-rose-400">Xao nhãng:</strong> {item.distractions}
                        </p>
                        <p className="text-slate-300">
                          <strong className="text-cyan-400">Cam kết:</strong> {item.commitments}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACHIEVEMENTS / BADGES */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INITIAL_ACHIEVEMENTS.map((ach) => {
              // Realtime condition evaluation
              const isUnlocked =
                ach.unlocked ||
                (ach.id === 'first_blood' && completedCount >= 1) ||
                (ach.id === 'streak_3' && streak >= 3) ||
                (ach.id === 'streak_7' && streak >= 7) ||
                (ach.id === 'mirror_master' && reflections.length >= 3) ||
                (ach.id === 'legend_will' && rank.level >= 5);

              return (
                <div
                  key={ach.id}
                  className={`rounded-2xl border p-5 flex items-start gap-4 transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-[#131d33] to-[#0d1424] border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/40 border-slate-800/60 opacity-50 grayscale'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 shadow-md shadow-orange-500/30'
                        : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    {ach.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-white truncate">{ach.title}</h4>
                      {isUnlocked ? (
                        <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                          ĐÃ MỞ
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                          KHÓA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{ach.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: STATS & DISCIPLINE RADAR */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Tổng Kinh Nghiệm</span>
              <div className="text-3xl font-extrabold font-mono text-amber-400">{xp} XP</div>
              <p className="text-xs text-slate-500">Cấp bậc: {rank.title}</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Chuỗi Kỷ Luật</span>
              <div className="text-3xl font-extrabold font-mono text-orange-400 flex items-center gap-1">
                <Flame size={28} className="fill-orange-400" /> {streak} Ngày
              </div>
              <p className="text-xs text-slate-500">Kỷ lục dài nhất của bạn</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Nhiệm Vụ Đã Xong</span>
              <div className="text-3xl font-extrabold font-mono text-emerald-400">
                {completedCount} / {totalCount}
              </div>
              <p className="text-xs text-slate-500">Tỷ lệ ngày: {completionPercent}%</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Bài Soi Chiếu</span>
              <div className="text-3xl font-extrabold font-mono text-cyan-400">
                {reflections.length} Lần
              </div>
              <p className="text-xs text-slate-500">Tự kiểm điểm đều đặn mỗi tối</p>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD QUEST */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Sword className="text-amber-400" size={20} /> Tạo Nhiệm Vụ Kỷ Luật
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuest} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Nội dung nhiệm vụ *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Chạy bộ 2km, Đọc sách 20 phút..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Phân loại nhiệm vụ
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="core">🔥 Nhiệm Vụ Cốt Lõi (Boss Quest - Việc quan trọng nhất)</option>
                  <option value="habit">⚡ Thói Quen Hàng Ngày (Uống nước, đọc sách...)</option>
                  <option value="side">🛡️ Việc Phụ / Việc phát sinh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Độ khó & Phần thưởng EXP
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'normal', label: 'Dễ', xp: '+40 XP', border: 'hover:border-cyan-500' },
                    { id: 'hard', label: 'Vừa', xp: '+70 XP', border: 'hover:border-amber-500' },
                    { id: 'boss', label: 'Khó (Boss)', xp: '+100 XP', border: 'hover:border-red-500' },
                  ].map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => setNewDifficulty(d.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        newDifficulty === d.id
                          ? 'border-amber-500 bg-amber-500/20 text-white font-bold'
                          : `border-slate-700 bg-slate-900 text-slate-400 ${d.border}`
                      }`}
                    >
                      <div className="text-xs">{d.label}</div>
                      <div className="text-[11px] font-mono text-amber-400 mt-0.5">{d.xp}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold text-sm text-slate-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-orange-500/20 transition-all"
                >
                  Tạo Nhiệm Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        IronWill • Kỷ Luật Tạo Nên Sức Mạnh • Dữ liệu tự động lưu trên máy của bạn
      </footer>
    </div>
  );
}
