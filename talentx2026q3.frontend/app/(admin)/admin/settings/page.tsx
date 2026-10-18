import type { Metadata } from "next";
import { AdminSettingsView } from "@/modules/admin/settings";

export const metadata: Metadata = {
  title: "Settings | TalentX Admin",
  description: "Manage global application settings and feature configurations",
};

export default function AdminSettingsPage() {
  return <AdminSettingsView />;
}
