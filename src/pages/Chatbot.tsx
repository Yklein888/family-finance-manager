import ChatbotWidget from "@/components/ChatbotWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Brain, TrendingUp, Target, MessageCircle } from "lucide-react";

export default function ChatbotPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">💬 פינקי - העוזר הפיננסי שלך</h1>
        <p className="text-muted-foreground">
          שאל אותי כל דבר על הכספים שלך - אני כאן לעזור! 🤖
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chatbot Widget */}
        <div className="lg:col-span-2">
          <ChatbotWidget />
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          {/* Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                מה אני יכול?
              </CardTitle>
              <CardDescription>היכולות שלי</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">ניתוח חכם</div>
                  <div className="text-xs text-muted-foreground">
                    מנתח את הנתונים שלך ונותן תשובות מדויקות
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">תובנות והמלצות</div>
                  <div className="text-xs text-muted-foreground">
                    מזהה דפוסים ומציע דרכים לחסוך
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">מעקב יעדים</div>
                  <div className="text-xs text-muted-foreground">
                    עוזר לך להגיע ליעדים הפיננסיים
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">שפה טבעית</div>
                  <div className="text-xs text-muted-foreground">
                    מדבר עברית ומבין אותך בקלות
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Example Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 שאלות לדוגמה</CardTitle>
              <CardDescription>רעיונות למה לשאול</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  "כמה הוצאתי על אוכל החודש?"
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  "האם אני עומד בתקציב?"
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  "איך אני יכול לחסוך יותר?"
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  "מתי אגיע ליעד החיסכון שלי?"
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  "מה ההוצאות הגדולות שלי?"
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  "תן לי המלצה לשבוע הבא"
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">💎 טיפים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span>תהיה ספציפי בשאלות שלך</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span>תשאל על תקופות זמן מוגדרות</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span>בקש המלצות מעשיות</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span>שאל על יעדים והתקדמות</span>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔒</div>
                <div className="text-xs text-muted-foreground">
                  <div className="font-semibold text-foreground mb-1">פרטיות ואבטחה</div>
                  כל השיחות שלך מוצפנות ומאובטחות. המידע שלך לא נמכר או משותף עם צד שלישי.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
