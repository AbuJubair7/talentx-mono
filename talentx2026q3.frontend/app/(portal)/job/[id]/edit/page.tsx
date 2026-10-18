import type { Metadata } from "next";
import { EmployerEditJobView, type EditJobPageProps } from "@/modules/employer-jobs";

export const metadata: Metadata = {
  title: "Edit Job | TalentX",
};

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  return <EmployerEditJobView jobId={id} />;
}
