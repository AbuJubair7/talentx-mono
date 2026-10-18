import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createQueryWrapper,
  createTestQueryClient,
} from "@/tests/test-utils/query-client-wrapper";
import { useAdminJobs, adminJobKeys } from "../hooks/useAdminJobs";
import { useAdminJobDetails } from "../hooks/useAdminJobDetails";
import { useDeactivateJob } from "../hooks/useDeactivateJob";
import { useReactivateJob } from "../hooks/useReactivateJob";
import {
  deactivateJob,
  fetchAdminJobDetails,
  fetchAdminJobs,
  reactivateJob,
} from "../services/job-moderation.service";
import type {
  AdminJobDetails,
  AdminJobListItem,
  PaginatedList,
} from "../types/job-moderation";

jest.mock("../services/job-moderation.service");
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockedFetchAdminJobs = jest.mocked(fetchAdminJobs);
const mockedFetchAdminJobDetails = jest.mocked(fetchAdminJobDetails);
const mockedDeactivateJob = jest.mocked(deactivateJob);
const mockedReactivateJob = jest.mocked(reactivateJob);

function wrapperFor(queryClient: QueryClient) {
  function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return QueryWrapper;
}

afterEach(() => jest.clearAllMocks());

describe("useAdminJobs", () => {
  it("fetches /admin/jobs with the given params", async () => {
    const page: PaginatedList<AdminJobListItem> = {
      items: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    };
    mockedFetchAdminJobs.mockResolvedValueOnce(page);

    const { result } = renderHook(() => useAdminJobs({ status: "PendingReview", page: 1 }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(page);
    expect(mockedFetchAdminJobs).toHaveBeenCalledWith({ status: "PendingReview", page: 1 });
  });
});

describe("useAdminJobDetails", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does not fetch when id is undefined", () => {
    const { result } = renderHook(() => useAdminJobDetails(undefined), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedFetchAdminJobDetails).not.toHaveBeenCalled();
  });

  it("fetches /admin/jobs/:id when id is provided", async () => {
    const details = { id: "job-1", title: "Backend Engineer" } as AdminJobDetails;
    mockedFetchAdminJobDetails.mockResolvedValueOnce(details);

    const { result } = renderHook(() => useAdminJobDetails("job-1"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(details);
    expect(mockedFetchAdminJobDetails).toHaveBeenCalledWith("job-1");
  });

  it("does not retry a 404, so the not-available message shows right away", async () => {
    mockedFetchAdminJobDetails.mockRejectedValueOnce({ status: 404, message: "Job not found." });

    const { result } = renderHook(() => useAdminJobDetails("job-1"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockedFetchAdminJobDetails).toHaveBeenCalledTimes(1);
  });
});

describe("useDeactivateJob", () => {
  const payload = { reason: "Spam" as const, details: "Posting links to an unrelated external site." };

  it("sends the payload, refreshes the list and detail, and toasts the backend message", async () => {
    mockedDeactivateJob.mockResolvedValueOnce({ message: "Job deactivated." });
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeactivateJob(), { wrapper: wrapperFor(queryClient) });

    act(() => result.current.mutate({ id: "job-1", payload }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedDeactivateJob).toHaveBeenCalledWith("job-1", payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: adminJobKeys.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: adminJobKeys.detail("job-1") });
    expect(toast.success).toHaveBeenCalledWith("Job deactivated.");
  });

  it("toasts the backend error message on failure", async () => {
    mockedDeactivateJob.mockRejectedValueOnce(
      Object.assign(new Error("Please explain the reason in at least 10 characters."), { status: 400 })
    );

    const { result } = renderHook(() => useDeactivateJob(), { wrapper: createQueryWrapper() });

    act(() => result.current.mutate({ id: "job-1", payload }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith("Please explain the reason in at least 10 characters.");
  });
});

describe("useReactivateJob", () => {
  it("reactivates, refreshes the list and detail, and falls back to a default message", async () => {
    mockedReactivateJob.mockResolvedValueOnce({});
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useReactivateJob(), { wrapper: wrapperFor(queryClient) });

    act(() => result.current.mutate("job-1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedReactivateJob).toHaveBeenCalledWith("job-1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: adminJobKeys.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: adminJobKeys.detail("job-1") });
    expect(toast.success).toHaveBeenCalledWith("Job reactivated.");
  });

  it("toasts the backend's expired-deadline message on failure", async () => {
    const message =
      "Cannot reactivate a job with an expired deadline. The employer must update the application deadline first.";
    mockedReactivateJob.mockRejectedValueOnce(Object.assign(new Error(message), { status: 400 }));

    const { result } = renderHook(() => useReactivateJob(), { wrapper: createQueryWrapper() });

    act(() => result.current.mutate("job-1"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith(message);
  });
});
