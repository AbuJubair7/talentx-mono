"use client"

import { useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, PencilIcon } from "lucide-react"

import { FieldWrapper, fieldDescribedBy } from "@/components/common/form/FieldWrapper"
import { SkillsField } from "@/components/common/form/SkillsField"
import { fieldInputClass } from "@/components/common/form/field-styles"
import { Textarea } from "@/components/ui/textarea"

import { useUpdateTalentProfile } from "../hooks/useUpdateTalentProfile"
import type { EditingSection, TalentProfileDto, TalentProfileFormProps, TalentProfileFormValues } from "../types"
import { talentProfileFormSchema } from "../types"
import { buildTalentProfileUpdatePayload } from "../utils/build-update-payload"

const SHORT_BIO_LIMIT = 1000

const emptyDefaults: TalentProfileFormValues = {
  name: "",
  location: "",
  tagline: "",
  shortBio: "",
  phone: "",
  linkedInUrl: "",
  additionalUrls: [],
  totalYearsExperience: null,
  expectedSalary: null,
  skillPropositions: [],
}

function toFormValues(profile: TalentProfileDto): TalentProfileFormValues {
  return {
    name: profile.name,
    location: profile.location ?? "",
    tagline: profile.tagline ?? "",
    shortBio: profile.shortBio ?? "",
    phone: profile.phone ?? "",
    linkedInUrl: profile.linkedInUrl ?? "",
    additionalUrls: [...profile.additionalUrls],
    totalYearsExperience: profile.totalYearsExperience,
    expectedSalary: profile.expectedSalary,
    skillPropositions: [...profile.skillPropositions],
  }
}

export function TalentProfileForm({ profile, isSubmitting, onSave }: TalentProfileFormProps) {
  const updateTalentProfileMutation = useUpdateTalentProfile()
  const [activeEditingSection, setActiveEditingSection] = useState<EditingSection>(null)

  const form = useForm<TalentProfileFormValues>({
    resolver: zodResolver(talentProfileFormSchema),
    defaultValues: { ...emptyDefaults, ...toFormValues(profile) },
  })
  const { register, handleSubmit, setValue, reset, control, formState } = form
  const { errors, isDirty } = formState

  const shortBioValue = useWatch({ control, name: "shortBio" })
  const additionalUrlsValue = useWatch({ control, name: "additionalUrls" })
  const skillPropositionsValue = useWatch({ control, name: "skillPropositions" })

  useEffect(() => {
    if (!isDirty && activeEditingSection === null) {
      reset(toFormValues(profile))
    }
  }, [profile, isDirty, activeEditingSection, reset])

  const isPending = isSubmitting ?? updateTalentProfileMutation.isPending

  function handleStartEdit(section: EditingSection) {
    reset(toFormValues(profile))
    setActiveEditingSection(section)
  }

  function handleCancelEdit() {
    reset(toFormValues(profile))
    setActiveEditingSection(null)
  }

  async function handleValid(submittedValues: TalentProfileFormValues) {
    const payload = buildTalentProfileUpdatePayload(profile, submittedValues)
    if (onSave) {
      onSave(payload)
      reset(submittedValues)
      setActiveEditingSection(null)
    } else {
      try {
        await updateTalentProfileMutation.mutateAsync(payload)
        reset(submittedValues)
        setActiveEditingSection(null)
      } catch {
        // Error is surfaced via the mutation onError notification
      }
    }
  }

  const shortBioLength = (shortBioValue ?? "").length

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-slate-100 bg-white shadow-xs">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-600">Identity</span>
            <h2 className="mt-1 text-base font-bold tracking-tight text-slate-900">Basic information</h2>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-500">How employers see you across the platform.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-slate-400">01</span>
            {activeEditingSection !== "basic" ? (
              <button
                type="button"
                aria-label="Edit basic information"
                onClick={() => handleStartEdit("basic")}
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <PencilIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </header>

        <div className="px-5 py-5">
          {activeEditingSection === "basic" ? (
            <form onSubmit={handleSubmit(handleValid)} className="flex flex-col gap-5">
              <FieldWrapper label="Name" htmlFor="name" error={errors.name?.message}>
                <input
                  id="name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={fieldDescribedBy("name", Boolean(errors.name), false)}
                  className={fieldInputClass}
                  {...register("name")}
                />
              </FieldWrapper>

              <FieldWrapper label="Tagline" htmlFor="tagline" error={errors.tagline?.message}>
                <input
                  id="tagline"
                  placeholder="e.g. Senior Backend Engineer"
                  aria-invalid={Boolean(errors.tagline)}
                  aria-describedby={fieldDescribedBy("tagline", Boolean(errors.tagline), false)}
                  className={fieldInputClass}
                  {...register("tagline")}
                />
              </FieldWrapper>

              <FieldWrapper
                label="Short bio"
                htmlFor="shortBio"
                error={errors.shortBio?.message}
                trailing={
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {shortBioLength} / {SHORT_BIO_LIMIT}
                  </span>
                }
              >
                <Textarea
                  id="shortBio"
                  rows={5}
                  maxLength={SHORT_BIO_LIMIT}
                  placeholder="A short summary of your experience and what you're looking for."
                  aria-invalid={Boolean(errors.shortBio)}
                  aria-describedby={fieldDescribedBy("shortBio", Boolean(errors.shortBio), false)}
                  {...register("shortBio")}
                />
              </FieldWrapper>

              <FieldWrapper label="Location" htmlFor="location" error={errors.location?.message}>
                <input
                  id="location"
                  placeholder="e.g. Dhaka, Bangladesh"
                  aria-invalid={Boolean(errors.location)}
                  aria-describedby={fieldDescribedBy("location", Boolean(errors.location), false)}
                  className={fieldInputClass}
                  {...register("location")}
                />
              </FieldWrapper>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isPending}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors duration-150 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {isPending ? <Loader2Icon aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /> : null}
                  Save changes
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Name</span>
                  <p className="text-sm font-semibold text-slate-900">{profile.name || <span className="italic text-slate-400">No name provided</span>}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Location</span>
                  <p className="text-sm font-medium text-slate-700">{profile.location || <span className="italic text-slate-400">No location added yet.</span>}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Tagline</span>
                <p className="text-sm font-medium text-slate-700">{profile.tagline || <span className="italic text-slate-400">No tagline added yet.</span>}</p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Short bio</span>
                {profile.shortBio ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{profile.shortBio}</p>
                ) : (
                  <p className="text-sm italic text-slate-400">No bio added yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white shadow-xs">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-600">Contact & links</span>
            <h2 className="mt-1 text-base font-bold tracking-tight text-slate-900">Contact & web presence</h2>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-500">Optional, but strongly recommended once you start applying.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-slate-400">02</span>
            {activeEditingSection !== "contact" ? (
              <button
                type="button"
                aria-label="Edit contact information"
                onClick={() => handleStartEdit("contact")}
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <PencilIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </header>

        <div className="px-5 py-5">
          {activeEditingSection === "contact" ? (
            <form onSubmit={handleSubmit(handleValid)} className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FieldWrapper label="Phone" htmlFor="phone" error={errors.phone?.message}>
                  <input
                    id="phone"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={fieldDescribedBy("phone", Boolean(errors.phone), false)}
                    className={fieldInputClass}
                    {...register("phone")}
                  />
                </FieldWrapper>

                <FieldWrapper label="LinkedIn URL" htmlFor="linkedInUrl" error={errors.linkedInUrl?.message}>
                  <input
                    id="linkedInUrl"
                    placeholder="https://linkedin.com/in/your-profile"
                    aria-invalid={Boolean(errors.linkedInUrl)}
                    aria-describedby={fieldDescribedBy("linkedInUrl", Boolean(errors.linkedInUrl), false)}
                    className={fieldInputClass}
                    {...register("linkedInUrl")}
                  />
                </FieldWrapper>
              </div>

              <SkillsField
                label="Additional URLs"
                hint="Portfolio, GitHub, personal site — press Enter or , after each one."
                placeholder="https://…"
                inputId="additional-urls-field"
                value={additionalUrlsValue ?? []}
                onChange={(urls) => setValue("additionalUrls", urls, { shouldValidate: true })}
                error={errors.additionalUrls?.message}
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isPending}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors duration-150 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {isPending ? <Loader2Icon aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /> : null}
                  Save changes
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Phone</span>
                  <p className="text-sm font-medium text-slate-700">{profile.phone || <span className="italic text-slate-400">No phone number added.</span>}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">LinkedIn URL</span>
                  {profile.linkedInUrl ? (
                    <a
                      href={profile.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sm font-medium text-emerald-600 hover:underline"
                    >
                      {profile.linkedInUrl}
                    </a>
                  ) : (
                    <span className="text-sm italic text-slate-400">No LinkedIn URL added.</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Additional URLs</span>
                {profile.additionalUrls.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.additionalUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-slate-400">No additional links added.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white shadow-xs">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-600">Experience</span>
            <h2 className="mt-1 text-base font-bold tracking-tight text-slate-900">Compensation & experience</h2>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-500">Helps employers gauge fit before they reach out.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-slate-400">03</span>
            {activeEditingSection !== "experience" ? (
              <button
                type="button"
                aria-label="Edit experience and compensation"
                onClick={() => handleStartEdit("experience")}
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <PencilIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </header>

        <div className="px-5 py-5">
          {activeEditingSection === "experience" ? (
            <form onSubmit={handleSubmit(handleValid)} className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FieldWrapper label="Expected salary" htmlFor="expectedSalary" error={errors.expectedSalary?.message}>
                  <input
                    id="expectedSalary"
                    type="number"
                    min={0}
                    step="0.01"
                    aria-invalid={Boolean(errors.expectedSalary)}
                    aria-describedby={fieldDescribedBy("expectedSalary", Boolean(errors.expectedSalary), false)}
                    className={`${fieldInputClass} font-mono`}
                    {...register("expectedSalary", {
                      setValueAs: (value) => (value === "" ? null : Number(value)),
                    })}
                  />
                </FieldWrapper>

                <FieldWrapper
                  label="Total years of experience"
                  htmlFor="totalYearsExperience"
                  error={errors.totalYearsExperience?.message}
                >
                  <input
                    id="totalYearsExperience"
                    type="number"
                    min={0}
                    step="0.5"
                    aria-invalid={Boolean(errors.totalYearsExperience)}
                    aria-describedby={fieldDescribedBy("totalYearsExperience", Boolean(errors.totalYearsExperience), false)}
                    className={`${fieldInputClass} font-mono`}
                    {...register("totalYearsExperience", {
                      setValueAs: (value) => (value === "" ? null : Number(value)),
                    })}
                  />
                </FieldWrapper>
              </div>

              <SkillsField
                label="Skill propositions"
                hint="Short statements that summarize what you bring — press Enter or , after each one."
                placeholder="e.g. Ships production ML pipelines end-to-end"
                inputId="skill-propositions-field"
                value={skillPropositionsValue ?? []}
                onChange={(statements) => setValue("skillPropositions", statements, { shouldValidate: true })}
                error={errors.skillPropositions?.message}
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isPending}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors duration-150 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {isPending ? <Loader2Icon aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /> : null}
                  Save changes
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Expected salary</span>
                  <p className="text-sm font-medium text-slate-700">
                    {profile.expectedSalary !== null && profile.expectedSalary !== undefined ? (
                      <span className="font-mono font-semibold text-slate-900">${profile.expectedSalary.toLocaleString()}</span>
                    ) : (
                      <span className="italic text-slate-400">Not specified</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Total years of experience</span>
                  <p className="text-sm font-medium text-slate-700">
                    {profile.totalYearsExperience !== null && profile.totalYearsExperience !== undefined ? (
                      <span className="font-mono font-semibold text-slate-900">
                        {profile.totalYearsExperience} {profile.totalYearsExperience === 1 ? "year" : "years"}
                      </span>
                    ) : (
                      <span className="italic text-slate-400">Not specified</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Skill propositions</span>
                {profile.skillPropositions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skillPropositions.map((proposition) => (
                      <span
                        key={proposition}
                        className="inline-flex items-center rounded-md border border-emerald-200/60 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800"
                      >
                        {proposition}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-slate-400">No skill propositions added yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
