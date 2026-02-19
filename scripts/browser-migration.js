// =====================================================
// Supabase Migration Script - Run in Browser Console
// =====================================================
// 
// Instructions:
// 1. Open Supabase Dashboard: https://supabase.com/dashboard/project/tzhhilhiheekhcpdexdc/editor
// 2. Open Browser Console (F12 → Console tab)
// 3. Copy and paste this ENTIRE script
// 4. Press Enter to run
//
// =====================================================

const migrationSQL = `
-- Advanced Features Migration
-- Run this in Supabase SQL Editor

-- 1. Institutional Accounts
CREATE TABLE IF NOT EXISTS institutional_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_type TEXT CHECK (account_type IN ('pension', 'provident', 'study_fund', 'managers_insurance', 'continuing_education')) NOT NULL,
    provider_name TEXT NOT NULL,
    balance NUMERIC(15,2) DEFAULT 0,
    monthly_deposit NUMERIC(15,2) DEFAULT 0,
    employer_deposit NUMERIC(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Recurring Transactions
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(15,2) NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    description TEXT,
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')) NOT NULL,
    next_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Savings Goals
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(15,2) NOT NULL,
    current_amount NUMERIC(15,2) DEFAULT 0,
    target_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Financial Insights
CREATE TABLE IF NOT EXISTS financial_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE institutional_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_insights ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage own institutional accounts" ON institutional_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own recurring transactions" ON recurring_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own savings goals" ON savings_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own insights" ON financial_insights FOR ALL USING (auth.uid() = user_id);
`;

console.log('📋 Migration SQL ready!');
console.log('📏 Length:', migrationSQL.length, 'characters');
console.log('\n✅ Copy the SQL below and paste it into Supabase SQL Editor:\n');
console.log('═══════════════════════════════════════════════════════════');
console.log(migrationSQL);
console.log('═══════════════════════════════════════════════════════════');
console.log('\n🚀 After pasting, click "Run" in Supabase SQL Editor');
