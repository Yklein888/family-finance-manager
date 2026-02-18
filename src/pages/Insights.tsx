import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, Lightbulb, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InsightsPage() {
  // Generate insights from data
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions-insights"],
    queryFn: async () => {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .gte("transaction_date", twoMonthsAgo.toISOString().split("T")[0]);
      return data || [];
    },
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets-insights"],
    queryFn: async () => {
      const { data } = await supabase.from("budgets").select("*, categories(name_he)").eq("is_active", true);
      return data || [];
    },
  });

  // Generate insights
  const insights: Array<{ type: "warning" | "opportunity" | "achievement" | "recommendation"; title: string; description: string; icon: React.ElementType }> = [];

  const now = new Date();
  const thisMonthTx = transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonthTx = transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
  });

  const thisExp = thisMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const lastExp = lastMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const thisInc = thisMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);

  if (lastExp > 0) {
    const diff = ((thisExp - lastExp) / lastExp) * 100;
    if (diff > 10) {
      insights.push({ type: "warning", title: "עלייה בהוצאות", description: `ההוצאות עלו ב-${diff.toFixed(0)}% לעומת חודש שעבר`, icon: AlertTriangle });
    } else if (diff < -10) {
      insights.push({ type: "achievement", title: "ירידה בהוצאות!", description: `ההוצאות ירדו ב-${Math.abs(diff).toFixed(0)}% - כל הכבוד!`, icon: Trophy });
    }
  }

  if (thisInc > thisExp && thisInc - thisExp > 1000) {
    insights.push({ type: "opportunity", title: "עודף חודשי", description: `יש לך עודף - שקול להעביר לחיסכון`, icon: Lightbulb });
  }

  if (thisExp > thisInc && thisInc > 0) {
    insights.push({ type: "warning", title: "הוצאות עולות על הכנסות", description: "ההוצאות החודשיות גבוהות מההכנסות", icon: AlertTriangle });
  }

  if (insights.length === 0) {
    insights.push({ type: "recommendation", title: "הוסף נתונים", description: "הוסף תנועות כדי לקבל תובנות פיננסיות מותאמות אישית", icon: Lightbulb });
  }

  const typeStyles = {
    warning: "border-r-4 border-r-expense bg-expense/5",
    opportunity: "border-r-4 border-r-income bg-income/5",
    achievement: "border-r-4 border-r-warning bg-warning/5",
    recommendation: "border-r-4 border-r-primary bg-primary/5",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">תובנות פיננסיות</h1>
        <p className="text-muted-foreground text-sm">ניתוח חכם של המצב הפיננסי שלך</p>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <Card key={i} className={cn("animate-fade-in", typeStyles[insight.type])}>
            <CardContent className="p-5 flex items-start gap-4">
              <insight.icon className="w-6 h-6 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <h3 className="font-heading font-semibold mb-1">{insight.title}</h3>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
