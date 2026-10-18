import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserTable } from "../UserTable";
import type { AdminUserListItem } from "../../types/user";

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

function buildUser(overrides: Partial<AdminUserListItem> = {}): AdminUserListItem {
  return {
    id: "user-1",
    name: "Jordan Smith",
    email: "jordan@talentx.com",
    role: "Talent",
    isVerified: true,
    status: "Active",
    createdAt: "2026-01-16T00:00:00Z",
    ...overrides,
  };
}

describe("UserTable", () => {
  it("renders skeleton rows while loading", () => {
    const { container } = render(
      <UserTable items={[]} isLoading onView={jest.fn()} onRequestStatusChange={jest.fn()} />
    );
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders an empty state when there are no items", () => {
    render(
      <UserTable items={[]} isLoading={false} onView={jest.fn()} onRequestStatusChange={jest.fn()} />
    );
    expect(screen.getByText("No matching users found.")).toBeInTheDocument();
  });

  it("renders user rows with role and account status", () => {
    render(
      <UserTable
        items={[
          buildUser({ role: "Talent", status: "Active" }),
          buildUser({ id: "user-2", name: "Acme Employer", email: "acme@talentx.com", role: "Employer", status: "Deactivated" }),
        ]}
        isLoading={false}
        onView={jest.fn()}
        onRequestStatusChange={jest.fn()}
      />
    );

    expect(screen.getByText("Jordan Smith")).toBeInTheDocument();
    expect(screen.getByText("jordan@talentx.com")).toBeInTheDocument();
    expect(screen.getByText("Talent")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    expect(screen.getByText("Acme Employer")).toBeInTheDocument();
    expect(screen.getByText("Employer")).toBeInTheDocument();
    expect(screen.getByText("Deactivated")).toBeInTheDocument();
  });

  it("formats the registered date as a readable string", () => {
    render(
      <UserTable
        items={[buildUser({ createdAt: "2026-01-16T00:00:00Z" })]}
        isLoading={false}
        onView={jest.fn()}
        onRequestStatusChange={jest.fn()}
      />
    );
    expect(screen.getByText("January 16, 2026")).toBeInTheDocument();
  });

  it("calls onView with the row's id when the View action is clicked", () => {
    const onView = jest.fn();
    render(
      <UserTable
        items={[buildUser({ id: "user-42" })]}
        isLoading={false}
        onView={onView}
        onRequestStatusChange={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "View details for Jordan Smith" }));

    expect(onView).toHaveBeenCalledWith("user-42");
  });

  it("shows a Deactivate action for an Active user and calls onRequestStatusChange with Deactivated", () => {
    const onRequestStatusChange = jest.fn();
    render(
      <UserTable
        items={[buildUser({ id: "user-42", status: "Active" })]}
        isLoading={false}
        onView={jest.fn()}
        onRequestStatusChange={onRequestStatusChange}
      />
    );

    fireEvent.click(screen.getByText("Deactivate"));

    expect(onRequestStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-42" }),
      "Deactivated"
    );
  });

  it("shows an Activate action for a Deactivated user and calls onRequestStatusChange with Active", () => {
    const onRequestStatusChange = jest.fn();
    render(
      <UserTable
        items={[buildUser({ id: "user-42", status: "Deactivated" })]}
        isLoading={false}
        onView={jest.fn()}
        onRequestStatusChange={onRequestStatusChange}
      />
    );

    fireEvent.click(screen.getByText("Activate"));

    expect(onRequestStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-42" }),
      "Active"
    );
  });

  it("disables the action menu for Guest rows instead of showing status actions", () => {
    render(
      <UserTable
        items={[buildUser({ id: "guest-1", name: "Guest User", role: "Guest" })]}
        isLoading={false}
        onView={jest.fn()}
        onRequestStatusChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText("More actions for Guest User (unavailable)")).toBeDisabled();
    expect(screen.queryByText("Deactivate")).not.toBeInTheDocument();
    expect(screen.queryByText("Activate")).not.toBeInTheDocument();
  });

  it("does not open the detail drawer when the action menu is clicked", () => {
    const onView = jest.fn();
    render(
      <UserTable
        items={[buildUser({ id: "user-42", status: "Active" })]}
        isLoading={false}
        onView={onView}
        onRequestStatusChange={jest.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText("More actions for Jordan Smith"));

    expect(onView).not.toHaveBeenCalled();
  });
});
