import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonData {
  current: number;
  previous: number;
  label: string;
}

interface ComparisonCardProps {
  title: string;
  icon?: React.ReactNode;
  comparisons: ComparisonData[];
  type?: "income" | "expense" | "neutral";
}

export default function ComparisonCard({ 
  title, 
  icon, 
  comparisons, 
  type = "neutral" 
}: ComparisonCardProps) {
  
  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4" />;
    if (change < 0) return <ArrowDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getChangeColor = (change: number, type: string) => {
    if (change === 0) return "text-gray-500";
    
    if (type === "income") {
      return change > 0 ? "text-green-600" : "text-red-600";
    }
    if (type === "expense") {
      return change > 0 ? "text-red-600" : "text-green-600";
    }
    return change > 0 ? "text-green-600" : "text-red-600";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comparisons.map((comp, idx) => {
          const change = comp.current - comp.previous;
          const changePercent = getChangePercentage(comp.current, comp.previous);
          const isPositive = change > 0;
          const isNegative = change < 0;

          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{comp.label}</span>
                <Badge
                  variant={change === 0 ? "secondary" : "outline"}
                  className={cn(
                    "gap-1",
                    getChangeColor(change, type)
                  )}
                >
                  {getChangeIcon(change)}
                  {Math.abs(changePercent).toFixed(1)}%
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">חודש נוכחי</div>
                  <div className="font-semibold text-lg">
                    {formatCurrency(comp.current)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">חודש קודם</div>
                  <div className="font-medium text-gray-600">
                    {formatCurrency(comp.previous)}
                  </div>
                </div>
              </div>

              {change !== 0 && (
                <div
                  className={cn(
                    "text-xs p-2 rounded-lg flex items-start gap-2",
                    isPositive && type === "income" && "bg-green-50 text-green-700",
                    isPositive && type === "expense" && "bg-red-50 text-red-700",
                    isNegative && type === "income" && "bg-red-50 text-red-700",
                    isNegative && type === "expense" && "bg-green-50 text-green-700",
                    type === "neutral" && isPositive && "bg-green-50 text-green-700",
                    type === "neutral" && isNegative && "bg-red-50 text-red-700"
                  )}
                >
                  {isPositive && type === "income" && (
                    <TrendingUp className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  {isPositive && type === "expense" && (
                    <TrendingUp className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  {isNegative && (
                    <TrendingDown className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>
                    {isPositive && type === "income" && `עלייה של ${formatCurrency(Math.abs(change))} - כל הכבוד! 🎉`}
                    {isPositive && type === "expense" && `עלייה של ${formatCurrency(Math.abs(change))} - שימו לב 👀`}
                    {isNegative && type === "income" && `ירידה של ${formatCurrency(Math.abs(change))} - כדאי לבדוק 🔍`}
                    {isNegative && type === "expense" && `חיסכון של ${formatCurrency(Math.abs(change))} - מצוין! 💪`}
                    {type === "neutral" && isPositive && `עלייה של ${formatCurrency(Math.abs(change))}`}
                    {type === "neutral" && isNegative && `ירידה של ${formatCurrency(Math.abs(change))}`}
                  </span>
                </div>
              )}

              {idx < comparisons.length - 1 && <div className="border-t" />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Quick comparison component for dashboard
export function QuickComparison({ 
  current, 
  previous, 
  label,
  type = "neutral" 
}: ComparisonData & { type?: "income" | "expense" | "neutral" }) {
  const change = current - previous;
  const changePercent = previous === 0 ? 0 : ((current - previous) / previous) * 100;
  const isPositive = change > 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{label}</span>
      {change !== 0 && (
        <Badge
          variant="secondary"
          className={cn(
            "gap-1 text-xs",
            isPositive && type === "income" && "bg-green-100 text-green-700",
            isPositive && type === "expense" && "bg-red-100 text-red-700",
            !isPositive && type === "income" && "bg-red-100 text-red-700",
            !isPositive && type === "expense" && "bg-green-100 text-green-700"
          )}
        >
          {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(changePercent).toFixed(0)}%
        </Badge>
      )}
    </div>
  );
}
