"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileTextIcon, FolderOpenIcon, UserIcon, VideoIcon } from "lucide-react"

import { PortalPageContainer } from "@/components/layout"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ResumeLibrarySection } from "@/modules/resumes"

import { useTalentProfile } from "../hooks/useTalentProfile"
import type { TalentProfileTab, TalentProfileViewProps } from "../types"
import { EditBasicInfoDialog } from "./modals/EditBasicInfoDialog"
import { OverviewTabContent } from "./OverviewTabContent"
import { ProjectsTabContent } from "./tabs/ProjectsTabContent"
import { TalentProfileHeroHeader } from "./TalentProfileHeroHeader"
import { VideoIntroUpload } from "./VideoIntroUpload"

export function TalentProfileView({ initialTab = "media-resume" }: TalentProfileViewProps = {}) {
  const { data: profile, isPending, isError, error, refetch } = useTalentProfile()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TalentProfileTab>(initialTab)
  const [basicInfoModalOpen, setBasicInfoModalOpen] = useState(false)

  function handleTabChange(tab: TalentProfileTab) {
    setActiveTab(tab)
    router.replace(`/profile?tab=${tab}`, { scroll: false })
  }

  if (isPending) {
    return (
      <PortalPageContainer>
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading your profile"
          className="flex flex-col gap-4"
        >
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      </PortalPageContainer>
    )
  }

  if (isError) {
    const errorStatus = (error as { status?: number | null })?.status
    const errorMessage = (error as { message?: string })?.message

    if (errorStatus === 404) {
      return (
        <div role="alert" className="flex min-h-full w-full items-center justify-center bg-slate-50">
          <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 px-6 py-20 text-center">
            <h1 className="text-xl font-bold text-slate-900">No profile yet</h1>
            <p className="text-sm text-slate-500">
              A Talent profile hasn&apos;t been created for this account yet.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div role="alert" className="flex min-h-full w-full items-center justify-center bg-slate-50">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 px-6 py-20 text-center">
          <h1 className="text-xl font-bold text-slate-900">Couldn&apos;t load your profile</h1>
          <p className="text-sm text-slate-500">{errorMessage ?? "Something went wrong."}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <PortalPageContainer>
      <div className="flex w-full flex-col gap-8">
        <TalentProfileHeroHeader
          profile={profile}
          onEditBasicInfo={() => setBasicInfoModalOpen(true)}
        />

        <div className="flex flex-col gap-6">
          <div
            role="tablist"
            aria-label="Profile Sections"
            className="flex items-center gap-8 border-b border-slate-200"
          >
            <button
              type="button"
              role="tab"
              id="tab-media-resume"
              aria-selected={activeTab === "media-resume"}
              aria-controls="panel-media-resume"
              onClick={() => handleTabChange("media-resume")}
              className={cn(
                "inline-flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700",
                activeTab === "media-resume"
                  ? "border-emerald-700 text-emerald-700 font-semibold -mb-px"
                  : "border-transparent text-slate-500 hover:text-slate-900 -mb-px"
              )}
            >
              <FileTextIcon
                className={cn(
                  "h-4 w-4",
                  activeTab === "media-resume" ? "text-emerald-700" : "text-slate-400"
                )}
              />
              Resume & Media
            </button>
            <button
              type="button"
              role="tab"
              id="tab-projects"
              aria-selected={activeTab === "projects"}
              aria-controls="panel-projects"
              onClick={() => handleTabChange("projects")}
              className={cn(
                "inline-flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700",
                activeTab === "projects"
                  ? "border-emerald-700 text-emerald-700 font-semibold -mb-px"
                  : "border-transparent text-slate-500 hover:text-slate-900 -mb-px"
              )}
            >
              <FolderOpenIcon
                className={cn(
                  "h-4 w-4",
                  activeTab === "projects" ? "text-emerald-700" : "text-slate-400"
                )}
              />
              Projects
            </button>
            <button
              type="button"
              role="tab"
              id="tab-overview"
              aria-selected={activeTab === "overview"}
              aria-controls="panel-overview"
              onClick={() => handleTabChange("overview")}
              className={cn(
                "inline-flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700",
                activeTab === "overview"
                  ? "border-emerald-700 text-emerald-700 font-semibold -mb-px"
                  : "border-transparent text-slate-500 hover:text-slate-900 -mb-px"
              )}
            >
              <UserIcon
                className={cn(
                  "h-4 w-4",
                  activeTab === "overview" ? "text-emerald-700" : "text-slate-400"
                )}
              />
              Overview
            </button>
          </div>

          {activeTab === "media-resume" ? (
            <div
              role="tabpanel"
              id="panel-media-resume"
              aria-labelledby="tab-media-resume"
              className="flex flex-col gap-6"
            >
              <ResumeLibrarySection />

              <section className="flex flex-col gap-3 rounded-md border border-slate-100 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="flex shrink-0 items-center justify-center text-emerald-700">
                    <VideoIcon aria-hidden="true" className="h-5 w-5 text-emerald-700" />
                  </span>
                  <h2 className="text-base font-bold text-slate-900">Video introduction</h2>
                </div>
                <VideoIntroUpload currentVideoUrl={profile.videoIntroUrl} />
              </section>
            </div>
          ) : null}

          {activeTab === "overview" ? (
            <div
              role="tabpanel"
              id="panel-overview"
              aria-labelledby="tab-overview"
              className="flex flex-col gap-6"
            >
              <OverviewTabContent profile={profile} />
            </div>
          ) : null}

          {activeTab === "projects" ? (
            <div
              role="tabpanel"
              id="panel-projects"
              aria-labelledby="tab-projects"
              className="flex flex-col gap-6"
            >
              <ProjectsTabContent projects={profile.projects ?? []} />
            </div>
          ) : null}
        </div>

        {basicInfoModalOpen ? (
          <EditBasicInfoDialog
            isOpen={basicInfoModalOpen}
            onClose={() => setBasicInfoModalOpen(false)}
            profile={profile}
          />
        ) : null}
      </div>
    </PortalPageContainer>
  )
}
