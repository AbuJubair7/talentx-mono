import type { Metadata } from 'next';
import { EmployerJobDetailView, type JobDetailsPageProps } from '@/modules/employer-jobs';

export const metadata: Metadata = {
  title: 'Job Details | TalentX',
};

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  return <EmployerJobDetailView jobId={id} />;
}
