import { render, screen } from "@testing-library/react";
import { UserStatsCards } from "../UserStatsCards";
import { useAdminUserStats } from "../../hooks/useAdminUserStats";

jest.mock("../../hooks/useAdminUserStats");

const mockedUseAdminUserStats = useAdminUserStats as jest.MockedFunction<
  typeof useAdminUserStats
>;

type HookResult = ReturnType<typeof useAdminUserStats>;

function hookState(partial: Partial<HookResult>): HookResult {
  return {
    data: undefined,
    isLoading: false,
    ...partial,
  } as HookResult;
}

afterEach(() => jest.clearAllMocks());

describe("UserStatsCards", () => {
  it("renders skeleton placeholders while loading", () => {
    mockedUseAdminUserStats.mockReturnValue(hookState({ isLoading: true }));

    render(<UserStatsCards />);

    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders each stat count once loaded", () => {
    mockedUseAdminUserStats.mockReturnValue(
      hookState({
        data: {
          totalUsers: 14,
          talentsCount: 10,
          employersCount: 4,
          guestsCount: 0,
          deactivatedCount: 1,
        },
      })
    );

    render(<UserStatsCards />);

    expect(screen.getByText("Talents")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Employers")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("Deactivated")).toBeInTheDocument();
    expect(screen.queryByText("Guests")).not.toBeInTheDocument();
  });
});
