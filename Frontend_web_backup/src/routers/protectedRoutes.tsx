import type { RouteObject } from 'react-router-dom'
import SiteLayout from '@/layouts/SiteLayout'
import ProfilePage from '@/features/profile/profile-feature'
import PaymentCreatePage from '@/features/payment/payment-create-feature'
import PaymentLoadingPage from '@/features/payment/payment-loading-feature'
import PaymentResultPage from '@/features/payment/payment-result-feature'


export const protectedRoutes: RouteObject[] = [
	{
		element: <SiteLayout requireAuth />,
		children: [
			{ path: 'profile', element: <ProfilePage /> },
			{ path: 'payment/create', element: <PaymentCreatePage /> },
			{ path: 'payment/loading', element: <PaymentLoadingPage /> },
			{ path: 'payment/result', element: <PaymentResultPage /> }
		],
	}
]
