import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth/require-auth';
import { UserRole } from '@/types/auth';
import { JobAlertsView } from '@/modules/job-alerts';

export const metadata: Metadata = {
  title: 'Job Alerts | TalentX',
  description: 'Manage your job search alerts and notification preferences.',
};

export default async function JobAlertsPage() {
  await requireAuth([UserRole.Talent]);

  return <JobAlertsView />;
}
