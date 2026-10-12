import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useSubmit from '@/hooks/useSubmit'
import { useErrorHandler } from '@/lib/error-handler'
import { cn } from '@/lib/utils'
import { registerUser } from '@/services/auth-service'

export default function RegisterFeature() {
  const navigate = useNavigate()
  const { handleError } = useErrorHandler()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { isSubmitting, wrap } = useSubmit()

  const handleSubmit = wrap(async () => {
    setFieldErrors({})
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Mật khẩu và xác nhận mật khẩu không trùng khớp.' })
      return
    }

    try {
      await registerUser({ fullName, phone, email, password, confirmPassword, isActive: false })
      // Redirect to OTP verification, passing email via state
      navigate('/verify-otp', { state: { email } })
    } catch (err: any) {
      handleError(err, { showToast: true })
      if (err && err.errors) {
        setFieldErrors(err.errors)
      }
    }
  })

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="mb-1 font-sans text-xl font-bold text-foreground sm:text-2xl">Create an Account</h2>
        <p className="text-xs text-muted-foreground sm:text-sm">Join the community of readers.</p>
      </div>

      {/* Register Form */}
      <form className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4" onSubmit={handleSubmit}>
        {/* Name Field */}
        <div className="space-y-1.5 sm:col-span-1">
          <label className="ml-1 block text-sm font-medium text-foreground/75" htmlFor="name">
            Full Name
          </label>
          <div className={cn(
            "group relative rounded-sm transition-all focus-within:ring-2",
            fieldErrors.fullName ? "focus-within:ring-error/20" : "focus-within:ring-primary/20"
          )}>
            <input
              className={cn(
                "h-10 w-full rounded-sm border bg-muted/40 px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/50 focus:outline-none",
                fieldErrors.fullName ? "border-error focus:border-error" : "border-border focus:border-primary"
              )}
              id="name"
              placeholder="John Doe"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          {fieldErrors.fullName && (
            <p className="ml-1 mt-1 text-[11px] text-error font-medium">{fieldErrors.fullName}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-1.5 sm:col-span-1">
          <label className="ml-1 block text-sm font-medium text-foreground/75" htmlFor="phone">
            Phone Number
          </label>
          <div className={cn(
            "group relative rounded-sm transition-all focus-within:ring-2",
            fieldErrors.phone ? "focus-within:ring-error/20" : "focus-within:ring-primary/20"
          )}>
            <input
              className={cn(
                "h-10 w-full rounded-sm border bg-muted/40 px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/50 focus:outline-none",
                fieldErrors.phone ? "border-error focus:border-error" : "border-border focus:border-primary"
              )}
              id="phone"
              placeholder="0912345678"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          {fieldErrors.phone && (
            <p className="ml-1 mt-1 text-[11px] text-error font-medium">{fieldErrors.phone}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="ml-1 block text-sm font-medium text-foreground/75" htmlFor="email">
            Email Address
          </label>
          <div className={cn(
            "group relative rounded-sm transition-all focus-within:ring-2",
            fieldErrors.email ? "focus-within:ring-error/20" : "focus-within:ring-primary/20"
          )}>
            <input
              className={cn(
                "h-10 w-full rounded-sm border bg-muted/40 px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/50 focus:outline-none",
                fieldErrors.email ? "border-error focus:border-error" : "border-border focus:border-primary"
              )}
              id="email"
              placeholder="name@domain.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {fieldErrors.email && (
            <p className="ml-1 mt-1 text-[11px] text-error font-medium">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1 sm:col-span-2">
          <div className="flex items-center justify-between px-1">
            <label className="block text-sm font-medium text-foreground/75" htmlFor="password">
              Password
            </label>
          </div>
          <div className={cn(
            "group relative rounded-sm transition-all focus-within:ring-2",
            fieldErrors.password ? "focus-within:ring-error/20" : "focus-within:ring-primary/20"
          )}>
            <input
              className={cn(
                "h-10 w-full rounded-sm border bg-muted/40 px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/50 focus:outline-none",
                fieldErrors.password ? "border-error focus:border-error" : "border-border focus:border-primary"
              )}
              id="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {fieldErrors.password && (
            <p className="ml-1 mt-1 text-[11px] text-error font-medium">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1 sm:col-span-2">
          <div className="flex items-center justify-between px-1">
            <label className="block text-sm font-medium text-foreground/75" htmlFor="confirmPassword">
              Confirm Password
            </label>
          </div>
          <div className={cn(
            "group relative rounded-sm transition-all focus-within:ring-2",
            fieldErrors.confirmPassword ? "focus-within:ring-error/20" : "focus-within:ring-primary/20"
          )}>
            <input
              className={cn(
                "h-10 w-full rounded-sm border bg-muted/40 px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/50 focus:outline-none",
                fieldErrors.confirmPassword ? "border-error focus:border-error" : "border-border focus:border-primary"
              )}
              id="confirmPassword"
              placeholder="••••••••"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {fieldErrors.confirmPassword && (
            <p className="ml-1 mt-1 text-[11px] text-error font-medium">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Primary Action */}
        <div className="pt-2 sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md border-none bg-primary text-sm font-bold text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </div>
      </form>

      {/* Secondary Action */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Already have an account?</span>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="text-sm font-bold text-primary transition-all hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}
