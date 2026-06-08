import Image from 'next/image'
import Link from 'next/link'
import { getAdminDashboardData } from '@/lib/admin/dashboard'
import { hasValidAdminSession } from '@/lib/admin/auth'
import { AdminDashboard } from './admin-dashboard'
import {
  authenticateAdmin,
  createAd,
  deleteAd,
  logoutAdmin,
  toggleAdActive,
  updateAd,
} from './actions'

export const dynamic = 'force-dynamic'

type AdminPageProps = {
  searchParams?: {
    error?: string
  }
}

function AdminAccessScreen({ hasError }: { hasError: boolean }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900 dark:bg-gray-950 dark:text-white">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo.png"
            alt="Leenk"
            width={56}
            height={56}
            priority
            className="dark:opacity-90"
          />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-xl font-semibold text-gray-950 dark:text-white">
            Admin Access
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter the security code to continue.
          </p>

          <form action={authenticateAdmin} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="accessCode"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Security code
              </label>
              <input
                id="accessCode"
                name="accessCode"
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
              {hasError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                  Invalid security code.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Unlock dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function AdminDataError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900 dark:bg-gray-950 dark:text-white">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-lg font-semibold text-gray-950 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          The dashboard could not load right now.
        </p>
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {message}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/admin"
            className="inline-flex h-10 items-center rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            Try again
          </Link>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const isAuthenticated = await hasValidAdminSession()

  if (!isAuthenticated) {
    return <AdminAccessScreen hasError={searchParams?.error === 'invalid'} />
  }

  try {
    const dashboardData = await getAdminDashboardData()

    return (
      <AdminDashboard
        data={dashboardData}
        logoutAction={logoutAdmin}
        createAdAction={createAd}
        updateAdAction={updateAd}
        toggleAdActiveAction={toggleAdActive}
        deleteAdAction={deleteAd}
      />
    )
  } catch (error) {
    return (
      <AdminDataError
        message={
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while loading admin data.'
        }
      />
    )
  }
}
