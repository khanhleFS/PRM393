import { Outlet } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'

/**
 * Injects a minimal fade-in keyframe once (avoids re-declaring on every render).
 * The animation is reset each time the component key changes (i.e. on route change).
 */
const PAGE_TRANSITION_STYLE = `
  @keyframes _page-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  ._page-transition {
    animation: _page-fade-in 0.2s ease-out both;
    will-change: opacity;
  }
`

export default function RootLayout() {
  return (
    // AuthProvider runs refreshProfile once on mount to validate the stored token.
    // It is NOT a Context.Provider — state lives in the Zustand store.
    <AuthProvider>
      {/* Inject global keyframe once */}
      <style dangerouslySetInnerHTML={{ __html: PAGE_TRANSITION_STYLE }} />
      <div className="_page-transition">
        <Outlet />
      </div>
    </AuthProvider>
  )
}