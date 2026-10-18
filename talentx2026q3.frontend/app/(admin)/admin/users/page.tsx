import type { Metadata } from "next";
import { UserManagementView } from "@/modules/admin/user-management";

export const metadata: Metadata = {
  title: "User Management | TalentX",
  description: "Manage Talent and Employer accounts",
};

export default function AdminUsersPage() {
  return <UserManagementView />;
}
