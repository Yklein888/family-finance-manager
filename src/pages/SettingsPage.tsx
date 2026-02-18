import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Settings, Calculator, Bell, Shield, Database, User } from "lucide-react";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("user_settings").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const [maaserPct, setMaaserPct] = useState<number>(settings?.maaser_percentage ?? 10);
  const [maaserMethod, setMaaserMethod] = useState(settings?.maaser_calculation_method ?? "gross");
  const [budgetAlert, setBudgetAlert] = useState(settings?.budget_alert_enabled ?? true);
  const [alertThreshold, setAlertThreshold] = useState<number>(settings?.budget_alert_threshold ?? 80);
  const [autoCategorize, setAutoCategorize] = useState(settings?.auto_categorize ?? true);
  const [currency, setCurrency] = useState(settings?.currency ?? "ILS");

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        user_id: user!.id,
        maaser_percentage: maaserPct,
        maaser_calculation_method: maaserMethod,
        budget_alert_enabled: budgetAlert,
        budget_alert_threshold: alertThreshold,
        auto_categorize: autoCategorize,
        currency,
        updated_at: new Date().toISOString(),
      };
      if (settings) {
        const { error } = await supabase.from("user_settings").update(payload).eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_settings").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      toast({ title: "הגדרות נשמרו ✅" });
    },
    onError: (err: any) => toast({ title: "שגיאה", description: err.message, variant: "destructive" }),
  });

  const handleExport = async () => {
    const { data: transactions } = await supabase.from("transactions").select("*").eq("user_id", user!.id);
    if (!transactions) return;
    const csv = [
      Object.keys(transactions[0] || {}).join(","),
      ...transactions.map((t) => Object.values(t).map((v) => `"${v ?? ""}"`).join(","))
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "transactions.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "הנתונים יוצאו בהצלחה ✅" });
  };

  if (isLoading) return <div className="text-center py-20 text-muted-foreground">טוען...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">הגדרות</h1>
        <p className="text-muted-foreground text-sm">התאמה אישית של המערכת</p>
      </div>

      <Tabs defaultValue="maaser" dir="rtl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="maaser" className="flex items-center gap-1.5 text-xs">
            <Calculator className="w-3.5 h-3.5" />מעשר
          </TabsTrigger>
          <TabsTrigger value="budgets" className="flex items-center gap-1.5 text-xs">
            <Bell className="w-3.5 h-3.5" />תקציבים
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-1.5 text-xs">
            <Settings className="w-3.5 h-3.5" />כללי
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-1.5 text-xs">
            <User className="w-3.5 h-3.5" />חשבון
          </TabsTrigger>
        </TabsList>

        {/* Maaser Settings */}
        <TabsContent value="maaser" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">הגדרות מעשר</CardTitle>
              <CardDescription>התאם את חישוב המעשר לפי הלכה</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>אחוז מעשר: {maaserPct}%</Label>
                <Slider
                  value={[maaserPct]}
                  onValueChange={([v]) => setMaaserPct(v)}
                  min={5} max={20} step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5% (מעשר עני)</span>
                  <span>10% (מעשר ממון)</span>
                  <span>20% (חומש)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>שיטת חישוב</Label>
                <Select value={maaserMethod} onValueChange={setMaaserMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gross">ברוטו — לפני ניכויים</SelectItem>
                    <SelectItem value="net">נטו — אחרי מסים</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {maaserMethod === "gross"
                    ? "חישוב לפי כלל ההכנסות ברוטו — השיטה המקובלת"
                    : "חישוב לפי הכנסה נטו בלבד — מומלץ להתייעץ עם רב"}
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  <strong>הערה:</strong> לשאלות הלכתיות פרטניות מומלץ להתייעץ עם רב מוסמך.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Settings */}
        <TabsContent value="budgets" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">הגדרות תקציב</CardTitle>
              <CardDescription>ניהול התראות ומעקב תקציב</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">התראות תקציב</p>
                  <p className="text-xs text-muted-foreground">קבל התראה כשמתקרב לגבול התקציב</p>
                </div>
                <Switch checked={budgetAlert} onCheckedChange={setBudgetAlert} />
              </div>

              {budgetAlert && (
                <div className="space-y-3">
                  <Label>סף התראה: {alertThreshold}%</Label>
                  <Slider
                    value={[alertThreshold]}
                    onValueChange={([v]) => setAlertThreshold(v)}
                    min={50} max={100} step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    תקבל התראה כשהוצאת {alertThreshold}% מהתקציב החודשי
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">קטגוריזציה אוטומטית</p>
                  <p className="text-xs text-muted-foreground">זהה קטגוריה אוטומטית לפי שם הסוחר</p>
                </div>
                <Switch checked={autoCategorize} onCheckedChange={setAutoCategorize} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">הגדרות כלליות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>מטבע ברירת מחדל</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ILS">₪ שקל חדש (ILS)</SelectItem>
                    <SelectItem value="USD">$ דולר אמריקאי (USD)</SelectItem>
                    <SelectItem value="EUR">€ אירו (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4" />
                גיבוי ונתונים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="text-sm font-medium">ייצוא נתונים</p>
                  <p className="text-xs text-muted-foreground">הורד את כל התנועות כקובץ CSV</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  ייצוא CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                פרטי חשבון
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>אימייל</Label>
                <Input value={user?.email || ""} disabled className="bg-muted" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>מזהה משתמש</Label>
                <Input value={user?.id || ""} disabled className="bg-muted text-xs" dir="ltr" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <Shield className="w-4 h-4" />
                אבטחה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={signOut} className="w-full">
                התנתקות מהמערכת
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full max-w-xs">
        {saveMutation.isPending ? "שומר..." : "שמור הגדרות"}
      </Button>
    </div>
  );
}
