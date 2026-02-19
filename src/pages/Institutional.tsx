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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingUp, Building2, Wallet, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES = {
  pension: { label: "קרן פנסיה", icon: "🏦", color: "bg-blue-100 text-blue-800" },
  provident: { label: "קופת גמל להשקעה", icon: "💰", color: "bg-green-100 text-green-800" },
  study_fund: { label: "קרן השתלמות", icon: "🎓", color: "bg-purple-100 text-purple-800" },
  managers_insurance: { label: "ביטוח מנהלים", icon: "🛡️", color: "bg-orange-100 text-orange-800" },
  continuing_education: { label: "השתלמות מתמשכת", icon: "📚", color: "bg-pink-100 text-pink-800" },
};

const EMPTY_FORM = {
  account_type: "pension",
  provider_name: "",
  account_number: "",
  policy_number: "",
  balance: "",
  monthly_deposit: "",
  employer_deposit: "",
  start_date: "",
};

export default function InstitutionalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["institutional-accounts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("institutional_accounts")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const addAccount = useMutation({
    mutationFn: async (formData: typeof form) => {
      const { error } = await supabase.from("institutional_accounts").insert({
        user_id: user!.id,
        account_type: formData.account_type,
        provider_name: formData.provider_name,
        account_number: formData.account_number || null,
        policy_number: formData.policy_number || null,
        balance: Number(formData.balance) || 0,
        monthly_deposit: Number(formData.monthly_deposit) || 0,
        employer_deposit: Number(formData.employer_deposit) || 0,
        start_date: formData.start_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutional-accounts"] });
      toast({ title: "✅ חשבון נוסף בהצלחה" });
      setOpen(false);
      setForm({ ...EMPTY_FORM });
    },
    onError: () => {
      toast({ title: "❌ שגיאה בהוספת חשבון", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount.mutate(form);
  };

  // Calculate totals
  const totals = accounts.reduce(
    (acc, a) => ({
      balance: acc.balance + (Number(a.balance) || 0),
      monthly: acc.monthly + (Number(a.monthly_deposit) || 0) + (Number(a.employer_deposit) || 0),
    }),
    { balance: 0, monthly: 0 }
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            חשבונות מוסדיים
          </h1>
          <p className="text-muted-foreground mt-1">
            פנסיה, קופות גמל, קרנות השתלמות וביטוח מנהלים
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              הוסף חשבון
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>הוספת חשבון מוסדי</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>סוג חשבון</Label>
                  <Select value={form.account_type} onValueChange={(v) => setForm({ ...form, account_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ACCOUNT_TYPES).map(([key, { label, icon }]) => (
                        <SelectItem key={key} value={key}>
                          {icon} {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>שם הספק</Label>
                  <Input value={form.provider_name} onChange={(e) => setForm({ ...form, provider_name: e.target.value })} placeholder="למשל: הראל, כלל, מגדל" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>מספר חשבון (אופציונלי)</Label>
                  <Input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>מספר פוליסה (אופציונלי)</Label>
                  <Input value={form.policy_number} onChange={(e) => setForm({ ...form, policy_number: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>יתרה נוכחית (₪)</Label>
                  <Input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>הפקדה חודשית - עובד (₪)</Label>
                  <Input type="number" value={form.monthly_deposit} onChange={(e) => setForm({ ...form, monthly_deposit: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>הפקדה חודשית - מעביד (₪)</Label>
                  <Input type="number" value={form.employer_deposit} onChange={(e) => setForm({ ...form, employer_deposit: e.target.value })} placeholder="0" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>תאריך תחילה (אופציונלי)</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  ביטול
                </Button>
                <Button type="submit" disabled={addAccount.isPending}>
                  {addAccount.isPending ? "שומר..." : "הוסף חשבון"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">סה"כ חיסכון</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{totals.balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">יתרה כוללת בכל החשבונות</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">הפקדות חודשיות</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{totals.monthly.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">עובד + מעביד</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">מספר חשבונות</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">חשבונות פעילים</p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      {isLoading ? (
        <div className="text-center py-12">טוען...</div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">אין חשבונות מוסדיים</h3>
            <p className="text-muted-foreground mb-4">התחל לנהל את החשבונות הפנסיוניים שלך</p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              הוסף חשבון ראשון
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const typeInfo = ACCOUNT_TYPES[account.account_type as keyof typeof ACCOUNT_TYPES];
            return (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className={cn("mb-2", typeInfo.color)}>
                        {typeInfo.icon} {typeInfo.label}
                      </Badge>
                      <CardTitle className="text-xl">{account.provider_name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold">₪{Number(account.balance).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">יתרה נוכחית</p>
                  </div>

                  {(account.monthly_deposit > 0 || account.employer_deposit > 0) && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-1">הפקדות חודשיות:</p>
                      {account.monthly_deposit > 0 && (
                        <p className="text-sm text-muted-foreground">
                          עובד: ₪{Number(account.monthly_deposit).toLocaleString()}
                        </p>
                      )}
                      {account.employer_deposit > 0 && (
                        <p className="text-sm text-muted-foreground">
                          מעביד: ₪{Number(account.employer_deposit).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {account.account_number && (
                    <p className="text-xs text-muted-foreground">
                      מספר חשבון: {account.account_number}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
