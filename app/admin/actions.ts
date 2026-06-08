'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  clearAdminSession,
  hasValidAdminSession,
  isValidAdminAccessCode,
  setAdminSession,
} from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/lib/types/database'

type AdInsert = Database['public']['Tables']['ads']['Insert']
type AdUpdate = Database['public']['Tables']['ads']['Update']
type AdPlacement = Database['public']['Tables']['ads']['Row']['placement']

const AD_PLACEMENTS: AdPlacement[] = [
  'bottom-right',
  'bottom-left',
  'top-right',
  'top-left',
]

async function requireAdminSession() {
  const isAuthenticated = await hasValidAdminSession()

  if (!isAuthenticated) {
    redirect('/admin')
  }
}

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim()
}

function getNullableText(formData: FormData, key: string) {
  const value = getText(formData, key)
  return value || null
}

function getRequiredUrl(formData: FormData, key: string, label: string) {
  const value = getText(formData, key)

  if (!value) {
    throw new Error(`${label} is required.`)
  }

  return normalizeUrl(value, label)
}

function getNullableUrl(formData: FormData, key: string, label: string) {
  const value = getText(formData, key)
  if (!value) return null

  return normalizeUrl(value, label)
}

function normalizeUrl(value: string, label: string) {
  try {
    return new URL(value).toString()
  } catch {
    throw new Error(`${label} must be a valid URL.`)
  }
}

function getPlacement(formData: FormData): AdPlacement {
  const placement = getText(formData, 'placement') as AdPlacement

  return AD_PLACEMENTS.includes(placement) ? placement : 'bottom-right'
}

function getDurationSeconds(formData: FormData) {
  const duration = Number(getText(formData, 'duration_seconds') || 4)

  if (!Number.isFinite(duration)) return 4

  return Math.min(5, Math.max(3, Math.round(duration)))
}

function getSortOrder(formData: FormData) {
  const sortOrder = Number(getText(formData, 'sort_order') || 0)

  if (!Number.isFinite(sortOrder)) return 0

  return Math.round(sortOrder)
}

function getNullableDate(formData: FormData, key: string) {
  const value = getText(formData, key)
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new Error('Ad schedule date is invalid.')
  }

  return date.toISOString()
}

function getAdPayload(formData: FormData): AdInsert {
  const title = getText(formData, 'title')

  if (!title) {
    throw new Error('Ad title is required.')
  }

  return {
    title,
    description: getNullableText(formData, 'description'),
    image_url: getRequiredUrl(formData, 'image_url', 'Image URL'),
    video_url: getNullableUrl(formData, 'video_url', 'Video URL'),
    target_url: getNullableUrl(formData, 'target_url', 'Target URL'),
    placement: getPlacement(formData),
    duration_seconds: getDurationSeconds(formData),
    sort_order: getSortOrder(formData),
    active: formData.get('active') === 'on',
    starts_at: getNullableDate(formData, 'starts_at'),
    ends_at: getNullableDate(formData, 'ends_at'),
    updated_at: new Date().toISOString(),
  }
}

function getAdId(formData: FormData) {
  const id = getText(formData, 'id')

  if (!id) {
    throw new Error('Ad ID is required.')
  }

  return id
}

export async function authenticateAdmin(formData: FormData) {
  const accessCode = String(formData.get('accessCode') || '')

  if (!isValidAdminAccessCode(accessCode)) {
    redirect('/admin?error=invalid')
  }

  await setAdminSession()
  redirect('/admin')
}

export async function logoutAdmin() {
  await clearAdminSession()
  redirect('/admin')
}

export async function createAd(formData: FormData) {
  await requireAdminSession()

  const supabase = createAdminClient()
  const ad = getAdPayload(formData)
  const { error } = await (supabase.from('ads') as any).insert(ad)

  if (error) {
    throw new Error(`Failed to create ad: ${error.message}`)
  }

  revalidatePath('/admin')
}

export async function updateAd(formData: FormData) {
  await requireAdminSession()

  const supabase = createAdminClient()
  const adId = getAdId(formData)
  const updates: AdUpdate = getAdPayload(formData)
  const { error } = await (supabase.from('ads') as any)
    .update(updates)
    .eq('id', adId)

  if (error) {
    throw new Error(`Failed to update ad: ${error.message}`)
  }

  revalidatePath('/admin')
}

export async function toggleAdActive(formData: FormData) {
  await requireAdminSession()

  const supabase = createAdminClient()
  const adId = getAdId(formData)
  const active = getText(formData, 'active') === 'true'
  const { error } = await (supabase.from('ads') as any)
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', adId)

  if (error) {
    throw new Error(`Failed to update ad status: ${error.message}`)
  }

  revalidatePath('/admin')
}

export async function deleteAd(formData: FormData) {
  await requireAdminSession()

  const supabase = createAdminClient()
  const adId = getAdId(formData)
  const { error } = await (supabase.from('ads') as any).delete().eq('id', adId)

  if (error) {
    throw new Error(`Failed to delete ad: ${error.message}`)
  }

  revalidatePath('/admin')
}
