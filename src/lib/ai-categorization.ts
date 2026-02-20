import { supabase } from "@/integrations/supabase/client";

/**
 * 🤖 AI Smart Categorization & Predictions
 * 
 * מערכת קטגוריזציה חכמה עם למידת מכונה
 * וחיזויים פיננסיים מתקדמים
 */

// כללי קטגוריזציה לפי מילות מפתח (Rule-Based)
const CATEGORY_RULES = {
  // מזון
  'food': {
    keywords: ['סופר', 'שופרסל', 'רמי לוי', 'יינות ביתן', 'מזון', 'מכולת', 'ירקות', 'שוק', 'טיב טעם', 'מגה', 'Victory', 'חצי חינם'],
    category_name: 'מזון - סופרמרקט'
  },
  'restaurants': {
    keywords: ['מסעדה', 'קפה', 'בית קפה', 'פיצה', 'המבורגר', 'סושי', 'וולט', 'טנא', 'משלוח', 'מקדונלד', 'בורגר', 'קפה גרג'],
    category_name: 'מזון - מסעדות'
  },
  'bakery': {
    keywords: ['מאפייה', 'לחם', 'חלה', 'עוגה', 'אנג\'ל'],
    category_name: 'מזון - מאפייה'
  },

  // תחבורה
  'fuel': {
    keywords: ['דלק', 'דור אלון', 'סונול', 'פז', 'דלק מוטור', 'תדלוק'],
    category_name: 'תחבורה - דלק'
  },
  'parking': {
    keywords: ['חניה', 'חניון', 'פנגו', 'סלופארק'],
    category_name: 'תחבורה - חניה'
  },
  'public_transport': {
    keywords: ['רב קו', 'רכבת', 'אוטובוס', 'מונית', 'גט טקסי', 'אפ מונית'],
    category_name: 'תחבורה - תחבורה ציבורית'
  },

  // בריאות
  'pharmacy': {
    keywords: ['סופר פארם', 'ניו פארם', 'בית מרקחת', 'תרופות'],
    category_name: 'בריאות - תרופות'
  },
  'medical': {
    keywords: ['קופת חולים', 'רופא', 'מכבי', 'כללית', 'מאוחדת', 'לאומית', 'מרפאה'],
    category_name: 'בריאות - רופאים'
  },

  // דיור
  'electricity': {
    keywords: ['חברת חשמל', 'חשמל', 'חח"י'],
    category_name: 'דיור - חשמל'
  },
  'water': {
    keywords: ['מים', 'תאגיד מים', 'מי'],
    category_name: 'דיור - מים'
  },
  'internet': {
    keywords: ['בזק', 'הוט', 'סלקום', 'פרטנר', 'אינטרנט', 'סלולר'],
    category_name: 'דיור - אינטרנט'
  },

  // בילויים
  'entertainment': {
    keywords: ['קולנוע', 'סינמה', 'יס פלנט', 'נטפליקס', 'ספוטיפיי', 'ערוצים'],
    category_name: 'בילויים - קולנוע ובידור'
  },
  'sports': {
    keywords: ['חדר כושר', 'ספורט', 'הולמס פלייס', 'פיטנס'],
    category_name: 'בילויים - ספורט'
  },

  // קניות
  'clothing': {
    keywords: ['זארה', 'H&M', 'קסטרו', 'פוקס', 'גולף', 'ביגוד', 'נעליים'],
    category_name: 'ביגוד - ביגוד'
  },
  'online': {
    keywords: ['אמזון', 'אלי אקספרס', 'ebay', 'PAYPAL', 'קניות אונליין'],
    category_name: 'אחר - קניות אונליין'
  },

  // ילדים
  'kids': {
    keywords: ['גן', 'משפחתון', 'חוגים', 'צעצועים'],
    category_name: 'חינוך - גן'
  },
};

// 🧠 קטגוריזציה חכמה
export async function smartCategorize(transaction: {
  description: string;
  merchant_name?: string;
  amount: number;
  user_id: string;
}) {
  try {
    // שלב 1: חיפוש בהיסטוריה - האם היה סוחר דומה?
    const historicalCategory = await findHistoricalCategory(
      transaction.user_id,
      transaction.merchant_name || transaction.description
    );

    if (historicalCategory) {
      return {
        category_id: historicalCategory.id,
        confidence: 0.95,
        method: 'historical'
      };
    }

    // שלב 2: כללים (Rule-Based)
    const ruleCategory = findCategoryByRules(
      transaction.merchant_name || transaction.description
    );

    if (ruleCategory) {
      return {
        category_id: ruleCategory.id,
        confidence: 0.85,
        method: 'rules'
      };
    }

    // שלב 3: דפוסים (Pattern Matching)
    const patternCategory = await findCategoryByPattern(
      transaction.user_id,
      transaction.amount,
      new Date()
    );

    if (patternCategory) {
      return {
        category_id: patternCategory.id,
        confidence: 0.70,
        method: 'pattern'
      };
    }

    return null;

  } catch (error) {
    console.error('Smart categorization error:', error);
    return null;
  }
}

// חיפוש קטגוריה היסטורית
async function findHistoricalCategory(userId: string, merchantText: string) {
  const { data: similar } = await supabase
    .from('transactions')
    .select('category_id, categories(id, name_he)')
    .eq('user_id', userId)
    .or(`merchant_name.ilike.%${merchantText}%,description.ilike.%${merchantText}%`)
    .not('category_id', 'is', null)
    .limit(10);

  if (!similar || similar.length === 0) return null;

  // הקטגוריה הנפוצה ביותר
  const categoryCounts: Record<string, number> = {};
  similar.forEach(t => {
    if (t.category_id) {
      categoryCounts[t.category_id] = (categoryCounts[t.category_id] || 0) + 1;
    }
  });

  const mostCommon = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])[0];

  if (mostCommon) {
    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('id', mostCommon[0])
      .single();
    
    return category;
  }

  return null;
}

// חיפוש לפי כללים
function findCategoryByRules(text: string) {
  const lowerText = text.toLowerCase();

  for (const [key, rule] of Object.entries(CATEGORY_RULES)) {
    for (const keyword of rule.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        // מצא קטגוריה לפי שם
        return { name: rule.category_name, id: null }; // TODO: Get real ID
      }
    }
  }

  return null;
}

// חיפוש לפי דפוס (סכום + זמן)
async function findCategoryByPattern(
  userId: string,
  amount: number,
  date: Date
) {
  const dayOfWeek = date.getDay();
  const hour = date.getHours();

  // חיפוש תנועות דומות באותו יום בשבוע ושעה
  const { data: similar } = await supabase
    .from('transactions')
    .select('category_id, amount')
    .eq('user_id', userId)
    .gte('amount', amount * 0.8)
    .lte('amount', amount * 1.2)
    .not('category_id', 'is', null)
    .limit(5);

  // TODO: סינון לפי יום ושעה
  if (similar && similar.length > 0) {
    return similar[0];
  }

  return null;
}

// 📊 חיזויים פיננסיים
export async function predictNextMonth(userId: string) {
  try {
    // קבלת 12 חודשים אחרונים
    const last12Months = await getLast12Months(userId);

    // חישוב טרנדים
    const predictions = {
      total: predictTotal(last12Months),
      byCategory: await predictByCategory(userId, last12Months),
      unusualExpenses: detectUnusualExpenses(last12Months),
      recommendations: generateRecommendations(last12Months)
    };

    return predictions;

  } catch (error) {
    console.error('Prediction error:', error);
    return null;
  }
}

// קבלת 12 חודשים אחרונים
async function getLast12Months(userId: string) {
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('transaction_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
    .order('transaction_date', { ascending: true });

  return data || [];
}

// חיזוי סכום כולל
function predictTotal(transactions: any[]) {
  // קיבוץ לפי חודש
  const monthlyTotals: Record<string, number> = {};

  transactions.forEach(t => {
    const month = new Date(t.transaction_date).toISOString().slice(0, 7);
    if (t.type === 'expense') {
      monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(t.amount);
    }
  });

  const totals = Object.values(monthlyTotals);
  
  if (totals.length === 0) return 0;

  // ממוצע משוקלל (חודשים אחרונים משקל גבוה יותר)
  let weightedSum = 0;
  let weightSum = 0;

  totals.forEach((total, index) => {
    const weight = index + 1; // חודש אחרון = משקל הגבוה ביותר
    weightedSum += total * weight;
    weightSum += weight;
  });

  const predicted = weightedSum / weightSum;

  // התאמה לעונתיות (אם יש)
  const seasonality = detectSeasonality(totals);
  
  return Math.round(predicted * seasonality);
}

// זיהוי עונתיות
function detectSeasonality(values: number[]) {
  if (values.length < 12) return 1;

  const currentMonth = new Date().getMonth();
  const lastYearSameMonth = values[values.length - 12 + currentMonth];
  const average = values.reduce((a, b) => a + b, 0) / values.length;

  if (lastYearSameMonth > average * 1.2) {
    return 1.15; // חודש יקר
  } else if (lastYearSameMonth < average * 0.8) {
    return 0.9; // חודש זול
  }

  return 1;
}

// חיזוי לפי קטגוריה
async function predictByCategory(userId: string, transactions: any[]) {
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('type', 'expense');

  const predictions: Record<string, any> = {};

  categories?.forEach(category => {
    const categoryTransactions = transactions.filter(
      t => t.category_id === category.id
    );

    if (categoryTransactions.length === 0) {
      predictions[category.name_he] = {
        predicted: 0,
        confidence: 0
      };
      return;
    }

    // ממוצע 3 חודשים אחרונים
    const recent3Months = categoryTransactions.slice(-90); // בערך 3 חודשים
    const total = recent3Months.reduce((sum, t) => sum + Number(t.amount), 0);
    const average = total / 3;

    predictions[category.name_he] = {
      predicted: Math.round(average),
      confidence: categoryTransactions.length > 10 ? 0.85 : 0.60,
      trend: calculateTrend(categoryTransactions)
    };
  });

  return predictions;
}

// חישוב טרנד
function calculateTrend(transactions: any[]) {
  if (transactions.length < 6) return 'stable';

  const firstHalf = transactions.slice(0, Math.floor(transactions.length / 2));
  const secondHalf = transactions.slice(Math.floor(transactions.length / 2));

  const firstAvg = firstHalf.reduce((sum, t) => sum + Number(t.amount), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, t) => sum + Number(t.amount), 0) / secondHalf.length;

  const change = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (change > 10) return 'increasing';
  if (change < -10) return 'decreasing';
  return 'stable';
}

// זיהוי הוצאות חריגות
function detectUnusualExpenses(transactions: any[]) {
  const amounts = transactions
    .filter(t => t.type === 'expense')
    .map(t => Number(t.amount));

  if (amounts.length === 0) return [];

  // חישוב סטיית תקן
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  // הוצאות שהן 2 סטיות תקן מעל הממוצע
  const threshold = mean + (2 * stdDev);

  return transactions.filter(t => 
    t.type === 'expense' && Number(t.amount) > threshold
  );
}

// יצירת המלצות
function generateRecommendations(transactions: any[]) {
  const recommendations = [];

  // המלצה 1: הפחתת הוצאות במסעדות
  const restaurantExpenses = transactions.filter(t => 
    t.description?.toLowerCase().includes('מסעדה') ||
    t.description?.toLowerCase().includes('קפה')
  );

  const restaurantTotal = restaurantExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

  if (restaurantTotal > 2000) {
    recommendations.push({
      type: 'reduce_spending',
      category: 'מסעדות',
      message: `הוצאת ₪${restaurantTotal} על מסעדות וקפה החודש. נסה להפחית ל-₪1,500 וחסוך ₪${restaurantTotal - 1500}!`,
      potentialSavings: restaurantTotal - 1500
    });
  }

  // המלצה 2: מנויים לא בשימוש
  const subscriptions = transactions.filter(t =>
    t.description?.toLowerCase().includes('נטפליקס') ||
    t.description?.toLowerCase().includes('ספוטיפיי')
  );

  if (subscriptions.length > 5) {
    recommendations.push({
      type: 'cancel_subscriptions',
      message: `יש לך ${subscriptions.length} מנויים פעילים. בדוק אילו באמת בשימוש!`,
      potentialSavings: 100
    });
  }

  return recommendations;
}

// 🎯 Auto-categorize existing transactions
export async function autoCategorizeAll(userId: string) {
  const { data: uncategorized } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .is('category_id', null)
    .limit(100);

  if (!uncategorized) return 0;

  let categorized = 0;

  for (const transaction of uncategorized) {
    const result = await smartCategorize(transaction);
    
    if (result && result.confidence > 0.7) {
      await supabase
        .from('transactions')
        .update({ category_id: result.category_id })
        .eq('id', transaction.id);
      
      categorized++;
    }
  }

  return categorized;
}
