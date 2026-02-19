import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DebtsLoansPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"debt" | "loan">("debt");
  
  const [form, setForm] = useState({
    name: "",
    type: "debt" as "debt" | "loan",
    original_amount: "",
    current_amount: "",
    interest_rate: "",
    monthly_payment: "",
    start_date: "",
    end_date: "",
    creditor_debtor: "",
    notes: "",
  });

  // Mock data for now - will be replaced with real Supabase data
  const mockDebtsLoans = [
    {
      id: "1",
      name: "הלוואת רכב",
      type: "debt",
      original_amount: 100000,
      current_amount: 65000,
      interest_rate: 3.5,
      monthly_payment: 2500,
      start_date: "2023-01-01",
      end_date: "2027-12-31",
      creditor_debtor: "בנק לאומי",
      status: "active"
    },
    {
      id: "2",
      name: "הלוואה לחבר",
      type: "loan",
      original_amount: 10000,
      current_amount: 4000,
      interest_rate: 0,
      monthly_payment: 500,
      start_date: "2024-06-01",
      end_date: "2025-09-30",
      creditor_debtor: "דוד כהן",
      status: "active"
    },
  ];

  const stats = {
    totalDebt: mockDebtsLoans
      .filter(d => d.type === "debt")
      .reduce((sum, d) => sum + d.current_amount, 0),
    totalLoan: mockDebtsLoans
      .filter(d => d.type === "loan")
      .reduce((sum, d) => sum + d.current_amount, 0),
    monthlyPayments: mockDebtsLoans
      .reduce((sum, d) => sum + d.monthly_payment, 0),
    activeCount: mockDebtsLoans.filter(d => d.status === "active").length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (current: number, original: number) => {
    const paid = original - current;
    return (paid / original) * 100;
  };

  const calculateMonthsLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const months = (end.getFullYear() - now.getFullYear()) * 12 + 
                   (end.getMonth() - now.getMonth());
    return Math.max(0, months);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">חובות והלוואות</h1>
          <p className="text-muted-foreground text-sm">מעקב אחר כל ההתחייבויות והזכויות הפיננסיות</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            הוסף חדש
          </Button>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalDebt)}
                </div>
                <div className="text-sm text-gray-600">סה"כ חובות</div>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalLoan)}
                </div>
                <div className="text-sm text-gray-600">סה"כ הלוואות</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.monthlyPayments)}
                </div>
                <div className="text-sm text-gray-600">תשלומים חודשיים</div>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.activeCount}
                </div>
                <div className="text-sm text-gray-600">פעילים</div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <TrendingDown className="w-5 h-5" />
            חובות ({mockDebtsLoans.filter(d => d.type === "debt").length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockDebtsLoans.filter(d => d.type === "debt").map((debt) => {
            const progress = calculateProgress(debt.current_amount, debt.original_amount);
            const monthsLeft = calculateMonthsLeft(debt.end_date);
            
            return (
              <div key={debt.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{debt.name}</h3>
                      <Badge variant="destructive">חוב</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {debt.creditor_debtor}
                    </p>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(debt.current_amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      מתוך {formatCurrency(debt.original_amount)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">התקדמות פירעון</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <div className="text-xs text-gray-500">תשלום חודשי</div>
                    <div className="font-medium">{formatCurrency(debt.monthly_payment)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">ריבית</div>
                    <div className="font-medium">{debt.interest_rate}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">חודשים נותרו</div>
                    <div className="font-medium">{monthsLeft}</div>
                  </div>
                </div>

                {monthsLeft <= 3 && monthsLeft > 0 && (
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    מתקרב מועד סיום - {monthsLeft} חודשים נותרו
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Loans Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <TrendingUp className="w-5 h-5" />
            הלוואות שנתתי ({mockDebtsLoans.filter(d => d.type === "loan").length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockDebtsLoans.filter(d => d.type === "loan").map((loan) => {
            const progress = calculateProgress(loan.current_amount, loan.original_amount);
            const monthsLeft = calculateMonthsLeft(loan.end_date);
            
            return (
              <div key={loan.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{loan.name}</h3>
                      <Badge className="bg-green-600">הלוואה</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {loan.creditor_debtor}
                    </p>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(loan.current_amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      מתוך {formatCurrency(loan.original_amount)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">הוחזר עד כה</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-green-100" />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <div className="text-xs text-gray-500">תשלום חודשי</div>
                    <div className="font-medium">{formatCurrency(loan.monthly_payment)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">ריבית</div>
                    <div className="font-medium">{loan.interest_rate}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">חודשים נותרו</div>
                    <div className="font-medium">{monthsLeft}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <DollarSign className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
            <div className="space-y-2 text-sm text-blue-900">
              <p className="font-medium">טיפים לניהול חובות:</p>
              <ul className="space-y-1 mr-4">
                <li>• שלם תמיד את המינימום בזמן למניעת ריבית פיגורים</li>
                <li>• העדף פירעון חובות עם ריבית גבוהה</li>
                <li>• שקול איחוד חובות לריבית נמוכה יותר</li>
                <li>• תכנן מראש תשלומים גדולים יותר בחודשים טובים</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
