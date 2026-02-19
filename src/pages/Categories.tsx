import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Folder, TrendingUp, TrendingDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_OPTIONS = [
  "🏠", "🛒", "🚗", "⚕️", "👶", "👔", "✡️", "🎭", "💇", "🛡️", "📦",
  "💼", "📚", "🍽️", "☕", "🎬", "🏋️", "✈️", "💊", "🦷", "👓",
  "🏫", "⚽", "👕", "🧸", "🍼", "👗", "👞", "👜", "💝", "🤲",
  "📖", "🕍", "🕯️", "⛽", "🅿️", "🚌", "🚕", "🔧", "📋", "⚖️",
  "💡", "💧", "🔥", "🌐", "📱", "📺", "🏡", "🏢", "🏛️", "🏪",
  "🥬", "🍖", "🍞", "🛵", "📈", "🏦", "🎁", "💄", "🧴", "💈",
];

const COLOR_OPTIONS = [
  { value: "#3B82F6", label: "כחול" },
  { value: "#10B981", label: "ירוק" },
  { value: "#EF4444", label: "אדום" },
  { value: "#F59E0B", label: "כתום" },
  { value: "#8B5CF6", label: "סגול" },
  { value: "#EC4899", label: "ורוד" },
  { value: "#06B6D4", label: "טורקיז" },
  { value: "#14B8A6", label: "ירוק ים" },
];

export default function CategoriesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  const [form, setForm] = useState({
    name_he: "",
    name_en: "",
    type: "expense" as "income" | "expense",
    icon: "📦",
    color: "#3B82F6",
    parent_id: null as string | null,
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name_he");
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editingId) {
        const { error } = await supabase
          .from("categories")
          .update(data)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("categories")
          .insert({ ...data, user_id: user?.id, is_system: false });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: editingId ? "✅ הקטגוריה עודכנה" : "✅ הקטגוריה נוצרה",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לשמור את הקטגוריה",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "✅ הקטגוריה נמחקה" });
    },
  });

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({
      name_he: cat.name_he,
      name_en: cat.name_en,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
      parent_id: cat.parent_id,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm({
      name_he: "",
      name_en: "",
      type: "expense",
      icon: "📦",
      color: "#3B82F6",
      parent_id: null,
    });
  };

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name_he.toLowerCase().includes(search.toLowerCase()) ||
                         cat.name_en.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || cat.type === filterType;
    return matchesSearch && matchesType;
  });

  const parentCategories = categories.filter((c) => !c.parent_id);
  const getChildCategories = (parentId: string) => 
    categories.filter((c) => c.parent_id === parentId);

  const stats = {
    total: categories.length,
    income: categories.filter((c) => c.type === "income").length,
    expense: categories.filter((c) => c.type === "expense").length,
    system: categories.filter((c) => c.is_system).length,
    user: categories.filter((c) => !c.is_system).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">קטגוריות</h1>
          <p className="text-muted-foreground text-sm">ניהול וארגון קטגוריות</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingId(null)}>
              <Plus className="w-4 h-4 ml-2" />
              קטגוריה חדשה
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "עריכת קטגוריה" : "קטגוריה חדשה"}
              </DialogTitle>
              <DialogDescription>
                הגדר קטגוריה לסיווג תנועות
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(form);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>שם בעברית *</Label>
                <Input
                  value={form.name_he}
                  onChange={(e) => setForm({ ...form, name_he: e.target.value })}
                  placeholder="מזון"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>שם באנגלית</Label>
                <Input
                  value={form.name_en}
                  onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                  placeholder="Food"
                />
              </div>
              <div className="space-y-2">
                <Label>סוג *</Label>
                <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        הכנסה
                      </div>
                    </SelectItem>
                    <SelectItem value="expense">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        הוצאה
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>אייקון</Label>
                <div className="grid grid-cols-8 gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      className={cn(
                        "p-2 text-2xl rounded hover:bg-gray-100 transition-colors",
                        form.icon === icon && "bg-blue-100 ring-2 ring-blue-500"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>צבע</Label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setForm({ ...form, color: color.value })}
                      className={cn(
                        "w-8 h-8 rounded-full transition-transform hover:scale-110",
                        form.color === color.value && "ring-2 ring-offset-2 ring-blue-500"
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>קטגוריית אב</Label>
                <Select
                  value={form.parent_id || "none"}
                  onValueChange={(v) => setForm({ ...form, parent_id: v === "none" ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ללא (קטגוריה ראשית)</SelectItem>
                    {parentCategories
                      .filter((c) => c.type === form.type && c.id !== editingId)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name_he}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  ביטול
                </Button>
                <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                  {saveMutation.isPending ? "שומר..." : "שמור"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">סה"כ קטגוריות</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.income}</div>
            <div className="text-sm text-gray-600">הכנסות</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.expense}</div>
            <div className="text-sm text-gray-600">הוצאות</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.system}</div>
            <div className="text-sm text-gray-600">מערכת</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{stats.user}</div>
            <div className="text-sm text-gray-600">שלי</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="חיפוש קטגוריה..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="income">הכנסות</SelectItem>
                <SelectItem value="expense">הוצאות</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Categories */}
        {(filterType === "all" || filterType === "income") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                הכנסות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {parentCategories
                .filter((c) => c.type === "income")
                .filter((c) =>
                  c.name_he.toLowerCase().includes(search.toLowerCase()) ||
                  c.name_en.toLowerCase().includes(search.toLowerCase())
                )
                .map((parent) => {
                  const children = getChildCategories(parent.id);
                  return (
                    <div key={parent.id} className="space-y-1">
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{parent.icon}</span>
                          <div>
                            <div className="font-medium">{parent.name_he}</div>
                            {parent.name_en && (
                              <div className="text-xs text-gray-500">{parent.name_en}</div>
                            )}
                          </div>
                          {parent.is_system && (
                            <Badge variant="secondary" className="text-xs">מערכת</Badge>
                          )}
                        </div>
                        {!parent.is_system && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(parent)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(parent.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {children.length > 0 && (
                        <div className="mr-8 space-y-1">
                          {children.map((child) => (
                            <div
                              key={child.id}
                              className="flex items-center justify-between p-2 border border-dashed rounded hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{child.icon}</span>
                                <span className="text-sm">{child.name_he}</span>
                              </div>
                              {!child.is_system && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(child)}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteMutation.mutate(child.id)}
                                  >
                                    <Trash2 className="w-3 h-3 text-red-600" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}

        {/* Expense Categories */}
        {(filterType === "all" || filterType === "expense") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                הוצאות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {parentCategories
                .filter((c) => c.type === "expense")
                .filter((c) =>
                  c.name_he.toLowerCase().includes(search.toLowerCase()) ||
                  c.name_en.toLowerCase().includes(search.toLowerCase())
                )
                .map((parent) => {
                  const children = getChildCategories(parent.id);
                  return (
                    <div key={parent.id} className="space-y-1">
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{parent.icon}</span>
                          <div>
                            <div className="font-medium">{parent.name_he}</div>
                            {parent.name_en && (
                              <div className="text-xs text-gray-500">{parent.name_en}</div>
                            )}
                          </div>
                          {parent.is_system && (
                            <Badge variant="secondary" className="text-xs">מערכת</Badge>
                          )}
                        </div>
                        {!parent.is_system && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(parent)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(parent.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {children.length > 0 && (
                        <div className="mr-8 space-y-1">
                          {children.map((child) => (
                            <div
                              key={child.id}
                              className="flex items-center justify-between p-2 border border-dashed rounded hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{child.icon}</span>
                                <span className="text-sm">{child.name_he}</span>
                              </div>
                              {!child.is_system && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(child)}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteMutation.mutate(child.id)}
                                  >
                                    <Trash2 className="w-3 h-3 text-red-600" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
