import { CandidateProfileSkeleton } from '@/modules/employer-applicants/components/candidate-profile/CandidateProfileSkeleton';

export default function CandidateProfileLoading() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <CandidateProfileSkeleton />
    </div>
  );
}
