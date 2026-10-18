import type { Metadata } from 'next';
import { ReportedJobsView } from '@/modules/admin/job-reports';

export const metadata: Metadata = {
  title: 'Reported Jobs | Admin | TalentX',
  description: 'Manage and review reported job postings.',
};

export default function ReportedJobsPage() {
  return <ReportedJobsView />;
}
