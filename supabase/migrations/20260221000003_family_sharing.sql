-- ================================================
-- Family Sharing System
-- ================================================

-- טבלת משפחות
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- טבלת חברי משפחה
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'child', 'viewer')),
    display_name TEXT,
    -- הרשאות
    can_add_transactions BOOLEAN DEFAULT TRUE,
    can_edit_transactions BOOLEAN DEFAULT TRUE,
    can_delete_transactions BOOLEAN DEFAULT FALSE,
    can_view_all_transactions BOOLEAN DEFAULT TRUE,
    can_edit_budgets BOOLEAN DEFAULT FALSE,
    can_view_budgets BOOLEAN DEFAULT TRUE,
    can_manage_members BOOLEAN DEFAULT FALSE,
    -- סטטוס
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(family_id, user_id)
);

-- טבלת הזמנות
CREATE TABLE IF NOT EXISTS family_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    role TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- אינדקסים
CREATE INDEX IF NOT EXISTS idx_families_created_by ON families(created_by);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_token ON family_invitations(token);
CREATE INDEX IF NOT EXISTS idx_family_invitations_email ON family_invitations(email);

-- RLS Policies
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- Families policies
CREATE POLICY "Users can view families they're members of"
    ON families FOR SELECT
    USING (
        id IN (
            SELECT family_id FROM family_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create families"
    ON families FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update their families"
    ON families FOR UPDATE
    USING (
        id IN (
            SELECT family_id FROM family_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Family members policies
CREATE POLICY "Members can view other members in their family"
    ON family_members FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM family_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage family members"
    ON family_members FOR ALL
    USING (
        family_id IN (
            SELECT family_id FROM family_members
            WHERE user_id = auth.uid() AND can_manage_members = TRUE
        )
    );

-- Invitations policies
CREATE POLICY "Anyone can view their own invitations"
    ON family_invitations FOR SELECT
    USING (email = auth.email());

CREATE POLICY "Admins can create invitations"
    ON family_invitations FOR INSERT
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM family_members
            WHERE user_id = auth.uid() AND can_manage_members = TRUE
        )
    );

-- עדכון טבלת transactions לתמיכה במשפחות
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id);

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id);

ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id),
ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES family_members(id);

-- Function ליצירת משפחה אוטומטית למשתמש חדש
CREATE OR REPLACE FUNCTION create_default_family()
RETURNS TRIGGER AS $$
DECLARE
    new_family_id UUID;
BEGIN
    -- יצירת משפחה חדשה
    INSERT INTO families (name, created_by)
    VALUES ('המשפחה של ' || COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.id)
    RETURNING id INTO new_family_id;
    
    -- הוספת המשתמש כאדמין
    INSERT INTO family_members (
        family_id, 
        user_id, 
        role,
        can_manage_members,
        can_edit_budgets,
        can_delete_transactions
    )
    VALUES (
        new_family_id,
        NEW.id,
        'admin',
        TRUE,
        TRUE,
        TRUE
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_creates_default_family
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_family();

-- Function לקבלת משפחה של משתמש
CREATE OR REPLACE FUNCTION get_user_family(p_user_id UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT family_id
        FROM family_members
        WHERE user_id = p_user_id
        AND is_active = TRUE
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- Function לבדיקת הרשאות
CREATE OR REPLACE FUNCTION user_can(
    p_user_id UUID,
    p_permission TEXT,
    p_family_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM family_members
        WHERE user_id = p_user_id
        AND family_id = p_family_id
        AND is_active = TRUE
        AND (
            (p_permission = 'add_transactions' AND can_add_transactions = TRUE) OR
            (p_permission = 'edit_transactions' AND can_edit_transactions = TRUE) OR
            (p_permission = 'delete_transactions' AND can_delete_transactions = TRUE) OR
            (p_permission = 'edit_budgets' AND can_edit_budgets = TRUE) OR
            (p_permission = 'manage_members' AND can_manage_members = TRUE) OR
            role = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE families IS 'משפחות - קבוצות משתמשים';
COMMENT ON TABLE family_members IS 'חברי משפחה עם הרשאות';
COMMENT ON TABLE family_invitations IS 'הזמנות להצטרף למשפחה';
