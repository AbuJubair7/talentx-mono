"use client"

import { useState } from "react"
import {
  BriefcaseIcon,
  FileTextIcon,
  GraduationCapIcon,
  MailIcon,
  PencilIcon,
  TagIcon,
  WalletIcon,
} from "lucide-react"

import type { ActiveOverviewModal, OverviewTabContentProps } from "../types"
import { formatDateSpan } from "../utils/format-date-span"
import {
  EditBasicInfoDialog,
  EditCareerPreferencesDialog,
  EditCareerSummaryDialog,
  EditContactInfoDialog,
  EditEducationDialog,
  EditSkillsDialog,
  EditWorkExperienceDialog,
} from "./modals"
import { SectionEmptyState } from "./SectionEmptyState"

export function OverviewTabContent({ profile }: OverviewTabContentProps) {
  const [activeModal, setActiveModal] = useState<ActiveOverviewModal>(null)

  const hasCareerPreferences =
    profile.totalYearsExperience !== null && profile.totalYearsExperience !== undefined ||
    profile.expectedSalary !== null && profile.expectedSalary !== undefined

  const hasSkills =
    (profile.skillPropositions?.length ?? 0) > 0 ||
    profile.technicalSkills.length > 0 ||
    profile.softSkills.length > 0 ||
    profile.toolsAndPlatforms.length > 0

  const hasContactInfo =
    Boolean(profile.email) ||
    Boolean(profile.phone) ||
    Boolean(profile.location) ||
    Boolean(profile.linkedInUrl) ||
    (profile.additionalUrls?.length ?? 0) > 0

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-xs">
      <section
        data-testid="section-career-summary"
        className="border-b border-slate-100 px-6 py-6 last:border-b-0 sm:px-8"
      >
        <header className="flex items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex shrink-0 items-center justify-center text-emerald-700">
              <FileTextIcon aria-hidden="true" className="h-5 w-5 text-emerald-700" />
            </span>
            <h3 className="text-base font-bold text-slate-900">Career Summary</h3>
          </div>
          <button
            type="button"
            aria-label="Edit Career Summary"
            onClick={() => setActiveModal("career-summary")}
            className="profile-no-print inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <PencilIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-500" />
            Edit
          </button>
        </header>

        {profile.shortBio ? (
          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
            {profile.shortBio}
          </p>
        ) : (
          <SectionEmptyState
            icon={FileTextIcon}
            title="No career summary added yet"
            description="A short professional summary will appear here once added."
          />
        )}
      </section>

      <section
        data-testid="section-work-experience"
        className="border-b border-slate-100 px-6 py-6 last:border-b-0 sm:px-8"
      >
        <header className="flex items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex shrink-0 items-center justify-center text-emerald-700">
              <BriefcaseIcon aria-hidden="true" className="h-5 w-5 text-emerald-700" />
            </span>
            <h3 className="text-base font-bold text-slate-900">Work Experience</h3>
          </div>
          <button
            type="button"
            aria-label="Edit Work Experience"
            onClick={() => setActiveModal("experience")}
            className="profile-no-print inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <PencilIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-500" />
            Edit
          </button>
        </header>

        {profile.workExperiences.length > 0 ? (
          <ul className="flex flex-col">
            {profile.workExperiences.map((experienceItem) => {
              const dateSpan = formatDateSpan(
                experienceItem.startDate,
                experienceItem.endDate,
                experienceItem.isCurrent
              )
              return (
                <li key={experienceItem.id} className="flex gap-3">
                  <div className="relative flex w-4 shrink-0 justify-center">
                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-700" />
                    <span className="absolute bottom-0 top-4 w-0.5 rounded-full bg-slate-200" />
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between gap-4 pb-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 break-words">{experienceItem.jobTitle}</p>
                      <p className="mt-1 text-xs text-slate-500 break-words">{experienceItem.companyName}</p>
                    </div>
                    {dateSpan ? (
                      <div className="shrink-0 text-right">
                        <p className="text-sm text-slate-900 font-normal">{dateSpan}</p>
                      </div>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <SectionEmptyState
            icon={BriefcaseIcon}
            title="No work experience added yet"
            description="Your past roles and employment history will appear here once added."
          />
        )}
      </section>

      <section
        data-testid="section-contact-information"
        className="border-b border-slate-100 px-6 py-6 last:border-b-0 sm:px-8"
      >
        <header className="flex items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex shrink-0 items-center justify-center text-emerald-700">
              <MailIcon aria-hidden="true" className="h-5 w-5 text-emerald-700" />
            </span>
            <h3 className="text-base font-bold text-slate-900">Contact Information</h3>
          </div>
          <button
            type="button"
            aria-label="Edit Contact Information"
            onClick={() => setActiveModal("contact")}
            className="profile-no-print inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <PencilIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-500" />
            Edit
          </button>
        </header>

        {hasContactInfo ? (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-500">Email</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900 break-all">
                {profile.email || "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Phone</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {profile.phone || "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Location</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {profile.location || "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">LinkedIn</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {profile.linkedInUrl ? (
                  <a
                    href={
                      profile.linkedInUrl.startsWith("http")
                        ? profile.linkedInUrl
                        : `https://${profile.linkedInUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:underline break-all"
                  >
                    {profile.linkedInUrl}
                  </a>
                ) : (
                  "Not specified"
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-slate-500">Additional URLs</dt>
              <dd className="mt-1">
                {profile.additionalUrls && profile.additionalUrls.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.additionalUrls.map((url) => {
                      const href =
                        url.startsWith("http://") || url.startsWith("https://")
                          ? url
                          : `https://${url}`
                      return (
                        <a
                          key={url}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-slate-100 hover:underline break-all"
                        >
                          {url}
                        </a>
                      )
                    })}
                  </div>
                ) : (
                  <span className="text-sm font-medium text-slate-500">
                    No additional links added
                  </span>
                )}
              </dd>
            </div>
          </dl>
        ) : (
          <SectionEmptyState
            icon={MailIcon}
            title="No contact information added yet"
            description="Recruiters use these details to reach you about opportunities."
          />
        )}
      </section>

      <section
        data-testid="section-education"
        className="border-b border-slate-100 px-6 py-6 last:border-b-0 sm:px-8"
      >
        <header className="flex items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex shrink-0 items-center justify-center text-emerald-700">
              <GraduationCapIcon aria-hidden="true" className="h-5 w-5 text-emerald-700" />
            </span>
            <h3 className="text-base font-bold text-slate-900">Education</h3>
          </div>
          <button
            type="button"
            aria-label="Edit Education"
            onClick={() => setActiveModal("education")}
            className="profile-no-print inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <PencilIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-500" />
            Edit
          </button>
        </header>

        {profile.educations.length > 0 ? (
          <ul className="flex flex-col">
            {profile.educations.map((educationItem) => {
              const dateSpan = formatDateSpan(educationItem.startDate, educationItem.endDate)
              return (
                <li key={educationItem.id} className="flex justify-between gap-4 py-2 border-b border-slate-100 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 break-words">{educationItem.degree}</p>
                    <p className="mt-1 text-xs text-slate-500 break-words">{educationItem.institution}</p>
                  </div>
                  {dateSpan ? (
                    <div className="shrink-0 text-right">
                      <p className="text-sm text-slate-900 font-normal">{dateSpan}</p>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : (
          <SectionEmptyState
            icon={GraduationCapIcon}
            title="No education added yet"
            description="Your degrees, institutions, and credentials will appear here once added."
          />
        )}
      </section>

      <section
        data-testid="section-career-preferences"
        className="border-b border-slate-100 px-6 py-6 last:border-b-0 sm:px-8"
      >
        <header className="flex items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex shrink-0 items-center justify-center text-emerald-700">
              <WalletIcon aria-hidden="true" className="h-5 w-5 text-emerald-700" />
            </span>
            <h3 className="text-base font-bold text-slate-900">Career Preferences</h3>
          </div>
          <button
            type="button"
            aria-label="Edit Career Preferences"
            onClick={() => setActiveModal("preferences")}
            className="profile-no-print inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <PencilIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-500" />
            Edit
          </button>
        </header>

        {hasCareerPreferences ? (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-500">Total Years of Experience</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {profile.totalYearsExperience !== null &&
                profile.totalYearsExperience !== undefined
                  ? `${profile.totalYearsExperience} year${profile.totalYearsExperience === 1 ? "" : "s"}`
                  : "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Expected Salary</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {profile.expectedSalary !== null && profile.expectedSalary !== undefined
                  ? `$${Number(profile.expectedSalary).toLocaleString()}`
                  : "Not specified"}
              </dd>
            </div>
          </dl>
        ) : (
          <SectionEmptyState
            icon={WalletIcon}
            title="No career preferences specified yet"
            description="Your experience level and salary expectations will appear here once specified."
          />
        )}
      </section>

      <section
        data-testid="section-skill-tags"
        className="border-b border-slate-100 px-6 py-6 last:border-b-0 sm:px-8"
      >
        <header className="flex items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex shrink-0 items-center justify-center text-emerald-700">
              <TagIcon aria-hidden="true" className="h-5 w-5 text-emerald-700" />
            </span>
            <h3 className="text-base font-bold text-slate-900">Skill Tags</h3>
          </div>
          <button
            type="button"
            aria-label="Edit Skill Tags & Propositions"
            title="Edit Skill Tags & Propositions"
            onClick={() => setActiveModal("skills")}
            className="profile-no-print inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <PencilIcon aria-hidden="true" className="h-3.5 w-3.5 text-slate-500" />
            Edit
          </button>
        </header>

        {hasSkills ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Skill Propositions
              </h4>
              {profile.skillPropositions && profile.skillPropositions.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {profile.skillPropositions.map((proposition) => (
                    <div
                      key={proposition}
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 break-words [overflow-wrap:anywhere]"
                    >
                      {proposition}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-slate-400">No skill propositions added yet.</p>
              )}
            </div>

            {profile.technicalSkills.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Technical Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.technicalSkills.map((technicalSkill) => (
                    <span
                      key={technicalSkill}
                      className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {technicalSkill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {profile.softSkills.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Soft Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.softSkills.map((softSkill) => (
                    <span
                      key={softSkill}
                      className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {softSkill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {profile.toolsAndPlatforms.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tools & Platforms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.toolsAndPlatforms.map((toolOrPlatform) => (
                    <span
                      key={toolOrPlatform}
                      className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {toolOrPlatform}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <SectionEmptyState
            icon={TagIcon}
            title="No skill tags added yet"
            description="Your technical skills, soft skills, and tools will appear here once added."
          />
        )}
      </section>

      {activeModal === "career-summary" ? (
        <EditCareerSummaryDialog
          isOpen={true}
          onClose={() => setActiveModal(null)}
          profile={profile}
        />
      ) : null}

      {activeModal === "experience" ? (
        <EditWorkExperienceDialog
          isOpen={true}
          onClose={() => setActiveModal(null)}
          items={profile.workExperiences}
        />
      ) : null}

      {activeModal === "contact" ? (
        <EditContactInfoDialog
          isOpen={true}
          onClose={() => setActiveModal(null)}
          profile={profile}
        />
      ) : null}

      {activeModal === "education" ? (
        <EditEducationDialog
          isOpen={true}
          onClose={() => setActiveModal(null)}
          items={profile.educations}
        />
      ) : null}

      {activeModal === "preferences" ? (
        <EditCareerPreferencesDialog
          isOpen={true}
          onClose={() => setActiveModal(null)}
          profile={profile}
        />
      ) : null}

      {activeModal === "skills" ? (
        <EditSkillsDialog
          isOpen={true}
          onClose={() => setActiveModal(null)}
          profile={profile}
        />
      ) : null}

      {activeModal === "basic" ? (
        <EditBasicInfoDialog
          isOpen={true}
          onClose={() => setActiveModal(null)}
          profile={profile}
        />
      ) : null}
    </div>
  )
}
