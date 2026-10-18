import { renderHook, waitFor } from "@testing-library/react";
import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { useAdminUserDetails } from "../hooks/useAdminUserDetails";
import { useAdminUserStats } from "../hooks/useAdminUserStats";
import {
  fetchAdminUserDetails,
  fetchAdminUsers,
  fetchAdminUserStats,
} from "../services/user.service";
import type { AdminUserDetails, AdminUserStats, PaginatedList, AdminUserListItem } from "../types/user";

jest.mock("../services/user.service");

const mockedFetchAdminUsers = fetchAdminUsers as jest.MockedFunction<typeof fetchAdminUsers>;
const mockedFetchAdminUserDetails = fetchAdminUserDetails as jest.MockedFunction<
  typeof fetchAdminUserDetails
>;
const mockedFetchAdminUserStats = fetchAdminUserStats as jest.MockedFunction<
  typeof fetchAdminUserStats
>;

afterEach(() => jest.restoreAllMocks());

describe("useAdminUsers", () => {
  it("fetches /admin/users with the given params", async () => {
    const page: PaginatedList<AdminUserListItem> = {
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
    };
    mockedFetchAdminUsers.mockResolvedValueOnce(page);

    const { result } = renderHook(() => useAdminUsers({ role: "Talent" }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(page);
    expect(mockedFetchAdminUsers).toHaveBeenCalledWith({ role: "Talent" });
  });
});

describe("useAdminUserDetails", () => {
  it("does not fetch when id is undefined", () => {
    const { result } = renderHook(() => useAdminUserDetails(undefined), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedFetchAdminUserDetails).not.toHaveBeenCalled();
  });

  it("fetches /admin/users/:id when id is provided", async () => {
    const details = { id: "user-1", name: "Jordan Smith" } as AdminUserDetails;
    mockedFetchAdminUserDetails.mockResolvedValueOnce(details);

    const { result } = renderHook(() => useAdminUserDetails("user-1"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(details);
    expect(mockedFetchAdminUserDetails).toHaveBeenCalledWith("user-1");
  });
});

describe("useAdminUserStats", () => {
  it("fetches /admin/users/stats", async () => {
    const stats: AdminUserStats = {
      totalUsers: 14,
      talentsCount: 10,
      employersCount: 4,
      guestsCount: 0,
      deactivatedCount: 1,
    };
    mockedFetchAdminUserStats.mockResolvedValueOnce(stats);

    const { result } = renderHook(() => useAdminUserStats(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(stats);
  });
});
