import { Metadata } from 'next';
import { requireAuth } from '@/lib/auth/require-auth';
import { UserRole } from '@/types/auth';
import { PortalPageContainer } from '@/components/layout';
import { PreparationOverview } from '@/modules/interview-preparation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Interview Preparation | TalentX',
};

interface PreparationPageProps {
  params: Promise<{
    invitationId: string;
  }>;
}

export default async function PreparationPage({ params }: PreparationPageProps) {
  await requireAuth([UserRole.Talent]);
  const resolvedParams = await params;

  return (
    <PortalPageContainer>
      <div className="mb-6">
        <Link 
          href="/interviews" 
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 text-ink-muted hover:text-ink -ml-2")}
        >
          <ArrowLeft className="size-4" />
          Back to Interviews
        </Link>
      </div>
      
      <PreparationOverview invitationId={resolvedParams.invitationId} />
    </PortalPageContainer>
  );
}
