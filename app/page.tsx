'use client'

import Link from 'next/link'
import Image from 'next/image'
import { HiArrowRight, HiChat, HiLightningBolt, HiShieldCheck, HiGlobeAlt, HiCheckCircle } from 'react-icons/hi'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Leenk"
              width={40}
              height={40}
              className="h-8 w-8"
            />
            <p className="text-2xl font-bold text-primary-600">Leenk</p>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/pricing"
              className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative">
        {/* Floating Chat Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <HiChat 
            className="absolute text-primary-500/40 dark:text-primary-400/30 text-4xl md:text-5xl animate-float-1"
            style={{ top: '5%', left: '3%', animationDelay: '0s' }}
          />
          <HiChat 
            className="absolute text-primary-500/40 dark:text-primary-400/30 text-3xl md:text-4xl animate-float-2"
            style={{ top: '15%', right: '5%', animationDelay: '1s' }}
          />
          <HiChat 
            className="absolute text-primary-500/40 dark:text-primary-400/30 text-5xl md:text-6xl animate-float-3"
            style={{ bottom: '10%', left: '5%', animationDelay: '2s' }}
          />
          <HiChat 
            className="absolute text-primary-500/40 dark:text-primary-400/30 text-2xl md:text-3xl animate-float-1"
            style={{ bottom: '20%', right: '8%', animationDelay: '1.5s' }}
          />
          <HiChat 
            className="absolute text-primary-500/40 dark:text-primary-400/30 text-4xl md:text-5xl animate-float-2"
            style={{ top: '45%', left: '1%', animationDelay: '0.5s' }}
          />
          <HiChat 
            className="absolute text-primary-500/40 dark:text-primary-400/30 text-3xl md:text-4xl animate-float-3"
            style={{ top: '55%', right: '3%', animationDelay: '2.5s' }}
          />
          <HiChat 
            className="absolute text-primary-500/40 dark:text-primary-400/30 text-3xl md:text-4xl animate-float-1"
            style={{ top: '30%', left: '8%', animationDelay: '3s' }}
          />
          <HiChat 
            className="absolute text-primary-500/40 dark:text-primary-400/30 text-2xl md:text-3xl animate-float-2"
            style={{ bottom: '35%', right: '10%', animationDelay: '1.2s' }}
          />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Card Container */}
          <div className="rounded-3xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-2xl p-8 md:p-12 lg:p-16 text-center relative overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"></div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Connect with Your Customers
              <span className="block text-primary-600 dark:text-primary-400">Like Never Before</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              WhatsApp-style business messaging that helps you communicate with your customers in real-time.
              Simple, fast, and reliable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-4 text-lg font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                Get Started
                <HiArrowRight className="text-xl" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white dark:bg-gray-800 px-8 py-4 text-lg font-semibold text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors"
              >
                See Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful features to help you communicate effectively with your customers
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Connecting Lines - Desktop */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none">
            {/* Horizontal lines connecting rows */}
            <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
              {/* Top row connections */}
              <line
                x1="16.66%"
                y1="25%"
                x2="50%"
                y2="25%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-primary-300 dark:text-primary-800"
              />
              <line
                x1="50%"
                y1="25%"
                x2="83.33%"
                y2="25%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-primary-300 dark:text-primary-800"
              />
              
              {/* Vertical lines connecting rows */}
              <line
                x1="16.66%"
                y1="25%"
                x2="16.66%"
                y2="75%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-primary-300 dark:text-primary-800"
              />
              <line
                x1="50%"
                y1="25%"
                x2="50%"
                y2="75%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-primary-300 dark:text-primary-800"
              />
              <line
                x1="83.33%"
                y1="25%"
                x2="83.33%"
                y2="75%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-primary-300 dark:text-primary-800"
              />
              
              {/* Bottom row connections */}
              <line
                x1="16.66%"
                y1="75%"
                x2="50%"
                y2="75%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-primary-300 dark:text-primary-800"
              />
              <line
                x1="50%"
                y1="75%"
                x2="83.33%"
                y2="75%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-primary-300 dark:text-primary-800"
              />
            </svg>
          </div>

          {/* Mobile/Tablet connecting lines */}
          <div className="lg:hidden absolute inset-0 pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
              {/* Vertical lines for mobile grid */}
              <line
                x1="50%"
                y1="0%"
                x2="50%"
                y2="33.33%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-primary-300 dark:text-primary-800"
              />
              <line
                x1="50%"
                y1="33.33%"
                x2="50%"
                y2="66.66%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-primary-300 dark:text-primary-800"
              />
              <line
                x1="50%"
                y1="66.66%"
                x2="50%"
                y2="100%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-primary-300 dark:text-primary-800"
              />
            </svg>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg border-2 border-primary-200 dark:border-primary-800 hover:border-primary-400 dark:hover:border-primary-600 transition-colors relative group">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary-500 dark:bg-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <HiChat className="text-2xl text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Real-time Messaging
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Instant messaging with your customers. No delays, no hassles. Just seamless communication.
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg border-2 border-primary-200 dark:border-primary-800 hover:border-primary-400 dark:hover:border-primary-600 transition-colors relative group">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary-500 dark:bg-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <HiLightningBolt className="text-2xl text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Lightweight & Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Built for performance. Fast loading, minimal lag, and optimized for the best user experience.
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg border-2 border-primary-200 dark:border-primary-800 hover:border-primary-400 dark:hover:border-primary-600 transition-colors relative group">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary-500 dark:bg-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <HiShieldCheck className="text-2xl text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your conversations are encrypted and secure. We take privacy seriously.
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg border-2 border-primary-200 dark:border-primary-800 hover:border-primary-400 dark:hover:border-primary-600 transition-colors relative group">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary-500 dark:bg-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <HiGlobeAlt className="text-2xl text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Image Sharing
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Share images, photos, and media files with ease. Perfect for product showcases and visual communication.
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg border-2 border-primary-200 dark:border-primary-800 hover:border-primary-400 dark:hover:border-primary-600 transition-colors relative group">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary-500 dark:bg-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <HiCheckCircle className="text-2xl text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Message Replies
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Reply to specific messages, edit, and delete. Full control over your conversations.
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg border-2 border-primary-200 dark:border-primary-800 hover:border-primary-400 dark:hover:border-primary-600 transition-colors relative group">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary-500 dark:bg-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <HiChat className="text-2xl text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                24/7 Support
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We're here to help. Get support whenever you need it, day or night.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using Leenk to communicate with their customers.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-primary-600 hover:bg-gray-100 transition-colors"
          >
            View Pricing
            <HiArrowRight className="text-xl" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Leenk"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="#features"
                className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
              >
                Sign In
              </Link>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} Leenk. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Built by{' '}
                <Link
                  href="https://jabulaniusen.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  Jabulani Usen
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
