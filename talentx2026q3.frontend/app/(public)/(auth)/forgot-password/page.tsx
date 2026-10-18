import type { Metadata } from "next";

import { AuthBrandPanel } from "@/components/auth-brand-panel";
import { ForgotPasswordForm } from "@/modules/auth/forgot-password/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password — TalentX",
  description: "Request a password reset link for your TalentX account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-white">
      <AuthBrandPanel />
      <ForgotPasswordForm />
    </div>
  );
}
