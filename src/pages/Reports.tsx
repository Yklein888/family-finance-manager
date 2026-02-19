import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import ExcelExporter from "@/components/ExcelExporter";

const MONTHS_HE = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const COLORS = ["#3B82F6","#10B981","#8B5CF6","#F59E0B","#EF4444","#06B6D4","#EC4899","#14B8A6"];

export default function ReportsPage() {
  const { user } = useAuth();
  const [range, setRange] = useState(6);

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions-reports", range],
    queryFn: async () => {
      const from = new Date();
      from.setMonth(from.getMonth() - range + 1);
      from.setDate(1);
      const { data } = await supabase
        .from("transactions")
        .select("*, categories(name_he, icon)")
        .gte("transaction_date", from.toISOString().split("T")[0])
        .order("transaction_date", { ascending: true });
      return data || [];
    },
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n);

  const { monthlyData, catData, totalIncome, totalExpenses } = useMemo(() => {
    const now = new Date();
    const months: any[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const mTx = transactions.filter((t) => t.transaction_date.startsWith(ym));
      const income = mTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
      const expenses = mTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
      months.push({ month: MONTHS_HE[d.getMonth()], income, expenses, surplus: income - expenses });
    }

    const catMap: Record<string, { amount: number; icon: string }> = {};
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      const name = (t.categories as any)?.name_he || "אחר";
      const icon = (t.categories as any)?.icon || "📦";
      if (!catMap[name]) catMap[name] = { amount: 0, icon };
      catMap[name].amount += Number(t.amount);
    });
    const catData = Object.entries(catMap)
      .map(([name, { amount, icon }]) => ({ name, amount, icon }))
      .sort((a, b) => b.amount - a.amount).slice(0, 8);

    const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

    return { monthlyData: months, catData, totalIncome, totalExpenses };
  }, [transactions, range]);

  const savings = totalIncome - totalExpenses;
  const totalCat = catData.reduce((s, c) => s + c.amount, 0);

  const handleExport = () => {
    const csv = ["חודש,הכנסות,הוצאות,יתרה",
      ...monthlyData.map((m) => `${m.month},${m.income},${m.expenses},${m.surplus}`)].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "דוח.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-sm">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name === "income" ? "הכנסות" : p.name === "expenses" ? "הוצאות" : "יתרה"}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">דוחות</h1>
          <p className="text-muted-foreground text-sm">ניתוח פיננסי מקיף</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            {[3, 6, 12].map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={cn("px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  range === r ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {r} חודשים
              </button>
            ))}
          </div>
          <ExcelExporter 
            data={{ transactions }}
            filename={`דוח_פיננסי_${new Date().toISOString().split('T')[0]}.xlsx`}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">סך הכנסות</p>
          <p className="text-xl font-heading font-bold text-income">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-muted-foreground mt-1">ממוצע: {formatCurrency(totalIncome / range)}/חודש</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">סך הוצאות</p>
          <p className="text-xl font-heading font-bold text-expense">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-muted-foreground mt-1">ממוצע: {formatCurrency(totalExpenses / range)}/חודש</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">חיסכון כולל</p>
          <p className={cn("text-xl font-heading font-bold", savings >= 0 ? "text-income" : "text-expense")}>
            {formatCurrency(savings)}
          </p>
          {totalIncome > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {((savings / totalIncome) * 100).toFixed(0)}% מההכנסות
            </p>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">הכנסות מול הוצאות</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => v === "income" ? "הכנסות" : "הוצאות"} />
              <Bar dataKey="income" name="income" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name="expenses" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">התפלגות הוצאות</CardTitle>
          </CardHeader>
          <CardContent>
            {catData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">אין נתונים</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="amount" paddingAngle={3}>
                      {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {catData.map((cat, i) => {
                    const pct = totalCat > 0 ? (cat.amount / totalCat) * 100 : 0;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span>{cat.icon} {cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                            <span className="font-medium">{formatCurrency(cat.amount)}</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">מגמת יתרה חודשית</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => v === "expenses" ? "הוצאות" : "יתרה"} />
                <Line type="monotone" dataKey="expenses" name="expenses" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="surplus" name="surplus" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-gradient-to-br from-primary/5 to-maaser/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">💡 תובנות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {savings >= 0 ? (
            <div className="flex gap-3">
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-sm font-semibold text-income">חיסכון מצוין!</p>
                <p className="text-sm text-muted-foreground">
                  חסכת {formatCurrency(savings)} ב-{range} חודשים —
                  {totalIncome > 0 ? ` ${((savings / totalIncome) * 100).toFixed(0)}% מההכנסות` : ""}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-expense">הוצאות עולות על הכנסות</p>
                <p className="text-sm text-muted-foreground">גירעון של {formatCurrency(Math.abs(savings))} — מומלץ לבדוק את הקטגוריות הגדולות.</p>
              </div>
            </div>
          )}
          {catData[0] && totalCat > 0 && (catData[0].amount / totalCat) > 0.3 && (
            <div className="flex gap-3">
              <span className="text-xl">📊</span>
              <div>
                <p className="text-sm font-semibold">קטגוריה דומיננטית</p>
                <p className="text-sm text-muted-foreground">
                  {catData[0].icon} {catData[0].name} מהווה {((catData[0].amount / totalCat) * 100).toFixed(0)}% מההוצאות.
                </p>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <span className="text-xl">✡️</span>
            <div>
              <p className="text-sm font-semibold">מעשר</p>
              <p className="text-sm text-muted-foreground">
                מעשר מחושב עבור {range} חודשים: {formatCurrency(totalIncome * 0.1)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
