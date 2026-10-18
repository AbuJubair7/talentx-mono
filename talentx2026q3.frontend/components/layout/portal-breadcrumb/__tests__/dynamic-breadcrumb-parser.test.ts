import {
  formatSlugToTitleCase,
  isIdentifierSegment,
  parseBreadcrumbSegments,
} from "../dynamic-breadcrumb-parser";

describe("dynamic-breadcrumb-parser", () => {
  describe("isIdentifierSegment", () => {
    it("identifies standard UUID segments", () => {
      expect(
        isIdentifierSegment("11111111-2222-3333-4444-555555555555")
      ).toBe(true);
      expect(
        isIdentifierSegment("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d")
      ).toBe(true);
    });

    it("identifies numeric ID segments", () => {
      expect(isIdentifierSegment("999")).toBe(true);
      expect(isIdentifierSegment("123456")).toBe(true);
      expect(isIdentifierSegment("0")).toBe(true);
    });

    it("identifies long hexadecimal hash ID segments", () => {
      expect(isIdentifierSegment("0123456789abcdef01234567")).toBe(true);
      expect(
        isIdentifierSegment("abcdef0123456789abcdef0123456789abcdef01")
      ).toBe(true);
    });

    it("returns false for non-identifier route slugs", () => {
      expect(isIdentifierSegment("dashboard")).toBe(false);
      expect(isIdentifierSegment("job-listing")).toBe(false);
      expect(isIdentifierSegment("edit")).toBe(false);
      expect(isIdentifierSegment("create-organizations")).toBe(false);
      expect(isIdentifierSegment("custom-reports")).toBe(false);
    });
  });

  describe("formatSlugToTitleCase", () => {
    it("formats kebab-case, snake_case, and camelCase into title-cased words", () => {
      expect(formatSlugToTitleCase("create-organizations")).toBe(
        "Create Organizations"
      );
      expect(formatSlugToTitleCase("custom_reports")).toBe("Custom Reports");
      expect(formatSlugToTitleCase("audit-log")).toBe("Audit Log");
      expect(formatSlugToTitleCase("monthly")).toBe("Monthly");
    });

    it("uppercases common technical acronyms", () => {
      expect(formatSlugToTitleCase("ai-matching")).toBe("AI Matching");
      expect(formatSlugToTitleCase("api-keys")).toBe("API Keys");
      expect(formatSlugToTitleCase("ui-components")).toBe("UI Components");
      expect(formatSlugToTitleCase("job-id")).toBe("Job ID");
      expect(formatSlugToTitleCase("redirect-url")).toBe("Redirect URL");
    });

    it("handles empty or falsy inputs gracefully", () => {
      expect(formatSlugToTitleCase("")).toBe("");
    });
  });

  describe("parseBreadcrumbSegments", () => {
    it("parses /admin/dashboard to ['Admin', 'Dashboard']", () => {
      expect(parseBreadcrumbSegments("/admin/dashboard")).toEqual([
        "Admin",
        "Dashboard",
      ]);
    });

    it("parses /admin/audit-log to ['Admin', 'Audit Log']", () => {
      expect(parseBreadcrumbSegments("/admin/audit-log")).toEqual([
        "Admin",
        "Audit Log",
      ]);
    });

    it("parses /dashboard to ['Dashboard']", () => {
      expect(parseBreadcrumbSegments("/dashboard")).toEqual(["Dashboard"]);
    });

    it("parses root / and empty string to ['Dashboard']", () => {
      expect(parseBreadcrumbSegments("/")).toEqual(["Dashboard"]);
      expect(parseBreadcrumbSegments("")).toEqual(["Dashboard"]);
    });

    it("parses /job/job-listing to ['My Jobs']", () => {
      expect(parseBreadcrumbSegments("/job/job-listing")).toEqual(["My Jobs"]);
    });

    it("parses /job/[id]/edit with UUID to ['My Jobs', 'Edit Jobs']", () => {
      expect(
        parseBreadcrumbSegments(
          "/job/11111111-2222-3333-4444-555555555555/edit"
        )
      ).toEqual(["My Jobs", "Edit Jobs"]);
    });

    it("parses /job/[id]/edit with numeric ID to ['My Jobs', 'Edit Jobs']", () => {
      expect(parseBreadcrumbSegments("/job/999/edit")).toEqual([
        "My Jobs",
        "Edit Jobs",
      ]);
    });

    it("parses /job/job-listing/[id] with UUID to ['My Jobs', 'Job Details']", () => {
      expect(
        parseBreadcrumbSegments(
          "/job/job-listing/11111111-2222-3333-4444-555555555555"
        )
      ).toEqual(["My Jobs", "Job Details"]);
    });

    it("parses /job/jobpost to ['Jobs', 'Post a Job']", () => {
      expect(parseBreadcrumbSegments("/job/jobpost")).toEqual([
        "Jobs",
        "Post a Job",
      ]);
    });

    it("parses /organizations/create-organizations to ['Organizations', 'Create Organizations']", () => {
      expect(
        parseBreadcrumbSegments("/organizations/create-organizations")
      ).toEqual(["Organizations", "Create Organizations"]);
    });

    it("parses /analytics/custom-reports/monthly to ['Analytics', 'Custom Reports', 'Monthly']", () => {
      expect(
        parseBreadcrumbSegments("/analytics/custom-reports/monthly")
      ).toEqual(["Analytics", "Custom Reports", "Monthly"]);
    });

    it("filters out UUIDs and numeric IDs in general non-job routes", () => {
      expect(
        parseBreadcrumbSegments(
          "/organizations/11111111-2222-3333-4444-555555555555"
        )
      ).toEqual(["Organizations"]);

      expect(
        parseBreadcrumbSegments(
          "/organizations/11111111-2222-3333-4444-555555555555/settings"
        )
      ).toEqual(["Organizations", "Settings"]);

      expect(
        parseBreadcrumbSegments("/analytics/999/custom-reports")
      ).toEqual(["Analytics", "Custom Reports"]);
    });

    it("filters out long hex hash IDs", () => {
      expect(
        parseBreadcrumbSegments("/users/0123456789abcdef01234567/profile")
      ).toEqual(["Users", "Profile"]);
    });

    it("handles query strings and hash anchors without polluting segments", () => {
      expect(
        parseBreadcrumbSegments("/job/job-listing?page=2&filter=active#section")
      ).toEqual(["My Jobs"]);
    });

    it("defaults to ['Dashboard'] if all route segments are filtered out identifiers", () => {
      expect(
        parseBreadcrumbSegments("/11111111-2222-3333-4444-555555555555")
      ).toEqual(["Dashboard"]);
    });
  });
});
