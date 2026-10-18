import { JobsView } from '@/modules/job-listing';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { getAuthCookies } from '@/modules/auth/shared/auth-cookies.service';
import { decodeAccessToken } from '@/lib/auth/jwt';
import { mapSessionToHeaderUser } from '@/components/common/types';

export const dynamic = 'force-dynamic';

export default async function JobsPage() {
  const { accessToken } = await getAuthCookies();
  const session = accessToken ? decodeAccessToken(accessToken) : null;
  const initialUser = mapSessionToHeaderUser(session);

  return (
    <div className="flex min-h-screen flex-col">
      <Header initialUser={initialUser} />
      <main className="grow">
        <JobsView />
      </main>
      <Footer />
    </div>
  );
}
