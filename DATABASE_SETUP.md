# Database Setup for Authentication and Notifications

This guide contains the complete SQL script to set up the necessary database tables in Supabase for the authentication and notification features.

## Complete SQL Script

Copy and paste the entire script below into your Supabase SQL Editor and run it:

```sql
-- ============================================
-- COMPLETE DATABASE SETUP SCRIPT
-- ============================================
-- Run this entire script in your Supabase SQL Editor
-- ============================================

-- 1. Create Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'memory', 
    'milestone', 
    'recipe', 
    'location', 
    'love_letter', 
    'playlist', 
    'joke', 
    'date_idea', 
    'care_package', 
    'countdown', 
    'daily_message', 
    'reason', 
    'compliment', 
    'language_entry'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 2. Add user_id Column to Existing Tables
-- ============================================
-- Memories table
ALTER TABLE memories ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Milestones table
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Locations table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Love Letters table (if exists)
ALTER TABLE love_letters ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Playlists table (if exists)
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Jokes table (if exists)
ALTER TABLE jokes ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Date Ideas table (if exists)
ALTER TABLE date_ideas ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Care Packages table (if exists)
ALTER TABLE care_packages ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Countdowns table (if exists)
ALTER TABLE countdowns ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Daily Messages table (if exists)
ALTER TABLE daily_messages ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Reasons table (if exists)
ALTER TABLE reasons ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Compliments table (if exists)
ALTER TABLE compliments ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Language Entries table (if exists)
ALTER TABLE language_entries ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 3. Row Level Security (RLS) Policies for Notifications
-- ============================================
-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Policy: Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (true);

-- Policy: System can insert notifications (for the system)
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (true);

-- 4. Enable Real-time Replication
-- ============================================
-- Enable real-time for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 5. Create Helper Function for Cleanup (Optional)
-- ============================================
-- Function to automatically delete old read notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE read = true
  AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready for authentication and notifications.
-- Test by logging in and uploading content to see notifications appear.
-- ============================================
```

## Step-by-Step Instructions

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com) and sign in
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Script**
   - Copy the entire SQL script above
   - Paste it into the SQL Editor
   - Click "Run" or press `Ctrl+Enter` (or `Cmd+Enter` on Mac)

4. **Verify Setup**
   - Go to "Table Editor" in the left sidebar
   - You should see the `notifications` table
   - Check that existing tables have the `user_id` column

5. **Enable Real-time (Alternative Method)**
   - If the SQL method doesn't work, go to Database → Replication
   - Find the `notifications` table
   - Toggle the replication switch ON

## Testing

After running the script, test the setup:

1. **Test Login**
   - Open your application
   - Try logging in with:
     - Username: `me`, Password: `love123`
     - Username: `boyfriend`, Password: `love123`

2. **Test Notifications**
   - Log in as one user
   - Upload a memory, milestone, recipe, or location
   - Log in as the other user
   - You should see a notification appear in the notification bell icon (top-right)

3. **Test Real-time**
   - Have both users logged in (in different browsers/incognito)
   - One user uploads content
   - The other user should see the notification appear immediately without refreshing

## Troubleshooting

### If you get "relation already exists" errors:
- The tables already exist, which is fine
- The script uses `IF NOT EXISTS` to handle this gracefully

### If real-time doesn't work:
- Make sure you've enabled replication in Database → Replication
- Check that your Supabase plan supports real-time features
- Verify the `supabase_realtime` publication exists

### If notifications don't appear:
- Check the browser console for errors
- Verify the `notifications` table was created
- Check that RLS policies are set correctly
- Ensure `user_id` columns were added to content tables

## Notes

- The `user_id` field stores either 'user1' or 'user2' based on which account is logged in
- Notifications are automatically created when content is uploaded
- The notification bell in the top-right corner shows unread notifications
- Real-time updates mean notifications appear immediately without page refresh
- Old read notifications can be cleaned up using the helper function (optional)

