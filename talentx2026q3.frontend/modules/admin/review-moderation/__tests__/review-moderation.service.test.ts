import { apiClient } from "@/lib/api/axios";
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
} from "../types/review-moderation";

// The service imports the named `apiClient`, so the mock must provide that name. A `default`
// key would leave `apiClient` undefined and crash the suite before any test runs.
jest.mock("@/lib/api/axios", () => ({
  apiClient: { get: jest.fn(), patch: jest.fn() },
}));

const mockedGet = jest.mocked(apiClient.get);
const mockedPatch = jest.mocked(apiClient.patch);

afterEach(() => jest.clearAllMocks());

describe("fetchAdminCompanyReviews", () => {
  it("GETs /admin/company-reviews forwarding query params and returns the paginated list", async () => {
    const page = {
      items: [] as AdminCompanyReviewListItem[],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    };
    mockedGet.mockResolvedValueOnce({ data: page });

    const result = await fetchAdminCompanyReviews({
      searchQuery: "acme",
      status: "Pending",
      sentiment: "Negative",
      page: 1,
      pageSize: 10,
    });

    expect(mockedGet).toHaveBeenCalledWith("/admin/company-reviews", {
      params: { searchQuery: "acme", status: "Pending", sentiment: "Negative", page: 1, pageSize: 10 },
    });
    expect(result).toBe(page);
  });
});

describe("fetchAdminCompanyReviewStats", () => {
  it("GETs /admin/company-reviews/stats and returns the counts", async () => {
    const stats = { total: 4, pendingCount: 2 } as AdminCompanyReviewStats;
    mockedGet.mockResolvedValueOnce({ data: stats });

    const result = await fetchAdminCompanyReviewStats();

    expect(mockedGet).toHaveBeenCalledWith("/admin/company-reviews/stats");
    expect(result).toBe(stats);
  });
});

describe("fetchAdminCompanyReviewDetails", () => {
  it("GETs /admin/company-reviews/:id and returns the details", async () => {
    const details = { id: "review-1", companyName: "Acme Inc" } as AdminCompanyReviewDetails;
    mockedGet.mockResolvedValueOnce({ data: details });

    const result = await fetchAdminCompanyReviewDetails("review-1");

    expect(mockedGet).toHaveBeenCalledWith("/admin/company-reviews/review-1");
    expect(result).toBe(details);
  });
});

describe("approveCompanyReview", () => {
  it("PATCHes /admin/company-reviews/:id/approve with no body", async () => {
    mockedPatch.mockResolvedValueOnce({ data: { message: "Review approved." } });

    const result = await approveCompanyReview("review-1");

    expect(mockedPatch).toHaveBeenCalledWith("/admin/company-reviews/review-1/approve");
    expect(result).toEqual({ message: "Review approved." });
  });

  it("returns an empty object when the response has no body", async () => {
    mockedPatch.mockResolvedValueOnce({ data: undefined });

    const result = await approveCompanyReview("review-1");

    expect(result).toEqual({});
  });
});

describe("rejectCompanyReview", () => {
  it("PATCHes /admin/company-reviews/:id/reject with the reason and details", async () => {
    mockedPatch.mockResolvedValueOnce({ data: { message: "Review rejected." } });

    const result = await rejectCompanyReview("review-1", {
      reason: "Spam",
      details: "This looks like a spam submission.",
    });

    expect(mockedPatch).toHaveBeenCalledWith("/admin/company-reviews/review-1/reject", {
      reason: "Spam",
      details: "This looks like a spam submission.",
    });
    expect(result).toEqual({ message: "Review rejected." });
  });
});

describe("hideCompanyReview", () => {
  it("PATCHes /admin/company-reviews/:id/hide with the reason and details", async () => {
    mockedPatch.mockResolvedValueOnce({ data: { message: "Review hidden." } });

    const result = await hideCompanyReview("review-1", {
      reason: "PersonalInformation",
      details: "Contains the employer's home address.",
    });

    expect(mockedPatch).toHaveBeenCalledWith("/admin/company-reviews/review-1/hide", {
      reason: "PersonalInformation",
      details: "Contains the employer's home address.",
    });
    expect(result).toEqual({ message: "Review hidden." });
  });
});

describe("unhideCompanyReview", () => {
  it("PATCHes /admin/company-reviews/:id/unhide with no body", async () => {
    mockedPatch.mockResolvedValueOnce({ data: { message: "Review unhidden." } });

    const result = await unhideCompanyReview("review-1");

    expect(mockedPatch).toHaveBeenCalledWith("/admin/company-reviews/review-1/unhide");
    expect(result).toEqual({ message: "Review unhidden." });
  });
});
