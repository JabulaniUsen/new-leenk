'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HiCheck, HiGlobeAlt } from 'react-icons/hi'

type Currency = 'NGN' | 'USD'
type Period = 'monthly' | '6months' | 'yearly'

interface PricingPlan {
  name: string
  period: string
  price: { NGN: string; USD: string }
  originalPrice?: { NGN: string; USD: string }
  save?: { NGN: string; USD: string }
  popular?: boolean
  features: string[]
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Monthly',
    period: 'per month',
    price: { NGN: 'N9,000', USD: '$9' },
    features: [
      'Unlimited conversations',
      'Real-time messaging',
      'Image sharing',
      'Message replies',
      'Read receipts',
      '24/7 support',
    ],
  },
  {
    name: '6 Months',
    period: 'per 6 months',
    price: { NGN: 'N52,000', USD: '$52' },
    originalPrice: { NGN: 'N54,000', USD: '$54' },
    save: { NGN: 'N2,000', USD: '$2' },
    popular: true,
    features: [
      'Unlimited conversations',
      'Real-time messaging',
      'Image sharing',
      'Message replies',
      'Read receipts',
      '24/7 support',
    ],
  },
  {
    name: 'Yearly',
    period: 'per year',
    price: { NGN: 'N100,000', USD: '$100' },
    originalPrice: { NGN: 'N108,000', USD: '$108' },
    save: { NGN: 'N8,000', USD: '$8' },
    features: [
      'Unlimited conversations',
      'Real-time messaging',
      'Image sharing',
      'Message replies',
      'Read receipts',
      '24/7 support',
    ],
  },
]

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>('NGN')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-with-text.png"
              alt="Leenk"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Choose the plan that works best for your business
        </p>

        {/* Currency Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className="text-sm text-gray-600 dark:text-gray-400">Currency:</span>
          <div className="inline-flex rounded-full bg-gray-200 dark:bg-gray-800 p-1">
            <button
              onClick={() => setCurrency('NGN')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currency === 'NGN'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Naira (₦)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currency === 'USD'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg border-2 transition-all hover:shadow-xl ${
                plan.popular
                  ? 'border-primary-500 scale-105'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price[currency]}
                  </span>
                  {plan.originalPrice && (
                    <span className="text-xl text-gray-500 line-through dark:text-gray-400">
                      {plan.originalPrice[currency]}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{plan.period}</p>
                {plan.save && (
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-1">
                    Save {plan.save[currency]}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <HiCheck className="flex-shrink-0 text-primary-600 dark:text-primary-400 text-lg" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`block w-full rounded-xl py-3 px-6 text-center font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo-with-text.png"
                alt="Leenk"
                width={100}
                height={33}
                className="h-6 w-auto"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Leenk. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

