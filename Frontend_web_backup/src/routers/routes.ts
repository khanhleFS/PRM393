import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '@/layouts/RootLayout'
import { RouteErrorPage } from '@/lib/error-handler'
import { adminRoutes } from './adminRoutes'
import { authorRoutes } from './authorRoutes'
import { guestRoutes } from './guestRoutes'
import { protectedRoutes } from './protectedRoutes'

const router = createBrowserRouter([
	{
		element: React.createElement(RootLayout),
		errorElement: React.createElement(RouteErrorPage),
		children: [
			...guestRoutes,
			...protectedRoutes,
			...adminRoutes,
			...authorRoutes
		],
	},
])

export default router
