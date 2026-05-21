'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  HiArrowRight,
  HiChat,
  HiLightningBolt,
  HiShieldCheck,
  HiPhotograph,
  HiCheckCircle,
  HiBell,
  HiStar,
  HiUserGroup,
  HiGlobeAlt,
  HiTrendingUp,
  HiPhone,
  HiBell as _HiBell,
} from 'react-icons/hi'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── NAV ────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Leenk" width={36} height={36} className="h-8 w-8" />
          <span className="text-xl font-bold text-white">Leenk</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/mobile-app" className="hover:text-white transition-colors">Mobile App</Link>
          <Link href="/advertise" className="hover:text-white transition-colors">Advertise</Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/pricing" className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-500 transition-colors">
            Get Started
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 overflow-hidden">
        {/* Mesh background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-700/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary-800/15 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-sm text-primary-300 font-medium mb-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
            </span>
            16,000+ businesses already connected
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-8">
            <span className="block text-white">Business chat,</span>
            <span className="block bg-gradient-to-r from-primary-400 via-purple-400 to-primary-300 bg-clip-text text-transparent">
              done right.
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Give your customers a direct line to your business — real-time, WhatsApp-style messaging from your website or link. No app required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="group flex items-center gap-2 rounded-full bg-primary-600 hover:bg-primary-500 px-8 py-4 text-base font-semibold transition-all duration-200 shadow-lg shadow-primary-900/50"
            >
              Start for Free
              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-8 py-4 text-base font-semibold transition-all duration-200"
            >
              Explore Features
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 text-xs">
          <span>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
        </div>
      </section>

      {/* ── STATS STRIP ────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '16,000+', lbl: 'Active Users' },
            { num: '30,000+', lbl: 'Monthly Visitors' },
            { num: '99.9%', lbl: 'Uptime' },
            { num: '< 100ms', lbl: 'Avg. Response' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-3xl md:text-4xl font-extrabold text-white mb-1">{s.num}</p>
              <p className="text-gray-500 text-sm">{s.lbl}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENTO FEATURES ─────────────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-400 mb-3">Features</p>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight max-w-xl">
              Everything your business needs.
            </h2>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 grid-rows-auto gap-4 max-w-6xl mx-auto">
            {/* Large feature 1 */}
            <div className="md:col-span-3 rounded-3xl bg-gradient-to-br from-primary-600/20 to-primary-900/20 border border-primary-500/20 p-8 flex flex-col justify-between min-h-[280px] group hover:border-primary-400/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center mb-6">
                <HiChat className="text-2xl text-primary-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Real-time Messaging</h3>
                <p className="text-gray-400 leading-relaxed">
                  Instant, live conversations with your customers the moment they reach out. Zero delays, zero friction.
                </p>
              </div>
            </div>

            {/* Large feature 2 */}
            <div className="md:col-span-3 rounded-3xl bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/20 p-8 flex flex-col justify-between min-h-[280px] group hover:border-purple-400/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                <HiShieldCheck className="text-2xl text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Secure & Private</h3>
                <p className="text-gray-400 leading-relaxed">
                  Every conversation is encrypted. Your customers' data and your business communications stay protected.
                </p>
              </div>
            </div>

            {/* Small feature 1 */}
            <div className="md:col-span-2 rounded-3xl bg-white/[0.04] border border-white/8 p-7 flex flex-col justify-between min-h-[200px] hover:border-white/15 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <HiLightningBolt className="text-xl text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Blazing Fast</h3>
                <p className="text-gray-500 text-sm">Sub-100ms response times, built for scale.</p>
              </div>
            </div>

            {/* Small feature 2 */}
            <div className="md:col-span-2 rounded-3xl bg-white/[0.04] border border-white/8 p-7 flex flex-col justify-between min-h-[200px] hover:border-white/15 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <HiPhotograph className="text-xl text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Image Sharing</h3>
                <p className="text-gray-500 text-sm">Share photos and media instantly for product demos.</p>
              </div>
            </div>

            {/* Small feature 3 */}
            <div className="md:col-span-2 rounded-3xl bg-white/[0.04] border border-white/8 p-7 flex flex-col justify-between min-h-[200px] hover:border-white/15 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <HiBell className="text-xl text-pink-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Push Notifications</h3>
                <p className="text-gray-500 text-sm">Never miss a message with instant push alerts.</p>
              </div>
            </div>

            {/* Wide bottom feature */}
            <div className="md:col-span-6 rounded-3xl bg-gradient-to-r from-primary-600/10 to-purple-700/10 border border-white/8 p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:border-white/15 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <HiCheckCircle className="text-2xl text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">Full Message Control</h3>
                <p className="text-gray-400">Reply to specific messages, edit, delete, and manage every conversation with full control — just like your favourite messaging app.</p>
              </div>
              <Link href="/pricing" className="flex-shrink-0 flex items-center gap-2 text-primary-400 font-semibold text-sm hover:text-primary-300 transition-colors">
                Try it free <HiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-400 mb-3">Process</p>
            <h2 className="text-4xl md:text-6xl font-black text-white">Up and running in minutes.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/5 rounded-3xl overflow-hidden max-w-5xl mx-auto">
            {[
              { n: '01', title: 'Create Your Account', body: 'Sign up and set up your business profile in under 2 minutes. No credit card required.' },
              { n: '02', title: 'Share Your Chat Link', body: 'Give customers your unique Leenk URL. They click it, no app downloads, no sign-up friction.' },
              { n: '03', title: 'Start Chatting', body: 'Messages arrive instantly. Reply in real-time, share images, and build lasting customer relationships.' },
            ].map((step, i) => (
              <div key={i} className="bg-gray-950 p-10 flex flex-col gap-6">
                <span className="text-6xl font-black text-white/5">{step.n}</span>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────── */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-400 mb-3">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">Loved by businesses.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { name: 'Amara Okonkwo', role: 'Fashion Store Owner', quote: 'Leenk transformed how I talk to my customers. Orders come in faster and I never miss a message anymore.', stars: 5 },
              { name: 'Chukwuemeka Adeyemi', role: 'Electronics Retailer', quote: 'My customers love how easy it is to reach me. The image sharing feature is perfect for showing products.', stars: 5 },
              { name: 'Fatima Bello', role: 'Beauty & Skincare Brand', quote: "Push notifications fixed everything. I used to lose customers because I responded too slowly.", stars: 5 },
            ].map((t, i) => (
              <div key={i} className="rounded-3xl bg-white/[0.04] border border-white/8 p-8 hover:border-white/15 transition-all">
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <HiStar key={j} className="text-yellow-400 text-lg" />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-gray-500 text-sm">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOBILE APP TEASER ──────────────────── */}
      <section className="px-4 py-8 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-primary-700 to-purple-700 p-1">
            <div className="rounded-[22px] bg-gray-950/70 backdrop-blur px-8 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <HiPhone className="text-primary-400 text-2xl" />
                </div>
                <div>
                  <p className="text-primary-300 text-xs font-bold uppercase tracking-widest mb-1">Mobile App</p>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
                    Take Leenk everywhere — ₦50,000
                  </h3>
                  <p className="text-gray-400 text-sm">Android & iOS. One-time purchase. Contact us to get it.</p>
                </div>
              </div>
              <Link
                href="/mobile-app"
                className="flex-shrink-0 group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-primary-700 hover:bg-primary-50 transition-colors"
              >
                Learn More
                <HiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ADVERTISE BANNER ───────────────────── */}
      <section className="px-4 py-8">
        <div className="container mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-purple-700 p-1">
            <div className="rounded-[22px] bg-gray-950/60 backdrop-blur px-8 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <p className="text-primary-300 text-sm font-semibold uppercase tracking-widest mb-2">Advertise with Us</p>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                  Reach 30,000+ Monthly Visitors
                </h3>
                <p className="text-gray-400 max-w-md">
                  Put your brand in front of thousands of active business owners across Africa.
                </p>
              </div>
              <Link
                href="/advertise"
                className="flex-shrink-0 flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-primary-700 hover:bg-primary-50 transition-colors"
              >
                Learn More <HiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────── */}
      <section className="py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary-600/15 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            Start talking to your customers today.
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join 16,000+ businesses already using Leenk to communicate faster, smarter, and more personally.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 hover:bg-primary-500 px-10 py-5 text-xl font-bold transition-all shadow-2xl shadow-primary-900/50 hover:-translate-y-0.5"
          >
            View Pricing <HiArrowRight className="text-2xl" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer className="border-t border-white/5 bg-black/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="Leenk" width={36} height={36} className="h-8 w-8" />
                <span className="text-xl font-bold text-white">Leenk</span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                WhatsApp-style business chat that helps you connect with your customers instantly, from anywhere.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mb-4 text-sm">Product</p>
              <ul className="space-y-2">
                {[['#features', 'Features'], ['#how-it-works', 'How it Works'], ['/pricing', 'Pricing']].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-4 text-sm">Company</p>
              <ul className="space-y-2">
                {[['/advertise', 'Advertise'], ['/login', 'Sign In']].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} Leenk. All rights reserved.</p>
            <p className="text-sm text-gray-600">
              Built by{' '}
              <Link href="https://jabulaniusen.com" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-400 transition-colors">
                Jabulani Usen
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
