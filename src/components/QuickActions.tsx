import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Plus, Zap, Edit2, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  name: string;
  icon: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  description?: string;
}

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: "1",
    name: "קניה בסופר",
    icon: "🛒",
    category: "מזון - סופרמרקט",
    amount: 500,
    type: "expense",
    description: "קניה שבועית"
  },
  {
    id: "2",
    name: "תדלוק",
    icon: "⛽",
    category: "תחבורה - דלק",
    amount: 300,
    type: "expense",
    description: "מילוי טנק"
  },
  {
    id: "3",
    name: "משכורת",
    icon: "💼",
    category: "משכורת",
    amount: 15000,
    type: "income",
    description: "משכורת חודשית"
  },
  {
    id: "4",
    name: "קפה",
    icon: "☕",
    category: "מזון - קפה ומאפים",
    amount: 25,
    type: "expense",
    description: "קפה בוקר"
  },
  {
    id: "5",
    name: "חניה",
    icon: "🅿️",
    category: "תחבורה - חניה",
    amount: 50,
    type: "expense",
    description: "חניה שעתית"
  },
  {
    id: "6",
    name: "מסעדה",
    icon: "🍽️",
    category: "מזון - מסעדות",
    amount: 200,
    type: "expense",
    description: "ארוחה במסעדה"
  },
];

interface QuickActionsProps {
  onActionClick: (action: QuickAction) => void;
  savedActions?: QuickAction[];
}

export default function QuickActions({ 
  onActionClick, 
  savedActions = DEFAULT_QUICK_ACTIONS 
}: QuickActionsProps) {
  const [showAll, setShowAll] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const visibleActions = showAll ? savedActions : savedActions.slice(0, 6);

  const toggleSelect = (id: string) => {
    setSelectedActions(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-yellow-500" />
            פעולות מהירות
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {visibleActions.map((action) => (
            <button
              key={action.id}
              onClick={() => !editMode && onActionClick(action)}
              disabled={editMode}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all hover:shadow-md",
                "flex flex-col items-center gap-2 text-center",
                editMode && "opacity-50",
                !editMode && "hover:border-blue-500 hover:scale-105 active:scale-95",
                action.type === "income" && "border-green-200 hover:border-green-500",
                action.type === "expense" && "border-red-200 hover:border-red-500"
              )}
            >
              {editMode && (
                <div
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(action.id);
                  }}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center",
                      selectedActions.includes(action.id)
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-gray-300"
                    )}
                  >
                    {selectedActions.includes(action.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              )}

              <div className="text-3xl">{action.icon}</div>
              <div>
                <div className="font-medium text-sm">{action.name}</div>
                <div className="text-xs text-gray-500 mt-1">{action.category}</div>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  action.type === "income" && "bg-green-100 text-green-700",
                  action.type === "expense" && "bg-red-100 text-red-700"
                )}
              >
                {formatCurrency(action.amount)}
              </Badge>
            </button>
          ))}

          {/* Add New Action Button */}
          <button
            className={cn(
              "p-4 rounded-lg border-2 border-dashed border-gray-300",
              "flex flex-col items-center justify-center gap-2",
              "transition-all hover:border-blue-500 hover:bg-blue-50",
              "text-gray-400 hover:text-blue-600"
            )}
          >
            <Plus className="w-8 h-8" />
            <span className="text-sm font-medium">הוסף מועדף</span>
          </button>
        </div>

        {savedActions.length > 6 && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "הצג פחות" : `הצג עוד (${savedActions.length - 6})`}
            </Button>
          </div>
        )}

        {editMode && selectedActions.length > 0 && (
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setSelectedActions([])}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => {
                // Handle delete
                setSelectedActions([]);
                setEditMode(false);
              }}
            >
              <Trash2 className="w-4 h-4 ml-1" />
              מחק ({selectedActions.length})
            </Button>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2 text-sm text-blue-900">
            <Star className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>טיפ:</strong> לחץ על פעולה מהירה ליצירת תנועה מיידית עם הנתונים המוכנים.
              ניתן לערוך לפני השמירה.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini version for dashboard
export function QuickActionsMini({ onActionClick }: { onActionClick: (action: QuickAction) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {DEFAULT_QUICK_ACTIONS.slice(0, 4).map((action) => (
        <button
          key={action.id}
          onClick={() => onActionClick(action)}
          className="p-3 rounded-lg border hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center gap-1 hover:scale-105"
        >
          <span className="text-2xl">{action.icon}</span>
          <span className="text-xs font-medium text-center">{action.name}</span>
        </button>
      ))}
    </div>
  );
}
