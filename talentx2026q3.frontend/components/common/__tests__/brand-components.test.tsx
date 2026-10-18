import { render, screen } from "@testing-library/react";
import { BrandLogo } from "@/components/common/brand-logo";
import { BrandIcon } from "@/components/common/brand-icon";

describe("BrandLogo Component", () => {
  it("renders with default accessibility attributes and emerald styling", () => {
    render(<BrandLogo />);
    const logoElement = screen.getByRole("img", { name: "TalentX" });
    expect(logoElement).toBeInTheDocument();
    expect(logoElement).toHaveAttribute("viewBox", "0 0 176 48");
    expect(logoElement).toHaveAttribute("preserveAspectRatio", "xMinYMid meet");
    expect(logoElement).toHaveClass("text-emerald-700");
  });

  it("applies custom class names while preserving accessibility attributes", () => {
    render(<BrandLogo className="h-8 w-auto custom-class" />);
    const logoElement = screen.getByRole("img", { name: "TalentX" });
    expect(logoElement).toHaveClass("h-8");
    expect(logoElement).toHaveClass("w-auto");
    expect(logoElement).toHaveClass("custom-class");
  });

  it("allows overriding preserveAspectRatio prop", () => {
    render(<BrandLogo preserveAspectRatio="xMidYMid slice" />);
    const logoElement = screen.getByRole("img", { name: "TalentX" });
    expect(logoElement).toHaveAttribute("preserveAspectRatio", "xMidYMid slice");
  });
});

describe("BrandIcon Component", () => {
  it("renders with default accessibility attributes and emerald styling", () => {
    render(<BrandIcon />);
    const iconElement = screen.getByRole("img", { name: "TalentX Icon" });
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveAttribute("viewBox", "0 0 48 48");
    expect(iconElement).toHaveClass("text-emerald-700");
  });

  it("applies custom class names while preserving accessibility attributes", () => {
    render(<BrandIcon className="size-8 custom-icon-class" />);
    const iconElement = screen.getByRole("img", { name: "TalentX Icon" });
    expect(iconElement).toHaveClass("size-8");
    expect(iconElement).toHaveClass("custom-icon-class");
  });
});
