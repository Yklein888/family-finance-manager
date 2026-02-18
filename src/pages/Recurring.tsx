import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw, Pencil, Trash2, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

const FREQ_LABELS: Record<string, string> = {
  daily: "יומי", weekly: "שבועי", "bi-weekly": "דו-שבועי", monthly: "חודשי",
  "bi-monthly": "דו-חודשי", quarterly: "רבעוני", yearly: "שנתי",
};

const EMPTY = { type: "expense", description: "", amount: "", frequency: "monthly",
  start_date: new Date().toISOString().split("T")[0], next_date: new Date().toISOString().split("T")[0],
  end_date: "", category_id: "", account_id: "", auto_create: true, reminder_days: "3" };

export default function RecurringPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [filterType, setFilterType] = useState("all");

  const { data: recurring = [], isLoading } = useQuery({
    queryKey: ["recurring"],
    queryFn: async () => {
      const { data } = await supabase.from("recurring_transactions")
        .select("*, categories(name_he, icon), accounts(name)")
        .order("next_date", { ascending: true });
      return data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => { const { data } = await supabase.from("categories").select("*").order("name_he"); return data || []; },
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => { const { data } = await supabase.from("accounts").select("*").eq("is_active", true); return data || []; },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        user_id: user!.id, type: form.type, description: form.description,
        amount: Number(form.amount), frequency: form.frequency,
        start_date: form.start_date, next_date: form.next_date || form.start_date,
        end_date: form.end_date || null, category_id: form.category_id || null,
        account_id: form.account_id || null, auto_create: form.auto_create,
        reminder_days: Number(form.reminder_days) || 3, is_active: true,
      };
      const { error } = editItem
        ? await supabase.from("recurring_transactions").update(payload).eq("id", editItem.id)
        : await supabase.from("recurring_transactions").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      setOpen(false); setEditItem(null); setForm({ ...EMPTY });
      toast({ title: editItem ? "עודכן ✅" : "נוסף ✅" });
    },
    onError: (err: any) => toast({ title: "שגיאה", description: err.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("recurring_transactions").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recurring_transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["recurring"] }); toast({ title: "נמחק" }); },
    onError: (err: any) => toast({ title: "שגיאה", description: err.message, variant: "destructive" }),
  });

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({ type: item.type, description: item.description || "", amount: String(item.amount),
      frequency: item.frequency, start_date: item.start_date, next_date: item.next_date,
      end_date: item.end_date || "", category_id: item.category_id || "", account_id: item.account_id || "",
      auto_create: item.auto_create ?? true, reminder_days: String(item.reminder_days || 3) });
    setOpen(true);
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n);

  const getDaysUntil = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    if (diff < 0) return "באיחור";
    if (diff === 0) return "היום";
    if (diff === 1) return "מחר";
    return `בעוד ${diff} ימים`;
  };

  const filtered = recurring.filter((r) => filterType === "all" || r.type === filterType);
  const activeCount = recurring.filter((r) => r.is_active).length;
  const monthlyTotal = recurring.filter((r) => r.is_active && r.type === "expense").reduce((s, r) => {
    const factor: Record<string, number> = { daily: 30, weekly: 4.3, "bi-weekly": 2.15, monthly: 1, "bi-monthly": 0.5, quarterly: 0.33, yearly: 0.083 };
    return s + Number(r.amount) * (factor[r.frequency] || 1);
  }, 0);
  const upcomingWeek = recurring.filter((r) => {
    if (!r.is_active) return false;
    const days = Math.ceil((new Date(r.next_date).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 7;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">תשלומים חוזרים</h1>
          <p className="text-muted-foreground text-sm">{activeCount} הוראות קבע פעילות</p>
        </div>
        <Button onClick={() => { setEditItem(null); setForm({ ...EMPTY }); setOpen(true); }}>
          <Plus className="w-4 h-4 ml-2" />הוסף תשלום חוזר
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">הוצאות חוזרות (חודשי)</p>
          <p className="text-xl font-heading font-bold text-expense">{formatCurrency(monthlyTotal)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">הוראות קבע פעילות</p>
          <p className="text-xl font-heading font-bold">{activeCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">תשלומים השבוע הקרוב</p>
          <p className="text-xl font-heading font-bold text-primary">{upcomingWeek.length}</p>
        </div>
      </div>

      {upcomingWeek.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-primary" />
              תשלומים קרובים — 7 ימים הקרובים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingWeek.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{(r.categories as any)?.icon || "🔄"}</span>
                  <div>
                    <p className="text-sm font-medium">{r.description}</p>
                    <p className="text-xs text-muted-foreground">{getDaysUntil(r.next_date)}</p>
                  </div>
                </div>
                <span className={cn("text-sm font-semibold", r.type === "income" ? "text-income" : "text-expense")}>
                  {r.type === "income" ? "+" : "-"}{formatCurrency(Number(r.amount))}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        {[["all", "הכל"], ["expense", "הוצאות"], ["income", "הכנסות"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilterType(val)}
            className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              filterType === val ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent")}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">טוען...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg mb-1">אין תשלומים חוזרים</p>
            <Button onClick={() => { setEditItem(null); setForm({ ...EMPTY }); setOpen(true); }} variant="outline" className="mt-3">
              <Plus className="w-4 h-4 ml-2" />הוסף ראשון
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id} className={cn("animate-fade-in", !r.is_active && "opacity-50")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">
                      {(r.categories as any)?.icon || "🔄"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold">{r.description || "ללא שם"}</p>
                        <Badge variant="secondary" className="text-xs">{FREQ_LABELS[r.frequency]}</Badge>
                        <Badge variant="outline" className={cn("text-xs", r.type === "income" ? "text-income border-income/30" : "text-expense border-expense/30")}>
                          {r.type === "income" ? "הכנסה" : "הוצאה"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        הבא: {new Date(r.next_date).toLocaleDateString("he-IL")} · {getDaysUntil(r.next_date)}
                        {(r.categories as any)?.name_he && ` · ${(r.categories as any).name_he}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-base font-bold", r.type === "income" ? "text-income" : "text-expense")}>
                      {r.type === "income" ? "+" : "-"}{formatCurrency(Number(r.amount))}
                    </span>
                    <Switch checked={r.is_active ?? true}
                      onCheckedChange={(checked) => toggleActive.mutate({ id: r.id, is_active: checked })} />
                    <button onClick={() => openEdit(r)}
                      className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm("למחוק?")) deleteMutation.mutate(r.id); }}
                      className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditItem(null); setForm({ ...EMPTY }); } }}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editItem ? "עריכת תשלום חוזר" : "הוספת תשלום חוזר"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="flex bg-muted rounded-lg p-1">
              {[["expense", "⬇️ הוצאה"], ["income", "⬆️ הכנסה"]].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setForm(f => ({ ...f, type: val }))}
                  className={cn("flex-1 py-2 rounded-md text-sm font-medium transition-colors",
                    form.type === val ? (val === "income" ? "bg-income text-white" : "bg-expense text-white") : "text-muted-foreground")}>
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>תיאור *</Label>
              <Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="שכר דירה, נטפליקס, ביטוח..." required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>סכום (₪) *</Label>
                <Input type="number" min="1" dir="ltr" value={form.amount}
                  onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label>תדירות</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm(f => ({ ...f, frequency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(FREQ_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>תאריך תחילה</Label>
                <Input type="date" dir="ltr" value={form.start_date}
                  onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value, next_date: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>תאריך סיום</Label>
                <Input type="date" dir="ltr" value={form.end_date}
                  onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>קטגוריה</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm(f => ({ ...f, category_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="בחר..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ללא</SelectItem>
                    {(categories as any[]).filter((c) => c.type === form.type).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name_he}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>חשבון</Label>
                <Select value={form.account_id} onValueChange={(v) => setForm(f => ({ ...f, account_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="בחר..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ללא</SelectItem>
                    {(accounts as any[]).map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">יצירה אוטומטית</p>
                <p className="text-xs text-muted-foreground">צור תנועה אוטומטית בתאריך</p>
              </div>
              <Switch checked={form.auto_create} onCheckedChange={(v) => setForm(f => ({ ...f, auto_create: v }))} />
            </div>
            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "שומר..." : editItem ? "שמור שינויים" : "הוסף תשלום חוזר"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
