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

export interface EditCareerPreferencesDialogProps {
  isOpen: boolean
  onClose: () => void
  profile: TalentProfileDto
}

export function EditCareerPreferencesDialog({
  isOpen,
  onClose,
  profile,
}: EditCareerPreferencesDialogProps) {
  const [totalYearsExperience, setTotalYearsExperience] = useState(
    profile.totalYearsExperience !== null && profile.totalYearsExperience !== undefined
      ? String(profile.totalYearsExperience)
      : ""
  )
  const [expectedSalary, setExpectedSalary] = useState(
    profile.expectedSalary !== null && profile.expectedSalary !== undefined
      ? String(profile.expectedSalary)
      : ""
  )

  const updateTalentProfileMutation = useUpdateTalentProfile()

  function handleOpenChange(openState: boolean) {
    if (!openState && !updateTalentProfileMutation.isPending) {
      onClose()
    }
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    const rawYears = totalYearsExperience === "" ? null : Number(totalYearsExperience)
    const rawSalary = expectedSalary === "" ? null : Number(expectedSalary)

    const parsedYears =
      rawYears !== null && !Number.isNaN(rawYears) && rawYears >= 0
        ? Math.max(0, rawYears)
        : null
    const parsedSalary =
      rawSalary !== null && !Number.isNaN(rawSalary) && rawSalary >= 0
        ? Math.max(0, rawSalary)
        : null

    try {
      await updateTalentProfileMutation.mutateAsync({
        name: profile.name,
        totalYearsExperience: parsedYears,
        expectedSalary: parsedSalary,
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
          <DialogTitle>Edit Career Preferences</DialogTitle>
          <DialogDescription>
            Salary expectations and experience level shown on your profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-2 flex flex-col gap-4 min-h-0">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="total-years-input" className="text-sm font-medium text-slate-700">
                Total Years of Experience
              </Label>
              <Input
                id="total-years-input"
                type="number"
                min={0}
                max={60}
                step={1}
                value={totalYearsExperience}
                onChange={(event) => {
                  const value = event.target.value
                  if (value === "" || (!value.includes("-") && Number(value) >= 0)) {
                    setTotalYearsExperience(value)
                  }
                }}
                onWheel={(event) => event.currentTarget.blur()}
                onKeyDown={(event) => {
                  if (event.key === "-" || event.key === "e" || event.key === "E") {
                    event.preventDefault()
                  }
                }}
                placeholder="e.g. 5"
                disabled={updateTalentProfileMutation.isPending}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expected-salary-input" className="text-sm font-medium text-slate-700">
                Expected Salary (USD)
              </Label>
              <Input
                id="expected-salary-input"
                type="number"
                min={0}
                step={1000}
                value={expectedSalary}
                onChange={(event) => {
                  const value = event.target.value
                  if (value === "" || (!value.includes("-") && Number(value) >= 0)) {
                    setExpectedSalary(value)
                  }
                }}
                onWheel={(event) => event.currentTarget.blur()}
                onKeyDown={(event) => {
                  if (event.key === "-" || event.key === "e" || event.key === "E") {
                    event.preventDefault()
                  }
                }}
                placeholder="e.g. 120000"
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
