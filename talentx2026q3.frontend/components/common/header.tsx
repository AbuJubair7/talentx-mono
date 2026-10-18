'use client'

import { useContext, useState } from 'react'
import Link from 'next/link'
import { BrandLogo } from '@/components/common/brand-logo'
import { QueryClientContext } from '@tanstack/react-query'
import { Menu, X } from 'lucide-react'
import { UserMenuDropdown } from '@/components/common/user-menu-dropdown'
import { NotificationBellDropdown } from '@/modules/notifications'
import { useHeaderSession } from '@/components/common/use-header-session'
import { useGetStarted } from '@/components/providers/get-started-provider'
import { useSignIn } from '@/components/providers/sign-in-provider'
import { useTalentProfile } from '@/modules/talent-profile/hooks/useTalentProfile'
import { PostJobChooser } from '@/modules/jobposting/components/PostJobChooser'
import { UserRole } from '@/types/auth'
import type { HeaderProps, HeaderUser } from './types'

export type { HeaderProps, HeaderUser }

const publicNavLinks = [
  { label: 'Browse Jobs', href: '/jobs' },
  { label: 'Companies', href: '/companies' },
  { label: 'For Talent', href: '/#for-talent' },
  { label: 'For Employers', href: '/#for-employers' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'AI Features', href: '/#ai-features' },
]

export function Header({ initialUser = null }: HeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { open: openGetStarted } = useGetStarted()
  const { open: openSignIn } = useSignIn()

  const queryClient = useContext(QueryClientContext)
  const { user: sessionUser } = useHeaderSession({
    initialUser,
    enabled: Boolean(queryClient),
  })

  const currentUser = sessionUser !== undefined && sessionUser !== null ? sessionUser : initialUser
  const normalizedUserRole = currentUser?.role?.trim().toLowerCase()
  const isTalentUser = Boolean(
    currentUser && (normalizedUserRole === 'talent' || currentUser?.role === UserRole.Talent)
  )
  const isEmployerUser = Boolean(
    currentUser && (normalizedUserRole === 'employer' || currentUser?.role === UserRole.Employer)
  )

  const { data: talentProfileData } = useTalentProfile({
    enabled: isTalentUser && Boolean(queryClient),
  })

  const resolvedUser: HeaderUser | null = currentUser
    ? {
        ...currentUser,
        name: isTalentUser && talentProfileData?.name?.trim() ? talentProfileData.name : currentUser.name,
        avatarUrl: isTalentUser
          ? (talentProfileData?.profilePictureUrl ?? currentUser.avatarUrl ?? null)
          : (currentUser.avatarUrl ?? null),
      }
    : null

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center group py-1">
            <BrandLogo className="h-8.5 w-auto text-emerald-700" />
          </Link>
        </div>

        <nav className="hidden lg:flex flex-1 items-center justify-center gap-3 xl:gap-5">
          {publicNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex shrink-0 items-center gap-2">
          {resolvedUser ? (
            <>
              {isTalentUser && <NotificationBellDropdown align="right" />}
              <UserMenuDropdown user={resolvedUser} align="right" />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openSignIn('choose')}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 cursor-pointer"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => openGetStarted('choose')}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 cursor-pointer"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {isTalentUser && <NotificationBellDropdown align="right" />}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-header-menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-header-menu" className="border-t border-slate-100 border-b border-slate-200 bg-white px-4 pb-6 pt-3 lg:hidden">
          <nav className="flex flex-col space-y-3">
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-slate-900 py-1"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              {resolvedUser ? (
                <div className="flex items-center gap-3 py-2">
                  <UserMenuDropdown user={resolvedUser} align="left" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-slate-900 truncate" title={resolvedUser.name || resolvedUser.email || undefined}>
                      {resolvedUser.name || resolvedUser.email || "User"}
                    </span>
                    <span className="text-xs text-slate-500 truncate" title={resolvedUser.email || undefined}>
                      {resolvedUser.email}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      openSignIn('choose')
                    }}
                    className="flex items-center justify-center w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      openGetStarted('choose')
                    }}
                    className="flex items-center justify-center w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 cursor-pointer"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
      {/* Public pages are outside the portal shell, so their Post a Job links need the chooser too. */}
      {isEmployerUser && queryClient && <PostJobChooser />}
    </header>
  )
}