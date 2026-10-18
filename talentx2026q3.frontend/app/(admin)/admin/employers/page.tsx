import type { Metadata } from "next";
import { EmployerVerificationView } from "@/modules/admin/employer-verification";

export const metadata: Metadata = {
  title: "Employer Verification | TalentX",
  description: "Review and verify employer accounts and onboarding requests.",
};

export default function AdminEmployersPage() {
  return <EmployerVerificationView />;
}
