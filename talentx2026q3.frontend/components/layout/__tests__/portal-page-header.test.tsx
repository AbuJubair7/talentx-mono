import React from "react";
import { render, screen } from "@testing-library/react";
import { PortalPageHeader } from "../portal-page-header";

describe("PortalPageHeader Component", () => {
  it("renders title in h1 element", () => {
    render(
      <PortalPageHeader title="Page Title" />
    );

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Page Title");
    expect(h1).toHaveClass("text-xl");
    expect(h1).toHaveClass("font-bold");
    expect(h1).toHaveClass("tracking-tight");
    expect(h1).toHaveClass("text-zinc-900");
    expect(h1).toHaveClass("sm:text-[28px]");
    expect(h1).toHaveClass("dark:text-zinc-100");
  });

  it("renders subtitle when provided", () => {
    render(
      <PortalPageHeader title="Page Title" subtitle="Page Subtitle" />
    );

    expect(screen.getByText("Page Subtitle")).toBeInTheDocument();
    const subtitle = screen.getByText("Page Subtitle");
    expect(subtitle).toHaveClass("mt-1.5");
    expect(subtitle).toHaveClass("text-sm");
    expect(subtitle).toHaveClass("text-zinc-500");
    expect(subtitle).toHaveClass("dark:text-zinc-400");
  });

  it("does not render subtitle element when not provided", () => {
    render(<PortalPageHeader title="Page Title" />);

    expect(screen.queryByText("Page Subtitle")).not.toBeInTheDocument();
  });

  it("renders eyebrow when provided", () => {
    render(
      <PortalPageHeader title="Page Title" eyebrow="Eyebrow Text" />
    );

    const eyebrowText = screen.getByText("Eyebrow Text");
    expect(eyebrowText).toBeInTheDocument();
    const eyebrowDiv = eyebrowText.closest("div.mb-1");
    expect(eyebrowDiv).toBeInTheDocument();
    expect(eyebrowDiv).toHaveClass("mb-1");
  });

  it("does not render eyebrow element when not provided", () => {
    render(<PortalPageHeader title="Page Title" />);

    expect(screen.queryByText("Eyebrow Text")).not.toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    const actions = (
      <button type="button" data-testid="action-button">
        Action
      </button>
    );

    render(<PortalPageHeader title="Page Title" actions={actions} />);

    expect(screen.getByTestId("action-button")).toBeInTheDocument();
    const actionsContainer = screen.getByTestId("action-button").parentElement;
    expect(actionsContainer).toHaveClass("flex");
    expect(actionsContainer).toHaveClass("flex-wrap");
    expect(actionsContainer).toHaveClass("items-center");
    expect(actionsContainer).toHaveClass("gap-3");
    expect(actionsContainer).toHaveClass("min-w-0");
    expect(actionsContainer).not.toHaveClass("shrink-0");
  });

  it("does not render actions container when not provided", () => {
    render(<PortalPageHeader title="Page Title" />);

    const actionsContainer = screen.queryByText("Action");
    expect(actionsContainer).not.toBeInTheDocument();
  });

  it("applies custom className to header", () => {
    const { container } = render(
      <PortalPageHeader title="Page Title" className="custom-header-class" />
    );

    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass("custom-header-class");
    expect(header).toHaveClass("mb-8");
    expect(header).toHaveClass("flex");
    expect(header).toHaveClass("flex-col");
    expect(header).toHaveClass("flex-wrap");
    expect(header).toHaveClass("gap-4");
    expect(header).toHaveClass("sm:flex-row");
    expect(header).toHaveClass("sm:items-start");
    expect(header).toHaveClass("sm:justify-between");
  });

  it("renders ReactNode title correctly", () => {
    render(
      <PortalPageHeader title={<span data-testid="title-span">Rich Title</span>} />
    );

    expect(screen.getByTestId("title-span")).toBeInTheDocument();
  });

  it("renders ReactNode subtitle correctly", () => {
    render(
      <PortalPageHeader
        title="Page Title"
        subtitle={<span data-testid="subtitle-span">Rich Subtitle</span>}
      />
    );

    expect(screen.getByTestId("subtitle-span")).toBeInTheDocument();
  });

  it("renders ReactNode eyebrow correctly", () => {
    render(
      <PortalPageHeader
        title="Page Title"
        eyebrow={<span data-testid="eyebrow-span">Rich Eyebrow</span>}
      />
    );

    expect(screen.getByTestId("eyebrow-span")).toBeInTheDocument();
  });

  it("renders ReactNode actions correctly", () => {
    const actions = (
      <>
        <button type="button" data-testid="action-1">
          Action 1
        </button>
        <button type="button" data-testid="action-2">
          Action 2
        </button>
      </>
    );

    render(<PortalPageHeader title="Page Title" actions={actions} />);

    expect(screen.getByTestId("action-1")).toBeInTheDocument();
    expect(screen.getByTestId("action-2")).toBeInTheDocument();
  });
});