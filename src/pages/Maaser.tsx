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
import { Plus, Calculator, Heart } from "lucide-react";

export default function MaaserPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [payOpen, setPayOpen] = useState(false);

  // Get income transactions for current month
  const { data: income = [] } = useQuery({
    queryKey: ["income-for-maaser"],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("type", "income")
        .eq("is_maaser_relevant", true)
        .gte("transaction_date", startOfMonth.toISOString().split("T")[0]);
      return data || [];
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["maaser-payments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("maaser_payments")
        .select("*")
        .order("payment_date", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const { data: calculations = [] } = useQuery({
    queryKey: ["maaser-calculations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("maaser_calculations")
        .select("*")
        .order("calculation_date", { ascending: false })
        .limit(12);
      return data || [];
    },
  });

  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);
  const maaserDue = totalIncome * 0.1;
  const totalPaidThisMonth = payments
    .filter((p) => {
      const d = new Date(p.payment_date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, p) => s + Number(p.amount), 0);
  const maaserBalance = maaserDue - totalPaidThisMonth;
  const totalPaidAllTime = payments.reduce((s, p) => s + Number(p.amount), 0);

  const addPayment = useMutation({
    mutationFn: async (formData: FormData) => {
      const { error } = await supabase.from("maaser_payments").insert({
        user_id: user!.id,
        amount: Number(formData.get("amount")),
        payment_date: formData.get("date") as string,
        recipient: formData.get("recipient") as string,
        recipient_type: formData.get("type") as string,
        description: formData.get("description") as string,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maaser-payments"] });
      setPayOpen(false);
      toast({ title: "תשלום מעשר נרשם ✅" });
    },
    onError: (err: any) => toast({ title: "שגיאה", description: err.message, variant: "destructive" }),
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">מעשרות</h1>
          <p className="text-muted-foreground text-sm">חישוב ומעקב אחר מעשר כספים</p>
        </div>
        <Dialog open={payOpen} onOpenChange={setPayOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 ml-2" />רשום תשלום</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader><DialogTitle>רישום תשלום מעשר</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addPayment.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
              <div className="space-y-2">
                <Label>סכום</Label>
                <Input name="amount" type="number" step="0.01" required placeholder="0.00" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>מקבל</Label>
                <Input name="recipient" placeholder="שם המוסד/אדם" />
              </div>
              <div className="space-y-2">
                <Label>סוג</Label>
                <Select name="type" defaultValue="tzedaka">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tzedaka">צדקה</SelectItem>
                    <SelectItem value="institution">מוסד</SelectItem>
                    <SelectItem value="individual">אדם פרטי</SelectItem>
                    <SelectItem value="other">אחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>תאריך</Label>
                <Input name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>תיאור</Label>
                <Input name="description" placeholder="פרטים נוספים" />
              </div>
              <Button type="submit" className="w-full" disabled={addPayment.isPending}>
                {addPayment.isPending ? "שומר..." : "שמור תשלום"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">הכנסות החודש</p>
          <p className="text-xl font-heading font-bold">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">מעשר לתשלום (10%)</p>
          <p className="text-xl font-heading font-bold text-maaser">{formatCurrency(maaserDue)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">שולם החודש</p>
          <p className="text-xl font-heading font-bold text-income">{formatCurrency(totalPaidThisMonth)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">יתרה לתשלום</p>
          <p className={`text-xl font-heading font-bold ${maaserBalance > 0 ? "text-expense" : "text-income"}`}>
            {formatCurrency(maaserBalance)}
          </p>
        </div>
      </div>

      {/* Recent payments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-maaser" />
            היסטוריית תשלומים
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Calculator className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>אין תשלומי מעשר עדיין</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{p.recipient || "תרומה"}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.description} · {new Date(p.payment_date).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-maaser">{formatCurrency(Number(p.amount))}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
