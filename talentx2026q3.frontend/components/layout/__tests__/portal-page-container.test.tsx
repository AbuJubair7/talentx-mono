import React from "react";
import { render, screen } from "@testing-library/react";
import { PortalPageContainer } from "../portal-page-container";

describe("PortalPageContainer Component", () => {
  it("renders children correctly", () => {
    render(
      <PortalPageContainer>
        <div data-testid="test-content">Test Content</div>
      </PortalPageContainer>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("applies default container classes", () => {
    const { container } = render(
      <PortalPageContainer>
        <div>Content</div>
      </PortalPageContainer>
    );

    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass("relative");
    expect(outerDiv).toHaveClass("px-6");
    expect(outerDiv).toHaveClass("py-6");
    expect(outerDiv).toHaveClass("lg:px-8");

    const innerDiv = outerDiv.firstChild as HTMLElement;
    expect(innerDiv).toHaveClass("mx-auto");
    expect(innerDiv).toHaveClass("w-full");
    expect(innerDiv).not.toHaveClass("max-w-7xl");
  });

  it("applies custom containerClassName to outer div", () => {
    const { container } = render(
      <PortalPageContainer containerClassName="custom-outer-class">
        <div>Content</div>
      </PortalPageContainer>
    );

    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass("custom-outer-class");
  });

  it("applies custom className to inner div", () => {
    const { container } = render(
      <PortalPageContainer className="custom-inner-class">
        <div>Content</div>
      </PortalPageContainer>
    );

    const outerDiv = container.firstChild as HTMLElement;
    const innerDiv = outerDiv.firstChild as HTMLElement;
    expect(innerDiv).toHaveClass("custom-inner-class");
  });

  it("applies both custom className and containerClassName", () => {
    const { container } = render(
      <PortalPageContainer
        className="custom-inner"
        containerClassName="custom-outer"
      >
        <div>Content</div>
      </PortalPageContainer>
    );

    const outerDiv = container.firstChild as HTMLElement;
    const innerDiv = outerDiv.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass("custom-outer");
    expect(innerDiv).toHaveClass("custom-inner");
  });
});