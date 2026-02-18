import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calculator,
  ArrowLeftRight,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  variant?: "default" | "income" | "expense" | "maaser";
}) {
  const gradientClass = {
    default: "gradient-primary",
    income: "gradient-income",
    expense: "gradient-expense",
    maaser: "gradient-maaser",
  }[variant];

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={`w-10 h-10 rounded-xl ${gradientClass} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>
      <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
    </div>
  );
}

const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899", "#14B8A6"];

export default function Dashboard() {
  const { user } = useAuth();

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions-summary"],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { data } = await supabase
        .from("transactions")
        .select("*, categories(name_he, icon, color)")
        .gte("transaction_date", startOfMonth.toISOString().split("T")[0])
        .order("transaction_date", { ascending: false });
      return data || [];
    },
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data } = await supabase.from("accounts").select("*").eq("is_active", true);
      return data || [];
    },
  });

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const monthlyIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
  const monthlyExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
  const maaserDue = monthlyIncome * 0.1;

  // Expense by category for pie chart
  const expenseByCategory = transactions
    .filter((t) => t.type === "expense" && t.categories)
    .reduce((acc, t) => {
      const cat = (t.categories as any)?.name_he || "אחר";
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expenseByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">דשבורד</h1>
          <p className="text-muted-foreground text-sm">סיכום פיננסי חודשי</p>
        </div>
        <Link to="/transactions">
          <Button>
            <Plus className="w-4 h-4 ml-2" />
            תנועה חדשה
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="יתרה כוללת" value={formatCurrency(totalBalance)} icon={Wallet} />
        <StatCard title="הכנסות החודש" value={formatCurrency(monthlyIncome)} icon={TrendingUp} variant="income" />
        <StatCard title="הוצאות החודש" value={formatCurrency(monthlyExpense)} icon={TrendingDown} variant="expense" />
        <StatCard title="מעשר לתשלום" value={formatCurrency(maaserDue)} icon={Calculator} variant="maaser" />
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">הוצאות לפי קטגוריה</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                אין נתונים עדיין
              </div>
            )}
            <div className="space-y-1.5 mt-2">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">תנועות אחרונות</CardTitle>
            <Link to="/transactions" className="text-sm text-primary hover:underline">
              הצג הכל
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg">
                        {(t.categories as any)?.icon || "📋"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.description || t.merchant_name || "תנועה"}</p>
                        <p className="text-xs text-muted-foreground">
                          {(t.categories as any)?.name_he} · {new Date(t.transaction_date).toLocaleDateString("he-IL")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-semibold ${t.type === "income" ? "text-income" : "text-expense"}`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(Number(t.amount))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                <ArrowLeftRight className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">אין תנועות עדיין</p>
                <Link to="/transactions">
                  <Button variant="outline" size="sm" className="mt-3">
                    הוסף תנועה ראשונה
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
