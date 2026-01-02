'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { HiStar, HiEye, HiEyeOff } from 'react-icons/hi'
import { ThemeToggle } from '@/components/theme-toggle'
import { useToast } from '@/lib/hooks/use-toast'

interface Review {
  name: string
  role: string
  company: string
  content: string
  rating: number
}

const reviews: Review[] = [
  {
    name: 'Sarah Johnson',
    role: 'CEO',
    company: 'TechStart Inc.',
    content: 'Leenk has transformed how we communicate with our customers. The real-time messaging is flawless and our response times have improved dramatically.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Customer Success Manager',
    company: 'Retail Plus',
    content: 'Best business messaging platform we\'ve used. The interface is clean, intuitive, and our customers love the WhatsApp-like experience.',
    rating: 5,
  },
  {
    name: 'Amina Hassan',
    role: 'Founder',
    company: 'Style Boutique',
    content: 'Switching to Leenk was the best decision we made. Our customer satisfaction scores increased by 40% in just the first month.',
    rating: 5,
  },
  {
    name: 'David Okafor',
    role: 'Operations Director',
    company: 'QuickServe Delivery',
    content: 'The image sharing and reply features make it so easy to handle customer inquiries. Our team productivity has doubled!',
    rating: 5,
  },
  {
    name: 'Emma Thompson',
    role: 'Marketing Lead',
    company: 'GreenLife Health',
    content: 'Leenk\'s reliability is unmatched. We handle hundreds of conversations daily without any issues. Highly recommended!',
    rating: 5,
  },
  {
    name: 'James Williams',
    role: 'Co-founder',
    company: 'EduTech Solutions',
    content: 'The 24/7 support and real-time messaging have been game-changers for our business. Our customers feel heard and valued.',
    rating: 5,
  },
]

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const supabase = createClient()
  const { showError, showSuccess } = useToast()

  // Rotate reviews every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Call signup API route
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          businessName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up')
      }

      // Sign in after successful signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      showSuccess('Account created successfully!')
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      showError(err.message || 'Failed to sign up. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentReview = reviews[currentReviewIndex]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {/* Left Side - Reviews */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/20 p-12">
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div key={currentReviewIndex} className="animate-fadeIn">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(currentReview.rating)].map((_, i) => (
                  <HiStar key={i} className="text-yellow-400 fill-yellow-400 text-xl" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                "{currentReview.content}"
              </p>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {currentReview.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentReview.role}, {currentReview.company}
                </p>
              </div>
            </div>
            {/* Review Indicators */}
            <div className="flex gap-2 justify-center mt-8">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReviewIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentReviewIndex
                      ? 'w-8 bg-primary-600'
                      : 'w-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label={`View review ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Leenk"
              width={64}
              height={64}
              priority
              className="dark:opacity-90"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Get Started
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create your business account
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSignup}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Business Name
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Your Business Name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="business@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <HiEyeOff className="text-xl" />
                    ) : (
                      <HiEye className="text-xl" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Minimum 6 characters
                </p>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary-600 px-4 py-3 text-white font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

