import { requireAuth } from "@/lib/auth/require-auth";
import { UserRole } from "@/types/auth";
import { BrandAmbientBackground } from "@/components/brand-ambient-background";

export default async function TalentLayout({ children }: { children: React.ReactNode }) {
  await requireAuth([UserRole.Talent]);
  return (
    <BrandAmbientBackground className="flex min-h-screen flex-col">
      {children}
    </BrandAmbientBackground>
  );
}
