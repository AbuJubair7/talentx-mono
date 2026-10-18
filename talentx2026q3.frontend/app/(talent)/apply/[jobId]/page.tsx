import { ApplyView } from "@/modules/job-application";
import { getSession } from "@/lib/auth/session";
import { mapSessionToHeaderUser } from "@/components/common/types";

interface ApplyPageProps {
  params: Promise<{ jobId: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { jobId } = await params;
  const session = await getSession();
  const initialUser = mapSessionToHeaderUser(session);

  return <ApplyView jobId={jobId} initialUser={initialUser} />;
}
