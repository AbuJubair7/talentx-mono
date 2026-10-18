'use client'

import { useEffect, useRef, useState } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Briefcase,
  GraduationCap,
  Layers,
  FileText,
  Loader2,
  Wand2,
  Link2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import type { ResumeExtractionResult } from '../types/resume.types'
import { ExtractionField, ExtractionSectionHeader, ExtractionTextarea } from './extraction-ui'
import { SkillTagsSection } from './SkillTagsSection'
import { PortfolioLinksEditor } from './PortfolioLinksEditor'
import { WorkExperienceSection } from './WorkExperienceSection'
import { EducationSection } from './EducationSection'
import { ProjectsSection } from './ProjectsSection'
import { initializeFormData } from '../utils/initialize-form-data'

export interface ExtractedProfileReviewProps {
  data: ResumeExtractionResult
  onReset: () => void
  onSaved?: (result: ResumeExtractionResult) => void | Promise<void>
  onConfirm?: (result: ResumeExtractionResult) => void | Promise<void>
}

export function ExtractedProfileReview({
  data: initialExtraction,
  onReset,
  onSaved,
  onConfirm,
}: ExtractedProfileReviewProps) {
  const [formData, setFormData] = useState<ResumeExtractionResult>(() => initializeFormData(initialExtraction))
  const [isSaving, setIsSaving] = useState(false)

  const technicalSkillsRef = useRef<HTMLDivElement>(null)
  const softSkillsRef = useRef<HTMLDivElement>(null)
  const [toolsColumn, setToolsColumn] = useState<1 | 2>(1)

  useEffect(() => {
    const technicalElement = technicalSkillsRef.current
    const softElement = softSkillsRef.current
    if (!technicalElement || !softElement) return

    const updateColumnPlacement = () => {
      setToolsColumn(technicalElement.offsetHeight <= softElement.offsetHeight ? 1 : 2)
    }

    updateColumnPlacement()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateColumnPlacement)
      return () => window.removeEventListener('resize', updateColumnPlacement)
    }

    const observer = new ResizeObserver(updateColumnPlacement)
    observer.observe(technicalElement)
    observer.observe(softElement)
    return () => observer.disconnect()
  }, [])

  const handleFieldChange = (field: keyof ResumeExtractionResult, value: unknown) => {
    setFormData((previousFormData) => ({ ...previousFormData, [field]: value }))
  }

  const handleSaveProfile = async () => {
    const callback = onSaved ?? onConfirm

    if (!callback) {
      toast.success('Extracted profile data confirmed!', {
        description: 'Your parsed resume details are ready for application.',
      })
      return
    }

    setIsSaving(true)
    try {
      const linkedInFromLinks = formData.portfolioUrls?.find((portfolioUrl) => /linkedin\.com/i.test(portfolioUrl))?.trim()
      const resolvedLinkedIn = formData.linkedInUrl?.trim() || linkedInFromLinks || null
      const resultToSave: ResumeExtractionResult = {
        ...formData,
        linkedInUrl: resolvedLinkedIn,
      }
      await callback(resultToSave)
    } finally {
      setIsSaving(false)
    }
  }

  const experienceCount = formData.workExperience?.length ?? 0
  const educationCount = formData.education?.length ?? 0
  const skillCount =
    (formData.technicalSkills?.length ?? 0) +
    (formData.softSkills?.length ?? 0) +
    (formData.toolsAndPlatforms?.length ?? 0)

  const completenessChecks = [
    Boolean(formData.fullName?.trim()),
    Boolean(formData.email?.trim()),
    Boolean(formData.phone?.trim()),
    Boolean(formData.location?.trim()),
    Boolean(formData.linkedInUrl?.trim()) || (formData.portfolioUrls?.length ?? 0) > 0,
    Boolean(formData.tagline?.trim()),
    Boolean(formData.shortBio?.trim()),
    experienceCount > 0,
    educationCount > 0,
    skillCount > 0,
  ]
  const completeness = Math.round(
    (completenessChecks.filter(Boolean).length / completenessChecks.length) * 100
  )

  const sectionDivider = <div className="h-px w-full bg-slate-100" aria-hidden="true" />

  const toolsSkillSection = (
    <SkillTagsSection
      title="Tools & Platforms"
      items={formData.toolsAndPlatforms || []}
      onChange={(updatedTools) => handleFieldChange('toolsAndPlatforms', updatedTools)}
      placeholder="Add a tool or platform"
    />
  )

  return (
    <Card className="w-full gap-0 overflow-hidden rounded-md border-slate-200/80 py-0 shadow-xl shadow-slate-900/[0.04]">
      <CardHeader className="relative gap-0 overflow-hidden border-b border-slate-100 bg-gradient-to-br from-emerald-50/70 via-slate-50/40 to-white px-6 py-6 sm:px-8 sm:py-7">
        <div
          className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-emerald-100/50 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
              <Wand2 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg font-bold tracking-tight text-slate-900">
                  Review extracted profile details
                </CardTitle>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200/70">
                  <Sparkles className="size-3" aria-hidden="true" />
                  AI parsed
                </span>
              </div>
              <CardDescription className="mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
                We filled these details from your resume. Review and edit your profile details before updating.
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-8 gap-1.5 rounded-md border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Upload new
          </Button>
        </div>

        <div className="relative mt-6 flex flex-col gap-4 rounded-md border border-slate-200/70 bg-white/70 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-xs">
              <Briefcase className="size-3.5 text-slate-400" aria-hidden="true" />
              {`${experienceCount} role${experienceCount === 1 ? '' : 's'}`}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-xs">
              <GraduationCap className="size-3.5 text-slate-400" aria-hidden="true" />
              {`${educationCount} education`}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-xs">
              <Layers className="size-3.5 text-slate-400" aria-hidden="true" />
              {`${skillCount} skill${skillCount === 1 ? '' : 's'}`}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 sm:w-60">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Profile completeness
              </span>
              <span className="text-xs font-bold tabular-nums text-slate-600">{completeness}%</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-label="Profile completeness"
              aria-valuenow={completeness}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-emerald-700 transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-7 px-6 py-7 sm:px-8">
        <section className="space-y-4">
          <ExtractionSectionHeader
            icon={User}
            title="Personal & Profile Information"
            description="Contact details and basic profile information we found on your resume."
          />

          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <ExtractionField
              label="Full name"
              icon={User}
              value={formData.fullName || ''}
              onChange={(event) => handleFieldChange('fullName', event.target.value)}
              placeholder="Candidate Full Name"
            />
            <ExtractionField
              label="Email address"
              icon={Mail}
              type="email"
              value={formData.email || ''}
              onChange={(event) => handleFieldChange('email', event.target.value)}
              placeholder="candidate@example.com"
            />
            <ExtractionField
              label="Phone number"
              icon={Phone}
              value={formData.phone || ''}
              onChange={(event) => handleFieldChange('phone', event.target.value)}
              placeholder="+1 (555) 000-0000"
            />
            <ExtractionField
              label="Location"
              icon={MapPin}
              value={formData.location || ''}
              onChange={(event) => handleFieldChange('location', event.target.value)}
              placeholder="City, Country"
            />
            <div className="sm:col-span-2">
              <ExtractionField
                label="LinkedIn profile"
                icon={Link2}
                value={formData.linkedInUrl || ''}
                onChange={(event) => handleFieldChange('linkedInUrl', event.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="sm:col-span-2">
              <ExtractionField
                label="Tagline"
                icon={Sparkles}
                value={formData.tagline || ''}
                onChange={(event) => handleFieldChange('tagline', event.target.value)}
                placeholder="e.g. Senior Machine Learning Engineer"
              />
            </div>
          </div>

          <ExtractionTextarea
            label="Short bio"
            rows={3}
            value={formData.shortBio || ''}
            onChange={(event) => handleFieldChange('shortBio', event.target.value)}
            placeholder="Brief overview of your experience and impact..."
          />

          <PortfolioLinksEditor
            urls={formData.portfolioUrls || []}
            onChange={(portfolioUrls) => handleFieldChange('portfolioUrls', portfolioUrls)}
          />
        </section>

        {sectionDivider}

        <WorkExperienceSection
          experiences={formData.workExperience || []}
          onChange={(updatedExperiences) => handleFieldChange('workExperience', updatedExperiences)}
        />

        {sectionDivider}

        <EducationSection
          education={formData.education || []}
          onChange={(updatedEducation) => handleFieldChange('education', updatedEducation)}
        />

        {sectionDivider}

        <ProjectsSection
          projects={formData.projects || []}
          onChange={(updatedProjects) => handleFieldChange('projects', updatedProjects)}
        />

        {sectionDivider}

        <section className="space-y-4">
          <ExtractionSectionHeader
            icon={Layers}
            title="Skills & competencies"
            description="Press Enter to add · click × to remove"
            count={skillCount}
          />

          <div className="grid gap-5 sm:grid-cols-2 sm:items-start">
            <div className="contents sm:flex sm:flex-col sm:gap-5">
              <div ref={technicalSkillsRef} className="order-1 min-w-0">
                <SkillTagsSection
                  title="Technical Skills"
                  items={formData.technicalSkills || []}
                  onChange={(updatedSkills) => handleFieldChange('technicalSkills', updatedSkills)}
                  placeholder="Add a technical skill"
                />
              </div>
              {toolsColumn === 1 ? <div className="order-3 min-w-0">{toolsSkillSection}</div> : null}
            </div>

            <div className="contents sm:flex sm:flex-col sm:gap-5">
              <div ref={softSkillsRef} className="order-2 min-w-0">
                <SkillTagsSection
                  title="Soft Skills"
                  items={formData.softSkills || []}
                  onChange={(updatedSkills) => handleFieldChange('softSkills', updatedSkills)}
                  placeholder="Add a soft skill"
                />
              </div>
              {toolsColumn === 2 ? <div className="order-3 min-w-0">{toolsSkillSection}</div> : null}
            </div>
          </div>
        </section>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <FileText className="size-3.5" aria-hidden="true" />
          <span>
            Ref <span className="font-mono text-slate-600">{formData.resumeUploadId}</span>
          </span>
        </p>

        <div className="flex w-full gap-3 sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={isSaving}
            className="h-10 flex-1 rounded-md border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:text-slate-900 sm:flex-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="h-10 flex-1 gap-2 rounded-md bg-emerald-700 px-5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-emerald-800 disabled:opacity-60 sm:flex-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-4" aria-hidden="true" />
            )}
            {isSaving ? 'Saving…' : 'Confirm'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
