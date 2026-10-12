import React from 'react'
import { AlertCircle, Home, RefreshCcw, X } from 'lucide-react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ToastVariant = 'info' | 'success' | 'warning' | 'error'

export interface ToastInput {
  title: string
  message?: string
  variant?: ToastVariant
  duration?: number
}

export interface HandleErrorOptions {
  showToast?: boolean
  log?: boolean
  redirect?: string | null
  silent?: boolean
  toastTitle?: string
  toastMessage?: string
}

interface NormalizedError {
  title: string
  message: string
  variant: ToastVariant
  status?: number
  code?: string | number
  original: unknown
}

interface ErrorHandlerContextValue {
  handleError: (error: unknown, options?: HandleErrorOptions) => Promise<NormalizedError>
  addToast: (toast: ToastInput) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

interface ErrorHandlerProviderProps {
  children: React.ReactNode
  loggerFn?: (error: NormalizedError) => void
  toastFn?: (toast: ToastInput) => void
  navigateFn?: (path: string) => void
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode | ((error: Error, resetErrorBoundary: () => void) => React.ReactNode)
  onError?: (error: Error, info: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: Error | null
}

interface ToastRecord extends ToastInput {
  id: string
}

const ErrorHandlerContext = React.createContext<ErrorHandlerContextValue | null>(null)

function createToastId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getRouteErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return error.statusText || `Request failed with ${error.status}`
  }

  return null
}

function getErrorMessage(error: unknown) {
  const routeErrorMessage = getRouteErrorMessage(error)

  if (routeErrorMessage) {
    return routeErrorMessage
  }

  if (error instanceof Error) {
    return error.message || 'Something went wrong'
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object') {
    const maybeMessage = (error as { message?: unknown }).message
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage
    }

    const maybeUserMessage = (error as { userMessage?: unknown }).userMessage
    if (typeof maybeUserMessage === 'string' && maybeUserMessage.trim()) {
      return maybeUserMessage
    }

    if (
      maybeUserMessage &&
      typeof maybeUserMessage === 'object' &&
      'message' in maybeUserMessage
    ) {
      const nestedMessage = (maybeUserMessage as { message?: unknown }).message
      if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
        return nestedMessage
      }
    }
  }

  return 'Something went wrong'
}

function getErrorTitle(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return `Request error ${error.status}`
  }

  if (error instanceof Error) {
    return error.name && error.name !== 'Error' ? error.name : 'Application error'
  }

  if (error && typeof error === 'object') {
    const maybeTitle = (error as { title?: unknown }).title
    if (typeof maybeTitle === 'string' && maybeTitle.trim()) {
      return maybeTitle
    }
  }

  return 'Application error'
}

function getErrorStatus(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return error.status
  }

  if (error && typeof error === 'object') {
    const response = (error as { response?: { status?: unknown } }).response
    if (response && typeof response.status === 'number') {
      return response.status
    }

    const status = (error as { status?: unknown }).status
    if (typeof status === 'number') {
      return status
    }
  }

  return undefined
}

function getErrorCode(error: unknown) {
  if (error && typeof error === 'object') {
    const code = (error as { code?: unknown }).code
    if (typeof code === 'string' || typeof code === 'number') {
      return code
    }
  }

  return undefined
}

function normalizeError(error: unknown): NormalizedError {
  const status = getErrorStatus(error)
  const message = getErrorMessage(error)
  const title = getErrorTitle(error)

  let variant: ToastVariant = 'error'
  if (status && status >= 400 && status < 500) {
    variant = 'warning'
  }

  return {
    title,
    message,
    variant,
    status,
    code: getErrorCode(error),
    original: error,
  }
}

export function ErrorHandlerProvider({
  children,
  loggerFn,
  toastFn,
  navigateFn,
}: ErrorHandlerProviderProps) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([])
  const toastTimersRef = React.useRef(new Map<string, ReturnType<typeof window.setTimeout>>())

  const removeToast = React.useCallback((id: string) => {
    const timer = toastTimersRef.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      toastTimersRef.current.delete(id)
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }, [])

  const clearToasts = React.useCallback(() => {
    toastTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    toastTimersRef.current.clear()
    setToasts([])
  }, [])

  const addToast = React.useCallback(
    (toast: ToastInput) => {
      const id = createToastId()
      const duration = toast.duration ?? 4500

      setToasts((currentToasts) => [
        ...currentToasts.slice(-3),
        { ...toast, id },
      ])

      const timer = window.setTimeout(() => {
        removeToast(id)
      }, duration)

      toastTimersRef.current.set(id, timer)

      return id
    },
    [removeToast]
  )

  const handleError = React.useCallback(
    async (error: unknown, options: HandleErrorOptions = {}) => {
      const normalizedError = normalizeError(error)

      if (options.log !== false) {
        if (loggerFn) {
          loggerFn(normalizedError)
        } else {
          console.error(normalizedError.original)
        }
      }

      if (options.showToast && !options.silent) {
        const toastPayload: ToastInput = {
          title: options.toastTitle ?? normalizedError.title,
          message: options.toastMessage ?? normalizedError.message,
          variant: normalizedError.variant,
        }

        if (toastFn) {
          toastFn(toastPayload)
        } else {
          addToast(toastPayload)
        }
      }

      const redirectTo = options.redirect ?? undefined
      if (redirectTo) {
        if (navigateFn) {
          navigateFn(redirectTo)
        } else if (typeof window !== 'undefined') {
          window.location.assign(redirectTo)
        }
      }

      return normalizedError
    },
    [addToast, loggerFn, navigateFn, toastFn]
  )

  React.useEffect(() => {
    return () => {
      toastTimersRef.current.forEach((timer) => window.clearTimeout(timer))
      toastTimersRef.current.clear()
    }
  }, [])

  const value = React.useMemo<ErrorHandlerContextValue>(
    () => ({
      handleError,
      addToast,
      removeToast,
      clearToasts,
    }),
    [addToast, clearToasts, handleError, removeToast]
  )

  return (
    <ErrorHandlerContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} clearToasts={clearToasts} />
    </ErrorHandlerContext.Provider>
  )
}

export function useErrorHandler() {
  const context = React.useContext(ErrorHandlerContext)

  if (!context) {
    throw new Error('useErrorHandler must be used within ErrorHandlerProvider')
  }

  return context
}

export function ToastContainer({
  toasts,
  removeToast,
  clearToasts: _clearToasts,
}: {
  toasts: ToastRecord[]
  removeToast: (id: string) => void
  clearToasts: () => void
}) {
  if (!toasts.length) {
    return null
  }

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-[100] flex w-[min(92vw,24rem)] -translate-x-1/2 flex-col items-center gap-3">
      {/* <div className="pointer-events-auto flex justify-end">
        <button
          type="button"
          onClick={clearToasts}
          className="rounded-full border border-[color-mix(in_srgb,var(--outline-variant),transparent_35%)] bg-[color-mix(in_srgb,var(--surface-container-highest),white_4%)] text-xs font-medium text-[var(--on-surface-variant)] shadow-lg shadow-black/5 backdrop-blur hover:bg-[color-mix(in_srgb,var(--surface-container-highest),white_10%)]"
        >
          <X className="h-8 w-8" />
        </button>
      </div> */}

      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastRecord
  onDismiss: () => void
}) {
  const variant = toast.variant ?? 'error'

  const variantStyles: Record<ToastVariant, string> = {
    info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/20 dark:bg-sky-950/30 dark:text-sky-200',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/30 dark:text-emerald-200',
    warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-200',
    error: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-950/30 dark:text-rose-200',
  }

  const Icon = AlertCircle

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-auto rounded-md border p-4 shadow-xl shadow-black/5 backdrop-blur transition-all duration-200',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/10 text-current">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5">{toast.title}</p>
          {toast.message ? (
            <p className="mt-1 text-sm leading-5 text-current/80">{toast.message}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full p-1 text-current/70 transition hover:bg-black/10 hover:text-current"
          aria-label="Dismiss toast"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  return (
    <InternalErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </InternalErrorBoundary>
  )
}

class InternalErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info)
  }

  resetErrorBoundary = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.resetErrorBoundary)
      }

      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          onRetry={this.resetErrorBoundary}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({
  error,
  onRetry,
}: {
  error: Error
  onRetry: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--primary),transparent_84%),transparent_38%),linear-gradient(180deg,var(--surface),var(--surface-container-low))] px-4 py-10 text-[var(--foreground)]">
      <div className="w-full max-w-xl rounded-[2rem] border border-[color-mix(in_srgb,var(--outline-variant),transparent_35%)] bg-[color-mix(in_srgb,var(--surface-container-highest),white_8%)] p-6 shadow-2xl shadow-black/10 backdrop-blur sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--error-container),white_12%)] text-[var(--on-error-container)]">
            <AlertCircle className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              Application error
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              Something interrupted the page
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              {error.message || 'The app hit an unexpected problem and needs a reset.'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={onRetry} className="rounded-xl">
            Try again
          </Button>

          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
        </div>

        <details className="mt-6 rounded-2xl border border-[color-mix(in_srgb,var(--outline-variant),transparent_50%)] bg-black/5 p-4 text-sm text-[var(--muted-foreground)]">
          <summary className="cursor-pointer select-none font-medium text-[var(--foreground)]">
            Error details
          </summary>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-5">
            {error.stack || error.message}
          </pre>
        </details>
      </div>
    </div>
  )
}

export function RouteErrorPage() {
  const error = useRouteError()

  const title = isRouteErrorResponse(error)
    ? `Request failed with ${error.status}`
    : error instanceof Error
      ? error.name && error.name !== 'Error'
        ? error.name
        : 'Route error'
      : 'Route error'

  const message = getErrorMessage(error)
  const status = getErrorStatus(error)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--primary),transparent_84%),transparent_38%),linear-gradient(180deg,var(--surface),var(--surface-container-low))] px-4 py-10 text-[var(--foreground)]">
      <div className="w-full max-w-2xl rounded-[2rem] border border-[color-mix(in_srgb,var(--outline-variant),transparent_35%)] bg-[color-mix(in_srgb,var(--surface-container-highest),white_8%)] p-6 shadow-2xl shadow-black/10 backdrop-blur sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--error-container),white_12%)] text-[var(--on-error-container)]">
            <AlertCircle className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              Route error
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              {message}
            </p>
            {typeof status === 'number' ? (
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                HTTP status {status}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={() => window.location.reload()} className="rounded-xl">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reload
          </Button>

          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
