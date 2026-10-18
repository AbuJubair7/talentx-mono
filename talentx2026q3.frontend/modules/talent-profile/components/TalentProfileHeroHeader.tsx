"use client"

import { useRef } from "react"
import {
  CameraIcon,
  Loader2Icon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  ALLOWED_PHOTO_CONTENT_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  PROFILE_PRINT_STYLES,
} from "../constants/profile-header.constants"
import { usePresignedUpload } from "../hooks/usePresignedUpload"
import { TalentProfileHeroBanner } from "./TalentProfileHeroBanner"
import type { TalentProfileHeroHeaderProps } from "../types"
import { initialsFor } from "../utils/initials"

export function TalentProfileHeroHeader({
  profile,
  onEditBasicInfo,
}: TalentProfileHeroHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { status, upload } = usePresignedUpload()

  const isUploading =
    status === "requesting-url" || status === "uploading" || status === "confirming"

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    event.target.value = ""
    if (!selectedFile) return

    if (!ALLOWED_PHOTO_CONTENT_TYPES.includes(selectedFile.type)) {
      toast.error("Please choose a JPEG, PNG, or WEBP image.")
      return
    }

    if (selectedFile.size > MAX_PHOTO_SIZE_BYTES) {
      toast.error("Image must be 5 MB or smaller.")
      return
    }

    try {
      await upload(selectedFile)
      toast.success("Profile photo updated successfully.")
    } catch (uploadError: unknown) {
      const errorMessage =
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload profile photo. Please try again."
      toast.error(errorMessage)
    }
  }

  return (
    <article
      id="profile-print-target"
      className="relative overflow-hidden rounded-md border border-slate-200/80 bg-white/75 backdrop-blur-md p-6 shadow-xs"
    >
      <TalentProfileHeroBanner />

      <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="profile-avatar relative w-fit rounded-full border-2 border-emerald-700 p-1 bg-white">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-100">
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-slate-700">
                  {initialsFor(profile.name)}
                </span>
              )}
              {isUploading ? (
                <div
                  role="status"
                  aria-label="Uploading profile photo"
                  className="absolute inset-0 flex items-center justify-center bg-black/40"
                >
                  <Loader2Icon aria-hidden="true" className="h-5 w-5 animate-spin text-white" />
                </div>
              ) : null}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              aria-label="Upload profile photo"
              onChange={handleFileSelected}
            />

            <button
              type="button"
              aria-label="Change profile photo"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="profile-no-print absolute -bottom-1 -right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              <CameraIcon className="h-3.5 w-3.5 text-white" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="mt-3 truncate text-lg font-bold leading-6 text-slate-900">
              {profile.name}
            </h2>
            {profile.tagline ? (
              <p className="mt-1 text-sm font-medium leading-5 text-emerald-700">
                {profile.tagline}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 font-medium">
                <MailIcon className="h-3.5 w-3.5 text-slate-500" />
                <span>{profile.email}</span>
              </span>

              {profile.phone ? (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 font-medium">
                  <PhoneIcon className="h-3.5 w-3.5 text-slate-500" />
                  <span>{profile.phone}</span>
                </span>
              ) : null}

              {profile.location ? (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 font-medium">
                  <MapPinIcon className="h-3.5 w-3.5 text-slate-500" />
                  <span>{profile.location}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {onEditBasicInfo ? (
          <div className="mt-2 md:mt-3 flex-shrink-0">
            <button
              type="button"
              aria-label="Edit basic information"
              onClick={onEditBasicInfo}
              className="profile-no-print inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <PencilIcon className="h-3.5 w-3.5" />
              Edit profile
            </button>
          </div>
        ) : null}
      </div>

      <style dangerouslySetInnerHTML={{ __html: PROFILE_PRINT_STYLES }} />
    </article>
  )
}
