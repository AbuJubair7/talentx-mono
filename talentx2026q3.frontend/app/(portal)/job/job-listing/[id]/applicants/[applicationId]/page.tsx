import type { Metadata } from 'next';
import { CandidateProfilePage } from '@/modules/employer-applicants';

export const metadata: Metadata = {
  title: 'Candidate Profile | TalentX',
};

interface CandidateProfileRouteProps {
  params: Promise<{ id: string; applicationId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CandidateProfileRoutePage({
  params,
  searchParams,
}: CandidateProfileRouteProps) {
  const { id, applicationId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <CandidateProfilePage jobId={id} applicationId={applicationId} searchParams={resolvedSearchParams} />
  );
}
