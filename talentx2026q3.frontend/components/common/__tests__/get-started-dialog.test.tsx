import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GetStartedDialog } from "../get-started-dialog";

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

describe("GetStartedDialog", () => {
  const onClose = jest.fn();
  const onViewChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderChoose = () =>
    render(
      <GetStartedDialog
        open
        view="choose"
        onViewChange={onViewChange}
        onClose={onClose}
      />
    );

  it("renders the role chooser with both options", () => {
    renderChoose();

    expect(
      screen.getByRole("heading", { name: /join talentx/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /i'm hiring/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /i'm looking for work/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /sign in/i })
    ).toHaveAttribute("href", "/login");
  });

  it("redirects to employer signup when choosing 'I'm hiring'", async () => {
    const user = userEvent.setup();
    renderChoose();

    await user.click(screen.getByRole("button", { name: /i'm hiring/i }));

    expect(mockPush).toHaveBeenCalledWith("/signup");
    expect(onClose).toHaveBeenCalled();
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("switches to the talent view when choosing 'I'm looking for work'", async () => {
    const user = userEvent.setup();
    renderChoose();

    await user.click(
      screen.getByRole("button", { name: /i'm looking for work/i })
    );

    expect(onViewChange).toHaveBeenCalledWith("talent");
    expect(mockPush).not.toHaveBeenCalled();
  });

  describe("talent view", () => {
    const renderTalent = () =>
      render(
        <GetStartedDialog
          open
          view="talent"
          onViewChange={onViewChange}
          onClose={onClose}
        />
      );

    it("shows the application-based account steps", () => {
      renderTalent();

      expect(
        screen.getByRole("heading", {
          name: /looking for a job\? no need to sign up!!/i,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /we'll create your talent account automatically after your first application/i
        )
      ).toBeInTheDocument();
      expect(screen.getByText(/find a role that fits/i)).toBeInTheDocument();
      expect(screen.getByText(/apply with your cv/i)).toBeInTheDocument();
      expect(
        screen.getByText(/your account is created, then you activate it/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/check the email we sent you/i)
      ).toBeInTheDocument();
    });

    it("goes back to the role chooser", async () => {
      const user = userEvent.setup();
      renderTalent();

      await user.click(screen.getByRole("button", { name: /back/i }));

      expect(onViewChange).toHaveBeenCalledWith("choose");
    });

    it("navigates to open roles when browsing", async () => {
      const user = userEvent.setup();
      renderTalent();

      await user.click(
        screen.getByRole("button", { name: /browse open roles/i })
      );

      expect(mockPush).toHaveBeenCalledWith("/jobs");
      expect(onClose).toHaveBeenCalled();
    });
  });
});
