# 🎯 הוראות לעבודה עם הפרויקט - FinFamily v2.0

## 📌 עקרונות כלליים

אתה עוזר למפתח ישראלי בניהול ופיתוח מערכת ניהול פיננסי משפחתי מתקדמת.

### 🎨 סגנון עבודה:
- **קוד**: באנגלית (משתנים, פונקציות, comments)
- **תיעוד**: בעברית או אנגלית לפי בקשה
- **ממשק משתמש**: 100% עברית עם RTL
- **הערות בקוד**: עברית (// בדיקת תקינות)

### 🔧 Stack טכנולוגי:
```yaml
Frontend:
  - Framework: React 18 + TypeScript
  - Build: Vite 5.4.2
  - Styling: Tailwind CSS 3.4.1 + shadcn/ui
  - State: React Query (TanStack)
  - Router: React Router DOM 6.21.3
  - Charts: Recharts 2.10.4
  - Icons: Lucide React
  
Backend:
  - Database: Supabase (PostgreSQL 15)
  - Auth: Supabase Auth
  - Functions: Vercel Serverless
  - APIs: OpenAI GPT-4, Pepper/Salt Edge/Mono
  
Tools:
  - Package Manager: npm
  - Version Control: Git/GitHub
  - Deployment: Vercel
  - Node: 18+
```

---

## 📂 מבנה הפרויקט

```
family-finance-manager/
├── api/                      # Vercel Serverless Functions
│   ├── auth/pepper/         # OAuth בנקאות פתוחה
│   ├── sync/                # סנכרון תנועות
│   └── chatbot.ts           # AI Chatbot endpoint
├── src/
│   ├── components/          # React Components
│   │   ├── ui/             # shadcn/ui components
│   │   └── ...
│   ├── pages/              # דפי Routes
│   ├── lib/                # Utilities
│   │   ├── gamification.ts
│   │   ├── ai-categorization.ts
│   │   └── smart-notifications.ts
│   ├── contexts/           # React Contexts
│   └── integrations/       # Supabase client
├── supabase/migrations/    # SQL migrations
└── public/                 # Static files + PWA
```

---

## 💾 Database Schema

```sql
15 טבלאות מרכזיות:

Core Tables:
- categories: 100+ קטגוריות (הכנסות + הוצאות)
- accounts: חשבונות בנק
- transactions: תנועות כספיות
- budgets: תקציבים
- savings_goals: יעדי חיסכון
- debts_loans: חובות והלוואות

Special Features:
- maaser_calculations: חישובי מעשר
- maaser_payments: תשלומי מעשר
- recurring_transactions: תשלומים חוזרים

v2.0 Features:
- user_gamification: נקודות, streaks, levels
- user_achievements: הישגים שהושגו
- notifications: התראות חכמות
- families: משפחות
- family_members: חברי משפחה + הרשאות
- chat_history: היסטוריית AI chatbot
```

**RLS:** כל הטבלאות מוגנות ב-Row Level Security
**Policies:** משתמשים רואים רק את המידע שלהם

---

## 🎯 תכונות מרכזיות

### v1.0 (קיים):
- ✅ Dashboard עם סטטיסטיקות
- ✅ Transactions (CRUD מלא)
- ✅ Categories (100+)
- ✅ Budgets
- ✅ Goals
- ✅ Debts
- ✅ Maaser
- ✅ Reports + Charts

### v2.0 (חדש):
- ✅ Open Banking (OAuth Pepper/Salt Edge/Mono)
- ✅ Gamification (30+ achievements)
- ✅ AI Categorization (95% accuracy)
- ✅ Predictions (next month forecast)
- ✅ Smart Notifications (6 types)
- ✅ Family Sharing (multi-user)
- ✅ AI Chatbot (GPT-4 Hebrew)
- ✅ PWA (offline support)

---

## 🔐 Environment Variables

```bash
# Required:
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
VITE_APP_URL

# Optional:
OPENAI_API_KEY              # לצ'אטבוט
VITE_PEPPER_CLIENT_ID       # לבנקאות פתוחה
VITE_PEPPER_CLIENT_SECRET
```

---

## 🎨 קונבנציות קוד

### Component Structure:
```typescript
// Good:
export default function TransactionsList() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery(...);
  
  if (isLoading) return <Loader />;
  
  return (
    <div className="space-y-4">
      {/* תוכן */}
    </div>
  );
}
```

### Naming:
```typescript
// Components: PascalCase
TransactionCard, BudgetForm

// Functions: camelCase
getUserTransactions, calculateTotal

// Constants: UPPER_SNAKE_CASE
MAX_BUDGET_AMOUNT, DEFAULT_CURRENCY

// Hebrew UI: strings
<Button>הוסף תנועה</Button>
```

### File Organization:
```
components/
├── ui/              # Generic reusable
├── features/        # Feature-specific
└── layout/          # Layout components

pages/
├── Dashboard.tsx
├── Transactions.tsx
└── ...
```

---

## 🚀 פעולות נפוצות

### הוספת תכונה חדשה:
1. צור component ב-`src/components/`
2. צור page ב-`src/pages/` (אם צריך)
3. הוסף route ב-`App.tsx`
4. הוסף לnavigation ב-`AppLayout.tsx`
5. SQL migration אם צריך טבלה חדשה

### עבודה עם Supabase:
```typescript
// Read
const { data } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', userId);

// Create
const { error } = await supabase
  .from('transactions')
  .insert({ ...data });

// Update
const { error } = await supabase
  .from('transactions')
  .update({ amount: 100 })
  .eq('id', id);
```

### AI Features:
```typescript
// Auto-categorization
import { smartCategorize } from '@/lib/ai-categorization';
const result = await smartCategorize(transaction);

// Predictions
import { predictNextMonth } from '@/lib/ai-categorization';
const forecast = await predictNextMonth(userId);

// Notifications
import { checkSmartNotifications } from '@/lib/smart-notifications';
await checkSmartNotifications(userId);
```

---

## 🐛 Debugging

### נפוץ:
1. **RLS Error**: בדוק policies ב-Supabase
2. **CORS**: הוסף domain ב-Supabase settings
3. **Build Error**: `npm run type-check`
4. **Env Vars**: ודא שקיים `.env.local`

### Logs:
```typescript
// Development
console.log('[DEBUG]', data);

// Production (Vercel)
console.error('[ERROR]', error);
```

---

## 📦 Deployment

### Local:
```bash
npm run dev          # http://localhost:5173
```

### Production:
```bash
vercel --prod        # או דרך Vercel Dashboard
```

### SQL Migrations:
- Supabase SQL Editor
- הרץ migrations בסדר (001, 002, 003, 004)

---

## 🎯 Best Practices

### ✅ DO:
- שמור RTL consistency
- השתמש ב-TypeScript types
- הוסף error handling
- כתוב comments בעברית
- בדוק RLS policies
- test לפני commit

### ❌ DON'T:
- לא לשלוח sensitive data ל-console
- לא להשתמש ב-any type
- לא לעקוף RLS
- לא לשכוח .env.local
- לא לעשות commit של keys

---

## 🔄 Git Workflow

```bash
# Feature branch
git checkout -b feature/new-feature

# Commit
git add .
git commit -m "✨ feat: הוספת תכונה חדשה"

# Push
git push origin feature/new-feature

# Merge to main
# דרך GitHub PR
```

### Commit Messages:
```
✨ feat: תכונה חדשה
🐛 fix: תיקון באג
📝 docs: עדכון תיעוד
🎨 style: שיפורי UI
♻️ refactor: שיפור קוד
🚀 deploy: deployment
```

---

## 💡 Tips

1. **Performance**: השתמש ב-React.memo לcomponents כבדים
2. **Security**: תמיד בדוק RLS + input validation
3. **UX**: הוסף loading states + error messages בעברית
4. **Accessibility**: ARIA labels בעברית
5. **Mobile**: test על מסכים קטנים (responsive)

---

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
- Recharts: https://recharts.org
- Tailwind: https://tailwindcss.com

---

## 🆘 צריך עזרה?

1. בדוק ב-DEPLOYMENT.md
2. בדוק ב-FEATURES_v2.md
3. חפש בקוד דוגמאות דומות
4. GitHub Issues

---

**גרסה:** 2.0.0  
**עדכון אחרון:** פברואר 2026  
**סטטוס:** Production Ready ✅
