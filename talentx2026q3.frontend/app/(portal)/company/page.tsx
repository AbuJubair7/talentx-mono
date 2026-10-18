import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/require-auth';
import { UserRole } from '@/types/auth';
import { EmployerCompanyPage } from '@/modules/company-profile/components/EmployerCompanyPage';

export const metadata: Metadata = {
  title: 'Company Profile | TalentX',
  description: 'Manage your company profile, brand assets, and public employer page on TalentX.',
};

export default async function CompanyPortalPage() {
  const session = await requireAuth([UserRole.Employer, UserRole.Talent]);

  // Only employers have a company profile — redirect others to their profile page
  if (session.role !== UserRole.Employer) {
    redirect('/profile');
  }

  return <EmployerCompanyPage />;
}
