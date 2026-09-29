# Supabase Integration Setup

## Configuration Required

To complete the Supabase integration, you need to:

### 1. Update Supabase Configuration

Edit `utils/supabase.ts` and replace the placeholder values:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual Supabase project URL and anon key from your Supabase dashboard.

### 2. Database Schema

Your Supabase database should have a `profiles` table with the following structure:

```sql
-- Main profiles table (should already exist if using Supabase Auth)
-- This assumes you're using Supabase Auth which automatically creates a profiles table
-- If not, create it manually:

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT DEFAULT 'Guest',
  email TEXT,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  level_points INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  daily_streak_count INTEGER DEFAULT 0,
  last_training_at TEXT,
  last_login_at TEXT,
  plan TEXT DEFAULT 'free',
  subscription_id TEXT,
  brain_type TEXT DEFAULT 'balanced',
  onboarding_checked BOOLEAN DEFAULT false,
  equipped_badge TEXT,
  badges TEXT[] DEFAULT '{}',  -- Array of badge IDs
  session_time INTEGER DEFAULT 0,
  completed_games INTEGER DEFAULT 0,
  ebooks JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add badges column if it doesn't exist (run this separately)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'badges'
  ) THEN
    ALTER TABLE profiles ADD COLUMN badges TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY IF NOT EXISTS "Users can view own data" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own data" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own data" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policy for leaderboard (public read)
CREATE POLICY IF NOT EXISTS "Anyone can view leaderboard" ON profiles
  FOR SELECT USING (true);
```

**Important**: Run the `supabase_schema.sql` file in your Supabase SQL Editor to ensure the `badges` column exists.

### 3. Authentication Setup

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Configure your site URL (for web app)
3. Add your mobile app's bundle identifier to allowed origins
4. Enable email/password authentication

### 4. Real-time Subscriptions

The app uses real-time subscriptions to sync data between web and mobile. Make sure:

1. Real-time is enabled in your Supabase project
2. The `profiles` table has real-time enabled (Database > Replication > Enable for `profiles`)
3. Row Level Security policies allow the necessary operations

### 5. Testing

After configuration:

1. Start the app: `npm start`
2. Try registering a new account
3. Check that data appears in your Supabase dashboard
4. Test login/logout functionality
5. Verify data syncs between web and mobile

## Features Included

- ✅ User authentication (sign up, sign in, sign out)
- ✅ User data persistence (XP, level, streak, badges, etc.)
- ✅ Real-time data synchronization
- ✅ Leaderboard functionality
- ✅ Cross-platform compatibility (web + mobile)
- ✅ Offline support with AsyncStorage

## Data Sync

All user data (stats, leaderboard, points, streaks) will automatically sync between your website and mobile app through the shared Supabase database. Users can log in on either platform and see their progress everywhere.
