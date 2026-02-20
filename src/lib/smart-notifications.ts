import { supabase } from "@/integrations/supabase/client";
import { predictNextMonth } from "./ai-categorization";

/**
 * 🔔 Smart Notifications System
 * 
 * מערכת התראות חכמות מבוססת AI
 * שמנתחת התנהגות ושולחת התראות רלוונטיות
 */

export type NotificationType = 
  | 'budget_warning'      // חריגה מתקציב
  | 'budget_exceeded'     // חרגת מהתקציב
  | 'bill_reminder'       // תזכורת חשבון
  | 'unusual_expense'     // הוצאה חריגה
  | 'achievement'         // הישג חדש
  | 'savings_milestone'   // אבן דרך בחיסכון
  | 'prediction_alert'    // התראת חיזוי
  | 'maaser_reminder'     // תזכורת מעשר
  | 'goal_progress'       // התקדמות ביעד
  | 'streak_reminder';    // שמירה על streak

export interface SmartNotification {
  id?: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  action_url?: string;
  action_text?: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

// 🧠 בדיקה יומית של התראות חכמות
export async function checkSmartNotifications(userId: string) {
  const notifications: SmartNotification[] = [];

  // 1. בדיקת חריגות תקציב
  const budgetNotifications = await checkBudgetAlerts(userId);
  notifications.push(...budgetNotifications);

  // 2. תזכורות חשבונות
  const billReminders = await checkBillReminders(userId);
  notifications.push(...billReminders);

  // 3. הוצאות חריגות
  const unusualExpenses = await checkUnusualExpenses(userId);
  notifications.push(...unusualExpenses);

  // 4. התראות חיזוי
  const predictions = await checkPredictionAlerts(userId);
  notifications.push(...predictions);

  // 5. תזכורת streak
  const streakReminder = await checkStreakReminder(userId);
  if (streakReminder) notifications.push(streakReminder);

  // 6. התקדמות יעדים
  const goalAlerts = await checkGoalProgress(userId);
  notifications.push(...goalAlerts);

  // שמירת התראות במסד נתונים
  for (const notification of notifications) {
    await createNotification(notification);
  }

  return notifications;
}

// 💰 בדיקת חריגות תקציב
async function checkBudgetAlerts(userId: string): Promise<SmartNotification[]> {
  const notifications: SmartNotification[] = [];

  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, categories(name_he)')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (!budgets) return [];

  const currentMonth = new Date().toISOString().slice(0, 7);

  for (const budget of budgets) {
    // חישוב הוצאות החודש בקטגוריה
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('category_id', budget.category_id)
      .eq('type', 'expense')
      .gte('transaction_date', `${currentMonth}-01`);

    const spent = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const percentage = (spent / budget.amount) * 100;

    // אזהרה ב-80%
    if (percentage >= 80 && percentage < 100 && !budget.alert_sent_80) {
      notifications.push({
        user_id: userId,
        type: 'budget_warning',
        title: '⚠️ קרוב לתקציב',
        message: `הוצאת ${Math.round(percentage)}% מתקציב "${budget.categories.name_he}". נותרו ₪${Math.round(budget.amount - spent)}`,
        priority: 'medium',
        action_url: '/budgets',
        action_text: 'צפה בתקציבים',
        data: { budget_id: budget.id, percentage },
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    // חריגה מתקציב
    if (percentage >= 100) {
      notifications.push({
        user_id: userId,
        type: 'budget_exceeded',
        title: '🚨 חריגה מתקציב!',
        message: `חרגת ב-₪${Math.round(spent - budget.amount)} מתקציב "${budget.categories.name_he}"`,
        priority: 'high',
        action_url: '/budgets',
        action_text: 'נהל תקציב',
        data: { budget_id: budget.id, overspent: spent - budget.amount },
        is_read: false,
        created_at: new Date().toISOString()
      });
    }
  }

  return notifications;
}

// 📅 תזכורות חשבונות
async function checkBillReminders(userId: string): Promise<SmartNotification[]> {
  const notifications: SmartNotification[] = [];

  const { data: recurring } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (!recurring) return [];

  const today = new Date();
  const in3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

  for (const bill of recurring) {
    const nextDate = new Date(bill.next_date);

    // תזכורת 3 ימים לפני
    if (nextDate <= in3Days && nextDate > today) {
      const daysLeft = Math.ceil((nextDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
      
      notifications.push({
        user_id: userId,
        type: 'bill_reminder',
        title: '📅 חשבון מתקרב',
        message: `תשלום "${bill.description}" בעוד ${daysLeft} ימים (₪${bill.amount})`,
        priority: 'medium',
        action_url: '/recurring',
        action_text: 'צפה בתשלומים',
        data: { recurring_id: bill.id, days_left: daysLeft },
        is_read: false,
        created_at: new Date().toISOString()
      });
    }
  }

  return notifications;
}

// 💸 הוצאות חריגות
async function checkUnusualExpenses(userId: string): Promise<SmartNotification[]> {
  const notifications: SmartNotification[] = [];

  // קבלת הוצאות של היום
  const today = new Date().toISOString().slice(0, 10);
  
  const { data: todayTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('transaction_date', today);

  if (!todayTransactions || todayTransactions.length === 0) return [];

  // חישוב ממוצע הוצאה
  const { data: last30Days } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('transaction_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const amounts = last30Days?.map(t => Number(t.amount)) || [];
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  const threshold = mean + (2 * stdDev);

  // בדיקת הוצאות גבוהות
  for (const transaction of todayTransactions) {
    if (Number(transaction.amount) > threshold) {
      notifications.push({
        user_id: userId,
        type: 'unusual_expense',
        title: '⚡ הוצאה חריגה זוהתה',
        message: `הוצאת ₪${transaction.amount} על "${transaction.description}" - זה גבוה מהרגיל שלך`,
        priority: 'high',
        action_url: '/transactions',
        action_text: 'צפה בתנועה',
        data: { transaction_id: transaction.id },
        is_read: false,
        created_at: new Date().toISOString()
      });
    }
  }

  return notifications;
}

// 🔮 התראות חיזוי
async function checkPredictionAlerts(userId: string): Promise<SmartNotification[]> {
  const notifications: SmartNotification[] = [];

  try {
    const predictions = await predictNextMonth(userId);
    
    if (!predictions) return [];

    // אזהרה אם החודש הבא צפוי להיות יקר
    const { data: thisMonth } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('transaction_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    const thisMonthTotal = thisMonth?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    if (predictions.total > thisMonthTotal * 1.15) {
      notifications.push({
        user_id: userId,
        type: 'prediction_alert',
        title: '📊 חיזוי: חודש יקר מתקרב',
        message: `החודש הבא צפוי להיות ב-₪${Math.round(predictions.total)} - ${Math.round((predictions.total - thisMonthTotal) / thisMonthTotal * 100)}% יותר מהחודש`,
        priority: 'medium',
        action_url: '/reports',
        action_text: 'צפה בחיזויים',
        data: { predicted: predictions.total },
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    // המלצות
    predictions.recommendations?.forEach((rec: any) => {
      notifications.push({
        user_id: userId,
        type: 'prediction_alert',
        title: '💡 המלצה חכמה',
        message: rec.message,
        priority: 'low',
        action_url: '/reports',
        action_text: 'למד עוד',
        data: { recommendation: rec },
        is_read: false,
        created_at: new Date().toISOString()
      });
    });

  } catch (error) {
    console.error('Prediction alerts error:', error);
  }

  return notifications;
}

// 🔥 תזכורת streak
async function checkStreakReminder(userId: string): Promise<SmartNotification | null> {
  const { data: gamification } = await supabase
    .from('user_gamification')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!gamification) return null;

  const lastActivity = new Date(gamification.last_activity_date);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  // אם הפעילות האחרונה היתה אתמול ועדיין לא עדכן היום
  if (
    lastActivity.toDateString() === yesterday.toDateString() &&
    gamification.current_streak > 3
  ) {
    return {
      user_id: userId,
      type: 'streak_reminder',
      title: `🔥 שמור על ה-Streak שלך!`,
      message: `יש לך ${gamification.current_streak} ימים רצופים! עדכן תנועה היום כדי לא לאבד`,
      priority: 'high',
      action_url: '/transactions',
      action_text: 'הוסף תנועה',
      data: { current_streak: gamification.current_streak },
      is_read: false,
      created_at: new Date().toISOString()
    };
  }

  return null;
}

// 🎯 התקדמות יעדים
async function checkGoalProgress(userId: string): Promise<SmartNotification[]> {
  const notifications: SmartNotification[] = [];

  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (!goals) return [];

  for (const goal of goals) {
    const progress = (goal.current_amount / goal.target_amount) * 100;

    // הודעה ב-50%, 75%, 90%, 100%
    const milestones = [50, 75, 90, 100];
    
    for (const milestone of milestones) {
      if (progress >= milestone && progress < milestone + 5) {
        notifications.push({
          user_id: userId,
          type: 'goal_progress',
          title: `🎯 ${milestone}% להשגת היעד!`,
          message: `השגת ${milestone}% מיעד "${goal.name}" - כל הכבוד!`,
          priority: milestone === 100 ? 'high' : 'low',
          action_url: '/goals',
          action_text: 'צפה ביעדים',
          data: { goal_id: goal.id, progress: milestone },
          is_read: false,
          created_at: new Date().toISOString()
        });
      }
    }
  }

  return notifications;
}

// שמירת התראה במסד נתונים
async function createNotification(notification: SmartNotification) {
  // בדיקה שלא קיימת התראה דומה מהיום
  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', notification.user_id)
    .eq('type', notification.type)
    .gte('created_at', new Date().toISOString().slice(0, 10))
    .single();

  if (existing) return; // כבר נשלחה היום

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      action_url: notification.action_url,
      action_text: notification.action_text,
      data: notification.data,
      is_read: false,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Failed to create notification:', error);
  }
}

// קבלת התראות למשתמש
export async function getUserNotifications(userId: string, limit: number = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

// סימון התראה כנקראה
export async function markAsRead(notificationId: string) {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
}

// מחיקת התראה
export async function deleteNotification(notificationId: string) {
  await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
}
