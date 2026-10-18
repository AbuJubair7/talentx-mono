import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthBrandPanel } from "@/components/auth-brand-panel";
import { LoginForm } from "@/modules/auth/login/components/login-form";
import { getAuthCookies } from "@/modules/auth/shared/auth-cookies.service";
import { decodeAccessToken } from "@/lib/auth/jwt";
import { UserRole } from "@/types/auth";

export const metadata: Metadata = {
  title: "Log In — TalentX",
  description:
    "Log in to your TalentX account to manage jobs and candidates.",
};

const DEACTIVATED_ACCOUNT_MESSAGE =
  "Your account has been deactivated. Please contact TalentX support for more information.";

type LoginPageProps = {
  searchParams: Promise<{
    reason?: string;
    redirect?: string;
  }>;
};

export default async function LoginPage(props: LoginPageProps) {
  const { accessToken } = await getAuthCookies();
  const session = accessToken ? decodeAccessToken(accessToken) : null;

  if (session) {
    switch (session.role) {
      case UserRole.Admin:
        redirect("/admin/dashboard");
      case UserRole.Guest:
        redirect("/change-password?source=verification");
      case UserRole.Employer:
      case UserRole.Talent:
      default:
        redirect("/dashboard");
    }
  }

  const searchParams = await props.searchParams;
  const deactivatedMessage =
    searchParams?.reason === "account-deactivated" ? DEACTIVATED_ACCOUNT_MESSAGE : undefined;

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-white">
      <AuthBrandPanel />
      <LoginForm deactivatedMessage={deactivatedMessage} redirectTo={searchParams?.redirect} />
    </div>
  );
}