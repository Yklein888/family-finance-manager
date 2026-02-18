import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Plus, Target } from "lucide-react";

export default function GoalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: goals = [] } = useQuery({
    queryKey: ["savings-goals"],
    queryFn: async () => {
      const { data } = await supabase.from("savings_goals").select("*").eq("is_active", true).order("created_at", { ascending: false });
      return data || [];
    },
  });

  const addGoal = useMutation({
    mutationFn: async (formData: FormData) => {
      const targetAmount = Number(formData.get("target"));
      const targetDate = formData.get("targetDate") as string;
      let monthlyTarget: number | null = null;
      if (targetDate) {
        const months = Math.max(1, (new Date(targetDate).getFullYear() - new Date().getFullYear()) * 12 + (new Date(targetDate).getMonth() - new Date().getMonth()));
        monthlyTarget = targetAmount / months;
      }
      const { error } = await supabase.from("savings_goals").insert({
        user_id: user!.id,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        target_amount: targetAmount,
        target_date: targetDate || null,
        icon: formData.get("icon") as string || "🎯",
        color: "#3B82F6",
        monthly_target: monthlyTarget,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
      setOpen(false);
      toast({ title: "יעד חדש נוסף ✅" });
    },
    onError: (err: any) => toast({ title: "שגיאה", description: err.message, variant: "destructive" }),
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n);

  const goalIcons = ["🎯", "🏠", "🚗", "✈️", "💒", "🎓", "💰", "🛡️", "👶", "📱"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">יעדי חיסכון</h1>
          <p className="text-muted-foreground text-sm">הגדר יעדים ועקוב אחרי ההתקדמות</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 ml-2" />יעד חדש</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader><DialogTitle>הוספת יעד חיסכון</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addGoal.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
              <div className="space-y-2">
                <Label>שם היעד</Label>
                <Input name="name" required placeholder="לדוגמה: חופשה משפחתית" />
              </div>
              <div className="space-y-2">
                <Label>תיאור</Label>
                <Input name="description" placeholder="פרטים נוספים" />
              </div>
              <div className="space-y-2">
                <Label>סכום יעד</Label>
                <Input name="target" type="number" required placeholder="0" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>תאריך יעד</Label>
                <Input name="targetDate" type="date" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>אייקון</Label>
                <div className="flex gap-2 flex-wrap">
                  {goalIcons.map((icon) => (
                    <label key={icon} className="cursor-pointer">
                      <input type="radio" name="icon" value={icon} className="sr-only peer" defaultChecked={icon === "🎯"} />
                      <span className="w-10 h-10 flex items-center justify-center rounded-lg text-lg border-2 border-transparent peer-checked:border-primary bg-muted">
                        {icon}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={addGoal.isPending}>
                {addGoal.isPending ? "שומר..." : "צור יעד"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg mb-1">אין יעדי חיסכון</p>
            <p className="text-sm">הגדר יעד ראשון כדי להתחיל לחסוך!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => {
            const pct = g.target_amount ? Math.min((Number(g.current_amount) / Number(g.target_amount)) * 100, 100) : 0;
            const remaining = Number(g.target_amount) - Number(g.current_amount);
            return (
              <Card key={g.id} className="animate-fade-in overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{g.icon || "🎯"}</span>
                    <div>
                      <h3 className="font-heading font-semibold">{g.name}</h3>
                      {g.description && <p className="text-xs text-muted-foreground">{g.description}</p>}
                    </div>
                  </div>
                  <Progress value={pct} className="h-3 mb-3" />
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold">{formatCurrency(Number(g.current_amount))}</span>
                    <span className="text-muted-foreground">{formatCurrency(Number(g.target_amount))}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{pct.toFixed(0)}% הושלם</span>
                    {g.target_date && (
                      <span>עד {new Date(g.target_date).toLocaleDateString("he-IL")}</span>
                    )}
                  </div>
                  {g.monthly_target && (
                    <p className="text-xs text-primary mt-2">
                      יעד חודשי: {formatCurrency(Number(g.monthly_target))}
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
