import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, BookOpen } from 'lucide-react'
import Container from '@/components/shared/site/container'

export default function PaymentLoadingFeature() {
  const navigate = useNavigate()

  useEffect(() => {
    // Simulate random loading time between 5s and 30s
    const loadingTime = Math.floor(Math.random() * (30000 - 5000 + 1)) + 5000

    const timer = setTimeout(() => {
      if (loadingTime > 15000) {
        // If loading takes more than 15s, assume a timeout and redirect to profile
        navigate('/profile')
      } else {
        // Otherwise, successful payment
        navigate('/payment/result')
      }
    }, loadingTime)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <Container className="text-foreground relative min-h-[calc(100vh-100px)] flex items-center justify-center py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(208,188,255,0.08),transparent_70%)] pointer-events-none"></div>
      
      <div className="mx-auto flex w-full max-w-xl flex-col items-center space-y-10 relative z-10">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-[4px] border-primary/20 border-t-primary animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard className="h-10 w-10 text-primary opacity-40" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-on-surface">Redirecting to gateway</p>
            <p className="text-base text-on-surface-variant opacity-80">Please do not close or refresh this page.</p>
          </div>
        </div>

        <div className="relative w-full overflow-hidden rounded-2xl border border-outline/10 bg-surface-container p-8 space-y-8 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 rounded bg-surface-container-high animate-pulse"></div>
              <div className="h-5 w-16 rounded bg-surface-container-high animate-pulse"></div>
            </div>
            
            <div className="h-px w-full bg-outline/10"></div>
            
            <div className="space-y-6 py-2">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-surface-container-high opacity-50 animate-pulse"></div>
                <div className="h-7 w-40 rounded bg-surface-container-high animate-pulse"></div>
              </div>
              
              <div className="space-y-2">
                <div className="h-3 w-28 rounded bg-surface-container-high opacity-50 animate-pulse"></div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 rounded-md bg-surface-container-high animate-pulse"></div>
                  <div className="h-6 w-48 rounded bg-surface-container-high animate-pulse"></div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flex items-center justify-between rounded-xl border border-outline/10 bg-surface-container-high p-6">
                  <div className="h-5 w-24 rounded bg-surface opacity-60 animate-pulse"></div>
                  <div className="h-8 w-32 rounded bg-surface animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex select-none items-center space-x-2 opacity-40">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold uppercase tracking-widest text-on-surface">Luminovels</span>
        </div>
      </div>
    </Container>
  )
}
