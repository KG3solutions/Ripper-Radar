-- Generator Share Row Level Security Policies
-- Migration 002: RLS Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Anyone can view basic profile info
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- LISTINGS POLICIES
-- ============================================

-- Anyone can view active listings (except from blocked users)
CREATE POLICY "Active listings are viewable"
    ON listings FOR SELECT
    USING (
        is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM blocks
            WHERE blocker_id = auth.uid() AND blocked_id = user_id
        )
        AND NOT EXISTS (
            SELECT 1 FROM blocks
            WHERE blocker_id = user_id AND blocked_id = auth.uid()
        )
    );

-- Users can view their own inactive listings
CREATE POLICY "Users can view own listings"
    ON listings FOR SELECT
    USING (user_id = auth.uid());

-- Authenticated users with verified phone can create listings
CREATE POLICY "Verified users can create listings"
    ON listings FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND phone_verified = true AND is_banned = false
        )
    );

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
    ON listings FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete (deactivate) their own listings
CREATE POLICY "Users can delete own listings"
    ON listings FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================

-- Users can only see conversations they're part of
CREATE POLICY "Users can view own conversations"
    ON conversations FOR SELECT
    USING (
        auth.uid() = initiator_id OR auth.uid() = owner_id
    );

-- Authenticated users can start conversations
CREATE POLICY "Users can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (
        auth.uid() = initiator_id
        AND auth.uid() != owner_id
        AND NOT EXISTS (
            SELECT 1 FROM blocks
            WHERE (blocker_id = auth.uid() AND blocked_id = owner_id)
            OR (blocker_id = owner_id AND blocked_id = auth.uid())
        )
    );

-- Both parties can update conversation status
CREATE POLICY "Participants can update conversations"
    ON conversations FOR UPDATE
    USING (auth.uid() = initiator_id OR auth.uid() = owner_id)
    WITH CHECK (auth.uid() = initiator_id OR auth.uid() = owner_id);

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view conversation messages"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE id = conversation_id
            AND (initiator_id = auth.uid() OR owner_id = auth.uid())
        )
    );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM conversations
            WHERE id = conversation_id
            AND (initiator_id = auth.uid() OR owner_id = auth.uid())
            AND status NOT IN ('cancelled')
        )
    );

-- ============================================
-- REVIEWS POLICIES
-- ============================================

-- Reviews are publicly viewable
CREATE POLICY "Reviews are viewable"
    ON reviews FOR SELECT
    USING (true);

-- Users can create reviews for completed conversations they participated in
CREATE POLICY "Users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (
        auth.uid() = reviewer_id
        AND auth.uid() != reviewee_id
        AND EXISTS (
            SELECT 1 FROM conversations
            WHERE id = conversation_id
            AND status = 'completed'
            AND (initiator_id = auth.uid() OR owner_id = auth.uid())
        )
        -- Ensure reviewee was the other party
        AND EXISTS (
            SELECT 1 FROM conversations
            WHERE id = conversation_id
            AND (
                (initiator_id = auth.uid() AND owner_id = reviewee_id)
                OR (owner_id = auth.uid() AND initiator_id = reviewee_id)
            )
        )
    );

-- ============================================
-- REPORTS POLICIES
-- ============================================

-- Only the reporter can see their own reports
CREATE POLICY "Users can view own reports"
    ON reports FOR SELECT
    USING (reporter_id = auth.uid());

-- Authenticated users can create reports
CREATE POLICY "Users can create reports"
    ON reports FOR INSERT
    WITH CHECK (
        auth.uid() = reporter_id
        AND auth.uid() != reported_user_id
    );

-- ============================================
-- BLOCKS POLICIES
-- ============================================

-- Users can view their own blocks
CREATE POLICY "Users can view own blocks"
    ON blocks FOR SELECT
    USING (blocker_id = auth.uid());

-- Users can create blocks
CREATE POLICY "Users can create blocks"
    ON blocks FOR INSERT
    WITH CHECK (
        auth.uid() = blocker_id
        AND auth.uid() != blocked_id
    );

-- Users can remove their own blocks
CREATE POLICY "Users can remove blocks"
    ON blocks FOR DELETE
    USING (blocker_id = auth.uid());

-- ============================================
-- ADMIN POLICIES (using service role or admin flag)
-- ============================================

-- Create admin function for checking admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user ID is in the ADMIN_USER_IDS environment variable
    -- This is a simplified check - in production, you might want a more robust solution
    RETURN auth.uid()::text = ANY(string_to_array(current_setting('app.admin_user_ids', true), ','));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin can view all reports
CREATE POLICY "Admins can view all reports"
    ON reports FOR SELECT
    USING (is_admin());

-- Admin can update reports
CREATE POLICY "Admins can update reports"
    ON reports FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Admin can update profiles (for banning)
CREATE POLICY "Admins can update any profile"
    ON profiles FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Admin can deactivate any listing
CREATE POLICY "Admins can update any listing"
    ON listings FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());
