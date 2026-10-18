"use client"

import { useState } from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateTalentProfile } from "../../hooks/useUpdateTalentProfile"
import type { TalentProfileDto } from "../../types"

export interface EditCareerSummaryDialogProps {
  isOpen: boolean
  onClose: () => void
  profile: TalentProfileDto
}

const MAX_CAREER_SUMMARY_LENGTH = 1000

export function EditCareerSummaryDialog({
  isOpen,
  onClose,
  profile,
}: EditCareerSummaryDialogProps) {
  const [bio, setBio] = useState(profile.shortBio ?? "")
  const updateTalentProfileMutation = useUpdateTalentProfile()

  function handleOpenChange(openState: boolean) {
    if (!openState && !updateTalentProfileMutation.isPending) {
      onClose()
    }
  }

  async function handleSave() {
    try {
      await updateTalentProfileMutation.mutateAsync({
        name: profile.name,
        shortBio: bio.trim(),
      })
      onClose()
    } catch {
      // Error handling is managed by useUpdateTalentProfile onError notification
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col max-h-[85vh] p-0 overflow-hidden sm:max-w-lg w-full min-w-0 rounded-md">
        <DialogHeader className="px-6 pt-6 pb-3 shrink-0">
          <DialogTitle>Edit Career Summary</DialogTitle>
          <DialogDescription>
            A short professional summary shown at the top of your talent profile.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-2 flex flex-col gap-2 min-h-0">
          <Label htmlFor="career-summary-input" className="text-sm font-medium text-slate-700">
            Career Summary *
          </Label>
          <Textarea
            id="career-summary-input"
            rows={6}
            maxLength={MAX_CAREER_SUMMARY_LENGTH}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Write a brief overview of your experience, key strengths, and career highlights..."
            disabled={updateTalentProfileMutation.isPending}
            className="resize-y"
          />
          <div className="flex justify-end text-xs text-slate-500">
            <span>
              {bio.length} / {MAX_CAREER_SUMMARY_LENGTH} characters
            </span>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 flex items-center justify-end gap-3 z-10 w-full min-w-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={updateTalentProfileMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateTalentProfileMutation.isPending}
            className="bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-700"
          >
            {updateTalentProfileMutation.isPending ? (
              <Loader2Icon aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
