-- ========================================
-- Advanced Features Migration
-- Family Finance Manager Enhanced Tables
-- ========================================

-- 1. Institutional Accounts (מוסדיים)
CREATE TABLE IF NOT EXISTS institutional_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_type TEXT CHECK (account_type IN ('pension', 'provident', 'study_fund', 'managers_insurance', 'continuing_education')) NOT NULL,
    provider_name TEXT NOT NULL,
    provider_id TEXT,
    account_number TEXT,
    policy_number TEXT,
    balance NUMERIC(15,2) DEFAULT 0,
    monthly_deposit NUMERIC(15,2) DEFAULT 0,
    employer_deposit NUMERIC(15,2) DEFAULT 0,
    total_deposits NUMERIC(15,2) DEFAULT 0,
    total_profit NUMERIC(15,2) DEFAULT 0,
    profit_percentage NUMERIC(5,2) DEFAULT 0,
    start_date DATE,
    maturity_date DATE,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    open_banking_provider TEXT,
    open_banking_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Recurring Transactions (תשלומים חוזרים)
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount NUMERIC(15,2) NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    description TEXT,
    merchant_name TEXT,
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'bi-weekly', 'monthly', 'bi-monthly', 'quarterly', 'yearly')) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_date DATE NOT NULL,
    day_of_month INTEGER,
    day_of_week INTEGER,
    is_active BOOLEAN DEFAULT true,
    auto_create BOOLEAN DEFAULT true,
    reminder_days INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Savings Goals (יעדי חיסכון)
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_amount NUMERIC(15,2) NOT NULL,
    current_amount NUMERIC(15,2) DEFAULT 0,
    target_date DATE,
    category TEXT,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    monthly_target NUMERIC(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Savings Contributions (הפקדות ליעדי חיסכון)
CREATE TABLE IF NOT EXISTS savings_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
    amount NUMERIC(15,2) NOT NULL,
    contribution_date DATE NOT NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Open Banking Connections (חיבורי בנקאות פתוחה)
CREATE TABLE IF NOT EXISTS open_banking_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL,
    provider_code TEXT NOT NULL,
    connection_status TEXT CHECK (connection_status IN ('active', 'expired', 'error', 'pending')) DEFAULT 'pending',
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    consent_id TEXT,
    consent_expires_at TIMESTAMP WITH TIME ZONE,
    last_sync TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Sync History (היסטוריית סנכרונים)
CREATE TABLE IF NOT EXISTS sync_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    connection_id UUID REFERENCES open_banking_connections(id) ON DELETE SET NULL,
    sync_type TEXT CHECK (sync_type IN ('manual', 'automatic', 'scheduled')) NOT NULL,
    sync_status TEXT CHECK (sync_status IN ('success', 'partial', 'failed')) NOT NULL,
    transactions_added INTEGER DEFAULT 0,
    transactions_updated INTEGER DEFAULT 0,
    sync_start TIMESTAMP WITH TIME ZONE NOT NULL,
    sync_end TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Financial Insights (תובנות פיננסיות)
CREATE TABLE IF NOT EXISTS financial_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type TEXT CHECK (insight_type IN ('warning', 'opportunity', 'achievement', 'recommendation')) NOT NULL,
    category TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15,2),
    percentage NUMERIC(5,2),
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. User Settings (הגדרות משתמש)
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    currency TEXT DEFAULT 'ILS',
    locale TEXT DEFAULT 'he-IL',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    theme TEXT CHECK (theme IN ('light', 'dark', 'auto')) DEFAULT 'light',
    maaser_percentage NUMERIC(5,2) DEFAULT 10.0,
    maaser_calculation_method TEXT CHECK (maaser_calculation_method IN ('gross', 'net')) DEFAULT 'gross',
    budget_alert_enabled BOOLEAN DEFAULT true,
    budget_alert_threshold NUMERIC(5,2) DEFAULT 80.0,
    sync_frequency TEXT CHECK (sync_frequency IN ('manual', 'daily', 'weekly')) DEFAULT 'daily',
    auto_categorize BOOLEAN DEFAULT true,
    receipt_ocr_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Merchants (סוחרים)
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    default_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    logo_url TEXT,
    website TEXT,
    auto_categorize BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE institutional_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_banking_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Institutional Accounts
CREATE POLICY "Users can view own institutional accounts" ON institutional_accounts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own institutional accounts" ON institutional_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own institutional accounts" ON institutional_accounts
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own institutional accounts" ON institutional_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Recurring Transactions
CREATE POLICY "Users can view own recurring transactions" ON recurring_transactions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recurring transactions" ON recurring_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recurring transactions" ON recurring_transactions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recurring transactions" ON recurring_transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Savings Goals
CREATE POLICY "Users can view own savings goals" ON savings_goals
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own savings goals" ON savings_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own savings goals" ON savings_goals
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own savings goals" ON savings_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Savings Contributions
CREATE POLICY "Users can view own savings contributions" ON savings_contributions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own savings contributions" ON savings_contributions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own savings contributions" ON savings_contributions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own savings contributions" ON savings_contributions
    FOR DELETE USING (auth.uid() = user_id);

-- Open Banking Connections
CREATE POLICY "Users can view own open banking connections" ON open_banking_connections
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own open banking connections" ON open_banking_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own open banking connections" ON open_banking_connections
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own open banking connections" ON open_banking_connections
    FOR DELETE USING (auth.uid() = user_id);

-- Sync History
CREATE POLICY "Users can view own sync history" ON sync_history
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sync history" ON sync_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Financial Insights
CREATE POLICY "Users can view own financial insights" ON financial_insights
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own financial insights" ON financial_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own financial insights" ON financial_insights
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own financial insights" ON financial_insights
    FOR DELETE USING (auth.uid() = user_id);

-- User Settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Merchants (public read, admin write)
CREATE POLICY "Anyone can view merchants" ON merchants
    FOR SELECT USING (true);

-- Create Indexes for Performance
CREATE INDEX idx_institutional_accounts_user_id ON institutional_accounts(user_id);
CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_next_date ON recurring_transactions(next_date) WHERE is_active = true;
CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_savings_contributions_goal_id ON savings_contributions(goal_id);
CREATE INDEX idx_open_banking_connections_user_id ON open_banking_connections(user_id);
CREATE INDEX idx_sync_history_user_id ON sync_history(user_id);
CREATE INDEX idx_financial_insights_user_id ON financial_insights(user_id) WHERE is_dismissed = false;
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Create Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Triggers for updated_at
CREATE TRIGGER update_institutional_accounts_updated_at BEFORE UPDATE ON institutional_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_open_banking_connections_updated_at BEFORE UPDATE ON open_banking_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate next recurring transaction date
CREATE OR REPLACE FUNCTION calculate_next_recurring_date(
    current_date DATE,
    frequency TEXT,
    day_of_month INTEGER DEFAULT NULL,
    day_of_week INTEGER DEFAULT NULL
)
RETURNS DATE AS $$
BEGIN
    CASE frequency
        WHEN 'daily' THEN
            RETURN current_date + INTERVAL '1 day';
        WHEN 'weekly' THEN
            RETURN current_date + INTERVAL '1 week';
        WHEN 'bi-weekly' THEN
            RETURN current_date + INTERVAL '2 weeks';
        WHEN 'monthly' THEN
            IF day_of_month IS NOT NULL THEN
                -- Set to specific day of next month
                RETURN (DATE_TRUNC('month', current_date) + INTERVAL '1 month' + (day_of_month - 1) * INTERVAL '1 day')::DATE;
            ELSE
                RETURN current_date + INTERVAL '1 month';
            END IF;
        WHEN 'bi-monthly' THEN
            RETURN current_date + INTERVAL '2 months';
        WHEN 'quarterly' THEN
            RETURN current_date + INTERVAL '3 months';
        WHEN 'yearly' THEN
            RETURN current_date + INTERVAL '1 year';
        ELSE
            RETURN current_date;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to generate financial insights
CREATE OR REPLACE FUNCTION generate_financial_insights(p_user_id UUID)
RETURNS TABLE(
    insight_type TEXT,
    title TEXT,
    description TEXT,
    amount NUMERIC,
    percentage NUMERIC
) AS $$
DECLARE
    v_this_month_expenses NUMERIC;
    v_last_month_expenses NUMERIC;
    v_expense_diff_pct NUMERIC;
BEGIN
    -- Calculate monthly expenses
    SELECT COALESCE(SUM(amount), 0) INTO v_this_month_expenses
    FROM transactions
    WHERE user_id = p_user_id
      AND type = 'expense'
      AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE);
    
    SELECT COALESCE(SUM(amount), 0) INTO v_last_month_expenses
    FROM transactions
    WHERE user_id = p_user_id
      AND type = 'expense'
      AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
    
    -- Calculate percentage difference
    IF v_last_month_expenses > 0 THEN
        v_expense_diff_pct := ((v_this_month_expenses - v_last_month_expenses) / v_last_month_expenses) * 100;
        
        -- Generate insight if difference is significant
        IF v_expense_diff_pct > 10 THEN
            RETURN QUERY SELECT 
                'warning'::TEXT,
                'עלייה בהוצאות'::TEXT,
                format('ההוצאות עלו ב-%s%% לעומת חודש שעבר', ROUND(v_expense_diff_pct))::TEXT,
                v_this_month_expenses - v_last_month_expenses,
                v_expense_diff_pct;
        ELSIF v_expense_diff_pct < -10 THEN
            RETURN QUERY SELECT
                'achievement'::TEXT,
                'ירידה בהוצאות!'::TEXT,
                format('ההוצאות ירדו ב-%s%% לעומת חודש שעבר', ROUND(ABS(v_expense_diff_pct)))::TEXT,
                v_last_month_expenses - v_this_month_expenses,
                ABS(v_expense_diff_pct);
        END IF;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;
