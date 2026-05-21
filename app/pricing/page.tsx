'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HiCheck, HiArrowRight, HiLightningBolt } from 'react-icons/hi'

type Currency = 'NGN' | 'USD'

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
    price: { NGN: '₦9,000', USD: '$9' },
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
    price: { NGN: '₦52,000', USD: '$52' },
    originalPrice: { NGN: '₦54,000', USD: '$54' },
    save: { NGN: '₦2,000', USD: '$2' },
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
    price: { NGN: '₦100,000', USD: '$100' },
    originalPrice: { NGN: '₦108,000', USD: '$108' },
    save: { NGN: '₦8,000', USD: '$8' },
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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── NAV ────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Leenk" width={36} height={36} className="h-8 w-8" />
          <span className="text-xl font-bold text-white">Leenk</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
          <Link href="/pricing" className="text-white font-semibold">Pricing</Link>
          <Link href="/advertise" className="hover:text-white transition-colors">Advertise</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/login" className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-500 transition-colors">
            Get Started
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────── */}
      <section className="relative pt-40 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-600/15 rounded-full blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-400 mb-4">Pricing</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            Simple,{' '}
            <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-primary-300 bg-clip-text text-transparent">
              transparent
            </span>
            <br />pricing.
          </h1>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            One plan, all features. Choose how long you commit and save more.
          </p>

          {/* Currency toggle */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            {(['NGN', 'USD'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  currency === c
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {c === 'NGN' ? 'Naira (₦)' : 'USD ($)'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING CARDS ──────────────────────── */}
      <section className="px-4 pb-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-3xl border p-8 flex flex-col transition-all duration-200 ${
                plan.popular
                  ? 'bg-gradient-to-b from-primary-600/20 to-purple-700/10 border-primary-500/50 scale-[1.03] shadow-2xl shadow-primary-900/40'
                  : 'bg-white/[0.04] border-white/8 hover:border-white/15'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                    <HiLightningBolt className="text-yellow-300" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-6">{plan.name}</h3>

                <div className="flex items-end gap-2 mb-1">
                  <span className="text-5xl font-black text-white leading-none">
                    {plan.price[currency]}
                  </span>
                  {plan.originalPrice && (
                    <span className="text-lg text-gray-600 line-through mb-1">
                      {plan.originalPrice[currency]}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-2">{plan.period}</p>
                {plan.save && (
                  <span className="inline-block rounded-full bg-green-500/15 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-0.5">
                    Save {plan.save[currency]}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-primary-500/30' : 'bg-white/10'}`}>
                      <HiCheck className={`text-xs ${plan.popular ? 'text-primary-300' : 'text-gray-400'}`} />
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`group flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-sm font-bold transition-all ${
                  plan.popular
                    ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/50'
                    : 'bg-white/8 hover:bg-white/15 text-white border border-white/10'
                }`}
              >
                Get Started
                <HiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── GUARANTEE STRIP ────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-12 px-4">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
          {[
            { emoji: '🔒', title: 'Secure Payments', body: 'All transactions are encrypted and safe.' },
            { emoji: '⚡', title: 'Instant Activation', body: 'Your account goes live the moment you pay.' },
            { emoji: '💬', title: '24/7 Support', body: 'We\'re here whenever you need us, day or night.' },
          ].map((item, i) => (
            <div key={i}>
              <p className="text-3xl mb-3">{item.emoji}</p>
              <p className="font-semibold text-white mb-1">{item.title}</p>
              <p className="text-gray-500 text-sm">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-400 mb-3 text-center">FAQ</p>
          <h2 className="text-4xl font-black text-white text-center mb-12">Common questions.</h2>

          <div className="space-y-px rounded-3xl overflow-hidden border border-white/5">
            {[
              {
                q: 'Can I cancel or switch plans at any time?',
                a: 'Yes. You can upgrade or switch plans at any time. Downgrades take effect at the end of your billing cycle.',
              },
              {
                q: 'Is there a free trial?',
                a: "We offer a straightforward paid plan with no hidden fees. Contact support if you'd like to discuss a trial for your specific situation.",
              },
              {
                q: 'What counts as a "conversation"?',
                a: 'A conversation is a chat thread with a single customer. All plans include unlimited conversations — no caps.',
              },
              {
                q: 'Do my customers need to download anything?',
                a: 'No. Customers chat through your unique Leenk link in their browser. No app, no sign-up, no friction.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white/[0.03] hover:bg-white/[0.06] transition-colors p-6">
                <p className="font-semibold text-white mb-2">{faq.q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-600/15 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join 16,000+ businesses already using Leenk to connect with their customers.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 hover:bg-primary-500 px-10 py-5 text-xl font-bold transition-all shadow-2xl shadow-primary-900/50 hover:-translate-y-0.5"
          >
            Create Your Account <HiArrowRight className="text-2xl" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer className="border-t border-white/5 bg-black/30">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Leenk" width={32} height={32} className="h-7 w-7" />
              <span className="text-lg font-bold text-white">Leenk</span>
            </Link>
            <div className="flex items-center gap-6">
              {[['/', 'Home'], ['/#features', 'Features'], ['/pricing', 'Pricing'], ['/advertise', 'Advertise'], ['/login', 'Sign In']].map(([href, label]) => (
                <Link key={href} href={href} className="text-sm text-gray-500 hover:text-white transition-colors">
                  {label}
                </Link>
              ))}
            </div>
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} Leenk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
