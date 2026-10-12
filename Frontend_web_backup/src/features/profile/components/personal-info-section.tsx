import { AtSign, Mail, UserRound } from 'lucide-react'
import { SectionTitle } from './section-title'
import { surfaceCardClass } from './profile-styles'
import { useProfile } from '../context/profile.context'
import type { InfoRow } from '../types/profile.types'

export function PersonalInfoSection() {
  const { data } = useProfile()
  const user = data?.user

  const personalInfo: InfoRow[] = [
    { label: 'Tên người dùng', value: user?.displayName ?? '—', icon: AtSign },
    { label: 'Địa chỉ Email', value: user?.email ?? '—', icon: Mail }
  ]

  return (
    <section>
      <div className={`overflow-hidden rounded-lg ${surfaceCardClass}`}>
        <div className="border-b border-outline/5 px-5 py-4">
          <SectionTitle icon={UserRound}>Thông tin cá nhân</SectionTitle>
        </div>
        <div className="p-5 sm:p-6">
          {/* Grid thông tin chính */}
          <div className="grid gap-6 md:grid-cols-2">
            {personalInfo.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary/70" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant/60">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-on-surface">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
