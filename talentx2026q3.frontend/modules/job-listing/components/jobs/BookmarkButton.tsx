'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Bookmark } from 'lucide-react'

interface BookmarkButtonProps {
  saved: boolean
  onToggle: () => void
  label: string
  size?: 'md' | 'sm'
  disabled?: boolean
}

export function BookmarkButton({ saved, onToggle, label, size = 'md', disabled = false }: BookmarkButtonProps) {
  const reduceMotion = useReducedMotion()

  const dims = size === 'md' ? 'size-9' : 'size-8'

  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.88 }}
      transition={{ duration: 0.12 }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from saved jobs` : `Save ${label}`}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onToggle()
      }}
      className={`relative z-10 flex ${dims} shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60 ${
        saved
          ? 'border-emerald-600 bg-emerald-600 text-white shadow-[0_4px_12px_-4px_rgba(5,150,105,0.5)]'
          : 'border-slate-200 bg-white text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:border-emerald-200 hover:text-emerald-600'
      }`}
    >
      <motion.span
        key={saved ? 'saved' : 'unsaved'}
        initial={reduceMotion ? false : { scale: 0.55 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 520, damping: 16 }}
        className="flex"
      >
        <Bookmark className="size-4" fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
      </motion.span>
    </motion.button>
  )
}
