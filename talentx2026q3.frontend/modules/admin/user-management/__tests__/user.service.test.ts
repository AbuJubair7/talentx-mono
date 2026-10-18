import { apiClient } from "@/lib/api/axios";
import {
  fetchAdminUserDetails,
  fetchAdminUsers,
  fetchAdminUserStats,
} from "../services/user.service";
import type {
  AdminUserDetails,
  AdminUserListItem,
  AdminUserStats,
} from "../types/user";

jest.mock("@/lib/api/axios", () => ({
  apiClient: { get: jest.fn() },
}));

const mockedGet = jest.mocked(apiClient.get);

afterEach(() => jest.clearAllMocks());

describe("fetchAdminUsers", () => {
  it("GETs /admin/users forwarding query params and returns the paginated list", async () => {
    const page = {
      items: [] as AdminUserListItem[],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
    };
    mockedGet.mockResolvedValueOnce({ data: page });

    const result = await fetchAdminUsers({ role: "Talent", searchQuery: "jordan" });

    expect(mockedGet).toHaveBeenCalledWith("/admin/users", {
      params: { role: "Talent", searchQuery: "jordan" },
    });
    expect(result).toBe(page);
  });
});

describe("fetchAdminUserDetails", () => {
  it("GETs /admin/users/:id and returns the details", async () => {
    const details = { id: "user-1", name: "Jordan Smith" } as AdminUserDetails;
    mockedGet.mockResolvedValueOnce({ data: details });

    const result = await fetchAdminUserDetails("user-1");

    expect(mockedGet).toHaveBeenCalledWith("/admin/users/user-1");
    expect(result).toBe(details);
  });
});

describe("fetchAdminUserStats", () => {
  it("GETs /admin/users/stats and returns the stats", async () => {
    const stats: AdminUserStats = {
      totalUsers: 14,
      talentsCount: 10,
      employersCount: 4,
      guestsCount: 0,
      deactivatedCount: 1,
    };
    mockedGet.mockResolvedValueOnce({ data: stats });

    const result = await fetchAdminUserStats();

    expect(mockedGet).toHaveBeenCalledWith("/admin/users/stats");
    expect(result).toBe(stats);
  });
});
