import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import TransactionsPage from "@/pages/Transactions";
import BudgetsPage from "@/pages/Budgets";
import MaaserPage from "@/pages/Maaser";
import GoalsPage from "@/pages/Goals";
import RecurringPage from "@/pages/Recurring";
import InsightsPage from "@/pages/Insights";
import SettingsPage from "@/pages/SettingsPage";
import BankingPage from "@/pages/Banking";
import ReportsPage from "@/pages/Reports";
import InstitutionalPage from "@/pages/Institutional";
import CategoriesPage from "@/pages/Categories";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">טוען...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">טוען...</div>;
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
            <Route path="/budgets" element={<ProtectedRoute><BudgetsPage /></ProtectedRoute>} />
            <Route path="/maaser" element={<ProtectedRoute><MaaserPage /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
            <Route path="/recurring" element={<ProtectedRoute><RecurringPage /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
            <Route path="/institutional" element={<ProtectedRoute><InstitutionalPage /></ProtectedRoute>} />
            <Route path="/banking" element={<ProtectedRoute><BankingPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
