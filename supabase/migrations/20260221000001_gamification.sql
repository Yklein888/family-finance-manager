-- ================================================
-- Gamification Tables
-- ================================================

-- טבלת נקודות והישגים למשתמש
CREATE TABLE IF NOT EXISTS user_gamification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    months_in_budget INTEGER DEFAULT 0,
    early_bird_days INTEGER DEFAULT 0,
    night_owl_days INTEGER DEFAULT 0,
    weekend_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- טבלת הישגים שהושגו
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points INTEGER NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- טבלת אתגרים פעילים
CREATE TABLE IF NOT EXISTS user_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_type TEXT NOT NULL,
    target_value REAL NOT NULL,
    current_value REAL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    reward_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- אינדקסים
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_active ON user_challenges(user_id, is_completed, end_date);

-- RLS Policies
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

-- Gamification policies
CREATE POLICY "Users can view their own gamification"
    ON user_gamification FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification"
    ON user_gamification FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert gamification"
    ON user_gamification FOR INSERT
    WITH CHECK (true);

-- Achievements policies
CREATE POLICY "Users can view their own achievements"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (true);

-- Challenges policies
CREATE POLICY "Users can view their own challenges"
    ON user_challenges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
    ON user_challenges FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert challenges"
    ON user_challenges FOR INSERT
    WITH CHECK (true);

-- Trigger לעדכון streak אוטומטי
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
BEGIN
    -- בדיקה אם התנועה היא מהיום
    IF NEW.transaction_date::date = CURRENT_DATE THEN
        -- עדכון last_activity_date ו-streak
        UPDATE user_gamification
        SET 
            last_activity_date = CURRENT_DATE,
            current_streak = CASE
                WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' 
                THEN current_streak + 1
                WHEN last_activity_date = CURRENT_DATE
                THEN current_streak
                ELSE 1
            END,
            longest_streak = GREATEST(
                longest_streak,
                CASE
                    WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day'
                    THEN current_streak + 1
                    ELSE 1
                END
            ),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;

        -- בדיקת early bird (לפני 8 בבוקר)
        IF EXTRACT(HOUR FROM NEW.created_at) < 8 THEN
            UPDATE user_gamification
            SET early_bird_days = early_bird_days + 1
            WHERE user_id = NEW.user_id;
        END IF;

        -- בדיקת night owl (אחרי 00:00)
        IF EXTRACT(HOUR FROM NEW.created_at) >= 0 AND EXTRACT(HOUR FROM NEW.created_at) < 6 THEN
            UPDATE user_gamification
            SET night_owl_days = night_owl_days + 1
            WHERE user_id = NEW.user_id;
        END IF;

        -- בדיקת weekend (שישי-שבת)
        IF EXTRACT(DOW FROM NEW.transaction_date) IN (5, 6) THEN
            UPDATE user_gamification
            SET weekend_days = weekend_days + 1
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_updates_streak
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_streak();

-- Function ליצירת gamification record אוטומטי למשתמש חדש
CREATE OR REPLACE FUNCTION create_user_gamification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_gamification (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_creates_gamification
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_gamification();

COMMENT ON TABLE user_gamification IS 'מערכת הנקודות וההישגים של המשתמש';
COMMENT ON TABLE user_achievements IS 'הישגים שהמשתמש השיג';
COMMENT ON TABLE user_challenges IS 'אתגרים פעילים של המשתמש';
