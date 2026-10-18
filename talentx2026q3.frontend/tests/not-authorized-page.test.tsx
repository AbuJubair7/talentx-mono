import React from "react";
import { render, screen } from "@testing-library/react";
import NotAuthorizedPage, { metadata } from "@/app/not-authorized/page";

describe("NotAuthorizedPage", () => {
  it("defines correct metadata", () => {
    expect(metadata).toEqual({
      title: "Access Restricted | TalentX",
      description: "You do not have the required permissions to view this page.",
    });
  });

  it("renders access restricted card with accessible content and navigation links", () => {
    render(<NotAuthorizedPage />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Access Restricted" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("You do not have the required permissions to view this page.")
    ).toBeInTheDocument();

    const dashboardLink = screen.getByRole("link", { name: "Go to Dashboard" });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");

    const loginLink = screen.getByRole("link", { name: "Return to Login" });
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
