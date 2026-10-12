import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useProfile } from '../context/profile.context'
import { useAuthStore } from '@/store/auth.store'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'


export function ProfileHeader() {
  const { data } = useProfile()
  const authUser = useAuthStore(s => s.user)
  const user = data?.user
  const isAuthor = authUser?.isAuthor || authUser?.role === 'ADMIN'

  return (
    <section className="mb-8 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage alt={user?.username} />
          <AvatarFallback className="bg-primary text-on-primary font-bold text-md">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-on-surface lg:text-4xl">
              {user?.displayName ?? '—'}
            </h2>
          </div>
        </div>
      </div>

      {/* Author Dashboard Link — only shown if user is an author */}
      {isAuthor && (
        <Link
          to="/author/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all text-sm font-bold flex-shrink-0"
          title="Trang dành cho tác giả"
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Trang tác giả</span>
        </Link>
      )}
    </section>
  )
}
