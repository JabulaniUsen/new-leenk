import type { CSSProperties } from 'react'
import type { Database } from '@/lib/types/database'

type Business = Database['public']['Tables']['businesses']['Row']

export const DEFAULT_PRIMARY_COLOR = '#9333ea'
export const DEFAULT_SECONDARY_COLOR = '#f3e8ff'

export const FONT_FAMILY_OPTIONS = [
  // System / web-safe fonts
  { label: 'Arial', value: 'Arial, sans-serif', googleFont: false },
  { label: 'Verdana', value: 'Verdana, sans-serif', googleFont: false },
  { label: 'Georgia', value: 'Georgia, serif', googleFont: false },
  { label: 'Courier New', value: '"Courier New", monospace', googleFont: false },
  // Google Fonts
  { label: 'Inter', value: '"Inter", sans-serif', googleFont: true, googleFontName: 'Inter' },
  { label: 'Roboto', value: '"Roboto", sans-serif', googleFont: true, googleFontName: 'Roboto' },
  { label: 'Poppins', value: '"Poppins", sans-serif', googleFont: true, googleFontName: 'Poppins' },
  { label: 'Nunito', value: '"Nunito", sans-serif', googleFont: true, googleFontName: 'Nunito' },
  { label: 'Lato', value: '"Lato", sans-serif', googleFont: true, googleFontName: 'Lato' },
  { label: 'Montserrat', value: '"Montserrat", sans-serif', googleFont: true, googleFontName: 'Montserrat' },
  { label: 'Playfair Display', value: '"Playfair Display", serif', googleFont: true, googleFontName: 'Playfair+Display' },
  { label: 'Space Grotesk', value: '"Space Grotesk", sans-serif', googleFont: true, googleFontName: 'Space+Grotesk' },
] as const

export const FONT_STYLE_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Italic', value: 'italic' },
] as const

export const FONT_SIZE_OPTIONS = [
  { label: 'Small', value: 'small' },
  { label: 'Normal', value: 'normal' },
  { label: 'Large', value: 'large' },
] as const

export const BORDER_RADIUS_OPTIONS = [
  { label: 'Sharp', value: 'sharp' },
  { label: 'Rounded', value: 'rounded' },
  { label: 'Pill', value: 'pill' },
] as const

export const HEADER_STYLE_OPTIONS = [
  { label: 'Solid', value: 'solid' },
  { label: 'Gradient', value: 'gradient' },
] as const

export const CHAT_BG_OPTIONS = [
  { label: 'Plain', value: 'plain' },
  { label: 'Solid', value: 'solid' },
  { label: 'Subtle Dots', value: 'dots' },
  { label: 'Light Grid', value: 'grid' },
] as const

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{6})$/

export function normalizeHexColor(color: string | null | undefined, fallback: string): string {
  if (!color) return fallback
  const normalized = color.trim()
  return HEX_COLOR_REGEX.test(normalized) ? normalized.toLowerCase() : fallback
}

export function normalizeFontFamily(fontFamily: string | null | undefined): string {
  if (!fontFamily) return FONT_FAMILY_OPTIONS[0].value
  const allowed = FONT_FAMILY_OPTIONS.some((option) => option.value === fontFamily)
  return allowed ? fontFamily : FONT_FAMILY_OPTIONS[0].value
}

export function normalizeFontStyle(fontStyle: string | null | undefined): 'normal' | 'italic' {
  return fontStyle === 'italic' ? 'italic' : 'normal'
}

export function normalizeFontSize(fontSize: string | null | undefined): 'small' | 'normal' | 'large' {
  if (fontSize === 'small' || fontSize === 'large') return fontSize
  return 'normal'
}

export function normalizeBorderRadius(value: string | null | undefined): 'sharp' | 'rounded' | 'pill' {
  if (value === 'sharp' || value === 'pill') return value
  return 'rounded'
}

export function normalizeHeaderStyle(value: string | null | undefined): 'solid' | 'gradient' {
  return value === 'gradient' ? 'gradient' : 'solid'
}

export function normalizeChatBg(value: string | null | undefined): 'plain' | 'solid' | 'dots' | 'grid' {
  if (value === 'dots' || value === 'grid' || value === 'solid') return value
  return 'plain'
}

export function hexToRgba(hex: string, alpha: number): string {
  const sanitizedHex = normalizeHexColor(hex, DEFAULT_PRIMARY_COLOR)
  const parsed = sanitizedHex.replace('#', '')
  const r = Number.parseInt(parsed.slice(0, 2), 16)
  const g = Number.parseInt(parsed.slice(2, 4), 16)
  const b = Number.parseInt(parsed.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function lightenHex(hex: string, amount: number): string {
  const sanitized = normalizeHexColor(hex, DEFAULT_PRIMARY_COLOR).replace('#', '')
  const r = Math.min(255, Number.parseInt(sanitized.slice(0, 2), 16) + amount)
  const g = Math.min(255, Number.parseInt(sanitized.slice(2, 4), 16) + amount)
  const b = Math.min(255, Number.parseInt(sanitized.slice(4, 6), 16) + amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function getGoogleFontUrl(fontFamily: string): string | null {
  const option = FONT_FAMILY_OPTIONS.find((f) => f.value === fontFamily)
  if (!option || !option.googleFont) return null
  return `https://fonts.googleapis.com/css2?family=${option.googleFontName}:wght@300;400;500;600;700&display=swap`
}

export function getFontSizePx(fontSize: 'small' | 'normal' | 'large'): string {
  if (fontSize === 'small') return '13px'
  if (fontSize === 'large') return '16px'
  return '15px'
}

export function getBorderRadiusPx(radius: 'sharp' | 'rounded' | 'pill'): string {
  if (radius === 'sharp') return '6px'
  if (radius === 'pill') return '24px'
  return '14px'
}

export function getChatBgStyle(
  chatBg: 'plain' | 'solid' | 'dots' | 'grid',
  secondaryColor: string
): CSSProperties {
  const base = hexToRgba(secondaryColor, 0.18)
  if (chatBg === 'solid') {
    return { backgroundColor: normalizeHexColor(secondaryColor, DEFAULT_SECONDARY_COLOR) }
  }
  if (chatBg === 'dots') {
    return {
      backgroundColor: base,
      backgroundImage: `radial-gradient(${hexToRgba(secondaryColor, 0.55)} 1.5px, transparent 1.5px)`,
      backgroundSize: '22px 22px',
    }
  }
  if (chatBg === 'grid') {
    return {
      backgroundColor: base,
      backgroundImage: `
        linear-gradient(${hexToRgba(secondaryColor, 0.45)} 1px, transparent 1px),
        linear-gradient(90deg, ${hexToRgba(secondaryColor, 0.45)} 1px, transparent 1px)
      `,
      backgroundSize: '28px 28px',
    }
  }
  return { backgroundColor: base }
}

export function getHeaderStyle(
  headerStyle: 'solid' | 'gradient',
  primaryColor: string
): CSSProperties {
  if (headerStyle === 'gradient') {
    const lighter = lightenHex(primaryColor, 40)
    return { background: `linear-gradient(135deg, ${primaryColor} 0%, ${lighter} 100%)` }
  }
  return { backgroundColor: primaryColor }
}

export function getBusinessThemeValues(business: Partial<Business> | null | undefined) {
  const primaryColor = normalizeHexColor(business?.theme_primary_color, DEFAULT_PRIMARY_COLOR)
  const secondaryColor = normalizeHexColor(business?.theme_secondary_color, DEFAULT_SECONDARY_COLOR)
  const fontFamily = normalizeFontFamily(business?.theme_font_family)
  const fontStyle = normalizeFontStyle(business?.theme_font_style)
  const fontSize = normalizeFontSize(business?.theme_font_size)
  const borderRadius = normalizeBorderRadius(business?.theme_border_radius)
  const headerStyle = normalizeHeaderStyle(business?.theme_header_style)
  const chatBg = normalizeChatBg(business?.theme_chat_bg)

  return {
    primaryColor,
    secondaryColor,
    fontFamily,
    fontStyle,
    fontSize,
    borderRadius,
    headerStyle,
    chatBg,
  }
}

export function getBusinessThemeStyle(business: Partial<Business> | null | undefined): CSSProperties {
  const { primaryColor, secondaryColor, fontFamily, fontStyle } = getBusinessThemeValues(business)

  return {
    ['--business-primary' as string]: primaryColor,
    ['--business-secondary' as string]: secondaryColor,
    ['--business-font-family' as string]: fontFamily,
    ['--business-font-style' as string]: fontStyle,
  } as CSSProperties
}
