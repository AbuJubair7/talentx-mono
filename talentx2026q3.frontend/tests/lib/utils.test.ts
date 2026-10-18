import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges single and multiple class strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles falsy and conditional values correctly", () => {
    expect(cn("base-class", false && "hidden", null, undefined, "", "active")).toBe(
      "base-class active"
    );
  });

  it("resolves Tailwind CSS conflicts using tailwind-merge", () => {
    expect(cn("px-2 text-sm", "px-4")).toBe("text-sm px-4");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("supports objects and arrays as inputs", () => {
    expect(cn(["font-bold", { "text-white": true, "opacity-50": false }])).toBe(
      "font-bold text-white"
    );
  });
});
