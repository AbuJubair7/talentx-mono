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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUpdateTalentProfile } from "../../hooks/useUpdateTalentProfile"
import type { TalentProfileDto } from "../../types"

export interface EditBasicInfoDialogProps {
  isOpen: boolean
  onClose: () => void
  profile: TalentProfileDto
}

export function EditBasicInfoDialog({
  isOpen,
  onClose,
  profile,
}: EditBasicInfoDialogProps) {
  const [name, setName] = useState(profile.name ?? "")
  const [tagline, setTagline] = useState(profile.tagline ?? "")
  const [validationError, setValidationError] = useState<string | null>(null)

  const updateTalentProfileMutation = useUpdateTalentProfile()

  function handleOpenChange(openState: boolean) {
    if (!openState && !updateTalentProfileMutation.isPending) {
      onClose()
    }
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setValidationError("Full name is required.")
      return
    }

    setValidationError(null)
    try {
      await updateTalentProfileMutation.mutateAsync({
        name: name.trim(),
        tagline: tagline.trim() || null,
      })
      onClose()
    } catch {
      // Handled by useUpdateTalentProfile onError notification
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col max-h-[85vh] p-0 overflow-hidden sm:max-w-lg w-full min-w-0 rounded-md">
        <DialogHeader className="px-6 pt-6 pb-3 shrink-0">
          <DialogTitle>Edit Basic Information</DialogTitle>
          <DialogDescription>
            Update your full name and professional headline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-2 flex flex-col gap-4 min-h-0">
            {validationError ? (
              <div role="alert" className="rounded-md bg-rose-50 p-2.5 text-xs text-rose-700">
                {validationError}
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="basic-info-name-input" className="text-sm font-medium text-slate-700">
                Full Name *
              </Label>
              <Input
                id="basic-info-name-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Jane Doe"
                disabled={updateTalentProfileMutation.isPending}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="basic-info-tagline-input"
                className="text-sm font-medium text-slate-700"
              >
                Tagline / Headline
              </Label>
              <Input
                id="basic-info-tagline-input"
                value={tagline}
                onChange={(event) => setTagline(event.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer | AI Specialist"
                disabled={updateTalentProfileMutation.isPending}
              />
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
              type="submit"
              disabled={updateTalentProfileMutation.isPending || !name.trim()}
              className="bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-700"
            >
              {updateTalentProfileMutation.isPending ? (
                <Loader2Icon aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
