import React, { useRef } from 'react'
import { motion, useDragControls } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Loader2,
  Music,
} from 'lucide-react'

import type { FloatingAudioPlayerProps } from '../types/reader.types'

export default function FloatingAudioPlayer({
  novel = 'Truyện chữ',
  chapter = 'Chương',
  cover,
  isPlaying,
  onPlayPause,
  duration,
  currentTime,
  onSeek,
  onPrevChapter,
  onNextChapter,
  hasPrevChapter,
  hasNextChapter,
  volume,
  setVolume,
  isMuted,
  onMuteToggle,
  isGenerating,
  onGenerateAudio,
  audioUrl,
  onClose
}: FloatingAudioPlayerProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '0:00'
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  };

  const remainingTime = duration - currentTime
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const displayChapter = chapter
  const displayNovel = novel

  const handleSeekPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current || !duration || !audioUrl) return
    // Prevent this from bubbling to framer-motion's drag listener
    e.stopPropagation()
    const rect = trackRef.current.getBoundingClientRect()

    const updateProgress = (clientX: number) => {
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
      const percentage = x / rect.width
      onSeek(percentage * duration)
    }

    updateProgress(e.clientX)
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updateProgress(moveEvent.clientX)
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0.1}
      dragTransition={{ power: 0.1, timeConstant: 200 }}
      initial={{ opacity: 0, scale: 0.95, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 100 }}
      className="fixed bottom-6 left-4 sm:left-10 z-[110] bg-surface backdrop-blur-md rounded-[28px] p-4 pr-5 flex gap-4 w-[92%] max-w-[410px] shadow-[0_24px_50px_rgba(0,0,0,0.5)] border border-white/10 select-none text-white"
    >
      <button
        onClick={onClose}
        className="absolute top-3.5 right-3.5 text-[#b3b3b3] hover:text-white transition-colors cursor-pointer z-10"
        title="Đóng trình phát"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Drag handle: cover image area */}
      <div
        className="bg-[#1e1e1e] w-[100px] h-[135px] rounded-md flex items-center justify-center shrink-0 shadow-lg overflow-hidden cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => dragControls.start(e)}
      >
        {cover ? (
          <img src={cover} alt={displayNovel} className="w-full h-full object-cover pointer-events-none" />
        ) : (
          <Music className="w-8 h-8 text-[#1db954] opacity-80 pointer-events-none" />
        )}
      </div>

      {/* Bỏ h-[100px] cố định -> dùng min-h để chữ dài không bị ép/clip */}
      <div className="flex flex-col flex-1 w-full justify-center min-h-[100px] min-w-0 gap-1.5">

        {/* Thêm pr-7 đủ chỗ né nút X, leading-[1.3] để không mất nét chữ dưới */}
        {/* Title row also acts as a drag handle */}
        <div
          className="flex flex-col min-w-0 pr-7 cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <h4 className="text-on-surface font-bold text-xs tracking-wide truncate leading-[1.3] pointer-events-none" title={displayNovel}>
            {displayNovel} - {displayChapter}
          </h4>
        </div>

        {audioUrl ? (
          <>
            <div className="mt-2">
              <div
                className="w-full h-3 flex items-center cursor-pointer group touch-none"
                onPointerDown={handleSeekPointerDown}
                ref={trackRef}
              >
                <div className="w-full h-[4px] bg-on-surface/20 rounded-full relative">
                  <div
                    className="absolute left-0 top-0 h-full bg-primary rounded-full transition-colors"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div
                    className="absolute w-2.5 h-2.5 rounded-full bg-primary border border-primary transition-opacity -translate-y-[3px] -translate-x-[5px]"
                    style={{ left: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-[#a7a7a7] font-semibold mt-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>-{formatTime(remainingTime)}</span>
              </div>
            </div>

            <div className="flex items-center text-[#b3b3b3] w-full mt-2">
              <div className="flex items-center gap-6 justify-start flex-1">
                <button
                  onClick={onPrevChapter}
                  disabled={!hasPrevChapter}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer hover:bg-on-surface/10 active:scale-90 ${!hasPrevChapter && 'opacity-40 cursor-not-allowed'}`}
                  title="Chương trước"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>

                <button
                  onClick={onPlayPause}
                  className="w-9 h-9 bg-primary text-on-primary rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
                  title={isPlaying ? 'Tạm dừng' : 'Phát'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-on-primary" /> : <Play className="w-4 h-4 fill-on-primary ml-0.5" />}
                </button>

                <button
                  onClick={onNextChapter}
                  disabled={!hasNextChapter}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer hover:bg-on-surface/10 active:scale-90 ${!hasNextChapter && 'opacity-40 cursor-not-allowed'}`}
                  title="Chương sau"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>

                {/* Volume Slider Block */}
                <div className="flex items-center shrink-0 group">
                  <button
                    onClick={onMuteToggle}
                    className="hover:text-primary transition-colors cursor-pointer shrink-0 py-2 pr-1.5"
                    title={isMuted ? 'Bật âm' : 'Tắt âm'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-primary" /> : <Volume2 className="w-4 h-4 text-on-surface/80" />}
                  </button>

                  <div className="flex items-center h-6 w-0 opacity-0 overflow-hidden group-hover:w-16 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value))
                        if (isMuted && Number(e.target.value) > 0) onMuteToggle()
                      }}
                      className="w-10 accent-primary bg-surface-container cursor-pointer shrink-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-10">
            <button
              onClick={onGenerateAudio}
              disabled={isGenerating}
              className="px-4 py-2 w-full rounded-full bg-[#1db954] text-black text-xs font-bold flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {isGenerating ? 'Đang sinh giọng đọc...' : 'Sinh giọng đọc AI'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}