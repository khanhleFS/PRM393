import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import DashboardLayout from '@/layouts/DashboardLayout'
import AuthorNovelsPage from '@/features/author-novel/novels-feature'
import AuthorNovelDetailPage from '@/features/author-novel/novel-detail-feature'
import AuthorChapterDetailPage from '@/features/author-novel/chapter-detail-feature'
import AuthorStatPage from '@/features/author-stat/stat-feature'
import AuthorProfilePage from '@/features/author-profile/profile-feature'

export const authorRoutes: RouteObject[] = [
	{
		path: 'author',
		element: <DashboardLayout />,
		children: [
			{ index: true, element: <Navigate to="novels" replace /> },
			{ path: 'novels', element: <AuthorNovelsPage /> },
			{ path: 'novels/new', element: <AuthorNovelDetailPage /> },
			{ path: 'novels/:novelId', element: <AuthorNovelDetailPage /> },
			{ path: 'novels/:novelId/chapters/new', element: <AuthorChapterDetailPage /> },
			{ path: 'novels/:novelId/chapters/:chapterNumber', element: <AuthorChapterDetailPage /> },
			{ path: 'stats', element: <AuthorStatPage /> },
			{ path: 'me', element: <AuthorProfilePage /> },
		],
	},
]

