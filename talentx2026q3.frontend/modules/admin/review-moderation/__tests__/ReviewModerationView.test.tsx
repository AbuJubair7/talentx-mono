import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ReviewModerationView } from "../components/ReviewModerationView";
import { useAdminCompanyReviews } from "../hooks/useAdminCompanyReviews";
import { useAdminCompanyReviewStats } from "../hooks/useAdminCompanyReviewStats";
import { useApproveCompanyReview } from "../hooks/useApproveCompanyReview";
import { useRejectCompanyReview } from "../hooks/useRejectCompanyReview";
import { useHideCompanyReview } from "../hooks/useHideCompanyReview";
import { useUnhideCompanyReview } from "../hooks/useUnhideCompanyReview";
import type { AdminCompanyReviewListItem } from "../types/review-moderation";

jest.mock("../hooks/useAdminCompanyReviews", () => ({
  useAdminCompanyReviews: jest.fn(),
}));
jest.mock("../hooks/useAdminCompanyReviewStats", () => ({
  useAdminCompanyReviewStats: jest.fn(),
}));
jest.mock("../hooks/useApproveCompanyReview", () => ({ useApproveCompanyReview: jest.fn() }));
jest.mock("../hooks/useRejectCompanyReview", () => ({ useRejectCompanyReview: jest.fn() }));
jest.mock("../hooks/useHideCompanyReview", () => ({ useHideCompanyReview: jest.fn() }));
jest.mock("../hooks/useUnhideCompanyReview", () => ({ useUnhideCompanyReview: jest.fn() }));
// The detail dialog has its own tests; here we only check which review the view asks it to show.
jest.mock("../components/ReviewDetailDialog", () => ({
  ReviewDetailDialog: ({ reviewId, onClose }: { reviewId: string | null; onClose: () => void }) => (
    <div data-testid="review-detail-dialog" data-review-id={reviewId ?? ""}>
      <button type="button" onClick={onClose}>
        Close dialog
      </button>
    </div>
  ),
}));

const mockedUseAdminCompanyReviews = useAdminCompanyReviews as jest.MockedFunction<typeof useAdminCompanyReviews>;
const mockedUseAdminCompanyReviewStats = useAdminCompanyReviewStats as jest.MockedFunction<typeof useAdminCompanyReviewStats>;
const mockedUseApproveCompanyReview = useApproveCompanyReview as jest.MockedFunction<typeof useApproveCompanyReview>;
const mockedUseRejectCompanyReview = useRejectCompanyReview as jest.MockedFunction<typeof useRejectCompanyReview>;
const mockedUseHideCompanyReview = useHideCompanyReview as jest.MockedFunction<typeof useHideCompanyReview>;
const mockedUseUnhideCompanyReview = useUnhideCompanyReview as jest.MockedFunction<typeof useUnhideCompanyReview>;

function buildItem(overrides: Partial<AdminCompanyReviewListItem> = {}): AdminCompanyReviewListItem {
  return {
    id: "review-1",
    status: "Pending",
    sentiment: "Positive",
    comment: "Great process overall.",
    ratings: { recruitmentProcess: 4, communication: 4, interviewExperience: null, professionalism: 5 },
    companyId: "company-1",
    companyName: "Acme Inc",
    jobTitle: "Backend Engineer",
    reviewerName: "Jordan Smith",
    reviewerEmail: "jordan.smith@ait.com",
    reviewerUserId: "user-1",
    submittedAt: "2026-09-20T00:00:00Z",
    updatedAt: null,
    publishedAt: null,
    moderationReason: null,
    moderationDetails: null,
    moderatedAt: null,
    ...overrides,
  };
}

function reviewsHookState(partial: Record<string, unknown> = {}) {
  return {
    data: { items: [buildItem()], page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    ...partial,
  } as unknown as ReturnType<typeof useAdminCompanyReviews>;
}

function mutationState(partial: Record<string, unknown> = {}) {
  return { mutateAsync: jest.fn().mockResolvedValue({}), isPending: false, ...partial } as never;
}

describe("ReviewModerationView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAdminCompanyReviews.mockReturnValue(reviewsHookState());
    mockedUseAdminCompanyReviewStats.mockReturnValue({
      data: { total: 6, pendingCount: 1, publishedCount: 2, rejectedCount: 1, hiddenCount: 1, withdrawnCount: 1 },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminCompanyReviewStats>);
    mockedUseApproveCompanyReview.mockReturnValue(mutationState());
    mockedUseRejectCompanyReview.mockReturnValue(mutationState());
    mockedUseHideCompanyReview.mockReturnValue(mutationState());
    mockedUseUnhideCompanyReview.mockReturnValue(mutationState());
  });

  it("defaults to the Pending tab on mount", () => {
    render(<ReviewModerationView />);

    expect(screen.getByRole("tab", { name: /Pending/ })).toHaveAttribute("aria-selected", "true");
    expect(mockedUseAdminCompanyReviews).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: "Pending", page: 1 })
    );
  });

  it("shows the count badge from the stats hook on each tab", () => {
    render(<ReviewModerationView />);

    expect(screen.getByRole("tab", { name: /Pending/ })).toHaveTextContent("1");
    expect(screen.getByRole("tab", { name: /Published/ })).toHaveTextContent("2");
    expect(screen.getByRole("tab", { name: /All/ })).toHaveTextContent("6");
  });

  it.each([
    ["Published", "Published"],
    ["Rejected", "Rejected"],
    ["Hidden", "Hidden"],
    ["Withdrawn", "Withdrawn"],
    ["All", undefined],
  ] as const)("the %s tab filters by status %s and resets to page 1", (tabLabel, expectedStatus) => {
    mockedUseAdminCompanyReviews.mockReturnValue(
      reviewsHookState({ data: { items: [buildItem()], page: 1, pageSize: 10, totalCount: 25, totalPages: 3 } })
    );
    render(<ReviewModerationView />);

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    fireEvent.click(screen.getByRole("tab", { name: new RegExp(tabLabel) }));

    expect(mockedUseAdminCompanyReviews).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: expectedStatus, page: 1 })
    );
  });

  describe("search", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("waits 300ms, trims the query, and resets to page 1", () => {
      mockedUseAdminCompanyReviews.mockReturnValue(
        reviewsHookState({ data: { items: [buildItem()], page: 1, pageSize: 10, totalCount: 25, totalPages: 3 } })
      );
      render(<ReviewModerationView />);

      fireEvent.click(screen.getByRole("button", { name: "Next page" }));
      fireEvent.change(screen.getByLabelText("Search reviews"), { target: { value: "  acme  " } });

      expect(mockedUseAdminCompanyReviews).toHaveBeenLastCalledWith(
        expect.objectContaining({ searchQuery: undefined, page: 2 })
      );

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockedUseAdminCompanyReviews).toHaveBeenLastCalledWith(
        expect.objectContaining({ searchQuery: "acme", page: 1 })
      );
    });
  });

  it("opens the detail dialog for a clicked row and clears it on close", () => {
    render(<ReviewModerationView />);
    const dialog = screen.getByTestId("review-detail-dialog");
    expect(dialog).toHaveAttribute("data-review-id", "");

    fireEvent.click(screen.getByRole("button", { name: "View details for review of Acme Inc" }));
    expect(dialog).toHaveAttribute("data-review-id", "review-1");

    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(dialog).toHaveAttribute("data-review-id", "");
  });

  it("approves a pending review", async () => {
    const mutateAsync = jest.fn().mockResolvedValue({});
    mockedUseApproveCompanyReview.mockReturnValue(mutationState({ mutateAsync }));
    render(<ReviewModerationView />);

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    fireEvent.click(screen.getByRole("button", { name: "Approve review" }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith("review-1"));
  });

  it("rejects a pending review with the chosen reason and details", async () => {
    const mutateAsync = jest.fn().mockResolvedValue({});
    mockedUseRejectCompanyReview.mockReturnValue(mutationState({ mutateAsync }));
    render(<ReviewModerationView />);

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    fireEvent.change(screen.getByLabelText("Reason"), {
      target: { value: screen.getByRole("option", { name: "Spam" }).getAttribute("value") },
    });
    fireEvent.change(screen.getByLabelText("Details"), {
      target: { value: "This looks like a spam submission." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reject review" }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        id: "review-1",
        payload: { reason: "Spam", details: "This looks like a spam submission." },
      })
    );
  });

  it("hides a published review with the chosen reason and details", async () => {
    const mutateAsync = jest.fn().mockResolvedValue({});
    mockedUseHideCompanyReview.mockReturnValue(mutationState({ mutateAsync }));
    mockedUseAdminCompanyReviews.mockReturnValue(reviewsHookState({ data: { items: [buildItem({ status: "Published" })], page: 1, pageSize: 10, totalCount: 1, totalPages: 1 } }));
    render(<ReviewModerationView />);

    fireEvent.click(screen.getByRole("button", { name: "Hide" }));
    expect(screen.getByRole("heading", { name: "Hide review" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Reason"), {
      target: { value: screen.getByRole("option", { name: "Personal information" }).getAttribute("value") },
    });
    fireEvent.change(screen.getByLabelText("Details"), {
      target: { value: "Contains the employer's home address." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Hide review" }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        id: "review-1",
        payload: { reason: "PersonalInformation", details: "Contains the employer's home address." },
      })
    );
  });

  it("unhides a hidden review", async () => {
    const mutateAsync = jest.fn().mockResolvedValue({});
    mockedUseUnhideCompanyReview.mockReturnValue(mutationState({ mutateAsync }));
    mockedUseAdminCompanyReviews.mockReturnValue(reviewsHookState({ data: { items: [buildItem({ status: "Hidden" })], page: 1, pageSize: 10, totalCount: 1, totalPages: 1 } }));
    render(<ReviewModerationView />);

    fireEvent.click(screen.getByRole("button", { name: "Unhide" }));
    fireEvent.click(screen.getByRole("button", { name: "Unhide review" }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith("review-1"));
  });
});
