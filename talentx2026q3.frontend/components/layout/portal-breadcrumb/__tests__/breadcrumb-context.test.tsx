import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import {
  PortalBreadcrumbProvider,
  usePortalBreadcrumbs,
  useSetDynamicBreadcrumbs,
} from "../index";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

function TestBreadcrumbConsumer() {
  const { breadcrumbs, setBreadcrumbs } = usePortalBreadcrumbs();

  return (
    <div>
      <ul data-testid="breadcrumb-list">
        {breadcrumbs.map((crumb, index) => (
          <li key={`${crumb}-${index}`}>{crumb}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setBreadcrumbs(["Custom", "Breadcrumbs"])}
      >
        Set Custom
      </button>
      <button type="button" onClick={() => setBreadcrumbs(null)}>
        Reset
      </button>
    </div>
  );
}

function TestDynamicSetter({
  breadcrumbs,
}: {
  breadcrumbs: string[] | null;
}) {
  useSetDynamicBreadcrumbs(breadcrumbs);
  return <div data-testid="setter-rendered">Setter Active</div>;
}

describe("breadcrumb-context", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/dashboard");
  });

  it("provides default parsed breadcrumbs from current pathname", () => {
    mockUsePathname.mockReturnValue("/job/job-listing");

    render(
      <PortalBreadcrumbProvider>
        <TestBreadcrumbConsumer />
      </PortalBreadcrumbProvider>
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent("My Jobs");
  });

  it("allows manual override via setBreadcrumbs and reset to default", async () => {
    const user = userEvent.setup();

    render(
      <PortalBreadcrumbProvider>
        <TestBreadcrumbConsumer />
      </PortalBreadcrumbProvider>
    );

    expect(screen.getByRole("listitem")).toHaveTextContent("Dashboard");

    await user.click(screen.getByRole("button", { name: "Set Custom" }));

    const updatedItems = screen.getAllByRole("listitem");
    expect(updatedItems).toHaveLength(2);
    expect(updatedItems[0]).toHaveTextContent("Custom");
    expect(updatedItems[1]).toHaveTextContent("Breadcrumbs");

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("listitem")).toHaveTextContent("Dashboard");
  });

  it("sets breadcrumbs on mount and clears on unmount using useSetDynamicBreadcrumbs", () => {
    mockUsePathname.mockReturnValue("/job/job-listing/11111111-2222-3333-4444-555555555555");

    const { rerender } = render(
      <PortalBreadcrumbProvider>
        <TestBreadcrumbConsumer />
        <TestDynamicSetter breadcrumbs={["Dynamic", "Job Title"]} />
      </PortalBreadcrumbProvider>
    );

    let items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Dynamic");
    expect(items[1]).toHaveTextContent("Job Title");

    rerender(
      <PortalBreadcrumbProvider>
        <TestBreadcrumbConsumer />
      </PortalBreadcrumbProvider>
    );

    items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("My Jobs");
    expect(items[1]).toHaveTextContent("Job Details");
  });
});
