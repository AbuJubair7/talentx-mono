"use client"

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useSaveResume } from "@/modules/resumes";

import { jobApplicationService } from "../services/job-application.service";
import { applyFormSchema, type ApplyFormValues } from "../schemas/apply-schema";
import type { ApplicationPrefill, ApplyPayload } from "../types/job-application.types";

function defaultResumeOption(prefill: ApplicationPrefill): "saved" | "new" {
  return prefill.resumes?.length ? "saved" : "new";
}

function defaultResumeId(prefill: ApplicationPrefill): string {
  const preferred = prefill.resumes?.find((resume) => resume.isDefault) ?? prefill.resumes?.[0];
  return preferred?.id ?? "";
}

export function useTalentApplyForm(
  prefill: ApplicationPrefill,
  onSubmit: (payload: ApplyPayload) => void,
  isSubmitting: boolean
) {
  const [isUploading, setIsUploading] = useState(false);
  const saveResumeMutation = useSaveResume();

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      applicantName: prefill.name ?? "",
      applicantEmail: prefill.email ?? "",
      coverLetter: "",
      location: prefill.location ?? "",
      expectedSalary: prefill.expectedSalary != null ? String(prefill.expectedSalary) : "",
      totalYearsExperience: prefill.totalYearsExperience != null ? String(prefill.totalYearsExperience) : "",
      resumeOption: defaultResumeOption(prefill),
      selectedResumeId: defaultResumeId(prefill),
      saveToLibrary: false,
    },
    mode: "onTouched",
  })

  const { reset, control, formState } = form;

  // Primitive signature instead of the whole `prefill` object so a caller that
  // rebuilds the object each render (e.g. `{ ...prefill, resumes: [] }`) cannot
  // retrigger the reset effect in a loop.
  const prefillResumePreference = `${defaultResumeOption(prefill)}:${defaultResumeId(prefill)}`;

  // Keep form in sync when backend prefill data finishes loading in background
  useEffect(() => {
    reset(
      {
        applicantName: prefill.name ?? "",
        applicantEmail: prefill.email ?? "",
        coverLetter: "",
        location: prefill.location ?? "",
        expectedSalary: prefill.expectedSalary != null ? String(prefill.expectedSalary) : "",
        totalYearsExperience: prefill.totalYearsExperience != null ? String(prefill.totalYearsExperience) : "",
        resumeOption: defaultResumeOption(prefill),
        selectedResumeId: defaultResumeId(prefill),
        saveToLibrary: false,
      },
      { keepDirty: true }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    prefill.name,
    prefill.email,
    prefill.location,
    prefill.expectedSalary,
    prefill.totalYearsExperience,
    prefillResumePreference,
    reset,
  ]);

  const resumeOption = useWatch({ control, name: "resumeOption" });
  const selectedResumeId = useWatch({ control, name: "selectedResumeId" });
  const resumeFile = useWatch({ control, name: "resumeFile" });
  const saveToLibrary = useWatch({ control, name: "saveToLibrary" });
  const [
    applicantName,
    applicantEmail,
    locationValue,
    expectedSalary,
    totalYearsExperience,
  ] = useWatch({
    control,
    name: [
      "applicantName",
      "applicantEmail",
      "location",
      "expectedSalary",
      "totalYearsExperience",
    ],
  });

  // Calculate percentage of filled key fields
  const hasResume = resumeOption === "saved" ? Boolean(selectedResumeId) : Boolean(resumeFile);
  const checks = [
    Boolean(applicantName?.trim()),
    Boolean(applicantEmail?.trim()),
    Boolean(locationValue?.trim()),
    hasResume,
    Boolean(expectedSalary?.trim()),
    Boolean(totalYearsExperience?.trim()),
  ];
  const completion = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const handleSubmitForm = async (formVals: ApplyFormValues) => {
    if (formVals.resumeOption === "saved") {
      if (!formVals.selectedResumeId) {
        toast.error("Please choose a saved resume.")
        return
      }

      onSubmit({
        applicantName: formVals.applicantName,
        applicantEmail: formVals.applicantEmail,
        resumeStorageKey: "",
        resumeId: formVals.selectedResumeId,
        coverLetter: formVals.coverLetter?.trim() || undefined,
        location: formVals.location?.trim() || undefined,
        expectedSalary: formVals.expectedSalary ? Number(formVals.expectedSalary) : undefined,
        totalYearsExperience: formVals.totalYearsExperience ? Number(formVals.totalYearsExperience) : undefined,
      })
      return
    }

    const file = formVals.resumeFile as File | undefined
    if (!file) {
      toast.error("Please upload a resume.")
      return
    }

    let resumeId: string | undefined
    let resumeStorageKey = ""

    if (formVals.saveToLibrary) {
      try {
        const saved = await saveResumeMutation.mutateAsync({ file })
        resumeId = saved.id
      } catch {
        // The mutation hook already surfaces the error as a toast.
        return
      }
    } else {
      setIsUploading(true)
      try {
        const uploadResult = await jobApplicationService.uploadApplicationResume(file)
        resumeStorageKey = uploadResult.storageKey
      } catch (error: unknown) {
        const err = error as { message?: string }
        toast.error("Resume upload failed", { description: err.message || "Failed to upload resume" })
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    onSubmit({
      applicantName: formVals.applicantName,
      applicantEmail: formVals.applicantEmail,
      resumeStorageKey,
      resumeId,
      coverLetter: formVals.coverLetter?.trim() || undefined,
      location: formVals.location?.trim() || undefined,
      expectedSalary: formVals.expectedSalary ? Number(formVals.expectedSalary) : undefined,
      totalYearsExperience: formVals.totalYearsExperience ? Number(formVals.totalYearsExperience) : undefined,
    })
  }

  return {
    form,
    resumeOption,
    selectedResumeId,
    resumeFile,
    saveToLibrary,
    completion,
    isWorking: isSubmitting || isUploading || saveResumeMutation.isPending,
    isUploading,
    errors: formState.errors,
    dirtyFields: formState.dirtyFields,
    handleSubmitForm: form.handleSubmit(handleSubmitForm),
  }
}
