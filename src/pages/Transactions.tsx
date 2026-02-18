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
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter, ArrowUpDown } from "lucide-react";

export default function TransactionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", filterType],
    queryFn: async () => {
      let q = supabase
        .from("transactions")
        .select("*, categories(name_he, icon, color)")
        .order("transaction_date", { ascending: false })
        .limit(100);
      if (filterType !== "all") q = q.eq("type", filterType);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name_he");
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

  const addTransaction = useMutation({
    mutationFn: async (formData: FormData) => {
      const { error } = await supabase.from("transactions").insert({
        user_id: user!.id,
        amount: Number(formData.get("amount")),
        type: formData.get("type") as string,
        description: formData.get("description") as string,
        merchant_name: formData.get("merchant") as string,
        transaction_date: formData.get("date") as string,
        category_id: formData.get("category") as string || null,
        account_id: formData.get("account") as string || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-summary"] });
      setOpen(false);
      toast({ title: "התנועה נוספה בהצלחה ✅" });
    },
    onError: (err: any) => toast({ title: "שגיאה", description: err.message, variant: "destructive" }),
  });

  const filtered = transactions.filter(
    (t) =>
      !search ||
      t.description?.includes(search) ||
      t.merchant_name?.includes(search) ||
      (t.categories as any)?.name_he?.includes(search)
  );

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">תנועות</h1>
          <p className="text-muted-foreground text-sm">ניהול הכנסות והוצאות</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 ml-2" />תנועה חדשה</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>הוספת תנועה</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addTransaction.mutate(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>סוג</Label>
                  <Select name="type" defaultValue="expense">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">הוצאה</SelectItem>
                      <SelectItem value="income">הכנסה</SelectItem>
                      <SelectItem value="transfer">העברה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>סכום</Label>
                  <Input name="amount" type="number" step="0.01" required placeholder="0.00" dir="ltr" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>תיאור</Label>
                <Input name="description" placeholder="תיאור התנועה" />
              </div>
              <div className="space-y-2">
                <Label>שם סוחר</Label>
                <Input name="merchant" placeholder="שם העסק" />
              </div>
              <div className="space-y-2">
                <Label>תאריך</Label>
                <Input name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>קטגוריה</Label>
                <Select name="category">
                  <SelectTrigger><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon} {c.name_he}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {accounts.length > 0 && (
                <div className="space-y-2">
                  <Label>חשבון</Label>
                  <Select name="account">
                    <SelectTrigger><SelectValue placeholder="בחר חשבון" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={addTransaction.isPending}>
                {addTransaction.isPending ? "שומר..." : "שמור תנועה"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש תנועות..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="income">הכנסות</SelectItem>
            <SelectItem value="expense">הוצאות</SelectItem>
            <SelectItem value="transfer">העברות</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">טוען...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p className="text-lg mb-2">אין תנועות</p>
              <p className="text-sm">הוסף את התנועה הראשונה שלך</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">תאריך</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">תיאור</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">קטגוריה</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">סכום</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(t.transaction_date).toLocaleDateString("he-IL")}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{t.description || t.merchant_name || "—"}</p>
                          {t.merchant_name && t.description && (
                            <p className="text-xs text-muted-foreground">{t.merchant_name}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          {(t.categories as any)?.icon} {(t.categories as any)?.name_he || "—"}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-semibold ${t.type === "income" ? "text-income" : "text-expense"}`}>
                        {t.type === "income" ? "+" : "-"}{formatCurrency(Number(t.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
