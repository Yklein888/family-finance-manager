import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * 💬 AI Financial Assistant Chatbot
 * 
 * צ'אטבוט פיננסי חכם המבוסס על GPT-4
 * עונה על שאלות ונותן המלצות מותאמות אישית
 */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ error: 'Message and userId required' });
  }

  try {
    // אתחול Supabase
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // קבלת הקשר פיננסי של המשתמש
    const context = await getUserFinancialContext(supabase, userId);

    // קריאה ל-OpenAI GPT-4
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: generateSystemPrompt(context)
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await openaiResponse.json();
    const reply = data.choices[0].message.content;

    // שמירת שיחה בהיסטוריה
    await supabase
      .from('chat_history')
      .insert({
        user_id: userId,
        user_message: message,
        bot_reply: reply,
        created_at: new Date().toISOString(),
      });

    return res.json({
      success: true,
      reply: reply,
      suggestions: generateSuggestions(context)
    });

  } catch (error: any) {
    console.error('Chatbot error:', error);
    return res.status(500).json({ 
      error: 'Failed to process message',
      message: error.message 
    });
  }
}

// בניית הקשר פיננסי למשתמש
async function getUserFinancialContext(supabase: any, userId: string) {
  // תנועות אחרונות
  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('amount, type, description, category_id, transaction_date')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .limit(20);

  // תקציבים
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, categories(name_he)')
    .eq('user_id', userId)
    .eq('is_active', true);

  // יעדים
  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  // סטטיסטיקות חודשיות
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const { data: monthlyIncome } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'income')
    .gte('transaction_date', `${currentMonth}-01`);

  const { data: monthlyExpense } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('transaction_date', `${currentMonth}-01`);

  const totalIncome = monthlyIncome?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalExpense = monthlyExpense?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  return {
    recentTransactions: recentTransactions?.slice(0, 5) || [],
    totalTransactions: recentTransactions?.length || 0,
    budgets: budgets || [],
    goals: goals || [],
    monthlyStats: {
      income: Math.round(totalIncome),
      expense: Math.round(totalExpense),
      balance: Math.round(totalIncome - totalExpense)
    }
  };
}

// יצירת System Prompt
function generateSystemPrompt(context: any) {
  return `אתה "פינקי" - עוזר פיננסי אישי חכם ומקצועי לשוק הישראלי.
  
תפקידך:
- לעזור למשתמשים לנהל את הכספים שלהם בצורה חכמה
- לתת עצות פיננסיות מעשיות ומותאמות אישית
- לדבר בעברית בצורה ידידותית אבל מקצועית
- להשתמש במטבע ש"ח (₪)
- להתייחס לתרבות הישראלית (שבתות, חגים, מנטליות)

מידע על המשתמש:
- הכנסות החודש: ₪${context.monthlyStats.income}
- הוצאות החודש: ₪${context.monthlyStats.expense}
- יתרה: ₪${context.monthlyStats.balance}
- תקציבים פעילים: ${context.budgets.length}
- יעדי חיסכון: ${context.goals.length}
- תנועות אחרונות: ${context.totalTransactions}

תנועות אחרונות:
${context.recentTransactions.map((t: any) => 
  `- ${t.type === 'income' ? '+' : '-'}₪${t.amount}: ${t.description}`
).join('\n')}

יעדים:
${context.goals.map((g: any) => 
  `- ${g.name}: ₪${g.current_amount} / ₪${g.target_amount} (${Math.round(g.current_amount/g.target_amount*100)}%)`
).join('\n')}

הנחיות:
1. השתמש במספרים קרובים (עיגולים) כשאתה מתייחס לסכומים
2. תן עצות מעשיות ולא כלליות
3. אם המשתמש שואל על דבר ספציפי - התבסס על הנתונים שלו
4. אם אין לך מידע - אל תמציא, ספר למשתמש שאתה צריך עוד פרטים
5. תמיד היה חיובי ומעודד
6. אם המשתמש מבקש עזרה רצינית - המליץ לפנות ליועץ פיננסי מקצועי

דוגמאות טובות:
- "לפי הנתונים שלך, הוצאת ₪2,400 על אוכל החודש - זה קצת גבוה. נסה להגדיר תקציב של ₪2,000 לחודש הבא"
- "ראיתי שיש לך יעד לחיסכון של ₪50,000 ואתה ב-30%. אם תחסוך ₪2,000 בחודש, תגיע ליעד ב-15 חודשים!"
- "הכנסות החודש שלך טובות! אבל שים לב שההוצאות כמעט מגיעות להכנסות. אולי כדאי להפחית קצת?"

דוגמאות רעות (אל תעשה):
- "יש לך בעיות פיננסיות חמורות"
- "אתה צריך לחסוך 50% מההכנסה" (לא מציאותי)
- "המצב שלך נורא" (שלילי מדי)

תמיד סיים עם שאלה או הצעה למעש בבמידה והדבר רלוונטי.`;
}

// יצירת הצעות מהירות
function generateSuggestions(context: any) {
  const suggestions = [];

  if (context.monthlyStats.balance < 0) {
    suggestions.push('איך אני יכול לחסוך כסף?');
  }

  if (context.budgets.length === 0) {
    suggestions.push('איך מגדירים תקציב?');
  }

  if (context.goals.length > 0) {
    suggestions.push('איך אני מתקדם ביעדים שלי?');
  }

  suggestions.push('מה ההוצאות הגדולות שלי?');
  suggestions.push('תן לי טיפ לחיסכון');

  return suggestions.slice(0, 4);
}
