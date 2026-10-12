import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useSubmit from '@/hooks/useSubmit'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { forgotPassword } from '@/services/auth-service'

export default function ForgotPasswordFeature() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    const { isSubmitting, wrap } = useSubmit()

    const handleSubmit = wrap(async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setError(null)
        setSuccessMsg(null)
        try {
            const res = await forgotPassword({ email })
            setSuccessMsg(res.message || 'Mật khẩu mới đã được gửi đến email của bạn.')
        } catch (err: any) {
            setError(err?.message || 'Yêu cầu quên mật khẩu thất bại. Vui lòng kiểm tra lại email.')
        }
    })

    return (
        <div className="w-full space-y-6">
            {/* Header Section */}
            <div className="text-center">
                <h2 className="mb-1 font-sans text-xl font-bold text-white sm:text-2xl">Quên mật khẩu</h2>
                <p className="text-xs text-white/70 sm:text-sm">Nhập email của bạn để nhận mật khẩu mới.</p>
            </div>

            {error && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Forgot Password Form */}
            <form className="w-full space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="space-y-1.5">
                    <label className="ml-1 block text-sm font-medium text-white/75" htmlFor="email">
                        Địa chỉ Email
                    </label>
                    <div className="group relative rounded-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
                        <input
                            className="h-10 w-full rounded-sm border border-white/10 bg-[#201f24] px-3 text-sm text-white transition-colors placeholder:text-white/30 focus:border-primary focus:outline-none"
                            id="email"
                            placeholder="name@domain.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Primary Action */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-md border-none bg-primary text-sm font-bold text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Gửi mật khẩu mới'}
                    </button>
                </div>
            </form>

            {/* Secondary Action */}
            <div className="flex justify-center">
                <button
                    onClick={() => navigate('/login', { replace: true })}
                    className="flex items-center gap-2 text-sm font-medium text-[#d8c3ff] transition-opacity hover:opacity-80"
                >
                    <ArrowLeft size={16} />
                    Quay lại Đăng nhập
                </button>
            </div>
        </div>
    )
}
