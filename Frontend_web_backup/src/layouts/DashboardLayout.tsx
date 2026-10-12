"use client"

import type React from 'react'
import { useLocation, Navigate, Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/shared/dashboard/app-sidebar'
import { useAuth } from '@/lib/auth'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export default function DashboardLayout() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAuthorRoute = location.pathname.startsWith('/author')

  const pageTitle = (() => {
    const path = location.pathname
    if (path === '/admin/dashboard' || path === '/author/dashboard') {
      return 'Tổng quan'
    }
    if (path === '/admin/finance' || path === '/author/finance') {
      return 'Quản lý tài chính'
    }
    if (path === '/admin/packages') {
      return 'Quản lý gói nạp'
    }
    if (path === '/admin/users') {
      return 'Quản lý người dùng'
    }
    if (path === '/admin/categories' || path === '/author/categories') {
      return 'Quản lý thể loại'
    }
    if (path === '/author/stats') {
      return 'Thống kê chương'
    }
    if (path === '/author/me') {
      return 'Hồ sơ tác giả'
    }


    if (path.startsWith('/author/novels')) {
      if (path.includes('/chapters/new')) return 'Thêm chương mới'
      if (path.includes('/chapters/')) return 'Chỉnh sửa chương'
      if (path.endsWith('/new')) return 'Tạo truyện mới'
      if (path === '/author/novels') return 'Quản lý truyện'
      return 'Chỉnh sửa truyện'
    }
    return 'Content'
  })()

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (isAdminRoute && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  if (isAuthorRoute && !user?.isAuthor && user?.role == 'ADMIN') {
    return <Navigate to="/" replace />
  }

  // Xác định variant dựa trên route hiện tại
  const sidebarVariant = isAdminRoute ? 'admin' : 'author'

  return (
    <SidebarProvider
      defaultOpen={true}
      className="h-screen overflow-hidden bg-primary text-[var(--on-primary)]"
      style={{
        '--sidebar': 'var(--inverse-primary)',
        '--sidebar-foreground': 'var(--on-primary-container)',
        '--sidebar-accent': 'var(--primary)',
        '--sidebar-accent-foreground': 'var(--on-primary)',
        '--sidebar-border': 'color-mix(in srgb, var(--primary) 22%, white)',
        '--sidebar-ring': 'var(--primary)',
      } as React.CSSProperties}
    >
      {/* Truyền variant xuống AppSidebar */}
      <AppSidebar variant={sidebarVariant} />
      <SidebarInset className="flex h-screen min-h-0 flex-col overflow-hidden bg-transparent">
        <div className="flex-1 min-h-0 py-4 pr-4">
          <div className="flex h-full min-h-0 w-full max-w-none">
            <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border border-gray-100 bg-surface-container-low shadow-sm">
              <div className="flex flex-none items-center gap-2 border-b border-black/10 px-6 py-4">
                <SidebarTrigger size="icon" className="shrink-0 rounded-full bg-primary text-[var(--on-primary)] hover:bg-primary/90 hover:text-[var(--on-primary)]" />
                <Separator orientation="vertical" className="h-6" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 [scrollbar-gutter:stable]">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}