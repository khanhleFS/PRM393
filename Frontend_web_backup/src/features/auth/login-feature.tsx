import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useSubmit from '@/hooks/useSubmit'
import { useAuth } from '@/lib/auth'
import { loginUser } from '@/services/auth-service'

export default function LoginFeature() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { isSubmitting, wrap } = useSubmit()

  const handleSubmit = wrap(async () => {
    setError(null)
    try {
      const { accessToken, refreshToken, userId, username, email: userEmail, role, isAuthor } = await loginUser({ email, password })
      login(
        {
          id: userId,
          username,
          email: userEmail,
          role,
          isAuthor,
          fullName: username,
          avatarUrl: undefined,
        },
        accessToken,
        refreshToken
      )

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
        }
      }

      if (target && !isAuthPage(target)) {
        navigate(target, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err: any) {
      setError(err?.message || 'Email hoặc mật khẩu không chính xác.')
    }
  })

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="mb-1 font-sans text-xl font-bold text-foreground sm:text-2xl">Welcome Back</h2>
        <p className="text-xs text-muted-foreground sm:text-sm">Continue your journey into the pages.</p>
      </div>

      {error && (
        <div className="alert alert-error rounded-sm text-xs py-2.5 px-3 text-error-content flex flex-col items-start gap-1">
          <span>{error}</span>
          {error.includes('chưa được kích hoạt') && (
            <button
              type="button"
              onClick={() => navigate('/verify-otp', { state: { email } })}
              className="mt-1 text-xs font-bold underline cursor-pointer hover:opacity-90"
            >
              Nhấn vào đây để xác thực OTP ngay
            </button>
          )}
        </div>
      )}

      {/* Login Form */}
      <form className="w-full space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="ml-1 block text-sm font-medium text-foreground/75" htmlFor="email">
            Email Address
          </label>
          <div className="group relative rounded-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <input
              className="h-10 w-full rounded-sm border border-border bg-muted/40 px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              id="email"
              placeholder="name@domain.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <label className="block text-sm font-medium text-foreground/75" htmlFor="password">
              Password
            </label>
          </div>
          <div className="group relative rounded-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <input
              className="h-10 w-full rounded-sm border border-border bg-muted/40 px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              id="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Remember Me and Forgot Password */}
        <div className="flex items-center justify-between px-1 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="peer h-4 w-4 cursor-pointer appearance-none rounded-[2px] border border-border bg-muted/40 bg-center bg-no-repeat bg-[length:12px_12px] focus:outline-none focus:ring-2 focus:ring-primary/20 checked:border-primary checked:bg-primary checked:bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%2220%206%209%2017%204%2012%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]"
            />
            <span className="text-sm text-foreground/75">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm font-bold text-primary transition-all hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {/* Primary Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md border-none bg-primary text-sm font-bold text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>

      {/* Secondary Action */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Don't have an account?</span>
          <button
            onClick={() => navigate('/register')}
            className="text-sm font-bold text-primary transition-all hover:underline"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  )
}
