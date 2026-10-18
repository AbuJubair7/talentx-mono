import React from "react";
import { act, render, screen, fireEvent } from "@testing-library/react";
import { UserManagementView } from "../UserManagementView";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import { useUpdateUserAccountStatus } from "../../hooks/useUpdateUserAccountStatus";

jest.mock("../../hooks/useAdminUsers");
jest.mock("../../hooks/useUpdateUserAccountStatus");
jest.mock("../UserStatsCards", () => ({
  UserStatsCards: () => <div data-testid="stats-cards" />,
}));
jest.mock("../UserDetailView", () => ({
  UserDetailView: ({ userId, isOpen }: { userId: string | null; isOpen: boolean }) => (
    <div data-testid="user-detail-view" data-user-id={userId ?? ""} data-open={isOpen} />
  ),
}));
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? React.createElement("div", { role: "dialog" }, children) : null,
  DialogContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DialogTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement("h2", null, children),
  DialogDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement("p", null, children),
  DialogClose: ({ children, render: RenderElement }: { children: React.ReactNode; render?: React.ReactElement }) =>
    RenderElement ? React.cloneElement(RenderElement, {}, children) : React.createElement("div", null, children),
}));
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DropdownMenuTrigger: ({
    children,
    ...restProperties
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("button", restProperties, children),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DropdownMenuItem: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => React.createElement("button", { onClick, className }, children),
}));

const mockedUseAdminUsers = useAdminUsers as jest.MockedFunction<typeof useAdminUsers>;
const mockedUseUpdateUserAccountStatus = useUpdateUserAccountStatus as jest.MockedFunction<
  typeof useUpdateUserAccountStatus
>;

type HookResult = ReturnType<typeof useAdminUsers>;

function hookState(partial: Partial<HookResult>): HookResult {
  return {
    data: undefined,
    isLoading: false,
    ...partial,
  } as HookResult;
}

afterEach(() => jest.clearAllMocks());

describe("UserManagementView", () => {
  beforeEach(() => {
    mockedUseUpdateUserAccountStatus.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ message: "Account status updated." }),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateUserAccountStatus>);
  });

  it("renders the stat cards and segmented tabs", () => {
    mockedUseAdminUsers.mockReturnValue(hookState({}));

    render(<UserManagementView />);

    expect(screen.getByTestId("stats-cards")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "All Users" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Talents" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Employers" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Guests" })).not.toBeInTheDocument();
  });

  it("switching to the Talents tab requests users filtered by the Talent role", () => {
    mockedUseAdminUsers.mockReturnValue(hookState({}));

    render(<UserManagementView />);
    fireEvent.click(screen.getByRole("tab", { name: "Talents" }));

    expect(mockedUseAdminUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ role: "Talent", page: 1 })
    );
  });

  it("clicking a row's View action opens the detail view for that user", () => {
    mockedUseAdminUsers.mockReturnValue(
      hookState({
        data: {
          items: [
            {
              id: "user-42",
              name: "Jordan Smith",
              email: "jordan@talentx.com",
              role: "Talent",
              isVerified: true,
              status: "Active",
              createdAt: "2026-01-16T00:00:00Z",
            },
          ],
          page: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
        },
      })
    );

    render(<UserManagementView />);

    expect(screen.getByTestId("user-detail-view")).toHaveAttribute("data-open", "false");

    fireEvent.click(screen.getByRole("button", { name: "View details for Jordan Smith" }));

    expect(screen.getByTestId("user-detail-view")).toHaveAttribute("data-open", "true");
    expect(screen.getByTestId("user-detail-view")).toHaveAttribute("data-user-id", "user-42");
  });

  it("shows a confirmation dialog and calls the mutation when a status action is confirmed", async () => {
    mockedUseAdminUsers.mockReturnValue(
      hookState({
        data: {
          items: [
            {
              id: "user-42",
              name: "Jordan Smith",
              email: "jordan@talentx.com",
              role: "Talent",
              isVerified: true,
              status: "Active",
              createdAt: "2026-01-16T00:00:00Z",
            },
          ],
          page: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
        },
      })
    );
    const mutateAsync = jest.fn().mockResolvedValue({ message: "Account status updated." });
    mockedUseUpdateUserAccountStatus.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateUserAccountStatus>);

    render(<UserManagementView />);

    expect(screen.queryByRole("heading", { name: "Deactivate Account" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Deactivate"));

    expect(screen.getByRole("heading", { name: "Deactivate Account" })).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Deactivate Account" }));
    });

    expect(mutateAsync).toHaveBeenCalledWith({ id: "user-42", newStatus: "Deactivated" });
    expect(screen.queryByRole("heading", { name: "Deactivate Account" })).not.toBeInTheDocument();
  });

  it("closes the confirmation dialog when cancelled without calling the mutation", () => {
    mockedUseAdminUsers.mockReturnValue(
      hookState({
        data: {
          items: [
            {
              id: "user-42",
              name: "Jordan Smith",
              email: "jordan@talentx.com",
              role: "Talent",
              isVerified: true,
              status: "Active",
              createdAt: "2026-01-16T00:00:00Z",
            },
          ],
          page: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
        },
      })
    );
    const mutateAsync = jest.fn();
    mockedUseUpdateUserAccountStatus.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateUserAccountStatus>);

    render(<UserManagementView />);

    fireEvent.click(screen.getByText("Deactivate"));
    expect(screen.getByRole("heading", { name: "Deactivate Account" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("heading", { name: "Deactivate Account" })).not.toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("shows the total user count in the pagination footer", () => {
    mockedUseAdminUsers.mockReturnValue(
      hookState({
        data: {
          items: [],
          page: 1,
          pageSize: 10,
          totalCount: 23,
          totalPages: 3,
        },
      })
    );

    render(<UserManagementView />);

    expect(screen.getByText("Showing 1-10 of 23 users")).toBeInTheDocument();
  });
});
