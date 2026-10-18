import type { Metadata } from "next";
import { AdminDashboardView } from "@/modules/admin/dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | TalentX",
  description: "Platform overview, active metrics, and administrative status.",
};

// The /admin/dashboard route. Access is already limited to admins by the (admin) layout, so this only renders the view.
export default function AdminDashboardPage() {
  return <AdminDashboardView />;
}
