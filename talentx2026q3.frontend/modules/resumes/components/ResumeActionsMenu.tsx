"use client"

import { CheckIcon, EyeIcon, MoreVertical, PencilIcon, Trash2Icon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import type { SavedResume } from "../types/resume.types"

interface ResumeActionsMenuProps {
  resume: SavedResume
  disabled?: boolean
  includePreviewOnMobile?: boolean
  onPreview: () => void
  onRename: () => void
  onSetDefault: () => void
  onDelete: () => void
}

export function ResumeActionsMenu({
  resume,
  disabled = false,
  includePreviewOnMobile = false,
  onPreview,
  onRename,
  onSetDefault,
  onDelete,
}: ResumeActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        aria-label={`More actions for ${resume.displayName}`}
        aria-haspopup="menu"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {includePreviewOnMobile ? (
          <DropdownMenuItem className="sm:hidden" onClick={onPreview}>
            <EyeIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Preview
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={onRename}>
          <PencilIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem disabled={resume.isDefault} onClick={onSetDefault}>
          <CheckIcon
            className={cn("h-4 w-4", resume.isDefault ? "text-emerald-600" : "text-slate-400")}
            aria-hidden="true"
          />
          {resume.isDefault ? "Current default" : "Set as default"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
          onClick={onDelete}
        >
          <Trash2Icon className="h-4 w-4" aria-hidden="true" />
          Delete…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
