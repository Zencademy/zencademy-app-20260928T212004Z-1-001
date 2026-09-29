-- Supabase Profiles Table Schema for Badges
-- Run this SQL in your Supabase SQL Editor to ensure the badges column exists

-- Check if badges column exists, if not add it
DO $$
BEGIN
  -- Add badges column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'badges'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN badges TEXT[] DEFAULT '{}';
    
    RAISE NOTICE 'Added badges column to profiles table';
  ELSE
    RAISE NOTICE 'badges column already exists in profiles table';
  END IF;
END $$;

-- Add brain_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'brain_type'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN brain_type TEXT DEFAULT 'balanced';

    RAISE NOTICE 'Added brain_type column to profiles table';
  ELSE
    RAISE NOTICE 'brain_type column already exists in profiles table';
  END IF;
END $$;

-- Add equipped_badge column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'equipped_badge'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN equipped_badge TEXT;

    RAISE NOTICE 'Added equipped_badge column to profiles table';
  ELSE
    RAISE NOTICE 'equipped_badge column already exists in profiles table';
  END IF;
END $$;

-- Add onboarding_checked column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'onboarding_checked'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN onboarding_checked BOOLEAN DEFAULT FALSE;

    RAISE NOTICE 'Added onboarding_checked column to profiles table';
  ELSE
    RAISE NOTICE 'onboarding_checked column already exists in profiles table';
  END IF;
END $$;

-- Add completed_games column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'completed_games'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN completed_games INTEGER DEFAULT 0;

    RAISE NOTICE 'Added completed_games column to profiles table';
  ELSE
    RAISE NOTICE 'completed_games column already exists in profiles table';
  END IF;
END $$;

-- Verify the columns exist and have correct type
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('badges', 'onboarding_checked', 'completed_games');

-- Optional: If you need to migrate existing data from another column
-- UPDATE profiles 
-- SET badges = ARRAY[]::TEXT[] 
-- WHERE badges IS NULL;

-- Example: Update a specific user's badges (for testing)
-- UPDATE profiles 
-- SET badges = ARRAY['badge-legend', 'badge-focus']::TEXT[]
-- WHERE id = 'your-user-id-here';

