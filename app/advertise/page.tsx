'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  HiArrowRight,
  HiPhone,
  HiUserGroup,
  HiGlobeAlt,
  HiTrendingUp,
  HiLightningBolt,
  HiShieldCheck,
  HiCheckCircle,
  HiMail,
  HiChat,
} from 'react-icons/hi'
import { ThemeToggle } from '@/components/theme-toggle'

const audienceStats = [
  { value: '16,000+', label: 'Active Users', icon: HiUserGroup, description: 'Registered businesses on the platform' },
  { value: '30,000+', label: 'Monthly Visitors', icon: HiGlobeAlt, description: 'Unique visitors every single month' },
  { value: '85%', label: 'Engagement Rate', icon: HiTrendingUp, description: 'Users who interact with content weekly' },
  { value: '92%', label: 'Mobile Reach', icon: HiLightningBolt, description: 'Audience accessible on mobile devices' },
]

const audienceProfile = [
  'Small and medium business owners',
  'Entrepreneurs and startup founders',
  'Online retailers and e-commerce sellers',
  'Service providers across Nigeria & Africa',
  'Young, tech-savvy professionals (18–45)',
  'Business decision-makers with real purchasing power',
]

const adFormats = [
  {
    title: 'Banner Ads',
    description: 'Prominent placements across the Leenk dashboard and landing pages. High visibility, maximum brand recall.',
    highlight: 'High Visibility',
  },
  {
    title: 'Sponsored Announcements',
    description: 'Reach all our users with a sponsored message featured on our platform notifications and emails.',
    highlight: 'Direct Reach',
  },
  {
    title: 'Featured Listings',
    description: "Get your business listed as a featured partner on Leenk's homepage and discovery sections.",
    highlight: 'Top Placement',
  },
  {
    title: 'Custom Packages',
    description: 'Need something specific? We build tailored advertising packages to match your campaign goals and budget.',
    highlight: 'Flexible',
  },
]

const whyAdvertise = [
  {
    icon: HiUserGroup,
    title: 'Massive Active Audience',
    description: 'Connect with over 16,000 active business users and 30,000 monthly visitors who are already engaged and decision-ready.',
  },
  {
    icon: HiTrendingUp,
    title: 'High Buying Intent',
    description: 'Our users are entrepreneurs and business owners actively looking for tools, services, and products to grow their businesses.',
  },
  {
    icon: HiShieldCheck,
    title: 'Trusted Platform',
    description: 'Leenk is a verified, professional platform. Advertising here signals quality and builds trust with a discerning audience.',
  },
  {
    icon: HiLightningBolt,
    title: 'Fast & Easy Setup',
    description: 'No complicated processes. Contact us, share your creative, and your ad goes live within 24–48 hours.',
  },
]

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/90 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Leenk" width={40} height={40} className="h-8 w-8" />
            <span className="text-2xl font-bold text-primary-600">Leenk</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
              Pricing
            </Link>
            <Link href="/advertise" className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              Advertise
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors">
              Sign In
            </Link>
            <Link href="/pricing" className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-primary-950/20 py-24 md:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-200/30 dark:bg-primary-900/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-200/30 dark:bg-purple-900/20 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 dark:bg-primary-900/30 px-4 py-1.5 text-sm font-medium text-primary-700 dark:text-primary-300 mb-8 border border-primary-200 dark:border-primary-800">
            <HiTrendingUp className="text-primary-600 dark:text-primary-400" />
            Advertising Opportunities
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
            Reach Thousands of
            <span className="block bg-gradient-to-r from-primary-600 to-purple-500 bg-clip-text text-transparent">
              Business Owners
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Advertise on Leenk and put your brand in front of over 30,000 monthly visitors — active entrepreneurs and business decision-makers across Africa.
          </p>

          <a
            href="tel:+2349063525949"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-primary-600 px-10 py-5 text-xl font-bold text-white hover:bg-primary-700 transition-all shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
          >
            <HiPhone className="text-2xl" />
            Call to Advertise: +234 906 352 5949
          </a>
        </div>
      </section>

      {/* Audience Stats */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">Our Reach</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              The Numbers Speak for Themselves
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Leenk has grown into one of the fastest-growing business messaging platforms in Africa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {audienceStats.map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mx-auto mb-5">
                  <stat.icon className="text-2xl text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                <p className="text-primary-600 dark:text-primary-400 font-semibold mb-2">{stat.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience Profile */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">Who You're Reaching</p>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-5">
                Our Audience is Your Target Market
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
                Leenk users are business owners who are actively investing in tools to grow. When you advertise with us, you're speaking directly to the people most likely to buy what you're selling.
              </p>
              <a
                href="tel:+2349063525949"
                className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 text-base font-semibold text-white hover:bg-primary-700 transition-all shadow-md"
              >
                <HiPhone />
                Get in Touch
              </a>
            </div>

            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8">
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Audience Profile</p>
              <ul className="space-y-4">
                {audienceProfile.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <HiCheckCircle className="text-primary-600 dark:text-primary-400 text-xl flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Formats */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">Ad Formats</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Flexible Ways to Advertise
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Choose the format that fits your campaign goals and budget
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {adFormats.map((format, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <span className="inline-block rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold px-3 py-1 mb-4">
                  {format.highlight}
                </span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{format.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{format.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Advertise */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">Why Leenk</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Advertise With Us?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {whyAdvertise.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="text-2xl text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-purple-700">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary-200 text-sm font-semibold uppercase tracking-widest mb-4">Get Started Today</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Ready to Reach 30,000+
            <span className="block">Monthly Visitors?</span>
          </h2>
          <p className="text-primary-100 text-xl mb-12 max-w-xl mx-auto">
            Contact us today to discuss your campaign goals, audience targeting, and get a custom advertising package that works for your budget.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="tel:+2349063525949"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-10 py-5 text-xl font-bold text-primary-700 hover:bg-primary-50 transition-all shadow-2xl hover:-translate-y-0.5"
            >
              <HiPhone className="text-2xl" />
              +234 906 352 5949
            </a>
            <a
              href="https://wa.me/2349063525949"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-primary-500/30 border-2 border-white/40 px-10 py-5 text-xl font-bold text-white hover:bg-primary-500/50 transition-all"
            >
              <HiChat className="text-2xl" />
              WhatsApp Us
            </a>
          </div>

          <p className="text-primary-200 text-sm mt-10">
            We typically respond within a few hours during business hours.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Leenk" width={32} height={32} className="h-7 w-7" />
              <span className="text-lg font-bold text-primary-600">Leenk</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
              <Link href="/#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</Link>
              <Link href="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Pricing</Link>
              <Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sign In</Link>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              © {new Date().getFullYear()} Leenk. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
