import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AuthGalleryPlaceholder from '@/components/custom/auth-gallery-placeholder/AuthGalleryPlaceholder'
import { useAuth } from '@/lib/auth'

export default function GuestLayout() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // If user is already authenticated, redirect back to previous page or appropriate target
  if (isAuthenticated) {
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />
    }

    const fromState = (location.state as any)?.from
    let target = ''
    if (typeof fromState === 'string' && fromState) {
      target = fromState
    } else if (fromState?.pathname) {
      target = `${fromState.pathname}${fromState.search || ''}${fromState.hash || ''}`
    }

    const isAuthPage = (p: string) =>
      ['/login', '/register', '/forgot-password', '/verify-otp'].some(path => p.startsWith(path))

    if (!target || isAuthPage(target)) {
      const lastVisited = typeof window !== 'undefined' ? sessionStorage.getItem('lastVisitedPath') : null
      if (lastVisited && !isAuthPage(lastVisited)) {
        target = lastVisited
      } else {
        target = '/'
      }
    }

    return <Navigate to={target} replace />
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-500">
      <section className="pointer-events-none absolute inset-0 hidden lg:block">
        <AuthGalleryPlaceholder />
      </section>

      <div className="relative z-20 flex min-h-screen justify-end">
        {/* Floating Back Button close to the left edge of the right-hand panel */}
        <Link
          to="/"
          className="absolute top-4 left-4 lg:left-auto lg:right-[424px] z-30 flex h-10 w-10 items-center justify-center rounded-full border border-border/20 bg-background/60 backdrop-blur-md text-foreground transition-all hover:scale-105 hover:bg-background/90 shadow-sm"
          title="Quay lại trang chủ"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <aside className="relative flex w-full items-start justify-center overflow-y-auto bg-background dark:bg-[#1a1625] text-foreground dark:text-[#e6e1e7] border-l border-border/20 dark:border-primary/20 shadow-[-24px_0_60px_rgba(0,0,0,0.35)] dark:shadow-[-24px_0_60px_rgba(103,80,164,0.18)] px-3 py-5 sm:px-4 lg:w-[400px] lg:min-w-[400px] lg:max-w-[400px] lg:items-center lg:px-6 lg:py-6">
          <div className="w-full max-w-[400px]">
            <Outlet />
          </div>
        </aside>
      </div>
    </div>
  )
}