import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdvancedSearchFilters {
  query: string;
  type: "all" | "income" | "expense";
  category: string;
  minAmount: string;
  maxAmount: string;
  dateFrom: string;
  dateTo: string;
  tags: string[];
  merchant: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: AdvancedSearchFilters) => void;
  categories?: any[];
  availableTags?: string[];
}

export default function AdvancedSearch({ onSearch, categories = [], availableTags = [] }: AdvancedSearchProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    query: "",
    type: "all",
    category: "all",
    minAmount: "",
    maxAmount: "",
    dateFrom: "",
    dateTo: "",
    tags: [],
    merchant: "",
  });

  const handleSearch = () => {
    onSearch(filters);
    setOpen(false);
  };

  const handleReset = () => {
    const resetFilters = {
      query: "",
      type: "all" as const,
      category: "all",
      minAmount: "",
      maxAmount: "",
      dateFrom: "",
      dateTo: "",
      tags: [],
      merchant: "",
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const toggleTag = (tag: string) => {
    setFilters({
      ...filters,
      tags: filters.tags.includes(tag)
        ? filters.tags.filter((t) => t !== tag)
        : [...filters.tags, tag],
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "type" || key === "category") return value !== "all";
    if (key === "tags") return value.length > 0;
    return value !== "";
  }).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 ml-2" />
          חיפוש מתקדם
          {activeFiltersCount > 0 && (
            <Badge className="absolute -top-2 -left-2 w-5 h-5 p-0 flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            חיפוש מתקדם
          </DialogTitle>
          <DialogDescription>
            סנן תנועות לפי קריטריונים מתקדמים
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* חיפוש חופשי */}
          <div className="space-y-2">
            <Label>חיפוש חופשי</Label>
            <div className="relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="חפש בתיאור, הערות או סוחר..."
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                className="pr-10"
              />
            </div>
          </div>

          {/* סוג + קטגוריה */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>סוג</Label>
              <Select value={filters.type} onValueChange={(v: any) => setFilters({ ...filters, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">הכל</SelectItem>
                  <SelectItem value="income">הכנסות</SelectItem>
                  <SelectItem value="expense">הוצאות</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>קטגוריה</Label>
              <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הקטגוריות</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name_he}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* טווח סכום */}
          <div className="space-y-2">
            <Label>טווח סכום (₪)</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="מינימום"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                dir="ltr"
              />
              <Input
                type="number"
                placeholder="מקסימום"
                value={filters.maxAmount}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                dir="ltr"
              />
            </div>
          </div>

          {/* טווח תאריכים */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              טווח תאריכים
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">מתאריך</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">עד תאריך</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* סוחר */}
          <div className="space-y-2">
            <Label>סוחר</Label>
            <Input
              placeholder='לדוגמה: "רמי לוי", "סופר פארם"...'
              value={filters.merchant}
              onChange={(e) => setFilters({ ...filters, merchant: e.target.value })}
            />
          </div>

          {/* תגיות */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <Label>תגיות</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      filters.tags.includes(tag) && "bg-blue-600"
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    {filters.tags.includes(tag) && <X className="w-3 h-3 mr-1" />}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* פילטרים פעילים */}
          {activeFiltersCount > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  {activeFiltersCount} פילטרים פעילים
                </span>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <X className="w-4 h-4 ml-1" />
                  איפוס הכל
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.query && (
                  <Badge variant="secondary">חיפוש: "{filters.query}"</Badge>
                )}
                {filters.type !== "all" && (
                  <Badge variant="secondary">
                    {filters.type === "income" ? "הכנסות" : "הוצאות"}
                  </Badge>
                )}
                {filters.minAmount && (
                  <Badge variant="secondary">מינימום: ₪{filters.minAmount}</Badge>
                )}
                {filters.maxAmount && (
                  <Badge variant="secondary">מקסימום: ₪{filters.maxAmount}</Badge>
                )}
                {filters.dateFrom && (
                  <Badge variant="secondary">מ-{filters.dateFrom}</Badge>
                )}
                {filters.dateTo && (
                  <Badge variant="secondary">עד-{filters.dateTo}</Badge>
                )}
                {filters.merchant && (
                  <Badge variant="secondary">סוחר: {filters.merchant}</Badge>
                )}
                {filters.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    🏷️ {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* כפתורים */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              איפוס
            </Button>
            <Button onClick={handleSearch} className="flex-1">
              <Search className="w-4 h-4 ml-2" />
              חפש
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
