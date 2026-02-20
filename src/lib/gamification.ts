import { supabase } from "@/integrations/supabase/client";

// 🏆 מערכת הישגים (Achievements)
export const ACHIEVEMENTS = {
  // התחלתי!
  FIRST_TRANSACTION: {
    id: 'first_transaction',
    name: 'צעד ראשון',
    nameEn: 'First Step',
    description: 'רשמת את התנועה הראשונה שלך',
    icon: '🎯',
    points: 10,
    category: 'beginner',
    condition: (stats: any) => stats.totalTransactions >= 1
  },
  
  FIRST_BUDGET: {
    id: 'first_budget',
    name: 'תקציבן חכם',
    nameEn: 'Smart Budgeter',
    description: 'הגדרת את התקציב הראשון',
    icon: '📊',
    points: 20,
    category: 'beginner',
    condition: (stats: any) => stats.totalBudgets >= 1
  },

  FIRST_GOAL: {
    id: 'first_goal',
    name: 'בעל חזון',
    nameEn: 'Visionary',
    description: 'הגדרת יעד חיסכון ראשון',
    icon: '🎯',
    points: 15,
    category: 'beginner',
    condition: (stats: any) => stats.totalGoals >= 1
  },

  // Streaks
  STREAK_7: {
    id: 'streak_7',
    name: 'שבוע מושלם',
    nameEn: 'Perfect Week',
    description: '7 ימים רצופים של עדכון תנועות',
    icon: '🔥',
    points: 50,
    category: 'streak',
    condition: (stats: any) => stats.currentStreak >= 7
  },

  STREAK_30: {
    id: 'streak_30',
    name: 'חודש זהב',
    nameEn: 'Golden Month',
    description: '30 ימים רצופים של ניהול פיננסי',
    icon: '👑',
    points: 200,
    category: 'streak',
    condition: (stats: any) => stats.currentStreak >= 30
  },

  STREAK_100: {
    id: 'streak_100',
    name: 'אגדה חיה',
    nameEn: 'Living Legend',
    description: '100 ימים רצופים!',
    icon: '🏆',
    points: 1000,
    category: 'streak',
    condition: (stats: any) => stats.currentStreak >= 100
  },

  // תקציבים
  BUDGET_MONTH_1: {
    id: 'budget_month_1',
    name: 'משמעת ראשונה',
    nameEn: 'First Discipline',
    description: 'חודש שלם בתוך התקציב',
    icon: '💪',
    points: 100,
    category: 'budget',
    condition: (stats: any) => stats.monthsInBudget >= 1
  },

  BUDGET_MONTH_3: {
    id: 'budget_month_3',
    name: 'מקצוען',
    nameEn: 'Professional',
    description: '3 חודשים רצופים בתוך התקציב',
    icon: '⭐',
    points: 300,
    category: 'budget',
    condition: (stats: any) => stats.monthsInBudget >= 3
  },

  // חיסכון
  SAVED_1K: {
    id: 'saved_1k',
    name: 'חוסך מתחיל',
    nameEn: 'Beginner Saver',
    description: 'חסכת ₪1,000',
    icon: '💰',
    points: 50,
    category: 'savings',
    condition: (stats: any) => stats.totalSaved >= 1000
  },

  SAVED_10K: {
    id: 'saved_10k',
    name: 'חוסך מקצועי',
    nameEn: 'Pro Saver',
    description: 'חסכת ₪10,000',
    icon: '💎',
    points: 200,
    category: 'savings',
    condition: (stats: any) => stats.totalSaved >= 10000
  },

  SAVED_50K: {
    id: 'saved_50k',
    name: 'אלוף החיסכון',
    nameEn: 'Savings Champion',
    description: 'חסכת ₪50,000!',
    icon: '🏅',
    points: 1000,
    category: 'savings',
    condition: (stats: any) => stats.totalSaved >= 50000
  },

  // יעדים
  GOAL_COMPLETED_1: {
    id: 'goal_completed_1',
    name: 'מגשים חלומות',
    nameEn: 'Dream Achiever',
    description: 'השגת יעד חיסכון ראשון',
    icon: '🌟',
    points: 100,
    category: 'goals',
    condition: (stats: any) => stats.goalsCompleted >= 1
  },

  GOAL_COMPLETED_5: {
    id: 'goal_completed_5',
    name: 'מכונת הישגים',
    nameEn: 'Achievement Machine',
    description: 'השגת 5 יעדי חיסכון',
    icon: '🚀',
    points: 500,
    category: 'goals',
    condition: (stats: any) => stats.goalsCompleted >= 5
  },

  // קטגוריזציה
  ORGANIZED_100: {
    id: 'organized_100',
    name: 'מסודר',
    nameEn: 'Organized',
    description: 'קיטלגת 100 תנועות',
    icon: '📁',
    points: 30,
    category: 'organization',
    condition: (stats: any) => stats.categorizedTransactions >= 100
  },

  // מעשר
  MAASER_PAID: {
    id: 'maaser_paid',
    name: 'נותן בסתר',
    nameEn: 'Secret Giver',
    description: 'שילמת מעשר לראשונה',
    icon: '✡️',
    points: 50,
    category: 'maaser',
    condition: (stats: any) => stats.maaserPayments >= 1
  },

  MAASER_YEAR: {
    id: 'maaser_year',
    name: 'צדקה כל השנה',
    nameEn: 'Year of Charity',
    description: '12 חודשים של מעשר',
    icon: '💝',
    points: 500,
    category: 'maaser',
    condition: (stats: any) => stats.maaserMonths >= 12
  },

  // מיוחדים
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'ציפור מוקדמת',
    nameEn: 'Early Bird',
    description: 'עדכנת תנועה לפני 8 בבוקר',
    icon: '🌅',
    points: 10,
    category: 'special',
    condition: (stats: any) => stats.earlyBirdDays >= 1
  },

  NIGHT_OWL: {
    id: 'night_owl',
    name: 'ינשוף לילה',
    nameEn: 'Night Owl',
    description: 'עדכנת תנועה אחרי חצות',
    icon: '🦉',
    points: 10,
    category: 'special',
    condition: (stats: any) => stats.nightOwlDays >= 1
  },

  WEEKEND_WARRIOR: {
    id: 'weekend_warrior',
    name: 'גיבור סוף השבוע',
    nameEn: 'Weekend Warrior',
    description: 'עדכנת בשבת או ביום ראשון',
    icon: '🏖️',
    points: 15,
    category: 'special',
    condition: (stats: any) => stats.weekendDays >= 1
  }
};

// 📊 רמות (Levels)
export const LEVELS = [
  { level: 1, name: 'מתחיל', nameEn: 'Beginner', minPoints: 0, icon: '🌱', color: '#9CA3AF' },
  { level: 2, name: 'חוסך', nameEn: 'Saver', minPoints: 100, icon: '🌿', color: '#10B981' },
  { level: 3, name: 'מנהל', nameEn: 'Manager', minPoints: 300, icon: '🌳', color: '#3B82F6' },
  { level: 4, name: 'מומחה', nameEn: 'Expert', minPoints: 600, icon: '🌲', color: '#8B5CF6' },
  { level: 5, name: 'מאסטר', nameEn: 'Master', minPoints: 1000, icon: '🎖️', color: '#F59E0B' },
  { level: 6, name: 'אגדה', nameEn: 'Legend', minPoints: 2000, icon: '👑', color: '#EF4444' },
  { level: 7, name: 'אלוהים', nameEn: 'God', minPoints: 5000, icon: '⚡', color: '#EC4899' },
];

// חישוב רמה לפי נקודות
export function getLevelByPoints(points: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

// חישוב התקדמות לרמה הבאה
export function getProgressToNextLevel(points: number) {
  const currentLevel = getLevelByPoints(points);
  const nextLevel = LEVELS.find(l => l.minPoints > points);
  
  if (!nextLevel) {
    return 100; // רמה מקסימלית
  }
  
  const pointsInLevel = points - currentLevel.minPoints;
  const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints;
  
  return (pointsInLevel / pointsNeeded) * 100;
}

// בדיקת הישגים חדשים
export async function checkNewAchievements(userId: string) {
  const stats = await getUserStats(userId);
  const userAchievements = await getUserAchievements(userId);
  
  const newAchievements = [];
  
  for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
    // אם כבר השיג - דלג
    if (userAchievements.includes(achievement.id)) {
      continue;
    }
    
    // בדוק תנאי
    if (achievement.condition(stats)) {
      newAchievements.push(achievement);
      
      // שמור הישג חדש
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: achievement.id,
        earned_at: new Date().toISOString(),
        points: achievement.points
      });
    }
  }
  
  // עדכון נקודות כוללות
  if (newAchievements.length > 0) {
    const totalNewPoints = newAchievements.reduce((sum, a) => sum + a.points, 0);
    
    await supabase
      .from('user_gamification')
      .update({
        total_points: stats.totalPoints + totalNewPoints,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  }
  
  return newAchievements;
}

// קבלת סטטיסטיקות משתמש
async function getUserStats(userId: string) {
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);

  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId);

  const { data: gamification } = await supabase
    .from('user_gamification')
    .select('*')
    .eq('user_id', userId)
    .single();

  // חישוב חיסכון כולל
  const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalExpense = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalSaved = totalIncome - totalExpense;

  return {
    totalTransactions: transactions?.length || 0,
    categorizedTransactions: transactions?.filter(t => t.category_id).length || 0,
    totalBudgets: budgets?.length || 0,
    totalGoals: goals?.length || 0,
    goalsCompleted: goals?.filter(g => g.current_amount >= g.target_amount).length || 0,
    totalSaved: Math.max(0, totalSaved),
    currentStreak: gamification?.current_streak || 0,
    monthsInBudget: gamification?.months_in_budget || 0,
    maaserPayments: 0, // TODO: מתוך טבלת מעשר
    maaserMonths: 0,
    totalPoints: gamification?.total_points || 0,
    earlyBirdDays: gamification?.early_bird_days || 0,
    nightOwlDays: gamification?.night_owl_days || 0,
    weekendDays: gamification?.weekend_days || 0,
  };
}

// קבלת הישגי משתמש
async function getUserAchievements(userId: string) {
  const { data } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  return data?.map(a => a.achievement_id) || [];
}
