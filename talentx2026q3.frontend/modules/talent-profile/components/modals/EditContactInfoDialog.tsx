"use client"

import { useState } from "react"
import { Loader2Icon } from "lucide-react"

import { SkillsField } from "@/components/common/form/SkillsField"
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

export interface EditContactInfoDialogProps {
  isOpen: boolean
  onClose: () => void
  profile: TalentProfileDto
}

export function EditContactInfoDialog({
  isOpen,
  onClose,
  profile,
}: EditContactInfoDialogProps) {
  const [phone, setPhone] = useState(profile.phone ?? "")
  const [location, setLocation] = useState(profile.location ?? "")
  const [linkedInUrl, setLinkedInUrl] = useState(profile.linkedInUrl ?? "")
  const [additionalUrls, setAdditionalUrls] = useState<string[]>([
    ...(profile.additionalUrls ?? []),
  ])

  const updateTalentProfileMutation = useUpdateTalentProfile()

  function handleOpenChange(openState: boolean) {
    if (!openState && !updateTalentProfileMutation.isPending) {
      onClose()
    }
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    try {
      await updateTalentProfileMutation.mutateAsync({
        name: profile.name,
        phone: phone.trim() || null,
        location: location.trim() || null,
        linkedInUrl: linkedInUrl.trim() || null,
        additionalUrls,
      })
      onClose()
    } catch {
      // Error is surfaced via useUpdateTalentProfile onError notification
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col max-h-[85vh] p-0 overflow-hidden sm:max-w-lg w-full min-w-0 rounded-md">
        <DialogHeader className="px-6 pt-6 pb-3 shrink-0">
          <DialogTitle>Edit Contact Information</DialogTitle>
          <DialogDescription>
            Recruiters use these details to reach you about applications.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-2 flex flex-col gap-4 min-h-0">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-email-input" className="text-sm font-medium text-slate-700">
                Email Address *
              </Label>
              <Input
                id="contact-email-input"
                value={profile.email}
                disabled
                readOnly
                className="bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500">Your account email cannot be changed here.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-phone-input" className="text-sm font-medium text-slate-700">
                Phone Number
              </Label>
              <Input
                id="contact-phone-input"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="e.g. +1 555-0199"
                disabled={updateTalentProfileMutation.isPending}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-location-input" className="text-sm font-medium text-slate-700">
                Present Address
              </Label>
              <Input
                id="contact-location-input"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. San Francisco, CA"
                disabled={updateTalentProfileMutation.isPending}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-linkedin-input" className="text-sm font-medium text-slate-700">
                LinkedIn Profile
              </Label>
              <Input
                id="contact-linkedin-input"
                type="url"
                value={linkedInUrl}
                onChange={(event) => setLinkedInUrl(event.target.value)}
                placeholder="e.g. https://linkedin.com/in/username"
                disabled={updateTalentProfileMutation.isPending}
              />
            </div>

            <SkillsField
              label="Additional URLs"
              hint="Portfolio, GitHub, personal site — press Enter or , after each one."
              placeholder="https://..."
              inputId="contact-additional-urls-input"
              value={additionalUrls}
              onChange={setAdditionalUrls}
            />
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
              disabled={updateTalentProfileMutation.isPending}
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
