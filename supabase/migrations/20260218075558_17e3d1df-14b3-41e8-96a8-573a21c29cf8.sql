
-- Open Banking Connections
CREATE TABLE public.open_banking_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_name TEXT NOT NULL,
  provider_code TEXT NOT NULL,
  connection_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (connection_status IN ('active', 'expired', 'error', 'pending')),
  consent_id TEXT,
  consent_expires_at TIMESTAMPTZ,
  last_sync TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.open_banking_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections" ON public.open_banking_connections FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own connections" ON public.open_banking_connections FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own connections" ON public.open_banking_connections FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own connections" ON public.open_banking_connections FOR DELETE USING (user_id = auth.uid());

CREATE TRIGGER update_open_banking_connections_updated_at
  BEFORE UPDATE ON public.open_banking_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sync History
CREATE TABLE public.sync_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  connection_id UUID REFERENCES public.open_banking_connections(id) ON DELETE SET NULL,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('manual', 'automatic', 'scheduled')),
  sync_status TEXT NOT NULL CHECK (sync_status IN ('success', 'partial', 'failed')),
  transactions_added INTEGER DEFAULT 0,
  transactions_updated INTEGER DEFAULT 0,
  sync_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  sync_end TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sync_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync history" ON public.sync_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own sync history" ON public.sync_history FOR INSERT WITH CHECK (user_id = auth.uid());

-- Merchants
CREATE TABLE public.merchants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  logo_url TEXT,
  website TEXT,
  auto_categorize BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view merchants" ON public.merchants FOR SELECT USING (true);

CREATE TRIGGER update_merchants_updated_at
  BEFORE UPDATE ON public.merchants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add open banking fields to accounts table
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS open_banking_provider TEXT,
  ADD COLUMN IF NOT EXISTS open_banking_connection_id UUID REFERENCES public.open_banking_connections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_sync TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_synced BOOLEAN DEFAULT false;
