-- Add brain_type column to profiles table if it doesn't exist
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

