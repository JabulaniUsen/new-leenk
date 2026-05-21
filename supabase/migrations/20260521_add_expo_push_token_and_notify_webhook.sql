-- Add expo push token column to businesses table
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS expo_push_token text;
