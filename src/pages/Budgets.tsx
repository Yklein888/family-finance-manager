import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Plus, PiggyBank, AlertTriangle } from "lucide-react";

export default function BudgetsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("budgets")
        .select("*, categories(name_he, icon, color)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-expense"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").eq("type", "expense").order("name_he");
      return data || [];
    },
  });

  // Calculate spent per budget from transactions
  const { data: spentMap = {} } = useQuery({
    queryKey: ["budget-spent"],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { data } = await supabase
        .from("transactions")
        .select("category_id, amount")
        .eq("type", "expense")
        .gte("transaction_date", startOfMonth.toISOString().split("T")[0]);
      
      const map: Record<string, number> = {};
      (data || []).forEach((t) => {
        if (t.category_id) map[t.category_id] = (map[t.category_id] || 0) + Number(t.amount);
      });
      return map;
    },
  });

  const addBudget = useMutation({
    mutationFn: async (formData: FormData) => {
      const { error } = await supabase.from("budgets").insert({
        user_id: user!.id,
        category_id: formData.get("category") as string,
        amount: Number(formData.get("amount")),
        period: formData.get("period") as string,
        start_date: new Date().toISOString().split("T")[0],
        alert_threshold: Number(formData.get("threshold") || 80),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setOpen(false);
      toast({ title: "תקציב נוסף בהצלחה ✅" });
    },
    onError: (err: any) => toast({ title: "שגיאה", description: err.message, variant: "destructive" }),
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n);

  const totalBudget = budgets.reduce((s, b) => s + Number(b.amount), 0);
  const totalSpent = budgets.reduce((s, b) => s + (spentMap[b.category_id || ""] || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">תקציבים</h1>
          <p className="text-muted-foreground text-sm">ניהול ובקרת תקציב חודשי</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 ml-2" />תקציב חדש</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader><DialogTitle>הוספת תקציב</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addBudget.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
              <div className="space-y-2">
                <Label>קטגוריה</Label>
                <Select name="category" required>
                  <SelectTrigger><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name_he}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>סכום תקציב</Label>
                <Input name="amount" type="number" step="1" required placeholder="0" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>תקופה</Label>
                <Select name="period" defaultValue="monthly">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">שבועי</SelectItem>
                    <SelectItem value="monthly">חודשי</SelectItem>
                    <SelectItem value="quarterly">רבעוני</SelectItem>
                    <SelectItem value="yearly">שנתי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>סף התראה (%)</Label>
                <Input name="threshold" type="number" defaultValue={80} min={50} max={100} dir="ltr" />
              </div>
              <Button type="submit" className="w-full" disabled={addBudget.isPending}>
                {addBudget.isPending ? "שומר..." : "שמור תקציב"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">סה"כ תקציב</p>
          <p className="text-xl font-heading font-bold">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">סה"כ הוצאות</p>
          <p className="text-xl font-heading font-bold text-expense">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">נותר</p>
          <p className="text-xl font-heading font-bold text-income">{formatCurrency(totalBudget - totalSpent)}</p>
        </div>
      </div>

      {/* Budget cards */}
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <PiggyBank className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg mb-1">אין תקציבים</p>
            <p className="text-sm">הגדר תקציבים כדי לעקוב אחרי ההוצאות שלך</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const spent = spentMap[b.category_id || ""] || 0;
            const pct = b.amount ? Math.min((spent / Number(b.amount)) * 100, 100) : 0;
            const over = pct >= Number(b.alert_threshold || 80);
            return (
              <Card key={b.id} className="animate-fade-in">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{(b.categories as any)?.icon || "📋"}</span>
                      <span className="font-medium">{(b.categories as any)?.name_he || "—"}</span>
                    </div>
                    {over && <AlertTriangle className="w-4 h-4 text-warning" />}
                  </div>
                  <Progress value={pct} className="h-2.5 mb-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatCurrency(spent)} / {formatCurrency(Number(b.amount))}
                    </span>
                    <span className={over ? "text-warning font-semibold" : "text-muted-foreground"}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
