import type { Metadata } from "next";
import { AuditLogView } from "./components/audit-log-view";

export const metadata: Metadata = {
  title: "Audit Log | TalentX",
  description: "Audit Log Insights",
};

export default function AdminAuditLogPage() {
  return <AuditLogView />;
}
