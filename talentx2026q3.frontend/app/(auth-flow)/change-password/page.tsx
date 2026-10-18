import { AuthBackground } from "@/components/auth-background";
import { ChangePasswordForm } from "@/modules/auth/change-password/components/change-password-form";

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source } = await searchParams;
  const showVerificationInstruction = source === "verification";

  return (
    <AuthBackground className="flex items-center justify-center p-4">
      <ChangePasswordForm showVerificationInstruction={showVerificationInstruction} />
    </AuthBackground>
  );
}
