-- ================================================
-- AI Chatbot - Chat History Table
-- ================================================

CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    bot_reply TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- אינדקסים
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at DESC);

-- RLS
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat history"
    ON chat_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert chat messages"
    ON chat_history FOR INSERT
    WITH CHECK (true);

COMMENT ON TABLE chat_history IS 'היסטוריית שיחות עם הצ\'אטבוט AI';
