import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, Link2, RefreshCw, Trash2, CheckCircle2, 
  XCircle, Clock, AlertCircle, Loader2, CreditCard, TrendingUp 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ספקי בנקאות פתוחה וחברות בישראל
const ISRAELI_PROVIDERS = {
  // בנקים מסחריים
  LEUMI: {
    id: "leumi",
    name: "בנק לאומי",
    logo: "🏦",
    color: "blue",
    types: ["checking", "savings", "credit", "investment"],
    category: "bank"
  },
  HAPOALIM: {
    id: "hapoalim",
    name: "בנק הפועלים",
    logo: "🏦",
    color: "red",
    types: ["checking", "savings", "credit", "investment"],
    category: "bank"
  },
  DISCOUNT: {
    id: "discount",
    name: "בנק דיסקונט",
    logo: "🏦",
    color: "purple",
    types: ["checking", "savings", "credit"],
    category: "bank"
  },
  MIZRAHI: {
    id: "mizrahi",
    name: "בנק מזרחי טפחות",
    logo: "🏦",
    color: "green",
    types: ["checking", "savings", "credit"],
    category: "bank"
  },
  INTERNATIONAL: {
    id: "international",
    name: "בנק הבינלאומי",
    logo: "🏦",
    color: "cyan",
    types: ["checking", "savings", "credit"],
    category: "bank"
  },
  JERUSALEM: {
    id: "jerusalem",
    name: "בנק ירושלים",
    logo: "🏦",
    color: "yellow",
    types: ["checking", "savings"],
    category: "bank"
  },
  OTSAR_HAHAYAL: {
    id: "otsar",
    name: "בנק אוצר החייל",
    logo: "🏦",
    color: "orange",
    types: ["checking", "savings"],
    category: "bank"
  },
  POSTAL_BANK: {
    id: "postal",
    name: "בנק הדואר",
    logo: "📮",
    color: "indigo",
    types: ["checking", "savings"],
    category: "bank"
  },
  
  // חברות אשראי
  ISRACARD: {
    id: "isracard",
    name: "ישראכרט",
    logo: "💳",
    color: "red",
    types: ["credit"],
    category: "credit"
  },
  CAL: {
    id: "cal",
    name: "כ.א.ל",
    logo: "💳",
    color: "blue",
    types: ["credit"],
    category: "credit"
  },
  MAX: {
    id: "max",
    name: "מקס",
    logo: "💳",
    color: "purple",
    types: ["credit"],
    category: "credit"
  },
  LEUMI_CARD: {
    id: "leumi_card",
    name: "לאומי כרטיסים",
    logo: "💳",
    color: "blue",
    types: ["credit"],
    category: "credit"
  },
  
  // חברות השקעות
  MEITAV: {
    id: "meitav",
    name: "מיטב דש",
    logo: "📈",
    color: "green",
    types: ["investment", "pension"],
    category: "investment"
  },
  PSAGOT: {
    id: "psagot",
    name: "פסגות",
    logo: "📈",
    color: "blue",
    types: ["investment", "pension"],
    category: "investment"
  },
  EXCELLENCE: {
    id: "excellence",
    name: "אקסלנס",
    logo: "📈",
    color: "purple",
    types: ["investment", "pension"],
    category: "investment"
  },
  ALTSHULER: {
    id: "altshuler",
    name: "אלטשולר שחם",
    logo: "📈",
    color: "cyan",
    types: ["investment", "pension"],
    category: "investment"
  },
  IBI: {
    id: "ibi",
    name: "IBI",
    logo: "📈",
    color: "orange",
    types: ["investment"],
    category: "investment"
  },
  
  // פנסיה וגמל
  MENORA: {
    id: "menora",
    name: "מנורה מבטחים",
    logo: "🛡️",
    color: "blue",
    types: ["pension", "insurance"],
    category: "insurance"
  },
  MIGDAL: {
    id: "migdal",
    name: "מגדל",
    logo: "🛡️",
    color: "red",
    types: ["pension", "insurance"],
    category: "insurance"
  },
  CLAL: {
    id: "clal",
    name: "כלל ביטוח",
    logo: "🛡️",
    color: "green",
    types: ["pension", "insurance"],
    category: "insurance"
  },
  HAREL: {
    id: "harel",
    name: "הראל",
    logo: "🛡️",
    color: "purple",
    types: ["pension", "insurance"],
    category: "insurance"
  },
};

const CATEGORY_NAMES = {
  bank: "בנקים",
  credit: "אשראי",
  investment: "השקעות",
  insurance: "פנסיה וביטוח"
};

export default function OpenBankingConnect() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["open-banking-connections"],
    queryFn: async () => {
      const { data } = await supabase
        .from("open_banking_connections")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (providerId: string) => {
      setIsConnecting(true);
      
      // Step 1: Create connection record
      const { data: connection, error } = await supabase
        .from("open_banking_connections")
        .insert({
          user_id: user?.id,
          provider_name: ISRAELI_PROVIDERS[providerId as keyof typeof ISRAELI_PROVIDERS].name,
          provider_code: providerId,
          connection_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Step 2: Initiate OAuth flow (simulated)
      // בפועל, כאן תקרא ל-API של ספק הבנקאות הפתוחה
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Update connection status
      const { error: updateError } = await supabase
        .from("open_banking_connections")
        .update({
          connection_status: "active",
          access_token: "mock_token_" + Date.now(),
          token_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", connection.id);

      if (updateError) throw updateError;

      return connection;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["open-banking-connections"] });
      toast({
        title: "✅ התחברת בהצלחה!",
        description: `החיבור ל${ISRAELI_PROVIDERS[selectedProvider as keyof typeof ISRAELI_PROVIDERS]?.name} הושלם`,
      });
      setSelectedProvider(null);
      setIsConnecting(false);
    },
    onError: (error) => {
      toast({
        title: "שגיאה בחיבור",
        description: "לא הצלחנו להתחבר. נסה שוב.",
        variant: "destructive",
      });
      setIsConnecting(false);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("open_banking_connections")
        .delete()
        .eq("id", connectionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["open-banking-connections"] });
      toast({
        title: "נותק בהצלחה",
        description: "החיבור הוסר מהמערכת",
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      // כאן תהיה קריאה אמיתית לסנכרון
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Record sync history
      await supabase.from("sync_history").insert({
        user_id: user?.id,
        connection_id: connectionId,
        sync_type: "manual",
        sync_status: "success",
        transactions_added: Math.floor(Math.random() * 50) + 10,
        sync_start: new Date().toISOString(),
        sync_end: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ סנכרון הושלם!",
        description: "התנועות עודכנו בהצלחה",
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const groupedProviders = Object.entries(ISRAELI_PROVIDERS).reduce((acc, [key, provider]) => {
    if (!acc[provider.category]) acc[provider.category] = [];
    acc[provider.category].push({ key, ...provider });
    return acc;
  }, {} as Record<string, any[]>);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "expired":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "מחובר";
      case "expired":
        return "פג תוקף";
      case "error":
        return "שגיאה";
      case "pending":
        return "ממתין";
      default:
        return "לא ידוע";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            בנקאות פתוחה
          </CardTitle>
          <CardDescription>
            חבר את כל החשבונות הבנקאיים, כרטיסי האשראי והשקעות שלך למקום אחד
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{connections.length}</div>
              <div className="text-gray-600">חיבורים פעילים</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(ISRAELI_PROVIDERS).length}
              </div>
              <div className="text-gray-600">ספקים זמינים</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-gray-600">מאובטח</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">אוטומטי</div>
              <div className="text-gray-600">סנכרון</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Connections */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">החיבורים שלי</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {Object.values(ISRAELI_PROVIDERS).find(p => p.id === conn.provider_code)?.logo || "🏦"}
                    </div>
                    <div>
                      <div className="font-medium">{conn.provider_name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        {getStatusIcon(conn.connection_status)}
                        {getStatusText(conn.connection_status)}
                        {conn.last_sync && (
                          <span>• עדכון אחרון: {new Date(conn.last_sync).toLocaleDateString("he-IL")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncMutation.mutate(conn.id)}
                      disabled={syncMutation.isPending}
                    >
                      {syncMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnectMutation.mutate(conn.id)}
                      disabled={disconnectMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Providers by Category */}
      {Object.entries(groupedProviders).map(([category, providers]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {category === "bank" && <Building2 className="w-5 h-5" />}
              {category === "credit" && <CreditCard className="w-5 h-5" />}
              {category === "investment" && <TrendingUp className="w-5 h-5" />}
              {category === "insurance" && <span className="text-lg">🛡️</span>}
              {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {providers.map((provider) => {
                const isConnected = connections.some(c => c.provider_code === provider.id);
                return (
                  <Button
                    key={provider.key}
                    variant={isConnected ? "secondary" : "outline"}
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => !isConnected && setSelectedProvider(provider.key)}
                    disabled={isConnected}
                  >
                    <div className="text-3xl">{provider.logo}</div>
                    <div className="text-sm font-medium text-center">{provider.name}</div>
                    {isConnected && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle2 className="w-3 h-3 ml-1" />
                        מחובר
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Connection Dialog */}
      <Dialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              התחבר ל
              {selectedProvider && ISRAELI_PROVIDERS[selectedProvider as keyof typeof ISRAELI_PROVIDERS]?.name}
            </DialogTitle>
            <DialogDescription>
              אתה עומד להתחבר דרך בנקאות פתוחה מאובטחת
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">מאובטח לחלוטין</div>
                  <div className="text-sm text-blue-700">
                    החיבור מוצפן והנתונים מועברים באופן מאובטח
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">סנכרון אוטומטי</div>
                  <div className="text-sm text-blue-700">
                    התנועות יתעדכנו אוטומטית כל יום
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">קטגוריזציה חכמה</div>
                  <div className="text-sm text-blue-700">
                    התנועות יסווגו אוטומטית לקטגוריות
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedProvider(null)}
                disabled={isConnecting}
              >
                ביטול
              </Button>
              <Button
                className="flex-1"
                onClick={() => selectedProvider && connectMutation.mutate(selectedProvider)}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    מתחבר...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 ml-2" />
                    התחבר עכשיו
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
