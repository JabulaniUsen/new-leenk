'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/queries/businesses'
import { getBusinessLogoUrl } from '@/lib/utils/storage'
import { HiUser, HiUsers, HiSpeakerphone, HiCollection, HiMenu, HiX } from 'react-icons/hi'

// Helper function to get initials from name or email
function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  const emailParts = email.split('@')[0]
  if (emailParts.length >= 2) {
    return emailParts.substring(0, 2).toUpperCase()
  }
  return emailParts.substring(0, 1).toUpperCase()
}

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { data: business } = useBusiness()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('profile')

  useEffect(() => {
    if (pathname === '/settings') {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      if (hash === '#broadcast') {
        setActiveSection('broadcast')
      } else if (hash === '#away') {
        setActiveSection('away')
      } else {
        setActiveSection('profile')
      }
    } else if (pathname.startsWith('/dashboard')) {
      setActiveSection('users')
    }
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  const initials = getInitials(business.business_name, business.email)
  const logoUrl = getBusinessLogoUrl(business.business_logo)

  const navItems = [
    { href: '/settings', icon: HiUser, label: 'Profile', section: 'profile' },
    { href: '/dashboard', icon: HiUsers, label: 'Users', section: 'users' },
    { href: '/settings#broadcast', icon: HiSpeakerphone, label: 'Broadcast Message', section: 'broadcast' },
    { href: '/settings#away', icon: HiCollection, label: 'Away Message', section: 'away' },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-white shadow-xl dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Profile"
                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {business.business_name || 'Business'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {business.email}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors md:hidden flex-shrink-0"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeSection === item.section
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className={`text-xl flex-shrink-0 ${active ? 'text-white' : ''}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors font-medium text-sm"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden md:ml-72">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-700 transition-colors md:hidden"
            >
              <HiMenu className="text-xl" />
            </button>
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Leenk"
                width={32}
                height={32}
                className="dark:opacity-90"
              />
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {business.business_name || 'Business'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {business.email}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                {initials}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
