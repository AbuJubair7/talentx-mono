import { apiClient } from "@/lib/api/axios";
import {
  deactivateJob,
  fetchAdminJobDetails,
  fetchAdminJobs,
  reactivateJob,
} from "../services/job-moderation.service";
import type { AdminJobDetails, AdminJobListItem } from "../types/job-moderation";

// The service imports the named `apiClient`, so the mock must provide that name. A `default`
// key would leave `apiClient` undefined and crash the suite before any test runs.
jest.mock("@/lib/api/axios", () => ({
  apiClient: { get: jest.fn(), patch: jest.fn() },
}));

const mockedGet = jest.mocked(apiClient.get);
const mockedPatch = jest.mocked(apiClient.patch);

afterEach(() => jest.clearAllMocks());

describe("fetchAdminJobs", () => {
  it("GETs /admin/jobs forwarding query params and returns the paginated list", async () => {
    const page = {
      items: [] as AdminJobListItem[],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    };
    mockedGet.mockResolvedValueOnce({ data: page });

    const result = await fetchAdminJobs({ searchQuery: "acme", status: "PendingReview", page: 1, pageSize: 10 });

    expect(mockedGet).toHaveBeenCalledWith("/admin/jobs", {
      params: { searchQuery: "acme", status: "PendingReview", page: 1, pageSize: 10 },
    });
    expect(result).toBe(page);
  });
});

describe("fetchAdminJobDetails", () => {
  it("GETs /admin/jobs/:id and returns the details", async () => {
    const details = { id: "job-1", title: "Backend Engineer" } as AdminJobDetails;
    mockedGet.mockResolvedValueOnce({ data: details });

    const result = await fetchAdminJobDetails("job-1");

    expect(mockedGet).toHaveBeenCalledWith("/admin/jobs/job-1");
    expect(result).toBe(details);
  });
});

describe("deactivateJob", () => {
  it("PATCHes /admin/jobs/:id/deactivate with the reason and details", async () => {
    mockedPatch.mockResolvedValueOnce({ data: { message: "Job deactivated." } });

    const result = await deactivateJob("job-1", {
      reason: "Spam",
      details: "Posting links to an unrelated external site.",
    });

    expect(mockedPatch).toHaveBeenCalledWith("/admin/jobs/job-1/deactivate", {
      reason: "Spam",
      details: "Posting links to an unrelated external site.",
    });
    expect(result).toEqual({ message: "Job deactivated." });
  });

  it("returns an empty object when the response has no body", async () => {
    mockedPatch.mockResolvedValueOnce({ data: undefined });

    const result = await deactivateJob("job-1", { reason: "Other", details: "Some explanation." });

    expect(result).toEqual({});
  });
});

describe("reactivateJob", () => {
  it("PATCHes /admin/jobs/:id/reactivate with no body", async () => {
    mockedPatch.mockResolvedValueOnce({ data: { message: "Job reactivated." } });

    const result = await reactivateJob("job-1");

    expect(mockedPatch).toHaveBeenCalledWith("/admin/jobs/job-1/reactivate");
    expect(result).toEqual({ message: "Job reactivated." });
  });
});
