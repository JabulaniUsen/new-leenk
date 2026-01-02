# Storage Buckets Setup Guide

## Problem
If you're getting "Bucket not found" errors when uploading images, the storage buckets haven't been created in your Supabase project yet.

## Solution

### Option 1: Create Buckets via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"** or **"Create bucket"**

#### Create `images` bucket:
- **Name**: `images`
- **Public bucket**: ✅ Yes (check this)
- **File size limit**: 10MB (10485760 bytes)
- **Allowed MIME types**: 
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`

#### Create `business_logo` bucket:
- **Name**: `business_logo`
- **Public bucket**: ✅ Yes (check this)
- **File size limit**: 5MB (5242880 bytes)
- **Allowed MIME types**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`

### Option 2: Create Buckets via SQL (Alternative)

Run this SQL in your Supabase SQL Editor:

```sql
-- Create images bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create business_logo bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business_logo',
  'business_logo',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;
```

### Storage Policies

After creating the buckets, make sure the storage policies are set up. Run this SQL:

```sql
-- ============================================
-- STORAGE POLICIES FOR IMAGES BUCKET
-- ============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can read images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload images" ON storage.objects;

-- Allow anyone to read images (public bucket)
CREATE POLICY "Anyone can read images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Allow anyone to upload images (customers are unauthenticated)
CREATE POLICY "Public can upload images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to update images
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- Business Logo Storage Policies
CREATE POLICY IF NOT EXISTS "Anyone can read business logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business_logo');

CREATE POLICY IF NOT EXISTS "Businesses can upload their own logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business_logo' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY IF NOT EXISTS "Businesses can update their own logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business_logo' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'business_logo' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY IF NOT EXISTS "Businesses can delete their own logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'business_logo' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Verify Setup

After creating the buckets, try uploading an image again. The error should be resolved.

## Troubleshooting

- **Still getting "Bucket not found"**: Make sure the bucket names are exactly `images` and `business_logo` (lowercase, no spaces)
- **Upload fails with permission error**: Check that the storage policies are created correctly
- **Images not displaying**: Ensure buckets are set to "Public"
