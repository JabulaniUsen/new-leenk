-- Create ads table for customer-facing sponsored media.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  video_url text,
  target_url text,
  placement text NOT NULL DEFAULT 'bottom-right'
    CHECK (placement IN ('bottom-right', 'bottom-left', 'top-right', 'top-left')),
  duration_seconds integer NOT NULL DEFAULT 4
    CHECK (duration_seconds BETWEEN 3 AND 5),
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active ads" ON public.ads;

CREATE POLICY "Anyone can read active ads"
ON public.ads
FOR SELECT
TO public
USING (
  active = true
  AND (starts_at IS NULL OR starts_at <= now())
  AND (ends_at IS NULL OR ends_at >= now())
);

CREATE INDEX IF NOT EXISTS ads_active_schedule_idx
ON public.ads (active, starts_at, ends_at, sort_order, created_at DESC);
