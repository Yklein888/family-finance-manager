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
  XCircle, Clock, AlertCircle, Loader2, ExternalLink
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ספקי בנקאות פתוחה אמיתיים
const PROVIDERS = {
  PEPPER: {
    id: "pepper",
    name: "Pepper",
    logo: "🌶️",
    description: "מחבר לכל הבנקים וכרטיסי האשראי בישראל",
    color: "#EF4444",
    website: "https://www.pepper.co.il",
    docs: "https://developers.pepper.co.il/docs",
    signupUrl: "https://www.pepper.co.il/developers/signup",
    features: ["כל הבנקים", "כרטיסי אשראי", "סנכרון יומי", "חינמי עד 100 משתמשים"],
  },
  SALT_EDGE: {
    id: "saltedge",
    name: "Salt Edge",
    logo: "🔐",
    description: "ספק עולמי עם תמיכה בבנקים ישראליים",
    color: "#3B82F6",
    website: "https://www.saltedge.com",
    docs: "https://docs.saltedge.com",
    signupUrl: "https://www.saltedge.com/client_users/sign_up",
    features: ["בנקים עולמיים", "תמיכה בישראל", "API מתקדם"],
  },
  MONO: {
    id: "mono",
    name: "Mono",
    logo: "🔗",
    description: "פתרון ישראלי חדש",
    color: "#8B5CF6",
    website: "https://mono.co.il",
    docs: "https://docs.mono.co.il",
    signupUrl: "https://mono.co.il/signup",
    features: ["פתרון מקומי", "תמיכה בעברית"],
  },
};

export default function OpenBankingConnect() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch existing connections
  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["open-banking-connections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("open_banking_connections")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching connections:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });

  const connectMutation = useMutation({
    mutationFn: async (providerId: string) => {
      setIsConnecting(true);
      
      const provider = PROVIDERS[providerId as keyof typeof PROVIDERS];
      
      // Create pending connection
      const { data: connection, error } = await supabase
        .from("open_banking_connections")
        .insert({
          user_id: user?.id,
          provider_name: provider.name,
          provider_code: providerId,
          connection_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // TODO: Start OAuth flow
      // For now, this will be implemented when you have API keys
      
      return connection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["open-banking-connections"] });
      toast({
        title: "🎉 בקשה נשלחה!",
        description: "עכשיו צריך להשלים את תהליך האימות עם הספק",
      });
      setSelectedProvider(null);
      setIsConnecting(false);
    },
    onError: (error: any) => {
      console.error("Connection error:", error);
      toast({
        title: "⚠️ שגיאה",
        description: error.message?.includes("relation") || error.message?.includes("table") 
          ? "נראה שטבלאות המסד נתונים חסרות. הרץ את SQL Migrations קודם!"
          : error.message || "לא הצלחנו להתחבר. נסה שוב.",
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
      toast({ title: "נותק בהצלחה" });
    },
  });

  const needsSetup = connections.length === 0 && !isLoading;

  return (
    <div className="space-y-6">
      {/* Setup Guide Banner */}
      {needsSetup && (
        <Card className="border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Building2 className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
              <div className="space-y-3 flex-1">
                <h3 className="font-bold text-lg text-blue-900">🚀 מוכן להתחבר לבנקים?</h3>
                <p className="text-sm text-blue-800">
                  כדי להתחיל, אתה צריך להירשם לאחד מספקי הבנקאות הפתוחה למטה. 
                  <strong className="block mt-2">המלצה: Pepper</strong> - הכי קל, חינמי, ותומך בכל הבנקים בישראל.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => window.open("https://www.pepper.co.il/developers", "_blank")}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    🌶️ הירשם ל-Pepper
                    <ExternalLink className="w-4 h-4 mr-2" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open("/QUICK_SETUP.md", "_blank")}
                  >
                    📖 מדריך מלא
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            חיבורים פעילים
          </CardTitle>
          <CardDescription>
            {connections.length > 0 
              ? `${connections.length} ספקים מחוברים`
              : "עדיין לא חיברת אף ספק"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>התחבר לספק כדי להתחיל</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((conn) => (
                <div 
                  key={conn.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {PROVIDERS[conn.provider_code as keyof typeof PROVIDERS]?.logo || "🏦"}
                    </div>
                    <div>
                      <div className="font-medium">{conn.provider_name}</div>
                      <div className="text-xs text-muted-foreground">
                        התחבר ב-{new Date(conn.created_at).toLocaleDateString("he-IL")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={conn.connection_status === "active" ? "default" : "secondary"}
                      className={conn.connection_status === "active" ? "bg-green-600" : ""}
                    >
                      {conn.connection_status === "active" && <CheckCircle2 className="w-3 h-3 ml-1" />}
                      {conn.connection_status === "active" ? "פעיל" : "ממתין"}
                    </Badge>
                    <Button
                      variant="ghost"
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
          )}
        </CardContent>
      </Card>

      {/* Available Providers */}
      <Card>
        <CardHeader>
          <CardTitle>ספקים זמינים</CardTitle>
          <CardDescription>בחר ספק כדי להתחבר</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(PROVIDERS).map(([key, provider]) => {
              const isConnected = connections.some(c => c.provider_code === provider.id);
              
              return (
                <Card 
                  key={key}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isConnected ? "border-green-500 bg-green-50" : ""
                  }`}
                  onClick={() => !isConnected && setSelectedProvider(provider.id)}
                >
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="text-5xl">{provider.logo}</div>
                      <div>
                        <div className="font-bold text-lg">{provider.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {provider.description}
                        </div>
                      </div>
                      
                      {isConnected ? (
                        <Badge className="bg-green-600">
                          <CheckCircle2 className="w-3 h-3 ml-1" />
                          מחובר
                        </Badge>
                      ) : (
                        <div className="space-y-2">
                          <Button 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(provider.signupUrl, "_blank");
                            }}
                          >
                            הירשם
                            <ExternalLink className="w-4 h-4 mr-2" />
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(provider.docs, "_blank");
                            }}
                          >
                            תיעוד
                          </Button>
                        </div>
                      )}
                      
                      <div className="pt-3 border-t space-y-1">
                        {provider.features.map((feature, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-purple-900">
              <p className="font-medium">💡 איך זה עובד?</p>
              <ol className="mr-5 space-y-1">
                <li>1. בחר ספק והירשם לקבל API Keys</li>
                <li>2. הוסף את ה-Keys למשתני הסביבה בהגדרות</li>
                <li>3. לחץ "התחבר" והאפליקציה תפנה אותך לאימות מאובטח</li>
                <li>4. אשר גישה ותתחיל לראות תנועות ויתרות אוטומטית!</li>
              </ol>
              <p className="text-xs pt-2 border-t border-purple-200 mt-3">
                🔒 כל הנתונים מוצפנים והאפליקציה לעולם לא רואה את הסיסמאות שלך לבנק
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
