import { CompaniesView } from '@/modules/companies';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { getAuthCookies } from '@/modules/auth/shared/auth-cookies.service';
import { decodeAccessToken } from '@/lib/auth/jwt';
import { mapSessionToHeaderUser } from '@/components/common/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Explore Companies',
  description: 'Browse verified employers and discover their open roles.',
};

export default async function CompaniesPage() {
  const { accessToken } = await getAuthCookies();
  const session = accessToken ? decodeAccessToken(accessToken) : null;
  const initialUser = mapSessionToHeaderUser(session);

  return (
    <div className="flex min-h-screen flex-col">
      <Header initialUser={initialUser} />
      <main className="grow">
        <CompaniesView />
      </main>
      <Footer />
    </div>
  );
}
