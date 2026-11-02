export const RANKS = [
  { level: 1, title: 'Tân Binh Kỷ Luật', minXp: 0, maxXp: 300, icon: '🛡️', color: 'text-zinc-400' },
  { level: 2, title: 'Chiến Binh Kiên Định', minXp: 300, maxXp: 800, icon: '⚔️', color: 'text-emerald-400' },
  { level: 3, title: 'Hộ Vệ Sắt Thép', minXp: 800, maxXp: 1600, icon: '🔥', color: 'text-cyan-400' },
  { level: 4, title: 'Đại Hiệp Sĩ Ý Chí', minXp: 1600, maxXp: 2800, icon: '⚡', color: 'text-amber-400' },
  { level: 5, title: 'Chiến Thần Kỷ Luật', minXp: 2800, maxXp: 5000, icon: '👑', color: 'text-purple-400' },
  { level: 6, title: 'Bất Tử Sắt Đá (Iron Legend)', minXp: 5000, maxXp: 999999, icon: '💎', color: 'text-rose-400' },
];

export function getRankInfo(xp) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) {
      const currentRank = RANKS[i];
      const nextRank = RANKS[i + 1] || null;
      const xpInCurrentRank = xp - currentRank.minXp;
      const rankRange = nextRank ? nextRank.minXp - currentRank.minXp : 1000;
      const progressPercent = nextRank 
        ? Math.min(100, Math.round((xpInCurrentRank / rankRange) * 100))
        : 100;

      return {
        ...currentRank,
        nextRank,
        xpInCurrentRank,
        rankRange,
        progressPercent,
      };
    }
  }
  return { ...RANKS[0], nextRank: RANKS[1], xpInCurrentRank: xp, rankRange: 300, progressPercent: 0 };
}

export const INITIAL_QUESTS = [
  {
    id: 'q1',
    title: 'Thức dậy trước 6:30 và không lướt điện thoại trên giường',
    category: 'core', // core, habit, side
    xp: 60,
    difficulty: 'boss', // normal, hard, boss
    completed: false,
    streakCount: 3,
    time: '06:30',
  },
  {
    id: 'q2',
    title: '45 phút làm việc sâu (Deep Work) không mở Facebook/Tiktok',
    category: 'core',
    xp: 80,
    difficulty: 'boss',
    completed: true,
    streakCount: 5,
    time: '09:00',
  },
  {
    id: 'q3',
    title: 'Uống đủ 2 lít nước trong ngày',
    category: 'habit',
    xp: 30,
    difficulty: 'normal',
    completed: true,
    streakCount: 7,
    time: 'Cả ngày',
  },
  {
    id: 'q4',
    title: 'Vận động thể thao / Tập gym 30 phút',
    category: 'side',
    xp: 50,
    difficulty: 'hard',
    completed: false,
    streakCount: 2,
    time: '17:30',
  },
  {
    id: 'q5',
    title: 'Đọc 10 trang sách phát triển bản thân',
    category: 'habit',
    xp: 40,
    difficulty: 'normal',
    completed: false,
    streakCount: 4,
    time: '21:30',
  },
];

export const INITIAL_REFLECTIONS = [
  {
    id: 'r1',
    date: '2026-11-01',
    score: 8,
    victories: 'Hoàn thành trọn vẹn 2 giờ học lập trình tập trung cao độ.',
    distractions: 'Buổi chiều lướt Youtube Shorts mất khoảng 30 phút.',
    commitments: 'Mai sẽ tắt thông báo điện thoại từ 14:00 đến 17:00.',
    xpAwarded: 120,
  },
];

export const INITIAL_ACHIEVEMENTS = [
  {
    id: 'first_blood',
    title: 'Bước Đầu Thép',
    desc: 'Hoàn thành nhiệm vụ kỷ luật đầu tiên',
    icon: '⚔️',
    unlocked: true,
    condition: (state) => state.completedQuestsCount >= 1,
  },
  {
    id: 'streak_3',
    title: 'Ngọn Lửa Kiên Trì',
    desc: 'Duy trì chuỗi kỷ luật 3 ngày liên tiếp',
    icon: '🔥',
    unlocked: true,
    condition: (state) => state.streak >= 3,
  },
  {
    id: 'streak_7',
    title: 'Chiến Binh 1 Tuần',
    desc: 'Duy trì chuỗi kỷ luật 7 ngày không gián đoạn',
    icon: '⚡',
    unlocked: false,
    condition: (state) => state.streak >= 7,
  },
  {
    id: 'boss_slayer',
    title: 'Kẻ Tiêu Diệt Trì Hoãn',
    desc: 'Đánh bại 5 nhiệm vụ Cốt Lõi (Boss)',
    icon: '🐲',
    unlocked: false,
    condition: (state) => state.bossDefeated >= 5,
  },
  {
    id: 'mirror_master',
    title: 'Soi Chiếu Đêm Khuya',
    desc: 'Hoàn thành 3 bài nhật ký tự kiểm điểm',
    icon: '📜',
    unlocked: false,
    condition: (state) => state.reflectionsCount >= 3,
  },
  {
    id: 'legend_will',
    title: 'Ý Chí Kim Cương',
    desc: 'Đạt Cấp độ 5 (Chiến Thần Kỷ Luật)',
    icon: '👑',
    unlocked: false,
    condition: (state) => state.level >= 5,
  },
];
