import type { Metadata } from 'next';
import { Suspense } from 'react';

import { PortalPageContainer } from '@/components/layout';
import { EmployerJobsClient, EmployerJobsTableSkeleton } from '@/modules/employer-jobs';

export const metadata: Metadata = {
  title: 'My Jobs | TalentX',
};

export default function MyJobsPage() {
  return (
    <PortalPageContainer>
      <Suspense fallback={<EmployerJobsTableSkeleton />}>
        <EmployerJobsClient />
      </Suspense>
    </PortalPageContainer>
  );
}

