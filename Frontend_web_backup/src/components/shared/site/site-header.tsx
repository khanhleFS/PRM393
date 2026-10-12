import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { User, Moon, Sun, BookOpen } from 'lucide-react'
import Container from './container'
import StaggeredMenu from '@/components/custom/staggered-menu/StaggeredMenu'
import { SearchInput } from './search-input'
import { useAuth } from '@/lib/auth'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useThemeStore } from '@/store/theme.store'

export default function SiteHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  )

  // Track and synchronize the global search query parameter from URL
  const urlQuery = useMemo(() => {
    return new URLSearchParams(location.search).get('q') || ''
  }, [location.search])

  const [headerQuery, setHeaderQuery] = useState(urlQuery)

  useEffect(() => {
    setHeaderQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20
      setIsScrolled(prev => (prev === scrolled ? prev : scrolled))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const { themeMode, setThemeMode } = useThemeStore()

  // Synchronize header theme icon state with the actual html class (so other pages can update it)
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })

    const applyObs = () => {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })
    }
    applyObs();

    return () => observer.disconnect()
  }, [])

  // Apply the 3-mode theme (light, dark, or system matching system media query)
  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = () => {
      if (themeMode === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        if (systemTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } else if (themeMode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme-mode', themeMode);

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode])

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark')
  }

  const baseMenuItems = useMemo(() => [
    { label: 'Trang chủ', link: '/' },
    { label: 'Khám phá', link: '/search' },
    ...(isAuthenticated ? [{ label: 'Thông tin cá nhân', link: '/profile' }] : []),
  ], [isAuthenticated])



  return (
    <header
      className={`fixed top-0 w-full z-50 transition-[background-color,padding,border-color,backdrop-filter] duration-300 py-4 ${isScrolled ? 'bg-background/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5' : 'bg-transparent'
        }`}
    >
      <Container className="flex items-center justify-between gap-6 md:grid md:grid-cols-3">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group justify-self-start">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
            <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-white dark:text-background" />
          </div>
          <span className="font-bold text-xl md:text-2xl tracking-tighter text-primary">Storya</span>
        </Link>

        {/* Search Bar - Center (Desktop) with reusable SearchInput validation */}
        <SearchInput
          value={headerQuery}
          onChange={setHeaderQuery}
          onSubmit={() => {
            const trimmed = headerQuery.trim()
            navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
          }}
          placeholder="Tìm kiếm truyện, tác giả..."
          className="hidden md:flex justify-self-center w-full max-w-md"
        />

        {/* Actions */}
        <div className="flex items-center gap-2 justify-self-end">
          <button
            onClick={toggleTheme}
            className="hidden sm:flex items-center justify-center h-10 w-10 rounded-full hover:bg-muted transition-colors text-foreground"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Profile / Login icon */}
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-muted transition-colors text-foreground"
              title="Hồ sơ cá nhân"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl} alt={user?.username} />
                <AvatarFallback className="bg-primary text-on-primary font-bold text-xs">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <button
              onClick={() => navigate('/login', { state: { from: location } })}
              className="hidden sm:flex items-center justify-center h-10 w-10 rounded-full hover:bg-muted transition-colors text-foreground"
              title="Đăng nhập"
            >
              <User className="h-5 w-5" />
            </button>
          )}

          <StaggeredMenu
            items={baseMenuItems}
            accentColor="var(--primary)"
            colors={['var(--lumina-dim)', 'var(--primary)']}
            menuButtonColor="var(--foreground)"
            openMenuButtonColor="var(--foreground)"
            isDark={isDark}
            toggleTheme={toggleTheme}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            user={user}
            onLogout={logout}
          />
        </div>
      </Container>
    </header>
  )
}