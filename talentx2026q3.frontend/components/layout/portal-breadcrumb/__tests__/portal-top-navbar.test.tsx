import React from "react";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import {
  PortalTopNavbar,
  PortalBreadcrumbProvider,
  useSetDynamicBreadcrumbs,
} from "../index";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

function CustomBreadcrumbSetter({
  breadcrumbs,
}: {
  breadcrumbs: string[];
}) {
  useSetDynamicBreadcrumbs(breadcrumbs);
  return null;
}

describe("PortalTopNavbar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/dashboard");
  });

  it("renders breadcrumb list from current path", () => {
    mockUsePathname.mockReturnValue("/job/job-listing");

    render(
      <PortalBreadcrumbProvider>
        <PortalTopNavbar />
      </PortalBreadcrumbProvider>
    );

    const headerRegion = screen.getByRole("region", {
      name: "Portal Navigation",
    });
    expect(headerRegion).toBeInTheDocument();

    const breadcrumbNav = screen.getByRole("navigation", {
      name: "Breadcrumb",
    });
    expect(breadcrumbNav).toBeInTheDocument();

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(1);
    expect(listItems[0]).toHaveTextContent("My Jobs");
  });

  it("renders terminal item with aria-current page and distinct styling", () => {
    mockUsePathname.mockReturnValue(
      "/job/job-listing/11111111-2222-3333-4444-555555555555"
    );

    render(
      <PortalBreadcrumbProvider>
        <PortalTopNavbar />
      </PortalBreadcrumbProvider>
    );

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(2);

    const firstSegmentSpan = screen.getByText("My Jobs");
    const terminalSegmentSpan = screen.getByText("Job Details");

    expect(firstSegmentSpan).not.toHaveAttribute("aria-current");
    expect(firstSegmentSpan).toHaveClass("text-muted-foreground");

    expect(terminalSegmentSpan).toHaveAttribute("aria-current", "page");
    expect(terminalSegmentSpan).toHaveClass("font-semibold", "text-foreground");
  });

  it("renders ChevronRight separators between segments in multi-segment trails", () => {
    mockUsePathname.mockReturnValue(
      "/job/job-listing/11111111-2222-3333-4444-555555555555/applicant"
    );

    const { container } = render(
      <PortalBreadcrumbProvider>
        <PortalTopNavbar />
      </PortalBreadcrumbProvider>
    );

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(3);

    const separators = container.querySelectorAll("svg");
    expect(separators).toHaveLength(2);
  });

  it("handles custom breadcrumbs provided through context", () => {
    mockUsePathname.mockReturnValue("/job/job-listing/123");

    render(
      <PortalBreadcrumbProvider>
        <CustomBreadcrumbSetter
          breadcrumbs={["Jobs", "Senior Engineer", "Review"]}
        />
        <PortalTopNavbar />
      </PortalBreadcrumbProvider>
    );

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(3);
    expect(listItems[0]).toHaveTextContent("Jobs");
    expect(listItems[1]).toHaveTextContent("Senior Engineer");
    expect(listItems[2]).toHaveTextContent("Review");

    const terminalSegmentSpan = screen.getByText("Review");
    expect(terminalSegmentSpan).toHaveAttribute("aria-current", "page");
  });

  it("renders children in the right-side action area", () => {
    render(
      <PortalBreadcrumbProvider>
        <PortalTopNavbar>
          <button data-testid="test-action-button">Action</button>
        </PortalTopNavbar>
      </PortalBreadcrumbProvider>
    );

    const actionButton = screen.getByTestId("test-action-button");
    expect(actionButton).toBeInTheDocument();
    expect(actionButton.parentElement).toHaveClass(
      "flex",
      "items-center",
      "gap-3"
    );
  });
});
