import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await signIn(form.get("email") as string, form.get("password") as string);
      toast({ title: "ברוכים הבאים! 🎉" });
    } catch (err: any) {
      toast({ title: "שגיאה בהתחברות", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await signUp(form.get("email") as string, form.get("password") as string, form.get("name") as string);
      toast({ title: "נרשמת בהצלחה! ✉️", description: "בדוק את המייל שלך לאימות" });
    } catch (err: any) {
      toast({ title: "שגיאה בהרשמה", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">FinFamily</h1>
          <p className="text-muted-foreground mt-1">ניהול פיננסי משפחתי חכם</p>
        </div>

        <Card>
          <Tabs defaultValue="signin" dir="rtl">
            <CardHeader className="pb-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">התחברות</TabsTrigger>
                <TabsTrigger value="signup">הרשמה</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="signin" className="mt-0">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">אימייל</Label>
                    <Input id="signin-email" name="email" type="email" required placeholder="name@example.com" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">סיסמה</Label>
                    <Input id="signin-password" name="password" type="password" required placeholder="••••••••" dir="ltr" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "מתחבר..." : "התחברות"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">שם מלא</Label>
                    <Input id="signup-name" name="name" required placeholder="ישראל ישראלי" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">אימייל</Label>
                    <Input id="signup-email" name="email" type="email" required placeholder="name@example.com" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">סיסמה</Label>
                    <Input id="signup-password" name="password" type="password" required minLength={6} placeholder="לפחות 6 תווים" dir="ltr" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "נרשם..." : "הרשמה"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
