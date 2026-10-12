import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import DashboardLayout from '@/layouts/DashboardLayout'
import Dashboard from '@/features/admin-dashboard/dashboard-feature'
import FinancePage from '@/features/admin-finance/finance-feature'
import UserManagementPage from '@/features/admin-user/user-feature'
import PackagesPage from '@/features/admin-packages/packages-feature'
import CategoryManagementPage from '@/features/category-management/category-feature'

export const adminRoutes: RouteObject[] = [
	{
		path: 'admin',
		element: <DashboardLayout />,
		children: [
			{ index: true, element: <Navigate to="dashboard" replace /> },
			{ path: 'dashboard-old', element: <Dashboard /> },
			{ path: 'dashboard', element: <Dashboard /> },
			{ path: 'finance', element: <FinancePage /> },
			{ path: 'users', element: <UserManagementPage /> },
			{ path: 'packages', element: <PackagesPage /> },
			{ path: 'categories', element: <CategoryManagementPage /> },
		],
	},
]


