import React, { useState, useEffect, useRef } from 'react';
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
  Heart,
  RefreshCw,
  Palette,
  Check,
  ChevronDown
} from 'lucide-react';
import { sounds } from './utils/sound';
import {
  getRankInfo,
  INITIAL_QUESTS,
  INITIAL_REFLECTIONS,
  INITIAL_ACHIEVEMENTS,
} from './utils/ranks';
import { THEMES } from './utils/themes';

export default function App() {
  // Theme state
  const [currentThemeKey, setCurrentThemeKey] = useState(() => {
    return localStorage.getItem('ironwill_theme') || 'gold';
  });
  const [showThemePicker, setShowThemePicker] = useState(false);
  const themePickerRef = useRef(null);

  const theme = THEMES[currentThemeKey] || THEMES.gold;

  // Navigation tab at top
  const [activeTab, setActiveTab] = useState('quests'); // 'quests' | 'reflection' | 'achievements' | 'stats'

  // User state
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

  // Close theme picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (themePickerRef.current && !themePickerRef.current.contains(event.target)) {
        setShowThemePicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync sound muted
  useEffect(() => {
    sounds.muted = !soundEnabled;
  }, [soundEnabled]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('ironwill_theme', currentThemeKey);
    localStorage.setItem('ironwill_xp', xp.toString());
    localStorage.setItem('ironwill_streak', streak.toString());
    localStorage.setItem('ironwill_hp', hp.toString());
    localStorage.setItem('ironwill_quests', JSON.stringify(quests));
    localStorage.setItem('ironwill_reflections', JSON.stringify(reflections));
  }, [currentThemeKey, xp, streak, hp, quests, reflections]);

  const rank = getRankInfo(xp);

  // Trigger celebration confetti
  const triggerConfetti = (isBig = false) => {
    if (isBig) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      confetti({
        particleCount: 35,
        spread: 45,
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
    setHp(100);
    setReflections([newReflectionItem, ...reflections]);
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      {/* 1. TOP HEADER WITH PRIMARY NAVIGATION */}
      <header className="border-b border-zinc-800/80 bg-[#0c0d10]/95 backdrop-blur sticky top-0 z-40 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className={`w-8 h-8 rounded-lg ${theme.accentBg} flex items-center justify-center text-zinc-950 font-bold text-base shadow-sm`}>
              ⚡
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-base tracking-tight text-zinc-100">IronWill</span>
              <span className="text-[11px] text-zinc-500 block leading-tight font-mono">Discipline App</span>
            </div>
          </div>

          {/* 4 PRIMARY NAVIGATION TABS (RIGHT AT THE TOP) */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'quests', label: 'Nhiệm Vụ', icon: Sword, count: quests.length },
              { id: 'reflection', label: 'Nhật Ký', icon: BookOpen, count: reflections.length },
              { id: 'achievements', label: 'Huy Hiệu', icon: Trophy },
              { id: 'stats', label: 'Thống Kê', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    sounds.playBlip();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? `${theme.activeNav}`
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-zinc-950/20 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT ACTIONS: THEME SELECTOR & SETTINGS */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Color Palette Switcher */}
            <div className="relative" ref={themePickerRef}>
              <button
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors"
                title="Đổi phong cách màu"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: theme.colorHex }}
                />
                <span className="hidden md:inline font-medium text-zinc-300">{theme.name}</span>
                <ChevronDown size={14} className="text-zinc-500" />
              </button>

              {/* Theme Dropdown Menu */}
              {showThemePicker && (
                <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Chọn Bảng Màu
                  </div>
                  <div className="space-y-0.5">
                    {Object.values(THEMES).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setCurrentThemeKey(t.id);
                          setShowThemePicker(false);
                          sounds.playBlip();
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          currentThemeKey === t.id
                            ? 'bg-zinc-800 text-zinc-100 font-semibold'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/40"
                            style={{ backgroundColor: t.colorHex }}
                          />
                          <span>{t.name}</span>
                        </div>
                        {currentThemeKey === t.id && <Check size={14} className={theme.accentText} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {soundEnabled ? <Volume2 size={16} className={theme.accentText} /> : <VolumeX size={16} />}
            </button>

            {/* Reset Data */}
            <button
              onClick={handleResetDemoData}
              title="Đặt lại dữ liệu mẫu"
              className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. REFINED COMPACT STATUS BAR (HUD) */}
      <section className="border-b border-zinc-800/60 bg-zinc-900/40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Level & Rank Badge */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs bg-zinc-800 border border-zinc-700 ${theme.accentText}`}>
                LV.{rank.level}
              </span>
              <span className="font-semibold text-zinc-200 text-sm">{rank.title}</span>
            </div>
            <span className="text-zinc-500 font-mono text-[11px]">
              {xp} EXP {rank.nextRank && `(Còn ${rank.nextRank.minXp - xp} EXP lên cấp)`}
            </span>
          </div>

          {/* Slender EXP Bar */}
          <div className="w-full md:max-w-md flex items-center gap-2">
            <div className="flex-1 bg-zinc-800 h-2 rounded-full overflow-hidden p-0">
              <div
                className={`bg-gradient-to-r ${theme.expGradient} h-full rounded-full transition-all duration-500`}
                style={{ width: `${rank.progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-zinc-400 text-[11px] shrink-0 font-medium">
              {rank.progressPercent}%
            </span>
          </div>

          {/* Quick Metrics: Willpower HP & Streak */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5" title="Ý Chí (Willpower)">
              <Heart size={14} className="text-rose-400 fill-rose-500/60" />
              <span className="font-mono font-semibold text-zinc-300">{hp}%</span>
            </div>

            <div className="h-3 w-[1px] bg-zinc-700" />

            <div className="flex items-center gap-1.5 text-orange-400 font-mono font-bold" title="Chuỗi ngày liên tục">
              <Flame size={15} className="fill-orange-500" />
              <span>{streak} ngày</span>
            </div>

            <div className="h-3 w-[1px] bg-zinc-700" />

            <div className="text-zinc-400 font-mono" title="Tiến độ hôm nay">
              <span className="text-zinc-200 font-bold">{completedCount}</span>/{totalCount} việc
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-6">
        {/* TAB 1: NHIỆM VỤ (DAILY TASKS / QUESTS) */}
        {activeTab === 'quests' && (
          <div className="flex flex-col gap-4">
            {/* Action Bar: Filters + Add Button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'Tất Cả' },
                  { id: 'core', label: 'Cốt Lõi (Boss)' },
                  { id: 'habit', label: 'Thói Quen' },
                  { id: 'side', label: 'Việc Phụ' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCategoryFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      categoryFilter === f.id
                        ? `bg-zinc-800 ${theme.accentBorder} ${theme.accentText}`
                        : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Add Task Button */}
              <button
                onClick={() => {
                  setShowAddModal(true);
                  sounds.playBlip();
                }}
                className={`flex items-center gap-1.5 ${theme.accentBg} text-zinc-950 font-semibold px-3.5 py-1.5 rounded-lg text-xs shadow-sm hover:opacity-90 transition-opacity`}
              >
                <Plus size={16} /> Thêm Nhiệm Vụ
              </button>
            </div>

            {/* Quests Clean List */}
            <div className="space-y-2">
              {filteredQuests.length === 0 ? (
                <div className="text-center py-14 border border-zinc-800/80 rounded-xl bg-zinc-900/30">
                  <p className="text-zinc-500 text-sm">Không có nhiệm vụ nào trong mục này.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className={`mt-2 text-xs font-medium ${theme.accentText} inline-flex items-center gap-1 hover:underline`}
                  >
                    <Plus size={14} /> Thêm nhiệm vụ mới ngay
                  </button>
                </div>
              ) : (
                filteredQuests.map((quest) => {
                  const isBoss = quest.difficulty === 'boss';

                  return (
                    <div
                      key={quest.id}
                      className={`group rounded-xl border transition-all p-3.5 flex items-center justify-between gap-3 ${
                        quest.completed
                          ? 'bg-zinc-900/30 border-zinc-800/40 opacity-55'
                          : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {/* Checkbox & Details */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => toggleQuest(quest.id)}
                          className="shrink-0 transition-transform active:scale-95"
                        >
                          {quest.completed ? (
                            <CheckCircle2 size={20} className="text-emerald-400" />
                          ) : (
                            <Circle size={20} className="text-zinc-500 hover:text-zinc-300" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            {isBoss && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase bg-red-500/10 border border-red-500/30 text-red-400">
                                Cốt Lõi
                              </span>
                            )}
                            {quest.category === 'habit' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                                Thói Quen
                              </span>
                            )}
                            {quest.category === 'side' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase bg-zinc-800 text-zinc-400">
                                Việc Phụ
                              </span>
                            )}
                            {quest.streakCount > 0 && (
                              <span className="text-[11px] text-orange-400 font-mono font-medium flex items-center gap-0.5">
                                <Flame size={12} className="fill-orange-400" /> {quest.streakCount}d
                              </span>
                            )}
                          </div>

                          <p
                            className={`text-sm font-normal break-words ${
                              quest.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                            }`}
                          >
                            {quest.title}
                          </p>
                        </div>
                      </div>

                      {/* EXP Reward & Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                            quest.completed
                              ? 'bg-zinc-800 text-zinc-400'
                              : `${theme.accentBgSubtle} ${theme.accentText} border ${theme.accentBorder}`
                          }`}
                        >
                          +{quest.xp} XP
                        </span>

                        <button
                          onClick={() => deleteQuest(quest.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-rose-400 rounded transition-opacity"
                          title="Xóa nhiệm vụ"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: NHẬT KÝ (DAILY REFLECTION) */}
        {activeTab === 'reflection' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reflection Form */}
            <div className="lg:col-span-2 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="font-semibold text-base text-zinc-100 flex items-center gap-2">
                    <BookOpen size={18} className={theme.accentText} /> Nhật Ký Tự Soi Chiếu
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    3 phút mỗi tối nhìn lại bản thân • Thưởng +150 EXP & Hồi phục HP
                  </p>
                </div>
                <span className="text-xs text-zinc-400 font-mono bg-zinc-800 px-2.5 py-1 rounded-lg">
                  {new Date().toLocaleDateString('vi-VN')}
                </span>
              </div>

              <form onSubmit={handleSubmitReflection} className="space-y-4">
                {/* Score Selector */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs font-medium">
                    <span className="text-zinc-300">Điểm kỷ luật hôm nay của bạn:</span>
                    <span className={`font-mono font-bold text-sm ${theme.accentText}`}>
                      {reflectionScore} / 10 ⭐
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={reflectionScore}
                    onChange={(e) => setReflectionScore(Number(e.target.value))}
                    className="w-full accent-zinc-200 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                    <span>1 (Chưa kỷ luật)</span>
                    <span>5 (Bình thường)</span>
                    <span>10 (Kỷ luật thép)</span>
                  </div>
                </div>

                {/* Question 1: Wins */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    1. Chiến tích lớn nhất hôm nay của bạn là gì?
                  </label>
                  <textarea
                    rows={2}
                    value={reflectionWin}
                    onChange={(e) => setReflectionWin(e.target.value)}
                    placeholder="Điều bạn hài lòng nhất về sự tập trung của mình hôm nay..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
                  />
                </div>

                {/* Question 2: Distractions */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    2. Điều gì đã làm bạn xao nhãng hoặc trì hoãn?
                  </label>
                  <textarea
                    rows={2}
                    value={reflectionDistraction}
                    onChange={(e) => setReflectionDistraction(e.target.value)}
                    placeholder="Mạng xã hội, thức khuya, không tập trung..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
                  />
                </div>

                {/* Question 3: Commitments */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    3. Một cam kết cụ thể cho ngày mai?
                  </label>
                  <textarea
                    rows={2}
                    value={reflectionCommit}
                    onChange={(e) => setReflectionCommit(e.target.value)}
                    placeholder="Việc bạn chắc chắn sẽ làm tốt hơn..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full ${theme.accentBg} text-zinc-950 font-semibold py-2.5 rounded-xl text-xs shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5`}
                >
                  <Sparkles size={16} /> Lưu Bài Soi Chiếu (+150 EXP)
                </button>
              </form>
            </div>

            {/* Reflection History */}
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider">
                Lịch Sử Soi Chiếu
              </h4>

              <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                {reflections.length === 0 ? (
                  <p className="text-xs text-zinc-600">Chưa có bài nhật ký nào.</p>
                ) : (
                  reflections.map((item) => (
                    <div
                      key={item.id}
                      className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
                        <span className="font-mono text-zinc-400 font-medium">{item.date}</span>
                        <span className={`font-mono font-semibold ${theme.accentText}`}>
                          {item.score}/10 ⭐
                        </span>
                      </div>
                      <div className="space-y-1 text-zinc-300 leading-relaxed">
                        <p>
                          <strong className="text-zinc-400 font-medium">Chiến tích:</strong> {item.victories}
                        </p>
                        <p>
                          <strong className="text-zinc-400 font-medium">Xao nhãng:</strong> {item.distractions}
                        </p>
                        <p>
                          <strong className="text-zinc-400 font-medium">Cam kết:</strong> {item.commitments}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HUY HIỆU (ACHIEVEMENTS) */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {INITIAL_ACHIEVEMENTS.map((ach) => {
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
                  className={`rounded-xl border p-4 flex items-start gap-3.5 transition-all ${
                    isUnlocked
                      ? 'bg-zinc-900/90 border-zinc-800'
                      : 'bg-zinc-900/30 border-zinc-800/50 opacity-40 grayscale'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xl shrink-0">
                    {ach.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-semibold text-xs text-zinc-200 truncate">{ach.title}</h4>
                      {isUnlocked ? (
                        <span className={`text-[10px] font-mono font-semibold ${theme.accentText}`}>
                          ĐÃ MỞ
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-600">KHÓA</span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-normal">{ach.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: THỐNG KÊ (STATS) */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Tổng Kinh Nghiệm</span>
              <div className={`text-2xl font-mono font-bold ${theme.accentText}`}>{xp} EXP</div>
              <p className="text-[11px] text-zinc-400">Danh hiệu: {rank.title}</p>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Chuỗi Kỷ Luật</span>
              <div className="text-2xl font-mono font-bold text-orange-400 flex items-center gap-1">
                <Flame size={20} className="fill-orange-500" /> {streak} Ngày
              </div>
              <p className="text-[11px] text-zinc-400">Số ngày duy trì liên tục</p>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Nhiệm Vụ Đã Xong</span>
              <div className="text-2xl font-mono font-bold text-emerald-400">
                {completedCount} / {totalCount}
              </div>
              <p className="text-[11px] text-zinc-400">Tỷ lệ hoàn thành: {completionPercent}%</p>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Số Bài Soi Chiếu</span>
              <div className="text-2xl font-mono font-bold text-cyan-400">
                {reflections.length} Lần
              </div>
              <p className="text-[11px] text-zinc-400">Nhật ký tự soi chiếu</p>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: TẠO NHIỆM VỤ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                <Sword size={16} className={theme.accentText} /> Thêm Nhiệm Vụ Mới
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuest} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Nội dung nhiệm vụ *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Chạy bộ 2km, Đọc 10 trang sách..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Phân loại
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                >
                  <option value="core">🔥 Nhiệm Vụ Cốt Lõi (Boss - Việc quan trọng nhất)</option>
                  <option value="habit">⚡ Thói Quen Hàng Ngày (Uống nước, đọc sách...)</option>
                  <option value="side">🛡️ Việc Phụ / Phát sinh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Độ khó & Phần thưởng EXP
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'normal', label: 'Dễ', xp: '+40 EXP' },
                    { id: 'hard', label: 'Vừa', xp: '+70 EXP' },
                    { id: 'boss', label: 'Khó (Boss)', xp: '+100 EXP' },
                  ].map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => setNewDifficulty(d.id)}
                      className={`p-2 rounded-xl border text-center transition-colors ${
                        newDifficulty === d.id
                          ? `border-zinc-500 bg-zinc-800 font-semibold text-zinc-100`
                          : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <div>{d.label}</div>
                      <div className={`text-[10px] font-mono mt-0.5 ${theme.accentText}`}>{d.xp}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-medium text-zinc-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 ${theme.accentBg} text-zinc-950 font-semibold rounded-xl text-xs shadow-sm hover:opacity-90 transition-opacity`}
                >
                  Tạo Nhiệm Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 py-3.5 px-4 text-center text-[11px] text-zinc-600">
        IronWill • Kỷ Luật Tạo Nên Sức Mạnh • Tự động lưu trữ trên máy
      </footer>
    </div>
  );
}
