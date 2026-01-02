# RLS Policy Fix for Messages Table

## Problem
Getting error: `new row violates row-level security policy` when trying to insert messages.

## Root Cause
The Row Level Security (RLS) policies on the `messages` table may not be correctly configured to allow:
1. **Customer messages**: Unauthenticated users inserting messages with `sender_type = 'customer'`
2. **Business messages**: Authenticated business users inserting messages in their conversations

## Solution

Run this SQL in your Supabase SQL Editor to fix the RLS policies:

```sql
-- ============================================
-- FIX RLS POLICIES FOR MESSAGES TABLE
-- ============================================

-- Step 1: Drop ALL existing policies on messages table
DROP POLICY IF EXISTS "Enable insert for customer messages" ON messages;
DROP POLICY IF EXISTS "Businesses can manage messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Businesses can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Businesses can read messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Enable read for customer chat" ON messages;
DROP POLICY IF EXISTS "Users can access messages in their conversations" ON messages;

-- Step 2: Create policies for SELECT (read)
-- Allow businesses to read messages in their conversations
CREATE POLICY "Businesses can read messages in their conversations" 
ON messages 
FOR SELECT 
TO authenticated 
USING (
  conversation_id IN (
    SELECT id 
    FROM conversations 
    WHERE business_id::text = auth.uid()::text
  )
);

-- Allow public read for customer chat (customers don't authenticate)
CREATE POLICY "Enable read for customer chat" 
ON messages 
FOR SELECT 
TO public 
USING (true);

-- Step 3: Create policies for INSERT
-- Allow customers (unauthenticated) to insert messages
-- This allows anyone to insert a message if sender_type is 'customer'
CREATE POLICY "Enable insert for customer messages" 
ON messages 
FOR INSERT 
TO public 
WITH CHECK (sender_type = 'customer');

-- Allow businesses (authenticated) to insert messages in their conversations
CREATE POLICY "Businesses can insert messages in their conversations" 
ON messages 
FOR INSERT 
TO authenticated 
WITH CHECK (
  conversation_id IN (
    SELECT id 
    FROM conversations 
    WHERE business_id::text = auth.uid()::text
  )
);

-- Step 4: Create policies for UPDATE and DELETE
-- Allow businesses to update/delete messages in their conversations
CREATE POLICY "Businesses can manage messages in their conversations" 
ON messages 
FOR ALL 
USING (
  conversation_id IN (
    SELECT id 
    FROM conversations 
    WHERE business_id::text = auth.uid()::text
  )
)
WITH CHECK (
  conversation_id IN (
    SELECT id 
    FROM conversations 
    WHERE business_id::text = auth.uid()::text
  )
);
```

## Verification

After running the SQL:

1. **Test customer message insert** (should work without authentication):
   ```sql
   -- This should work (simulating customer insert)
   INSERT INTO messages (conversation_id, sender_type, sender_id, content, status)
   VALUES ('some-conversation-id', 'customer', 'customer@email.com', 'Test message', 'sent');
   ```

2. **Test business message insert** (should work with authentication):
   - Log in as a business user
   - Try sending a message in a conversation
   - Should work if the conversation belongs to that business

## Additional Notes

- The `conversations` table also needs proper RLS policies for inserts
- Make sure the `conversations` table has a policy that allows public inserts for customer conversations
- The `images` table may also need RLS policies if you're storing image metadata there

---

# Storage Bucket RLS Policy Fix

## Problem
Getting error: `new row violates row-level security policy` when trying to upload images to Supabase Storage.

## Root Cause
The storage bucket RLS policies are blocking uploads from unauthenticated users (customers).

## Solution

Run this SQL in your Supabase SQL Editor to fix the storage bucket policies:

```sql
-- ============================================
-- FIX STORAGE BUCKET RLS POLICIES
-- ============================================

-- Step 1: Drop existing storage policies for images bucket
DROP POLICY IF EXISTS "Anyone can read images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload images" ON storage.objects;

-- Step 2: Create policies for images bucket
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

-- Step 3: Ensure business_logo policies are correct
-- (These should already exist, but let's make sure)
DROP POLICY IF EXISTS "Anyone can read business logos" ON storage.objects;
DROP POLICY IF EXISTS "Businesses can upload their own logo" ON storage.objects;
DROP POLICY IF EXISTS "Businesses can update their own logo" ON storage.objects;
DROP POLICY IF EXISTS "Businesses can delete their own logo" ON storage.objects;

-- Allow anyone to read business logos
CREATE POLICY "Anyone can read business logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business_logo');

-- Allow businesses to upload their own logo
CREATE POLICY "Businesses can upload their own logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business_logo' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow businesses to update their own logo
CREATE POLICY "Businesses can update their own logo"
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

-- Allow businesses to delete their own logo
CREATE POLICY "Businesses can delete their own logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'business_logo' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Verification

After running the SQL:

1. **Test image upload from customer chat** (should work without authentication)
2. **Test image upload from business chat** (should work with authentication)
3. **Test logo upload from settings** (should work with authentication)

## Security Note

The `images` bucket allows public uploads because customers (who are unauthenticated) need to upload images. The bucket is public for reading, which is fine for chat images. If you want to restrict uploads further, you could:
- Add file size validation in the application code (already done)
- Add file type validation in the application code (already done)
- Monitor uploads and add rate limiting if needed

## If Issues Persist

1. Check if RLS is enabled on the messages table:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'messages';
   ```

2. Check existing policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'messages';
   ```

3. Verify the conversation exists and belongs to the business:
   ```sql
   SELECT id, business_id, customer_email 
   FROM conversations 
   WHERE id = 'your-conversation-id';
   ```

