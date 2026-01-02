import { createClient } from '@/lib/supabase/client'

/**
 * Compress image before upload
 * Cost optimization: Reduces storage and egress costs
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/webp',
          quality
        )
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Upload image to Supabase Storage
 * Cost optimization: Uses WebP format, compressed before upload
 */
export async function uploadImage(
  file: File,
  businessId: string,
  bucket: 'images' | 'business_logo' = 'images'
): Promise<string> {
  const supabase = createClient()

  // Compress image
  const compressedBlob = await compressImage(file)
  const compressedFile = new File([compressedBlob], file.name, {
    type: 'image/webp',
  })

  // Generate unique filename
  const fileExt = compressedFile.name.split('.').pop()
  const fileName = `${businessId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  // Upload to storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, compressedFile, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    // Provide helpful error message for missing bucket
    if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
      throw new Error(
        `Storage bucket "${bucket}" not found. Please create it in your Supabase dashboard. See STORAGE_SETUP.md for instructions.`
      )
    }
    throw error
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return publicUrl
}

/**
 * Draw on image (simple canvas-based drawing)
 * Returns blob of drawn image
 */
export async function drawOnImage(
  imageUrl: string,
  drawFunction: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // Draw original image
      ctx.drawImage(img, 0, 0)

      // Apply drawing function
      drawFunction(ctx, img.width, img.height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        'image/webp',
        0.9
      )
    }
    img.onerror = reject
    img.src = imageUrl
  })
}

