import type { RouteObject } from 'react-router-dom'
import SiteLayout from '@/layouts/SiteLayout'
import GuestLayout from '@/layouts/GuestLayout'
import LoginPage from '@/features/auth/login-feature'
import RegisterPage from '@/features/auth/register-feature'
import ForgotPasswordPage from '@/features/auth/forgot-password-feature'
import VerifyOtpPage from '@/features/auth/verify-otp-feature'
import DemoPage from '@/pages/guest/demo'

// Import public content pages
import HomePage from '@/pages/guest/home'
import SearchPage from '@/features/search/search-feature'
import StoryDetailPage from '@/features/story-detail/story-detail-feature'
import ReaderPage from '@/features/reader/reader-feature'



export const guestRoutes: RouteObject[] = [
	{
		element: <GuestLayout />,
		children: [
			{ path: 'login', element: <LoginPage /> },
			{ path: 'register', element: <RegisterPage /> },
			{ path: 'forgot-password', element: <ForgotPasswordPage /> },
			{ path: 'verify-otp', element: <VerifyOtpPage /> },
		],
	},
	{
		element: <SiteLayout />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: 'demo', element: <DemoPage /> },
			{ path: 'search', element: <SearchPage /> },
			{ path: ':novelSlugWithId', element: <StoryDetailPage /> },
			{ path: ':novelSlugWithId/:chapterSlug', element: <ReaderPage /> }
		],
	}
]
