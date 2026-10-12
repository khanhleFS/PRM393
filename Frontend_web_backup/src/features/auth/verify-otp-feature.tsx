import { useState, useRef, useEffect } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useErrorHandler } from '@/lib/error-handler'
import { cn } from '@/lib/utils'
import { verifyRegisterOtp, resendOtp } from '@/services/auth-service'

export default function VerifyOtpFeature() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const { handleError, addToast } = useErrorHandler()

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email) {
      navigate('/register')
    }
  }, [email, navigate])

  useEffect(() => {
    if (timeLeft <= 0) return
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timerId)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus()
    }
  }

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    setError(null)

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    if (value) {
      if (index < 5) {
        focusInput(index + 1)
      } else {
        inputRefs.current[5]?.blur()
      }
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    setError(null)
    if (
      otp.join('').length === 6 &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== 'ArrowLeft' &&
      e.key !== 'ArrowRight' &&
      e.key !== 'Tab' &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      const target = e.target as HTMLInputElement
      if (target.selectionStart === target.selectionEnd) {
        e.preventDefault()
      }
    }

    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      focusInput(index - 1)
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1)
    } else if (e.key === 'ArrowRight' && index < 5) {
      focusInput(index + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    setError(null)
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6)

    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)

    const nextIndex = Math.min(pastedData.length, 5)
    if (pastedData.length === 6) {
      inputRefs.current[5]?.blur()
    } else {
      focusInput(nextIndex)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join('')
    if (otpValue.length === 6) {
      setError(null)
      setIsSubmitting(true)
      try {
        await verifyRegisterOtp({ email, otpCode: otpValue })
        addToast({
          title: 'Kích hoạt tài khoản thành công!',
          message: 'Đang chuyển hướng sang đăng nhập...',
          variant: 'success'
        })
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 2000)
      } catch (err: any) {
        const errMsg = err?.message || 'Mã OTP không chính xác hoặc đã hết hạn.'
        setError(errMsg)
        handleError(err, { showToast: true, toastTitle: 'Lỗi xác thực' })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleResend = async () => {
    setError(null)
    try {
      await resendOtp(email)
      addToast({
        title: 'Đã gửi lại OTP',
        message: 'Mã OTP mới đã được gửi lại vào email của bạn.',
        variant: 'success'
      })
      setTimeLeft(300)
    } catch (err: any) {
      handleError(err, { showToast: true, toastTitle: 'Gửi lại OTP thất bại' })
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="mb-1 font-sans text-xl font-bold text-foreground sm:text-2xl">Verify Email</h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          We've sent a 6-digit code to <span className="font-semibold text-primary">{email}</span>
        </p>
      </div>

      {/* OTP Form */}
      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        <div className="flex justify-center gap-1 sm:gap-1.5">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={2}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={(e) => e.target.select()}
              onPaste={handlePaste}
              className={cn(
                "h-9 w-9 rounded-sm border bg-muted/40 text-center text-base font-bold text-foreground transition-colors focus:outline-none focus:ring-2 sm:h-10 sm:w-10 sm:text-lg",
                error
                  ? "border-error focus:border-error focus:ring-error/20"
                  : "border-border focus:border-primary focus:ring-primary/20"
              )}
            />
          ))}
        </div>

        {/* Primary Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={otp.join('').length !== 6 || isSubmitting}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md border-none bg-primary text-sm font-bold text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying...' : 'Verify Account'}
          </button>
        </div>
      </form>

      {/* Secondary Action */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Didn't receive the code?</span>
          <button
            type="button"
            disabled={timeLeft > 0}
            className={`text-sm font-bold transition-all ${timeLeft > 0
              ? 'cursor-not-allowed text-muted-foreground/50'
              : 'text-primary hover:underline'
              }`}
            onClick={handleResend}
          >
            {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : 'Resend OTP'}
          </button>
        </div>
      </div>
      {/* Back Button */}
      <div className="flex justify-center">
        <button
          onClick={() => navigate('/register')}
          className="flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80"
        >
          <ArrowLeft size={16} />
          Back to Register
        </button>
      </div>
    </div>
  )
}
