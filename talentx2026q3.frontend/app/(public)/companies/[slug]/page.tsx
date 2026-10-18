import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { getSession } from '@/lib/auth/session';
import { mapSessionToHeaderUser } from '@/components/common/types';
import {
  companyProfileService,
  PublicCompanyProfileView,
  slugifyCompanyName,
} from '@/modules/company-profile';
import { UserRole } from '@/types/auth';

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const company = await companyProfileService.getPublicCompanyProfile(slug);
    const title = `${company.name} — Careers & Company Profile | TalentX`;
    const description =
      company.description?.slice(0, 160) ||
      `Explore open career opportunities, culture, and company details at ${company.name}.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: company.logoUrl ? [{ url: company.logoUrl }] : [],
      },
    };
  } catch {
    return {
      title: 'Company Profile | TalentX',
    };
  }
}

export default async function PublicCompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  let companyData;
  try {
    companyData = await companyProfileService.getPublicCompanyProfile(decodedSlug);
  } catch {
    notFound();
  }

  if (!companyData || !companyData.name) {
    notFound();
  }

  const session = await getSession();
  const initialUser = mapSessionToHeaderUser(session);

  // Check if current user is an employer associated with this company.
  // Public lookup is ID-based; slug URLs are resolved from live /jobs data.
  const isOwner =
    session?.role === UserRole.Employer &&
    Boolean(
      (session?.companyName &&
        slugifyCompanyName(session.companyName as string) === decodedSlug.toLowerCase()) ||
        (companyData.id && session?.sub === companyData.id),
    );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header initialUser={initialUser} />
      <main className="flex-1">
        <PublicCompanyProfileView
          company={companyData}
          isOwner={isOwner}
          isPreview={false}
        />
      </main>
      <Footer />
    </div>
  );
}
