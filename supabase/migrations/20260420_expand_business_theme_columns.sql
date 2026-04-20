ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS theme_font_size text DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS theme_border_radius text DEFAULT 'rounded',
  ADD COLUMN IF NOT EXISTS theme_header_style text DEFAULT 'solid',
  ADD COLUMN IF NOT EXISTS theme_chat_bg text DEFAULT 'plain';
