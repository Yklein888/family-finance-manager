
-- Categories table (system + user categories)
CREATE TABLE public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name_he TEXT NOT NULL,
    name_en TEXT NOT NULL,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    icon TEXT,
    color TEXT,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Accounts table
CREATE TABLE public.accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bank_name TEXT,
    bank_code TEXT,
    branch_number TEXT,
    account_number TEXT,
    balance NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'ILS',
    account_type TEXT DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings', 'credit', 'investment', 'pension', 'insurance')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    description TEXT,
    merchant_name TEXT,
    transaction_date DATE NOT NULL,
    is_maaser_relevant BOOLEAN DEFAULT true,
    is_recurring BOOLEAN DEFAULT false,
    recurring_rule_id UUID,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Maaser calculations
CREATE TABLE public.maaser_calculations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calculation_date DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_income NUMERIC NOT NULL DEFAULT 0,
    total_expenses NUMERIC NOT NULL DEFAULT 0,
    net_income NUMERIC NOT NULL DEFAULT 0,
    maaser_percentage NUMERIC DEFAULT 10.0,
    maaser_amount NUMERIC NOT NULL DEFAULT 0,
    maaser_paid NUMERIC DEFAULT 0,
    maaser_balance NUMERIC NOT NULL DEFAULT 0,
    calculation_method TEXT DEFAULT 'gross' CHECK (calculation_method IN ('gross', 'net')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Maaser payments
CREATE TABLE public.maaser_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calculation_id UUID REFERENCES public.maaser_calculations(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    payment_date DATE NOT NULL,
    recipient TEXT,
    recipient_type TEXT CHECK (recipient_type IN ('tzedaka', 'institution', 'individual', 'other')),
    description TEXT,
    is_tax_deductible BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Budgets
CREATE TABLE public.budgets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    spent NUMERIC DEFAULT 0,
    period TEXT DEFAULT 'monthly' CHECK (period IN ('monthly', 'weekly', 'yearly', 'quarterly')),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    alert_threshold NUMERIC DEFAULT 80.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recurring transactions
CREATE TABLE public.recurring_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'bi-weekly', 'monthly', 'bi-monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    next_date DATE NOT NULL,
    day_of_month INTEGER,
    is_active BOOLEAN DEFAULT true,
    auto_create BOOLEAN DEFAULT true,
    reminder_days INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Savings goals
CREATE TABLE public.savings_goals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_amount NUMERIC NOT NULL,
    current_amount NUMERIC DEFAULT 0,
    target_date DATE,
    category TEXT,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    monthly_target NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Savings contributions
CREATE TABLE public.savings_contributions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    contribution_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User settings
CREATE TABLE public.user_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    currency TEXT DEFAULT 'ILS',
    locale TEXT DEFAULT 'he-IL',
    maaser_percentage NUMERIC DEFAULT 10.0,
    maaser_calculation_method TEXT DEFAULT 'gross' CHECK (maaser_calculation_method IN ('gross', 'net')),
    budget_alert_enabled BOOLEAN DEFAULT true,
    budget_alert_threshold NUMERIC DEFAULT 80.0,
    auto_categorize BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles table for user display info
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maaser_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maaser_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Categories (system categories readable by all authenticated, user categories by owner)
CREATE POLICY "Users can view system and own categories" ON public.categories
    FOR SELECT USING (is_system = true OR user_id = auth.uid());
CREATE POLICY "Users can create own categories" ON public.categories
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (user_id = auth.uid() AND is_system = false);
CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (user_id = auth.uid() AND is_system = false);

-- RLS Policies for all other user-owned tables (same pattern)
CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own accounts" ON public.accounts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own accounts" ON public.accounts FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own maaser_calculations" ON public.maaser_calculations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own maaser_calculations" ON public.maaser_calculations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own maaser_calculations" ON public.maaser_calculations FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own maaser_calculations" ON public.maaser_calculations FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own maaser_payments" ON public.maaser_payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own maaser_payments" ON public.maaser_payments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own maaser_payments" ON public.maaser_payments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own maaser_payments" ON public.maaser_payments FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own budgets" ON public.budgets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own budgets" ON public.budgets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own budgets" ON public.budgets FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own budgets" ON public.budgets FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own recurring_transactions" ON public.recurring_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own recurring_transactions" ON public.recurring_transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own recurring_transactions" ON public.recurring_transactions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own recurring_transactions" ON public.recurring_transactions FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own savings_goals" ON public.savings_goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own savings_goals" ON public.savings_goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own savings_goals" ON public.savings_goals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own savings_goals" ON public.savings_goals FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own savings_contributions" ON public.savings_contributions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own savings_contributions" ON public.savings_contributions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own savings_contributions" ON public.savings_contributions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own savings_contributions" ON public.savings_contributions FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- Trigger for auto-creating profile and settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recurring_updated_at BEFORE UPDATE ON public.recurring_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_category ON public.transactions(category_id);
CREATE INDEX idx_transactions_account ON public.transactions(account_id);
CREATE INDEX idx_budgets_user_active ON public.budgets(user_id, is_active);
CREATE INDEX idx_recurring_user_next ON public.recurring_transactions(user_id, next_date);
CREATE INDEX idx_goals_user_active ON public.savings_goals(user_id, is_active);
