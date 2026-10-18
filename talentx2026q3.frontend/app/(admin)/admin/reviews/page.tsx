import type { Metadata } from "next";
import { ReviewModerationView } from "@/modules/admin/review-moderation";

export const metadata: Metadata = {
  title: "Review Moderation | TalentX",
  description: "Approve, reject, hide or unhide talent reviews of companies",
};

export default function AdminReviewsPage() {
  return <ReviewModerationView />;
}
