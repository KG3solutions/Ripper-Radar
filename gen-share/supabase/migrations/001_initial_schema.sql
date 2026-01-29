-- Generator Share Database Schema
-- Migration 001: Initial Schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT '',
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    phone_number TEXT,
    positive_reviews INTEGER NOT NULL DEFAULT 0,
    negative_reviews INTEGER NOT NULL DEFAULT 0,
    is_banned BOOLEAN NOT NULL DEFAULT false,
    ban_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, display_name, phone_verified, phone_number)
    VALUES (
        NEW.id,
        COALESCE(SPLIT_PART(NEW.phone, '', 1), 'User'),
        NEW.phone IS NOT NULL,
        NEW.phone
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Update phone_verified when phone is confirmed
CREATE OR REPLACE FUNCTION handle_phone_verified()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.phone IS NOT NULL AND NEW.phone_confirmed_at IS NOT NULL THEN
        UPDATE profiles
        SET phone_verified = true, phone_number = NEW.phone
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_phone_verified
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (OLD.phone_confirmed_at IS NULL AND NEW.phone_confirmed_at IS NOT NULL)
    EXECUTE FUNCTION handle_phone_verified();

-- ============================================
-- LISTINGS TABLE
-- ============================================
CREATE TYPE listing_type AS ENUM ('offer', 'request');
CREATE TYPE generator_type AS ENUM ('portable', 'inverter', 'standby', 'other');
CREATE TYPE fuel_type AS ENUM ('gasoline', 'propane', 'dual_fuel', 'solar_battery', 'other');
CREATE TYPE wattage_range AS ENUM ('under_2000', '2000_3500', '3500_5000', '5000_7500', '7500_10000', 'over_10000', 'not_sure');
CREATE TYPE neighborhood AS ENUM (
    'east_nashville', 'germantown', 'the_nations', '12_south', 'sylvan_park',
    'inglewood', 'madison', 'donelson', 'bellevue', 'green_hills',
    'berry_hill', 'antioch', 'hermitage'
);
CREATE TYPE timeframe AS ENUM ('asap', 'within_24h', 'within_2_3_days', 'flexible');

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_type listing_type NOT NULL,
    generator_type generator_type,
    wattage_range wattage_range NOT NULL,
    fuel_type fuel_type,
    neighborhood neighborhood NOT NULL,
    available_until DATE,
    timeframe timeframe,
    is_urgent BOOLEAN NOT NULL DEFAULT false,
    has_fuel BOOLEAN,
    has_cords BOOLEAN,
    notes TEXT CHECK (LENGTH(notes) <= 200),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster browsing
CREATE INDEX idx_listings_active ON listings(is_active, listing_type);
CREATE INDEX idx_listings_neighborhood ON listings(neighborhood) WHERE is_active = true;
CREATE INDEX idx_listings_user ON listings(user_id);

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TYPE conversation_status AS ENUM ('proposed', 'confirmed', 'completed', 'cancelled');

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    initiator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status conversation_status NOT NULL DEFAULT 'proposed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(listing_id, initiator_id)
);

-- Index for faster conversation lookup
CREATE INDEX idx_conversations_users ON conversations(initiator_id, owner_id);
CREATE INDEX idx_conversations_listing ON conversations(listing_id);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (LENGTH(content) <= 1000),
    is_system_message BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching conversation messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TYPE review_sentiment AS ENUM ('positive', 'negative');

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sentiment review_sentiment NOT NULL,
    comment TEXT CHECK (LENGTH(comment) <= 50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(conversation_id, reviewer_id)
);

-- Index for fetching user reviews
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);

-- Update review counts on profile
CREATE OR REPLACE FUNCTION update_review_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.sentiment = 'positive' THEN
            UPDATE profiles SET positive_reviews = positive_reviews + 1 WHERE id = NEW.reviewee_id;
        ELSE
            UPDATE profiles SET negative_reviews = negative_reviews + 1 WHERE id = NEW.reviewee_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.sentiment = 'positive' THEN
            UPDATE profiles SET positive_reviews = positive_reviews - 1 WHERE id = OLD.reviewee_id;
        ELSE
            UPDATE profiles SET negative_reviews = negative_reviews - 1 WHERE id = OLD.reviewee_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
    AFTER INSERT OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_review_counts();

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TYPE report_reason AS ENUM ('spam_fake', 'harassment', 'payment_request', 'no_show', 'safety_concern', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'dismissed');

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reported_listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    reason report_reason NOT NULL,
    details TEXT CHECK (LENGTH(details) <= 500),
    block_user BOOLEAN NOT NULL DEFAULT false,
    status report_status NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (reported_user_id IS NOT NULL OR reported_listing_id IS NOT NULL)
);

-- Index for admin moderation
CREATE INDEX idx_reports_pending ON reports(status) WHERE status = 'pending';

-- ============================================
-- BLOCKS TABLE
-- ============================================
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- Index for checking blocks
CREATE INDEX idx_blocks_users ON blocks(blocker_id, blocked_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
