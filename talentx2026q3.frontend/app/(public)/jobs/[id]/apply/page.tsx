import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { jobListingService } from '@/modules/job-listing';
import { GuestApplyView } from '@/modules/job-application';
import { getAuthCookies } from '@/modules/auth/shared/auth-cookies.service';
import { decodeAccessToken } from '@/lib/auth/jwt';
import { mapSessionToHeaderUser } from '@/components/common/types';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { UserRole } from '@/types/auth';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const job = await jobListingService.getJobDetails(id);
    return {
      title: `Apply: ${job.title} at ${job.companyName} | TalentX`,
      description: `Apply to the ${job.title} position at ${job.companyName}.`,
    };
  } catch {
    return { title: 'Apply | TalentX' };
  }
}

interface ApplyPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { id } = await params;
  const { accessToken, refreshToken } = await getAuthCookies();
  const session = accessToken ? decodeAccessToken(accessToken) : null;

  // Access token expired/missing but refresh token present: bounce through the
  // refresh-redirect Route Handler, which is the only place (besides Server
  // Actions) where cookies may legally be written. Writing them here during
  // render throws "Cookies can only be modified in a Server Action or Route
  // Handler".
  if (!session && refreshToken) {
    redirect(`/api/auth/refresh-redirect?next=/jobs/${id}/apply`);
  }

  if (session?.role === UserRole.Talent) {
    redirect(`/apply/${id}`);
  }

  const initialUser = mapSessionToHeaderUser(session);

  return (
    <div>
      <Header initialUser={initialUser} />
      <main>
        <GuestApplyView jobId={id} />
      </main>
      <Footer/>
    </div>
  );
}