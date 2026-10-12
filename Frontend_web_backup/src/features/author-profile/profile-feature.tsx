import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Calendar,
  BookOpen,
  Eye,
  FileText,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Save,
  Edit2
} from 'lucide-react'
import { useAuthorProfile, useUpdateAuthorProfile } from './hooks/use-author-profile'
import { useErrorHandler } from '@/lib/error-handler'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WalletCard } from './components/wallet-card'
import { TicketSection } from './components/ticket-section'

export default function AuthorProfilePage() {
  const { data: profile, isLoading, error } = useAuthorProfile()
  const updateProfileMutation = useUpdateAuthorProfile()
  const { addToast, handleError } = useErrorHandler()

  const [isEditingInfo, setIsEditingInfo] = useState(false)

  // Form states
  const [penName, setPenName] = useState('')
  const [bio, setBio] = useState('')

  // Sync form states with API data when profile loaded
  useEffect(() => {
    if (profile) {
      setPenName(profile.penName || '')
      setBio(profile.bio || '')
    }
  }, [profile])

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!penName.trim()) {
      addToast({
        title: 'Thông tin không hợp lệ',
        message: 'Bút danh không được để trống.',
        variant: 'warning'
      })
      return
    }

    try {
      await updateProfileMutation.mutateAsync({
        penName,
        bio,
        bankName: profile?.bankName,
        bankAccountNumber: profile?.bankAccountNumber,
        bankAccountHolder: profile?.bankAccountHolder
      })
      addToast({
        title: 'Cập nhật thành công',
        message: 'Hồ sơ cá nhân tác giả đã được lưu lại.',
        variant: 'success'
      })
      setIsEditingInfo(false)
    } catch (err) {
      handleError(err, { showToast: true, toastTitle: 'Cập nhật thất bại' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] p-6 text-center">
        <XCircle className="w-12 h-12 text-destructive mb-3" />
        <h3 className="text-base font-bold text-foreground">Không thể tải thông tin hồ sơ</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Đã có lỗi xảy ra khi lấy thông tin tài khoản tác giả của bạn.
        </p>
      </div>
    )
  }

  // Author Status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          icon: CheckCircle2,
          text: 'Đang hoạt động',
          bgClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
        }
      case 'PENDING':
        return {
          icon: Clock,
          text: 'Chờ duyệt',
          bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
        }
      case 'SUSPENDED':
      case 'BANNED':
        return {
          icon: AlertCircle,
          text: 'Bị tạm khóa',
          bgClass: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
        }
      default:
        return {
          icon: AlertCircle,
          text: status || 'Không rõ',
          bgClass: 'bg-gray-500/10 border-gray-500/30 text-gray-600 dark:text-gray-400',
        }
    }
  }

  const statusConfig = getStatusConfig(profile.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-sans text-foreground">
      {/* Upper Section with Profile Header & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* Left Column: Profile Card, Key Metrics, and Payout Bank setup */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Merged Author Profile Card */}
          <Card className="border border-outline-variant/60 bg-surface shadow-sm overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-primary/30 to-violet-500/20 relative" />
            <CardContent className="relative pt-0 px-6 pb-6">
              {/* Profile Avatar positioning overlay & Action button */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-10 mb-6 gap-4">
                <div className="flex items-end gap-4">
                  <div className="h-20 w-20 rounded-2xl border-4 border-surface bg-primary text-on-primary flex items-center justify-center text-3xl font-extrabold shadow-md shrink-0">
                    {profile.penName ? profile.penName.charAt(0).toUpperCase() : <User />}
                  </div>
                  <div className="pb-1">
                    <h2 className="text-xl font-bold tracking-tight text-on-surface">
                      {profile.penName || 'Bút danh chưa đặt'}
                    </h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">{profile.userEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.bgClass}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusConfig.text}
                  </span>
                  {!isEditingInfo ? (
                    <Button
                      onClick={() => setIsEditingInfo(true)}
                      variant="outline"
                      size="sm"
                      className="rounded-lg h-7 gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Button
                        onClick={() => {
                          setPenName(profile.penName || '')
                          setBio(profile.bio || '')
                          setIsEditingInfo(false)
                        }}
                        variant="ghost"
                        size="sm"
                        className="rounded-lg h-7"
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={handleUpdateInfo}
                        disabled={updateProfileMutation.isPending}
                        size="sm"
                        className="rounded-lg h-7 gap-1"
                      >
                        <Save className="w-3 h-3" />
                        {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio details / Edit Form */}
              <div className="mt-4 pt-4 border-t border-outline-variant/40">
                {isEditingInfo ? (
                  <form onSubmit={handleUpdateInfo} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/80">Bút danh tác giả</label>
                      <Input
                        value={penName}
                        onChange={(e) => setPenName(e.target.value)}
                        placeholder="Bút danh xuất bản truyện"
                        className="h-9 focus:ring-primary/20 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/80">Tiểu sử giới thiệu</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Viết một vài câu giới thiệu bản thân đến các độc giả..."
                        rows={4}
                        className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      />
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mô tả giới thiệu</p>
                      <p className="text-sm text-foreground/80 leading-relaxed italic">
                        {profile.bio || 'Chưa có lời giới thiệu nào. Hãy cập nhật hồ sơ để người đọc hiểu thêm về bạn.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Tham gia từ: {new Date(profile.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics / Statistics Card */}
          <Card className="border border-outline-variant/60 bg-surface shadow-sm">
            <CardHeader className="border-b border-outline-variant/40 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Số liệu tác phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Total Novels Card */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Số lượng truyện</p>
                    <p className="text-base font-bold text-foreground mt-0.5">{profile.totalNovels} tác phẩm</p>
                  </div>
                </div>

                {/* Total Chapters Card */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Tổng số chương</p>
                    <p className="text-base font-bold text-foreground mt-0.5">{profile.totalChapters} chương</p>
                  </div>
                </div>

                {/* Total Views Card */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Tổng lượt đọc</p>
                    <p className="text-base font-bold text-foreground mt-0.5">{profile.totalViews.toLocaleString('vi-VN')} lượt</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </motion.div>

        {/* Right Column: Wallet Card & Settlement Payout Tickets */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Wallet Balance Card */}
          <WalletCard />

          {/* Settlement Payout Tickets Section */}
          <TicketSection />
        </motion.div>
      </div>
    </div>
  )
}
