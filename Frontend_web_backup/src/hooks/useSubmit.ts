import { useCallback, useState } from 'react'
import type { FormEvent } from 'react'

export default function useSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const wrap = useCallback(
    (fn: (e: FormEvent) => void | Promise<void>) => {
      return async (e: FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return
        setIsSubmitting(true)
        try {
          await Promise.resolve(fn(e))
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [isSubmitting]
  )

  return { isSubmitting, setIsSubmitting, wrap }
}
