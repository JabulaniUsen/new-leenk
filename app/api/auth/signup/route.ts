import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

type BusinessInsert = Database['public']['Tables']['businesses']['Insert']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, businessName } = body

    if (!email || !password || !businessName) {
      return NextResponse.json(
        { error: 'Email, password, and business name are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Create business record in the database
    // Note: password_hash is required by schema but Supabase Auth handles passwords
    const businessInsert: BusinessInsert = {
      id: authData.user.id,
      email: email,
      password_hash: 'supabase_auth', // Placeholder - Supabase Auth handles passwords
      business_name: businessName,
    }

    const { error: businessError } = await (supabase.from('businesses') as any).insert(businessInsert)

    if (businessError) {
      // If business creation fails, user will need to retry signup
      return NextResponse.json(
        { error: businessError.message || 'Failed to create business profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, user: authData.user })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sign up' },
      { status: 500 }
    )
  }
}

