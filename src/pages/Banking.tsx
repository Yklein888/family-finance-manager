import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Building2,
  Link2,
  Unlink,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Zap,
  History,
  CreditCard,
  Wallet,
} from "lucide-react";
import {
  OPEN_BANKING_PROVIDERS,
  ACCOUNT_TYPE_LABELS,
  CONNECTION_STATUS_LABELS,
  type OpenBankingProvider,
} from "@/lib/open-banking-providers";

export default function BankingPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [connectDialog, setConnectDialog] = useState<OpenBankingProvider | null>(null);
  const [addAccountDialog, setAddAccountDialog] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", bank_name: "", account_type: "checking", balance: "" });

  // Fetch connections
  const { data: connections = [] } = useQuery({
    queryKey: ["open-banking-connections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("open_banking_connections")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch accounts
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch sync history
  const { data: syncHistory = [] } = useQuery({
    queryKey: ["sync-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sync_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Connect provider
  const connectMutation = useMutation({
    mutationFn: async (provider: OpenBankingProvider) => {
      const { error } = await supabase.from("open_banking_connections").insert({
        user_id: user!.id,
        provider_name: provider.name,
        provider_code: provider.code,
        connection_status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["open-banking-connections"] });
      toast.success("ספק חובר בהצלחה!");
      setConnectDialog(null);
    },
    onError: () => toast.error("שגיאה בחיבור הספק"),
  });

  // Disconnect provider
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
      toast.success("ספק נותק בהצלחה");
    },
    onError: () => toast.error("שגיאה בניתוק הספק"),
  });

  // Add manual account
  const addAccountMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("accounts").insert({
        user_id: user!.id,
        name: newAccount.name,
        bank_name: newAccount.bank_name || null,
        account_type: newAccount.account_type,
        balance: parseFloat(newAccount.balance) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("חשבון נוסף בהצלחה!");
      setAddAccountDialog(false);
      setNewAccount({ name: "", bank_name: "", account_type: "checking", balance: "" });
    },
    onError: () => toast.error("שגיאה בהוספת חשבון"),
  });

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const syncedCount = accounts.filter((a) => a.is_synced).length;

  const getProviderConnection = (code: string) =>
    connections.find((c) => c.provider_code === code);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">בנקאות פתוחה</h1>
          <p className="text-muted-foreground text-sm">חבר חשבונות בנק וכרטיסי אשראי לסנכרון אוטומטי</p>
        </div>
        <Button onClick={() => setAddAccountDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          חשבון ידני
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">יתרה כוללת</p>
                <p className="text-xl font-bold">₪{totalBalance.toLocaleString("he-IL")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--success))]/10 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">חיבורים פעילים</p>
                <p className="text-xl font-bold">{connections.filter((c) => c.connection_status === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--maaser))]/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[hsl(var(--maaser))]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">חשבונות</p>
                <p className="text-xl font-bold">{accounts.length} ({syncedCount} מסונכרנים)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="providers" dir="rtl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">ספקים</TabsTrigger>
          <TabsTrigger value="accounts">חשבונות</TabsTrigger>
          <TabsTrigger value="history">היסטוריית סנכרון</TabsTrigger>
        </TabsList>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-4 mt-4">
          {/* Benefits */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading font-semibold mb-2">למה בנקאות פתוחה?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      סנכרון אוטומטי של תנועות
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      עדכון בזמן אמת
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      אבטחה מלאה ומוצפנת
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Provider Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OPEN_BANKING_PROVIDERS.map((provider) => {
              const conn = getProviderConnection(provider.code);
              const isConnected = conn?.connection_status === "active";

              return (
                <Card key={provider.code} className="stat-card">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{provider.logo}</span>
                        <div>
                          <h3 className="font-heading font-semibold">{provider.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{provider.description}</p>
                        </div>
                      </div>
                      {provider.status === "coming_soon" ? (
                        <Badge variant="secondary">בקרוב</Badge>
                      ) : isConnected ? (
                        <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20">
                          <CheckCircle2 className="w-3 h-3 ml-1" />
                          מחובר
                        </Badge>
                      ) : null}
                    </div>

                    {/* Supported account types */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {provider.supportedAccounts.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {ACCOUNT_TYPE_LABELS[type] || type}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      {provider.status === "coming_soon" ? (
                        <Button variant="outline" size="sm" disabled className="flex-1">
                          בקרוב
                        </Button>
                      ) : isConnected ? (
                        <>
                          <Button variant="outline" size="sm" className="flex-1 gap-1.5" disabled>
                            <RefreshCw className="w-3.5 h-3.5" />
                            סנכרן
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-destructive hover:text-destructive"
                            onClick={() => conn && disconnectMutation.mutate(conn.id)}
                          >
                            <Unlink className="w-3.5 h-3.5" />
                            נתק
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" className="flex-1 gap-1.5" onClick={() => setConnectDialog(provider)}>
                          <Link2 className="w-3.5 h-3.5" />
                          התחבר
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4 mt-4">
          {accounts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg mb-1">אין חשבונות עדיין</p>
                <p className="text-sm mb-4">חבר ספק בנקאות פתוחה או הוסף חשבון ידנית</p>
                <Button onClick={() => setAddAccountDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  הוסף חשבון
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((account) => (
                <Card key={account.id} className="stat-card">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold">{account.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {account.bank_name || "חשבון ידני"} • {ACCOUNT_TYPE_LABELS[account.account_type || "checking"]}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`text-lg font-bold ${(account.balance || 0) >= 0 ? "text-[hsl(var(--success))]" : "text-[hsl(var(--expense))]"}`}>
                          ₪{(account.balance || 0).toLocaleString("he-IL")}
                        </p>
                        {account.is_synced && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <RefreshCw className="w-3 h-3" />
                            מסונכרן
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Sync History Tab */}
        <TabsContent value="history" className="space-y-4 mt-4">
          {syncHistory.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg mb-1">אין היסטוריית סנכרון</p>
                <p className="text-sm">לאחר חיבור ספק, היסטוריית הסנכרון תופיע כאן</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {syncHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        {entry.sync_status === "success" ? (
                          <CheckCircle2 className="w-5 h-5 text-[hsl(var(--success))]" />
                        ) : entry.sync_status === "failed" ? (
                          <XCircle className="w-5 h-5 text-destructive" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-[hsl(var(--warning))]" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {entry.sync_type === "manual" ? "סנכרון ידני" : entry.sync_type === "automatic" ? "סנכרון אוטומטי" : "סנכרון מתוזמן"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.transactions_added} תנועות נוספו • {entry.transactions_updated} עודכנו
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Connect Dialog */}
      <Dialog open={!!connectDialog} onOpenChange={() => setConnectDialog(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{connectDialog?.logo}</span>
              חיבור ל-{connectDialog?.name}
            </DialogTitle>
            <DialogDescription>
              לאחר האישור, המערכת תסנכרן את החשבונות והתנועות שלך באופן אוטומטי.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
              <p className="font-medium">הרשאות נדרשות:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />
                  צפייה ביתרות חשבון
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />
                  צפייה בתנועות (90 יום אחרונים)
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  קריאה בלבד - ללא גישת כתיבה
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConnectDialog(null)}>
              ביטול
            </Button>
            <Button
              onClick={() => connectDialog && connectMutation.mutate(connectDialog)}
              disabled={connectMutation.isPending}
              className="gap-2"
            >
              <Link2 className="w-4 h-4" />
              {connectMutation.isPending ? "מתחבר..." : "אשר וחבר"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Account Dialog */}
      <Dialog open={addAccountDialog} onOpenChange={setAddAccountDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>הוסף חשבון ידני</DialogTitle>
            <DialogDescription>
              הוסף חשבון בנק או כרטיס אשראי ידנית
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>שם החשבון</Label>
              <Input
                placeholder='לדוגמה: חשבון עו"ש לאומי'
                value={newAccount.name}
                onChange={(e) => setNewAccount((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>שם הבנק</Label>
              <Input
                placeholder="לדוגמה: בנק לאומי"
                value={newAccount.bank_name}
                onChange={(e) => setNewAccount((p) => ({ ...p, bank_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>סוג חשבון</Label>
              <Select value={newAccount.account_type} onValueChange={(v) => setNewAccount((p) => ({ ...p, account_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCOUNT_TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>יתרה נוכחית (₪)</Label>
              <Input
                type="number"
                placeholder="0"
                value={newAccount.balance}
                onChange={(e) => setNewAccount((p) => ({ ...p, balance: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddAccountDialog(false)}>ביטול</Button>
            <Button
              onClick={() => addAccountMutation.mutate()}
              disabled={!newAccount.name || addAccountMutation.isPending}
            >
              {addAccountMutation.isPending ? "שומר..." : "הוסף חשבון"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
