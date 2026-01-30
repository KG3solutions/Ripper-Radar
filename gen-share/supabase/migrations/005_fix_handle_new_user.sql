-- Generator Share Database Schema Fix
-- Migration 005: Fix handle_new_user trigger for email OTP signup
--
-- Problem: The original handle_new_user() function had issues:
-- 1. SPLIT_PART(NEW.phone, '', 1) splits by empty string (meaningless)
-- 2. Didn't handle email OTP signups (phone is NULL for email users)
-- 3. No exception handling causing transaction rollback
--
-- This migration replaces the trigger function to properly handle:
-- - Email OTP signups (NEW.email is set, NEW.phone is NULL)
-- - Phone OTP signups (NEW.phone is set)
-- - OAuth/other signups (uses email or fallback)

-- ============================================
-- FIX: Replace handle_new_user function
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_display_name TEXT;
BEGIN
    -- Determine display name:
    -- 1. For email users: extract username from email (before @)
    -- 2. For phone users: use last 4 digits of phone
    -- 3. Fallback: 'User'
    IF NEW.email IS NOT NULL AND NEW.email != '' THEN
        -- Extract username from email (before the @ symbol)
        user_display_name := SPLIT_PART(NEW.email, '@', 1);
    ELSIF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
        -- Use last 4 digits of phone number
        user_display_name := 'User ' || RIGHT(NEW.phone, 4);
    ELSE
        user_display_name := 'User';
    END IF;

    -- Insert the profile with safe defaults
    INSERT INTO public.profiles (
        id,
        display_name,
        phone_verified,
        phone_number
    )
    VALUES (
        NEW.id,
        user_display_name,
        -- phone_verified is true only if phone exists AND is confirmed
        COALESCE(NEW.phone_confirmed_at IS NOT NULL, false),
        NEW.phone
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        -- The profile can be created later if needed
        RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Ensure the trigger is properly set up
-- ============================================
-- Drop and recreate to ensure clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Grant necessary permissions
-- ============================================
-- The function needs to be able to insert into profiles
-- SECURITY DEFINER already handles this, but ensure public schema access
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- ============================================
-- Create any missing profiles for existing users
-- ============================================
-- This handles cases where users were created but profile creation failed
INSERT INTO public.profiles (id, display_name, phone_verified, phone_number)
SELECT
    u.id,
    COALESCE(
        NULLIF(SPLIT_PART(u.email, '@', 1), ''),
        CASE WHEN u.phone IS NOT NULL THEN 'User ' || RIGHT(u.phone, 4) ELSE 'User' END
    ),
    COALESCE(u.phone_confirmed_at IS NOT NULL, false),
    u.phone
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
