import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

const ADMIN_COOKIE_NAME = 'leenk_admin_session'
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8

function getAdminAccessCode() {
  return process.env.ADMIN_ACCESS_CODE?.trim() || '2255'
}

function getAdminSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    getAdminAccessCode()
  )
}

function signSessionPayload(payload: string) {
  return createHmac('sha256', getAdminSessionSecret())
    .update(payload)
    .digest('hex')
}

function timingSafeStringEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

function createSessionToken() {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000
  const payload = String(expiresAt)

  return `${payload}.${signSessionPayload(payload)}`
}

function isValidSessionToken(token: string | undefined) {
  if (!token) return false

  const parts = token.split('.')
  if (parts.length !== 2) return false

  const [expiresAt, signature] = parts
  const expiresAtMs = Number(expiresAt)

  if (!Number.isFinite(expiresAtMs) || Date.now() > expiresAtMs) {
    return false
  }

  return timingSafeStringEqual(signature, signSessionPayload(expiresAt))
}

export function isValidAdminAccessCode(accessCode: string) {
  return timingSafeStringEqual(accessCode.trim(), getAdminAccessCode())
}

export async function hasValidAdminSession() {
  const cookieStore = await cookies()
  return isValidSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value)
}

export async function setAdminSession() {
  const cookieStore = await cookies()

  cookieStore.set(ADMIN_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    maxAge: ADMIN_SESSION_TTL_SECONDS,
    path: '/admin',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()

  cookieStore.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/admin',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })
}
