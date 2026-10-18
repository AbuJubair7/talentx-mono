import type { SavedResume } from "@/modules/resumes/types/resume.types";

// Mirrors the backend TalentApplicationPrefillResponse
// (GET /api/v1/talents/me/application-prefill).
export interface ApplicationPrefill {
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  expectedSalary: number | null;
  totalYearsExperience: number | null;
  resumeStorageKey: string | null;
  resumeOriginalFileName: string | null;
  resumeUrl: string | null;
  resumes: SavedResume[];
}

// Body for POST /api/v1/jobs/{jobId}/applications (ApplyToJobCommand without JobId).
// Exactly one of resumeId (a saved resume) or resumeStorageKey (a fresh upload)
// is required; the backend resolves the saved resume server-side.
export interface ApplyPayload {
  applicantName: string;
  applicantEmail: string;
  resumeStorageKey: string;
  resumeId?: string;
  coverLetter?: string;
  expectedSalary?: number;
  totalYearsExperience?: number;
  location?: string;
}

// Response of that POST (ApplicationSubmittedDto).
export interface ApplicationSubmitted {
  id: string;
  jobId: string;
  status: string;
  appliedAt: string;
}

export interface UploadApplicationResumeResponse {
  storageKey: string;
  originalFileName: string;
  resumeDownloadUrl?: string;
}
