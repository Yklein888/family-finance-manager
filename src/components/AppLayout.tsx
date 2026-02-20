import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  Calculator,
  RefreshCw,
  TrendingUp,
  Settings,
  LogOut,
  Wallet,
  ChevronLeft,
  Building2,
  BarChart3,
  Landmark,
  FolderTree,
  HandCoins,
  Trophy,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import NotificationsBell from "@/components/NotificationsBell";
import NotificationCenter from "@/components/NotificationCenter";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "דשבורד" },
  { to: "/transactions", icon: ArrowLeftRight, label: "תנועות" },
  { to: "/categories", icon: FolderTree, label: "קטגוריות" },
  { to: "/budgets", icon: PiggyBank, label: "תקציבים" },
  { to: "/maaser", icon: Calculator, label: "מעשרות" },
  { to: "/goals", icon: Target, label: "יעדי חיסכון" },
  { to: "/debts", icon: HandCoins, label: "חובות והלוואות" },
  { to: "/recurring", icon: RefreshCw, label: "תשלומים חוזרים" },
  { to: "/institutional", icon: Landmark, label: "מוסדיים" },
  { to: "/insights", icon: TrendingUp, label: "תובנות" },
  { to: "/achievements", icon: Trophy, label: "הישגים 🎮" },
  { to: "/chatbot", icon: MessageCircle, label: "פינקי 🤖" },
  { to: "/reports", icon: BarChart3, label: "דוחות" },
  { to: "/banking", icon: Building2, label: "בנקאות" },
  { to: "/settings", icon: Settings, label: "הגדרות" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full bg-sidebar text-sidebar-foreground border-l border-sidebar-border z-40 transition-all duration-300 flex flex-col",
          collapsed ? "w-[72px]" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-primary shrink-0">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <>
              <span className="font-heading font-bold text-lg">FinFamily</span>
              <div className="mr-auto">
                <NotificationsBell />
              </div>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>התנתקות</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-20 -left-3 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-accent transition-colors"
        >
          <ChevronLeft className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Main content */}
      <main className={cn("flex-1 transition-all duration-300", collapsed ? "mr-[72px]" : "mr-60")}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-end h-14 px-6 gap-2">
            <NotificationCenter />
          </div>
        </div>
        
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
