-- Add per-business appearance customization columns
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS theme_primary_color text,
  ADD COLUMN IF NOT EXISTS theme_secondary_color text,
  ADD COLUMN IF NOT EXISTS theme_font_family text,
  ADD COLUMN IF NOT EXISTS theme_font_style text;

-- Seed existing rows with defaults where not set
UPDATE public.businesses
SET
  theme_primary_color = COALESCE(theme_primary_color, '#9333ea'),
  theme_secondary_color = COALESCE(theme_secondary_color, '#f3e8ff'),
  theme_font_family = COALESCE(theme_font_family, 'Arial, sans-serif'),
  theme_font_style = COALESCE(theme_font_style, 'normal')
WHERE
  theme_primary_color IS NULL
  OR theme_secondary_color IS NULL
  OR theme_font_family IS NULL
  OR theme_font_style IS NULL;
