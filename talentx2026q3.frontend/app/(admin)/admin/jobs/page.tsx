import type { Metadata } from "next";
import { JobModerationView } from "@/modules/admin/job-moderation";

export const metadata: Metadata = {
  title: "Job Moderation | TalentX",
  description: "Review published jobs and take down ones that break the rules",
};

// Reads ?job= (from notification links) on the server, so the view needs no Suspense boundary.
export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string | string[] }>;
}) {
  const { job } = await searchParams;
  const initialJobId = (Array.isArray(job) ? job[0] : job) || null;

  return <JobModerationView initialJobId={initialJobId} />;
}
