import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createQueryWrapper,
  createTestQueryClient,
} from "@/tests/test-utils/query-client-wrapper";
import { useAdminCompanyReviews, adminCompanyReviewKeys } from "../hooks/useAdminCompanyReviews";
import { useAdminCompanyReviewStats } from "../hooks/useAdminCompanyReviewStats";
import { useAdminCompanyReviewDetails } from "../hooks/useAdminCompanyReviewDetails";
import { useApproveCompanyReview } from "../hooks/useApproveCompanyReview";
import { useRejectCompanyReview } from "../hooks/useRejectCompanyReview";
import { useHideCompanyReview } from "../hooks/useHideCompanyReview";
import { useUnhideCompanyReview } from "../hooks/useUnhideCompanyReview";
import {
  approveCompanyReview,
  fetchAdminCompanyReviewDetails,
  fetchAdminCompanyReviews,
  fetchAdminCompanyReviewStats,
  hideCompanyReview,
  rejectCompanyReview,
  unhideCompanyReview,
} from "../services/review-moderation.service";
import type {
  AdminCompanyReviewDetails,
  AdminCompanyReviewListItem,
  AdminCompanyReviewStats,
  PaginatedList,
} from "../types/review-moderation";

jest.mock("../services/review-moderation.service");
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockedFetchAdminCompanyReviews = jest.mocked(fetchAdminCompanyReviews);
const mockedFetchAdminCompanyReviewStats = jest.mocked(fetchAdminCompanyReviewStats);
const mockedFetchAdminCompanyReviewDetails = jest.mocked(fetchAdminCompanyReviewDetails);
const mockedApproveCompanyReview = jest.mocked(approveCompanyReview);
const mockedRejectCompanyReview = jest.mocked(rejectCompanyReview);
const mockedHideCompanyReview = jest.mocked(hideCompanyReview);
const mockedUnhideCompanyReview = jest.mocked(unhideCompanyReview);

function wrapperFor(queryClient: QueryClient) {
  function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return QueryWrapper;
}

afterEach(() => jest.clearAllMocks());

describe("useAdminCompanyReviews", () => {
  it("fetches /admin/company-reviews with the given params", async () => {
    const page: PaginatedList<AdminCompanyReviewListItem> = {
      items: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    };
    mockedFetchAdminCompanyReviews.mockResolvedValueOnce(page);

    const { result } = renderHook(() => useAdminCompanyReviews({ status: "Pending", page: 1 }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(page);
    expect(mockedFetchAdminCompanyReviews).toHaveBeenCalledWith({ status: "Pending", page: 1 });
  });
});

describe("useAdminCompanyReviewStats", () => {
  it("fetches /admin/company-reviews/stats", async () => {
    const stats = { total: 4, pendingCount: 2 } as AdminCompanyReviewStats;
    mockedFetchAdminCompanyReviewStats.mockResolvedValueOnce(stats);

    const { result } = renderHook(() => useAdminCompanyReviewStats(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(stats);
  });
});

describe("useAdminCompanyReviewDetails", () => {
  it("does not fetch when id is undefined", () => {
    const { result } = renderHook(() => useAdminCompanyReviewDetails(undefined), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedFetchAdminCompanyReviewDetails).not.toHaveBeenCalled();
  });

  it("fetches /admin/company-reviews/:id when id is provided", async () => {
    const details = { id: "review-1", companyName: "Acme Inc" } as AdminCompanyReviewDetails;
    mockedFetchAdminCompanyReviewDetails.mockResolvedValueOnce(details);

    const { result } = renderHook(() => useAdminCompanyReviewDetails("review-1"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(details);
    expect(mockedFetchAdminCompanyReviewDetails).toHaveBeenCalledWith("review-1");
  });

  it("does not retry a 404", async () => {
    mockedFetchAdminCompanyReviewDetails.mockRejectedValueOnce({ status: 404, message: "Review not found." });

    const { result } = renderHook(() => useAdminCompanyReviewDetails("review-1"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockedFetchAdminCompanyReviewDetails).toHaveBeenCalledTimes(1);
  });
});

describe("useApproveCompanyReview", () => {
  it("approves, refreshes list/detail/stats, and toasts the backend message", async () => {
    mockedApproveCompanyReview.mockResolvedValueOnce({ message: "Review approved." });
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useApproveCompanyReview(), { wrapper: wrapperFor(queryClient) });

    act(() => result.current.mutate("review-1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApproveCompanyReview).toHaveBeenCalledWith("review-1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: adminCompanyReviewKeys.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: adminCompanyReviewKeys.detail("review-1") });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: adminCompanyReviewKeys.stats() });
    expect(toast.success).toHaveBeenCalledWith("Review approved.");
  });

  it("toasts the backend error message on failure", async () => {
    mockedApproveCompanyReview.mockRejectedValueOnce(
      Object.assign(new Error("Only pending reviews can be approved."), { status: 400 })
    );

    const { result } = renderHook(() => useApproveCompanyReview(), { wrapper: createQueryWrapper() });

    act(() => result.current.mutate("review-1"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith("Only pending reviews can be approved.");
  });
});

describe("useRejectCompanyReview", () => {
  const payload = { reason: "Spam" as const, details: "This looks like a spam submission." };

  it("sends the payload, refreshes list/detail/stats, and toasts the backend message", async () => {
    mockedRejectCompanyReview.mockResolvedValueOnce({ message: "Review rejected." });
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useRejectCompanyReview(), { wrapper: wrapperFor(queryClient) });

    act(() => result.current.mutate({ id: "review-1", payload }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedRejectCompanyReview).toHaveBeenCalledWith("review-1", payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: adminCompanyReviewKeys.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: adminCompanyReviewKeys.detail("review-1") });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: adminCompanyReviewKeys.stats() });
    expect(toast.success).toHaveBeenCalledWith("Review rejected.");
  });
});

describe("useHideCompanyReview", () => {
  const payload = { reason: "PersonalInformation" as const, details: "Contains the employer's home address." };

  it("sends the payload, refreshes list/detail/stats, and toasts the backend message", async () => {
    mockedHideCompanyReview.mockResolvedValueOnce({ message: "Review hidden." });
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useHideCompanyReview(), { wrapper: wrapperFor(queryClient) });

    act(() => result.current.mutate({ id: "review-1", payload }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedHideCompanyReview).toHaveBeenCalledWith("review-1", payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: adminCompanyReviewKeys.stats() });
    expect(toast.success).toHaveBeenCalledWith("Review hidden.");
  });
});

describe("useUnhideCompanyReview", () => {
  it("unhides, refreshes list/detail/stats, and toasts the backend message", async () => {
    mockedUnhideCompanyReview.mockResolvedValueOnce({ message: "Review unhidden." });
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUnhideCompanyReview(), { wrapper: wrapperFor(queryClient) });

    act(() => result.current.mutate("review-1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedUnhideCompanyReview).toHaveBeenCalledWith("review-1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: adminCompanyReviewKeys.all });
    expect(toast.success).toHaveBeenCalledWith("Review unhidden.");
  });

  it("toasts a default message when the backend response has none", async () => {
    mockedUnhideCompanyReview.mockResolvedValueOnce({});

    const { result } = renderHook(() => useUnhideCompanyReview(), { wrapper: createQueryWrapper() });

    act(() => result.current.mutate("review-1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith("Review unhidden.");
  });
});
