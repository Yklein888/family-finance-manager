import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Flame, Target } from "lucide-react";
import { ACHIEVEMENTS, LEVELS, getLevelByPoints, getProgressToNextLevel } from "@/lib/gamification";

export default function Achievements() {
  const { user } = useAuth();
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const { data: gamification } = useQuery({
    queryKey: ["gamification", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user?.id)
        .single();
      return data || { total_points: 0, current_streak: 0 };
    },
    enabled: !!user,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user?.id)
        .order("earned_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const totalPoints = gamification?.total_points || 0;
  const currentLevel = getLevelByPoints(totalPoints);
  const progressToNext = getProgressToNextLevel(totalPoints);
  const nextLevel = LEVELS.find(l => l.minPoints > totalPoints);
  const earnedIds = achievements.map((a) => a.achievement_id);

  useEffect(() => {
    if (achievements.length > 0) {
      const latest = achievements[0];
      const now = new Date();
      const earned = new Date(latest.earned_at);
      const diffMinutes = (now.getTime() - earned.getTime()) / (1000 * 60);
      if (diffMinutes < 5) {
        setNewAchievements([latest.achievement_id]);
        setTimeout(() => setNewAchievements([]), 5000);
      }
    }
  }, [achievements]);

  const categorizedAchievements = {
    beginner: Object.values(ACHIEVEMENTS).filter(a => a.category === "beginner"),
    streak: Object.values(ACHIEVEMENTS).filter(a => a.category === "streak"),
    budget: Object.values(ACHIEVEMENTS).filter(a => a.category === "budget"),
    savings: Object.values(ACHIEVEMENTS).filter(a => a.category === "savings"),
    goals: Object.values(ACHIEVEMENTS).filter(a => a.category === "goals"),
    maaser: Object.values(ACHIEVEMENTS).filter(a => a.category === "maaser"),
    organization: Object.values(ACHIEVEMENTS).filter(a => a.category === "organization"),
    special: Object.values(ACHIEVEMENTS).filter(a => a.category === "special"),
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-5xl">{currentLevel.icon}</div>
              <div>
                <h2 className="text-2xl font-bold">{currentLevel.name}</h2>
                <p className="text-purple-100">Level {currentLevel.level}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{totalPoints}</div>
              <div className="text-sm text-purple-100">נקודות</div>
            </div>
          </div>
          {nextLevel && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>התקדמות לרמה הבאה</span>
                <span>{nextLevel.name} ({nextLevel.minPoints} נקודות)</span>
              </div>
              <Progress value={progressToNext} className="h-3 bg-purple-600" />
              <div className="text-xs text-purple-100 text-center">
                עוד {nextLevel.minPoints - totalPoints} נקודות!
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <div className="text-3xl font-bold">{gamification?.current_streak || 0}</div>
          <div className="text-sm text-muted-foreground">ימים רצופים</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-3xl font-bold">{achievements.length}</div>
          <div className="text-sm text-muted-foreground">הישגים</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Star className="w-8 h-8 mx-auto mb-2 text-purple-500" />
          <div className="text-3xl font-bold">{totalPoints}</div>
          <div className="text-sm text-muted-foreground">נקודות</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <div className="text-3xl font-bold">{(gamification as any)?.longest_streak || 0}</div>
          <div className="text-sm text-muted-foreground">שיא ימים</div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>הישגים</CardTitle>
          <CardDescription>{achievements.length} מתוך {Object.keys(ACHIEVEMENTS).length} הישגים</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">הכל</TabsTrigger>
              <TabsTrigger value="unlocked">הושגו</TabsTrigger>
              <TabsTrigger value="locked">נעולים</TabsTrigger>
              <TabsTrigger value="streak">🔥 Streak</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-6 mt-6">
              {Object.entries(categorizedAchievements).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold capitalize">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement}
                        isUnlocked={earnedIds.includes(achievement.id)}
                        isNew={newAchievements.includes(achievement.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="unlocked" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.values(ACHIEVEMENTS).filter(a => earnedIds.includes(a.id))
                  .map(a => <AchievementCard key={a.id} achievement={a} isUnlocked={true} isNew={false} />)}
              </div>
            </TabsContent>
            <TabsContent value="locked" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.values(ACHIEVEMENTS).filter(a => !earnedIds.includes(a.id))
                  .map(a => <AchievementCard key={a.id} achievement={a} isUnlocked={false} isNew={false} />)}
              </div>
            </TabsContent>
            <TabsContent value="streak" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categorizedAchievements.streak.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement}
                    isUnlocked={earnedIds.includes(achievement.id)}
                    isNew={newAchievements.includes(achievement.id)} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function AchievementCard({ achievement, isUnlocked, isNew }: { achievement: any; isUnlocked: boolean; isNew: boolean }) {
  return (
    <Card className={`relative overflow-hidden transition-all ${isUnlocked ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50" : "opacity-60 grayscale"} ${isNew ? "ring-4 ring-yellow-400 animate-pulse" : ""}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="font-semibold">{achievement.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{achievement.description}</div>
            <Badge className="mt-2" variant={isUnlocked ? "default" : "secondary"}>{achievement.points} נקודות</Badge>
          </div>
        </div>
        {isNew && <div className="absolute top-2 left-2"><Badge className="bg-yellow-500 text-white">חדש!</Badge></div>}
      </CardContent>
    </Card>
  );
      }
