import React from "react";
import { render, screen } from "@testing-library/react";
import { JobDetailView } from "../components/JobDetailView";
import type { JobDetails } from "../types/job.types";

const mockJob: JobDetails = {
  id: "job-1",
  title: "Full Stack Developer",
  companyName: "Acme Corp",
  description: "Job description text",
  location: "Dhaka",
  employmentType: "FullTime",
  experienceLevel: "Senior",
  workArrangement: "Remote",
  requiredSkills: ["React", "Node.js"],
  vacancies: 1,
  createdAt: "2026-01-01T00:00:00Z",
  expireAt: "2099-01-01T00:00:00Z",
  status: "Published",
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("../hooks/useJobDetails", () => ({
  useJobDetails: () => ({
    data: mockJob,
    isPending: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock("../hooks/useApplicationStatus", () => ({
  useApplicationStatus: () => ({
    data: { hasApplied: false },
    isLoading: false,
    isSuccess: true,
  }),
}));

jest.mock("@/modules/saved-jobs", () => ({
  useSavedJobIds: () => ({ data: new Set() }),
  useSaveJob: () => ({ mutate: jest.fn(), isPending: false }),
  useRemoveSavedJob: () => ({ mutate: jest.fn(), isPending: false }),
  SaveJobButton: () => <button type="button">Save Job</button>,
}));

const mockUseHeaderSession = jest.fn();
jest.mock("@/components/common/use-header-session", () => ({
  useHeaderSession: () => mockUseHeaderSession(),
}));

describe("JobDetailView — Apply button visibility based on viewer role", () => {
  beforeEach(() => {
    mockUseHeaderSession.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isTalent: false,
      isEmployer: false,
      isAdmin: false,
    });
  });

  it("renders Apply button for unauthenticated anonymous visitor", () => {
    render(
      <JobDetailView
        jobId="job-1"
        viewerIsAuthenticated={false}
        viewerIsTalent={false}
        viewerIsGuest={false}
        viewerIsEmployer={false}
        viewerIsAdmin={false}
      />
    );

    expect(screen.getByRole("link", { name: /apply for this role/i })).toBeInTheDocument();
  });

  it("renders Apply button for authenticated Talent", () => {
    mockUseHeaderSession.mockReturnValue({
      user: { role: "Talent" },
      isAuthenticated: true,
      isTalent: true,
      isEmployer: false,
      isAdmin: false,
    });

    render(
      <JobDetailView
        jobId="job-1"
        viewerIsAuthenticated={true}
        viewerIsTalent={true}
        viewerIsGuest={false}
        viewerIsEmployer={false}
        viewerIsAdmin={false}
      />
    );

    expect(screen.getByRole("link", { name: /apply for this role/i })).toBeInTheDocument();
  });

  it("renders Apply button for Guest viewer", () => {
    render(
      <JobDetailView
        jobId="job-1"
        viewerIsAuthenticated={true}
        viewerIsTalent={false}
        viewerIsGuest={true}
        viewerIsEmployer={false}
        viewerIsAdmin={false}
      />
    );

    expect(screen.getByRole("link", { name: /apply for this role/i })).toBeInTheDocument();
  });

  it("does NOT render Apply button for Employer viewer (from server props)", () => {
    render(
      <JobDetailView
        jobId="job-1"
        viewerIsAuthenticated={true}
        viewerIsTalent={false}
        viewerIsGuest={false}
        viewerIsEmployer={true}
        viewerIsAdmin={false}
      />
    );

    expect(screen.queryByRole("link", { name: /apply for this role/i })).not.toBeInTheDocument();
  });

  it("does NOT render Apply button for Admin viewer (from server props)", () => {
    render(
      <JobDetailView
        jobId="job-1"
        viewerIsAuthenticated={true}
        viewerIsTalent={false}
        viewerIsGuest={false}
        viewerIsEmployer={false}
        viewerIsAdmin={true}
      />
    );

    expect(screen.queryByRole("link", { name: /apply for this role/i })).not.toBeInTheDocument();
  });

  it("does NOT render Apply button when client session resolves to Employer", () => {
    mockUseHeaderSession.mockReturnValue({
      user: { role: "Employer" },
      isAuthenticated: true,
      isTalent: false,
      isEmployer: true,
      isAdmin: false,
    });

    render(
      <JobDetailView
        jobId="job-1"
        viewerIsAuthenticated={true}
        viewerIsTalent={false}
        viewerIsGuest={false}
      />
    );

    expect(screen.queryByRole("link", { name: /apply for this role/i })).not.toBeInTheDocument();
  });

  it("does NOT render Apply button when client session resolves to Admin", () => {
    mockUseHeaderSession.mockReturnValue({
      user: { role: "Admin" },
      isAuthenticated: true,
      isTalent: false,
      isEmployer: false,
      isAdmin: true,
    });

    render(
      <JobDetailView
        jobId="job-1"
        viewerIsAuthenticated={true}
        viewerIsTalent={false}
        viewerIsGuest={false}
      />
    );

    expect(screen.queryByRole("link", { name: /apply for this role/i })).not.toBeInTheDocument();
  });
});
