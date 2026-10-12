import { Volume, Volume2 } from 'lucide-react'
import type { ThemeType, FontType, LineHeightType, ReaderConfigMenuProps } from '../types/reader.types'

export default function ReaderConfigMenu({
  theme, setTheme,
  fontSize, setFontSize,
  fontFamily, setFontFamily,
  lineHeight, setLineHeight,
  fullFrame, setFullFrame,
  volume, setVolume
}: ReaderConfigMenuProps) {
  const glassControlClass =
    'bg-white/[0.14] dark:bg-white/[0.10] backdrop-blur-sm border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_14px_rgba(0,0,0,0.10)] [contain:paint]'

  return (
    <div className="space-y-2">
      {/* 1. Theme Canvas Select */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Màu nền trình đọc</label>
        <div className={`flex justify-between items-center rounded-full px-5 py-3 select-none gap-2 ${glassControlClass}`}>
          {(['nocturne', 'charcoal', 'sepia', 'ivory', 'day'] as ThemeType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              title={t.toUpperCase()}
              className={`h-7 w-7 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${theme === t ? 'border-primary scale-110 shadow' : 'border-outline/10 hover:scale-105 active:scale-95'}`}
              style={{
                backgroundColor:
                  t === 'nocturne' ? '#151419' :
                    t === 'charcoal' ? '#1e1e24' :
                      t === 'sepia' ? '#f4ebd4' :
                        t === 'ivory' ? '#FAF5E6' : '#ffffff'
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. Font Size */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-70">
          <span>Cỡ chữ (Font Size)</span>
          <span className="text-primary text-xs font-extrabold">{fontSize}px</span>
        </div>
        <div className={`flex items-center gap-3 rounded-full px-5 py-3 ${glassControlClass}`}>
          <span className="text-[10px] font-bold opacity-60">A</span>
          <input
            type="range" min="14" max="32" value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="flex-1 accent-primary h-1 bg-surface-container-high rounded-full appearance-none cursor-pointer"
          />
          <span className="text-lg font-bold opacity-80">A</span>
        </div>
      </div>

      {/* 3. Font Family */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Kiểu chữ (Font Family)</label>
        <div className={`grid grid-cols-3 gap-1 rounded-xl p-1 ${glassControlClass}`}>
          {[{ id: 'serif', label: 'Serif' }, { id: 'sans', label: 'Sans' }, { id: 'mono', label: 'Mono' }].map((f) => (
            <button
              key={f.id}
              onClick={() => setFontFamily(f.id as FontType)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${fontFamily === f.id ? 'bg-primary text-on-primary shadow' : 'text-foreground hover:bg-surface-container-high'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Line Height */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Giãn dòng (Line Height)</label>
        <div className={`grid grid-cols-3 gap-1 rounded-xl p-1 ${glassControlClass}`}>
          {[{ id: 'tight', label: 'Hẹp' }, { id: 'normal', label: 'Thường' }, { id: 'loose', label: 'Rộng' }].map((l) => (
            <button
              key={l.id}
              onClick={() => setLineHeight(l.id as LineHeightType)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${lineHeight === l.id ? 'bg-primary text-on-primary shadow' : 'text-foreground hover:bg-surface-container-high'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Full Frame toggle */}
      {setFullFrame && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Khung hiển thị</label>
          <button
            onClick={() => setFullFrame((prev: boolean) => !prev)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${fullFrame ? 'border-primary bg-primary shadow text-on-primary' : `border-transparent hover:bg-surface-container-high text-foreground ${glassControlClass}`}`}
          >
            {fullFrame ? 'Đang tràn khung (Bật)' : 'Cân đối (Tắt)'}
          </button>
        </div>
      )}

      {/* 6. Volume */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-70">
          <span>Âm lượng</span>
          <span className="text-primary text-xs font-extrabold">{volume}%</span>
        </div>
        <div className={`flex items-center gap-3 rounded-full px-5 py-3 ${glassControlClass}`}>
          <Volume className="h-4 w-4 text-on-surface-variant shrink-0" />
          <input
            type="range" min="0" max="100" value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 accent-primary h-1 bg-surface-container-high rounded-full appearance-none cursor-pointer"
          />
          <Volume2 className="h-5 w-5 text-on-surface-variant shrink-0 opacity-80" />
        </div>
      </div>

    </div>
  )
}