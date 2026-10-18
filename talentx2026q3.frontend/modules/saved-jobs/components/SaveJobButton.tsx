'use client'

import { Bookmark } from 'lucide-react'

interface SaveJobButtonProps {
  jobId: string
  isSaved: boolean
  onToggle: (jobId: string, saved: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  /** Job Listing shows the bookmark icon only; Job Details shows icon + "Save"/"Saved" text. */
  showLabel?: boolean
}

const SIZE_CLASSES: Record<NonNullable<SaveJobButtonProps['size']>, { button: string; iconOnlyButton: string; icon: string; text: string }> = {
  sm: { button: 'h-7.5 px-2.5 gap-1', iconOnlyButton: 'h-7.5 w-7.5', icon: 'size-3.5', text: 'text-xs' },
  md: { button: 'h-9 px-3.5 gap-1.5', iconOnlyButton: 'h-9 w-9', icon: 'size-4', text: 'text-sm' },
}

export function SaveJobButton({
  jobId,
  isSaved,
  onToggle,
  disabled = false,
  size = 'sm',
  showLabel = true,
}: SaveJobButtonProps) {
  const { button: buttonSize, iconOnlyButton, icon: iconSize, text: textSize } = SIZE_CLASSES[size]
  const label = isSaved ? 'Saved' : 'Save'

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onToggle(jobId, !isSaved)
      }}
      className={`relative z-10 ${showLabel ? buttonSize : iconOnlyButton} inline-flex items-center justify-center rounded-md border font-semibold whitespace-nowrap transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${textSize} ${
        isSaved
          ? 'bg-white border-amber-200 text-slate-900'
          : 'bg-slate-100 border-slate-200/80 text-slate-500 hover:text-slate-700 hover:bg-slate-200'
      }`}
    >
      <Bookmark className={`${iconSize} ${isSaved ? 'fill-current text-emerald-600' : ''}`} />
      {showLabel && label}
    </button>
  )
}
