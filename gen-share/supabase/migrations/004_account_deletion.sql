-- Generator Share Account Deletion Function
-- Migration 004: Account Deletion RPC

-- Function to delete user account and all associated data
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the current user's ID
    current_user_id := auth.uid();

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Delete in order of foreign key dependencies

    -- Delete messages where user is sender
    DELETE FROM messages WHERE sender_id = current_user_id;

    -- Delete reviews (both given and received)
    DELETE FROM reviews WHERE reviewer_id = current_user_id OR reviewee_id = current_user_id;

    -- Delete reports
    DELETE FROM reports WHERE reporter_id = current_user_id;

    -- Delete blocks
    DELETE FROM blocks WHERE blocker_id = current_user_id OR blocked_id = current_user_id;

    -- Delete conversations where user is a participant
    -- This will cascade delete messages
    DELETE FROM conversations WHERE initiator_id = current_user_id OR owner_id = current_user_id;

    -- Delete listings
    DELETE FROM listings WHERE user_id = current_user_id;

    -- Delete profile
    DELETE FROM profiles WHERE id = current_user_id;

    -- Note: The auth.users record should be deleted via Supabase Auth API
    -- or via a separate admin function with service role
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
