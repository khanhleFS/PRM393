import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  placeholder?: string
  className?: string
  inputClassName?: string
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Tìm kiếm...",
  className = "",
  inputClassName = ""
}: SearchInputProps) {
  const [error, setError] = useState<string | null>(null)

  // Regex phát hiện ký tự đặc biệt nguy hiểm: < > ; [ ] { } \ / | * % $ @ # ^ &
  const FORBIDDEN_REGEX = /[<>;{}[\]\\/|*%#^&]/

  useEffect(() => {
    if (!value) {
      setError(null)
      return
    }

    if (value.length > 50) {
      setError("Tối đa 50 ký tự")
    } else if (FORBIDDEN_REGEX.test(value)) {
      setError("Không nhập ký tự đặc biệt")
    } else {
      setError(null)
    }
  }, [value])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Chỉ cho phép submit khi không có lỗi validation
    if (!error) {
      onSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative group w-full ${className}`}>
      {/* Search Icon - Tự chuyển màu cảnh báo hổ phách khi có lỗi */}
      <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors ${
        error 
          ? 'text-tertiary' 
          : 'text-muted-foreground group-focus-within:text-primary'
      }`}>
        <Search className="size-4" />
      </div>
      
      {/* Input Field - Đổi màu viền sang hổ phách khi có lỗi */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-muted border rounded-2xl py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all outline-none ${
          error 
            ? 'border-tertiary focus:ring-2 focus:ring-tertiary/20' 
            : 'border-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary'
        } ${inputClassName}`}
      />

      {/* Elegant Tooltip Cảnh Báo (Tự động trượt nhẹ lên bên dưới ô tìm kiếm) */}
      {error && (
        <div className="absolute top-[105%] left-4 bg-tertiary text-on-tertiary text-[9px] font-bold px-2 py-0.5 rounded shadow-md z-30 select-none animate-fade-slide-up whitespace-nowrap">
          {error}
        </div>
      )}
    </form>
  )
}
