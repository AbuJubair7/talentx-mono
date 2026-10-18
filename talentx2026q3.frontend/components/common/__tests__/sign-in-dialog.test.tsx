import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignInDialog } from "../sign-in-dialog";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: (...args: unknown[]) => mockPush(...args),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: () => null,
  }),
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) => (open ? <div role="dialog">{children}</div> : null),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
}));

describe("SignInDialog", () => {
  const onClose = jest.fn();
  const onViewChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderChoose = () =>
    render(
      <SignInDialog
        open
        view="choose"
        onViewChange={onViewChange}
        onClose={onClose}
      />
    );

  it("renders the sign-in role chooser with both options", () => {
    renderChoose();

    expect(
      screen.getByRole("heading", { name: /sign in to talentx/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in as employer/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in as talent/i })
    ).toBeInTheDocument();
  });

  it("redirects to the login page when choosing 'Sign in as Employer'", async () => {
    const user = userEvent.setup();
    renderChoose();

    await user.click(screen.getByRole("button", { name: /sign in as employer/i }));

    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(onClose).toHaveBeenCalled();
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("switches to the talent view when choosing 'Sign in as Talent'", async () => {
    const user = userEvent.setup();
    renderChoose();

    await user.click(screen.getByRole("button", { name: /sign in as talent/i }));

    expect(onViewChange).toHaveBeenCalledWith("talent");
    expect(mockPush).not.toHaveBeenCalled();
  });

  describe("talent view", () => {
    const renderTalent = () =>
      render(
        <SignInDialog
          open
          view="talent"
          onViewChange={onViewChange}
          onClose={onClose}
        />
      );

    it("asks whether the candidate already applied and has an account", () => {
      renderTalent();

      expect(
        screen.getByRole("heading", { name: /sign in as talent/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/did you apply for any job before and create an account/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /i already have an account/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /apply first/i })
      ).toBeInTheDocument();
    });

    it("goes back to the role chooser", async () => {
      const user = userEvent.setup();
      renderTalent();

      await user.click(screen.getByRole("button", { name: /back/i }));

      expect(onViewChange).toHaveBeenCalledWith("choose");
    });

    it("redirects to the login page when the candidate already has an account", async () => {
      const user = userEvent.setup();
      renderTalent();

      await user.click(
        screen.getByRole("button", { name: /i already have an account/i })
      );

      expect(mockPush).toHaveBeenCalledWith("/login");
      expect(onClose).toHaveBeenCalled();
    });

    it("sends the candidate to the jobs page to apply first", async () => {
      const user = userEvent.setup();
      renderTalent();

      await user.click(screen.getByRole("button", { name: /apply first/i }));

      expect(mockPush).toHaveBeenCalledWith("/jobs");
      expect(onClose).toHaveBeenCalled();
    });
  });
});
