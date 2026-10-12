"use client"

import * as React from "react"
import { useLocation } from 'react-router-dom'
import { LayoutDashboardIcon, Check, Moon, Sun, SunMoon, AudioLinesIcon, GalleryVerticalEndIcon, TerminalIcon, WalletIcon, BookOpen, LogOut, BarChart3Icon, Users, Coins, FolderTree, User } from "lucide-react"

import { NavMain } from "@/components/shared/dashboard/nav-main"
import { TeamSwitcher } from "@/components/shared/dashboard/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

import { useThemeStore } from "@/store/theme.store"
import { useAuth } from "@/lib/auth"

type ThemeMode = 'light' | 'dark' | 'system'
const THEME_CYCLE = ['light', 'dark', 'system'] as const

const THEME_BUTTONS: { mode: ThemeMode; icon: React.ElementType; label: string }[] = [
  { mode: 'light', icon: Sun, label: 'Sáng' },
  { mode: 'dark', icon: Moon, label: 'Tối' },
  { mode: 'system', icon: SunMoon, label: 'Hệ thống' },
]

const data = {
  teams: [
    { name: "Storya", logo: <GalleryVerticalEndIcon />, plan: "" },
    { name: "Acme Corp.", logo: <AudioLinesIcon />, plan: "Startup" },
    { name: "Evil Corp.", logo: <TerminalIcon />, plan: "Free" },
  ],
  navMain: [
    { title: "Tổng quan", url: "/admin/dashboard", icon: <LayoutDashboardIcon /> },
    { title: "Quản lý người dùng", url: "/admin/users", icon: <Users /> },
    { title: "Quản lý tài chính", url: "/admin/finance", icon: <WalletIcon /> },
    { title: "Quản lý gói nạp", url: "/admin/packages", icon: <Coins /> },
    { title: "Quản lý thể loại", url: "/admin/categories", icon: <FolderTree /> },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()

  const { themeMode, setThemeMode } = useThemeStore()
  const { user, logout } = useAuth()

  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('light')
  const [themeAnimating, setThemeAnimating] = React.useState(false)

  React.useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = () => {
      if (themeMode === 'system') {
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setResolvedTheme(systemIsDark ? 'dark' : 'light')
        root.classList.toggle('dark', systemIsDark)
      } else {
        setResolvedTheme(themeMode)
        root.classList.toggle('dark', themeMode === 'dark')
      }
    }

    applyTheme()
    localStorage.setItem('theme-mode', themeMode)

    if (themeMode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', applyTheme)
      return () => mq.removeEventListener('change', applyTheme)
    }
  }, [themeMode])

  React.useEffect(() => {
    setThemeAnimating(true)
    const timeout = window.setTimeout(() => setThemeAnimating(false), 180)

    return () => window.clearTimeout(timeout)
  }, [themeMode])

  const handleThemeSwap = () => {
    const nextIndex = (THEME_CYCLE.indexOf(themeMode) + 1) % THEME_CYCLE.length
    setThemeMode(THEME_CYCLE[nextIndex])
  }

  const isAuthorRoute = location.pathname.startsWith('/author')
  const navItems = React.useMemo(() => {
    let items = [...data.navMain]
    if (isAuthorRoute) {
      items = [
        { title: "Hồ sơ tác giả", url: "/author/me", icon: <User /> },
        { title: "Quản lý truyện", url: "/author/novels", icon: <BookOpen /> },
        { title: "Thống kê truyện", url: "/author/stats", icon: <BarChart3Icon /> },
      ]
      return items.map((item) => ({
        ...item,
        isActive: location.pathname === item.url || location.pathname.startsWith(item.url + '/'),
      }))
    }


    return items.map((item) => ({
      ...item,
      isActive: location.pathname === item.url || location.pathname.startsWith(item.url + '/'),
    }))
  }, [isAuthorRoute, location.pathname])

  const isDarkActive = themeMode === 'dark' || (themeMode === 'system' && resolvedTheme === 'dark')

  const checkBadgeClass = isDarkActive
    ? 'border border-white/80 bg-on-primary text-primary'
    : 'border border-white/80 bg-primary text-on-primary'

  const activeButtonClass = isDarkActive
    ? 'border-white/80 bg-on-primary text-primary shadow-sm ring-1 ring-inset ring-on-primary/70'
    : 'border-white/80 bg-white text-primary shadow-sm ring-1 ring-inset ring-white/70'

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-4 pt-4 pb-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:py-4">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>

      {/* Theme Switcher */}
      <div className="px-4 pb-1 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:pb-0">
        {/*
          Expanded  → 3-col grid, all buttons visible
          Collapsed → grid collapses to icon width; unchecked buttons are hidden,
                      only the active button remains (square icon button) and acts as a swap toggle
        */}
        <div className="grid grid-cols-3 gap-2 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:grid-cols-1 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-items-start">
          {THEME_BUTTONS.map(({ mode, icon: Icon, label }) => {
            const isActive = themeMode === mode
            return (
              <button
                key={mode}
                type="button"
                onClick={isActive ? handleThemeSwap : () => setThemeMode(mode)}
                className={[
                  // base
                  'relative flex flex-col items-center justify-center rounded-md border px-2 py-2 text-xs transition-all',
                  // active vs inactive
                  isActive
                    ? activeButtonClass
                    : 'border-on-primary bg-white/20 text-on-primary hover:bg-white/30',
                  // collapsed: hide unchecked buttons entirely
                  !isActive ? 'group-data-[collapsible=icon]:hidden' : '',
                  // collapsed + active: make it a square icon button matching footer size
                  isActive ? 'group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0' : '',
                ].join(' ')}
                aria-label={isActive ? `Chuyển chế độ (hiện tại: ${label})` : label}
                title={label}
              >
                {isActive && (
                  <span className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full group-data-[collapsible=icon]:hidden ${checkBadgeClass}`}>
                    <Check className="h-2.5 w-2.5 stroke-[3.5]" />
                  </span>
                )}
                <Icon className={[
                  'mb-1 h-4 w-4 transition-transform duration-180 ease-out group-data-[collapsible=icon]:mb-0',
                  themeAnimating && isActive ? 'group-data-[collapsible=icon]:rotate-180' : 'group-data-[collapsible=icon]:rotate-0',
                ].join(' ')} />
                <span className="text-[10px] font-bold group-data-[collapsible=icon]:hidden">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <SidebarFooter className="px-4 py-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={logout}
              className="bg-primary-container text-[var(--on-primary-container)] hover:bg-primary-container/90 hover:text-[var(--on-primary-container)] focus-visible:bg-primary-container focus-visible:text-[var(--on-primary-container)]"
              title="Đăng xuất"
            >
              <Avatar className="h-8 w-8 rounded-lg bg-[var(--on-primary)] p-0.5">
                <AvatarImage src={user?.avatarUrl} alt={user?.username} />
                <AvatarFallback className="rounded-lg bg-primary text-on-primary font-bold text-xs">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{user?.fullName || user?.username || "Người dùng"}</span>
                <span className="truncate text-xs text-[var(--on-primary-container)]/70">{user?.email}</span>
              </div>
              <LogOut className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}