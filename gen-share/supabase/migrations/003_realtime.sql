-- Generator Share Realtime Configuration
-- Migration 003: Enable Realtime

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for conversations table (for status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
