'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  HiArrowRight,
  HiChat,
  HiCheckCircle,
  HiBell,
  HiPhone,
  HiPhotograph,
  HiLightningBolt,
  HiShieldCheck,
  HiUserGroup,
} from 'react-icons/hi'

const features = [
  { icon: HiChat, title: 'Real-time Chat', body: 'See and reply to customer messages the instant they arrive — no refresh needed.' },
  { icon: HiBell, title: 'Push Notifications', body: 'Get alerted the moment a customer sends a message, even when the app is in the background.' },
  { icon: HiPhotograph, title: 'Image Sharing', body: 'Send and receive product photos, receipts, and media files with ease.' },
  { icon: HiLightningBolt, title: 'Blazing Fast', body: 'Lightweight and optimised for low-data connections across Nigeria and Africa.' },
  { icon: HiShieldCheck, title: 'Secure & Private', body: 'All messages are encrypted. Your conversations stay between you and your customers.' },
  { icon: HiUserGroup, title: 'All Chats in One Place', body: 'Manage every customer conversation from a single, clean inbox on your phone.' },
]

export default function MobileAppPage() {
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
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/mobile-app" className="text-white font-semibold">Mobile App</Link>
          <Link href="/advertise" className="hover:text-white transition-colors">Advertise</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/pricing" className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-500 transition-colors">
            Get Started
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20 px-4 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-primary-600/15 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-700/10 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-sm text-primary-300 font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                </span>
                Now available — Android & iOS
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
                Leenk,
                <span className="block bg-gradient-to-r from-primary-400 via-purple-400 to-primary-300 bg-clip-text text-transparent">
                  in your pocket.
                </span>
              </h1>

              <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-xl">
                The full power of Leenk business chat on your phone. Stay connected to every customer conversation — wherever you are, whenever they message.
              </p>

              {/* Price card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 mb-8 inline-block">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">One-time purchase</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-white">₦50,000</span>
                  <span className="text-gray-500 text-sm">lifetime access</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">No subscriptions. Pay once, use forever.</p>
              </div>

              <p className="text-gray-400 text-sm mb-6">
                To purchase and receive the app, contact us directly:
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="tel:+2349063525949"
                  className="group flex items-center justify-center gap-2 rounded-full bg-primary-600 hover:bg-primary-500 px-8 py-4 text-base font-bold text-white transition-all shadow-lg shadow-primary-900/50 hover:-translate-y-0.5"
                >
                  <HiPhone className="text-lg" />
                  Call +234 906 352 5949
                  <HiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a
                  href="https://wa.me/2349063525949"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-8 py-4 text-base font-bold text-white transition-all"
                >
                  <HiChat className="text-lg" />
                  WhatsApp Us
                </a>
              </div>
              <p className="text-gray-600 text-xs mt-4">
                We respond within a few hours. App is sent directly after payment.
              </p>
            </div>

            {/* Right — animated phone */}
            <div className="flex items-center justify-center relative py-16 lg:py-0">
              {/* Glow behind phone */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 bg-primary-600/20 rounded-full blur-[90px]" />
              </div>

              {/* Floating orbs */}
              <div className="absolute top-10 right-10 w-3 h-3 rounded-full bg-primary-400/70 animate-float-1" />
              <div className="absolute bottom-16 left-10 w-2 h-2 rounded-full bg-purple-400/70 animate-float-2" />
              <div className="absolute top-1/3 left-6 w-1.5 h-1.5 rounded-full bg-primary-300/50 animate-float-3" />
              <div className="absolute bottom-1/3 right-6 w-2.5 h-2.5 rounded-full bg-purple-500/40 animate-float-1" style={{ animationDelay: '1.5s' }} />

              {/* Main phone */}
              <div className="relative animate-float-2" style={{ animationDuration: '6s' }}>
                <div className="relative w-[270px] h-[560px] rounded-[48px] bg-gradient-to-b from-gray-600 to-gray-900 p-[3px] shadow-[0_50px_100px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)] ring-1 ring-white/8">
                  <div className="w-full h-full rounded-[46px] bg-gray-950 overflow-hidden flex flex-col">

                    {/* Status bar */}
                    <div className="flex items-center justify-between px-5 pt-4 pb-1 flex-shrink-0">
                      <span className="text-white text-[10px] font-semibold">9:41</span>
                      <div className="w-[72px] h-[18px] rounded-full bg-gray-900 border border-white/10" />
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-[2px] items-end h-3">
                          {[4, 6, 8, 10].map((h, i) => (
                            <div key={i} className="w-[3px] rounded-full bg-white/60" style={{ height: h }} />
                          ))}
                        </div>
                        <div className="w-4 h-2.5 rounded-sm border border-white/40 relative">
                          <div className="absolute inset-[2px] rounded-[1px] bg-white/60 w-[60%]" />
                          <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[3px] h-1.5 rounded-r-sm bg-white/40" />
                        </div>
                      </div>
                    </div>

                    {/* App header */}
                    <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <HiChat className="text-white text-sm" />
                        </div>
                        <div>
                          <p className="text-white text-xs font-bold leading-tight">Leenk Business</p>
                          <p className="text-primary-200 text-[9px]">4 conversations</p>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <div className="flex flex-col gap-[3px]">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="w-3 h-[1.5px] rounded-full bg-white/70" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Search bar */}
                    <div className="px-4 py-2 bg-gray-950 flex-shrink-0">
                      <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-2 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-gray-600" />
                        <span className="text-gray-600 text-[10px]">Search conversations...</span>
                      </div>
                    </div>

                    {/* Chat list */}
                    <div className="flex-1 overflow-hidden bg-gray-950 divide-y divide-white/[0.04]">
                      {[
                        { name: 'Chioma A.', msg: 'Is the red one still available?', time: '2m', unread: 2, color: 'bg-pink-500', online: true },
                        { name: 'Emeka S.', msg: 'Thanks! Got the order 🎉', time: '15m', unread: 0, color: 'bg-blue-500', online: false },
                        { name: 'Ada O.', msg: 'Can I pay on delivery?', time: '1h', unread: 1, color: 'bg-green-500', online: true },
                        { name: 'Kola B.', msg: 'What\'s the price for 3 units?', time: '2h', unread: 0, color: 'bg-orange-500', online: false },
                        { name: 'Ngozi T.', msg: 'Do you ship to Abuja?', time: '3h', unread: 0, color: 'bg-purple-500', online: false },
                      ].map((chat, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                          <div className="relative flex-shrink-0">
                            <div className={`w-9 h-9 rounded-full ${chat.color} flex items-center justify-center`}>
                              <span className="text-white text-[11px] font-bold">{chat.name[0]}</span>
                            </div>
                            {chat.online && (
                              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-gray-950" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <p className="text-white text-[11px] font-semibold truncate">{chat.name}</p>
                              <p className="text-gray-600 text-[9px] flex-shrink-0 ml-2">{chat.time}</p>
                            </div>
                            <p className="text-gray-500 text-[10px] truncate">{chat.msg}</p>
                          </div>
                          {chat.unread > 0 && (
                            <div className="w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-[8px] font-bold">{chat.unread}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Bottom nav */}
                    <div className="bg-gray-900/90 backdrop-blur-sm px-4 py-2.5 flex items-center justify-around border-t border-white/5 flex-shrink-0">
                      {[
                        { Icon: HiChat, label: 'Chats', active: true },
                        { Icon: HiBell, label: 'Alerts', active: false },
                        { Icon: HiUserGroup, label: 'Contacts', active: false },
                      ].map(({ Icon, label, active }, i) => (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${active ? 'bg-primary-600' : ''}`}>
                            <Icon className={`text-sm ${active ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                          <span className={`text-[8px] ${active ? 'text-primary-400' : 'text-gray-600'}`}>{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Home indicator */}
                    <div className="flex justify-center pb-2 pt-1 flex-shrink-0">
                      <div className="w-20 h-1 rounded-full bg-white/15" />
                    </div>
                  </div>
                </div>

                {/* Physical buttons */}
                <div className="absolute -right-[3px] top-28 w-[4px] h-14 rounded-r-full bg-gray-700" />
                <div className="absolute -left-[3px] top-24 w-[4px] h-9 rounded-l-full bg-gray-700" />
                <div className="absolute -left-[3px] top-36 w-[4px] h-9 rounded-l-full bg-gray-700" />
                <div className="absolute -left-[3px] top-48 w-[4px] h-14 rounded-l-full bg-gray-700" />

                {/* Floating notification badge */}
                <div
                  className="absolute -top-4 -right-6 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl px-3 py-2 shadow-xl shadow-primary-900/60 border border-white/10 animate-float-3"
                  style={{ animationDuration: '4s' }}
                >
                  <p className="text-white text-[10px] font-bold whitespace-nowrap">💬 New message!</p>
                </div>

                {/* Second floating badge */}
                <div
                  className="absolute -bottom-4 -left-8 bg-gray-800 rounded-2xl px-3 py-2 shadow-xl border border-white/10 animate-float-1"
                  style={{ animationDuration: '5.5s', animationDelay: '1s' }}
                >
                  <p className="text-green-400 text-[10px] font-bold whitespace-nowrap">✓ Order confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ──────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5 bg-white/[0.02]">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-400 mb-3">What you get</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Everything, on mobile.</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">All the features of Leenk — optimised for your phone.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <div
                key={i}
                className="group rounded-2xl bg-white/[0.03] border border-white/8 p-7 hover:border-primary-500/40 hover:bg-white/[0.06] transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-primary-500/15 flex items-center justify-center mb-5 group-hover:bg-primary-600 transition-colors">
                  <f.icon className="text-xl text-primary-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO GET IT ───────────────────────── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-400 mb-3">How to get it</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Simple process.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/5 rounded-3xl overflow-hidden">
            {[
              { n: '01', title: 'Contact Us', body: 'Call or WhatsApp +234 906 352 5949. Tell us you want the Leenk mobile app.' },
              { n: '02', title: 'Make Payment', body: 'Pay the one-time fee of ₦50,000. We accept bank transfer and other convenient methods.' },
              { n: '03', title: 'Receive the App', body: 'We send you the app directly. Install it on your Android or iOS device and you\'re live.' },
            ].map((step, i) => (
              <div key={i} className="bg-gray-950 p-10 flex flex-col gap-6">
                <span className="text-6xl font-black text-white/5">{step.n}</span>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary-600/12 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
            Ready to go mobile?
          </h2>
          <p className="text-gray-400 text-xl mb-10 leading-relaxed">
            One call is all it takes. Get the Leenk mobile app for a one-time fee of ₦50,000 and never miss a customer again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+2349063525949"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-primary-600 hover:bg-primary-500 px-10 py-5 text-lg font-bold text-white transition-all shadow-2xl shadow-primary-900/50 hover:-translate-y-0.5"
            >
              <HiPhone className="text-xl" />
              Call +234 906 352 5949
              <HiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="https://wa.me/2349063525949"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-10 py-5 text-lg font-bold text-white transition-all"
            >
              <HiChat className="text-xl" />
              WhatsApp Us
            </a>
          </div>
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
              {[['/', 'Home'], ['/pricing', 'Pricing'], ['/mobile-app', 'Mobile App'], ['/advertise', 'Advertise'], ['/login', 'Sign In']].map(([href, label]) => (
                <Link key={href} href={href} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} Leenk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
