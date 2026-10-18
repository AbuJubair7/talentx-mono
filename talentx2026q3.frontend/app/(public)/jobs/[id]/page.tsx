import type { Metadata } from 'next';
import { jobListingService, JobDetailView } from '@/modules/job-listing';
import { getSession } from '@/lib/auth/session';
import { mapSessionToHeaderUser } from '@/components/common/types';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';

import { UserRole } from '@/types/auth';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const job = await jobListingService.getJobDetails(id);
    return {
      title: `${job.title} at ${job.companyName} | TalentX`,
      description: job.description ?? `${job.title} position at ${job.companyName}`,
    };
  } catch {
    return { title: 'Job | TalentX' };
  }
}

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;

  const session = await getSession();
  const initialUser = mapSessionToHeaderUser(session);
  const normalizedRole = session?.role?.trim().toLowerCase();
  const viewerIsTalent = session?.role === UserRole.Talent || normalizedRole === 'talent';
  const viewerIsGuest = session?.role === UserRole.Guest || normalizedRole === 'guest';
  const viewerIsEmployer = session?.role === UserRole.Employer || normalizedRole === 'employer';
  const viewerIsAdmin = session?.role === UserRole.Admin || normalizedRole === 'admin';

  return (
    <div>
      <Header initialUser={initialUser} />
      <main>
        <JobDetailView
          jobId={id}
          viewerIsAuthenticated={Boolean(session)}
          viewerIsTalent={viewerIsTalent}
          viewerIsGuest={viewerIsGuest}
          viewerIsEmployer={viewerIsEmployer}
          viewerIsAdmin={viewerIsAdmin}
        />
      </main>
      <Footer/>
    </div>
  );
}
