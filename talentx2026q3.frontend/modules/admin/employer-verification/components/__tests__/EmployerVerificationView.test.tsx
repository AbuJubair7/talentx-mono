import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { EmployerVerificationView } from "../EmployerVerificationView";
import { usePendingEmployers } from "../../hooks/usePendingEmployers";
import { useEmployerDetails } from "../../hooks/useEmployerDetails";
import { useApproveEmployer } from "../../hooks/useApproveEmployer";
import { useRejectEmployer } from "../../hooks/useRejectEmployer";

jest.mock("../../hooks/usePendingEmployers", () => ({
  usePendingEmployers: jest.fn(),
}));

jest.mock("../../hooks/useEmployerDetails", () => ({
  useEmployerDetails: jest.fn(),
}));

jest.mock("../../hooks/useApproveEmployer", () => ({
  useApproveEmployer: jest.fn(),
}));

jest.mock("../../hooks/useRejectEmployer", () => ({
  useRejectEmployer: jest.fn(),
}));

const mockUsePendingEmployers = usePendingEmployers as jest.MockedFunction<typeof usePendingEmployers>;
const mockUseEmployerDetails = useEmployerDetails as jest.MockedFunction<typeof useEmployerDetails>;
const mockUseApproveEmployer = useApproveEmployer as jest.MockedFunction<typeof useApproveEmployer>;
const mockUseRejectEmployer = useRejectEmployer as jest.MockedFunction<typeof useRejectEmployer>;

describe("EmployerVerificationView Component", () => {
  const mockApproveMutateAsync = jest.fn();
  const mockRejectMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseApproveEmployer.mockReturnValue({
      mutateAsync: mockApproveMutateAsync,
      isPending: false,
    } as any);

    mockUseRejectEmployer.mockReturnValue({
      mutateAsync: mockRejectMutateAsync,
      isPending: false,
    } as any);

    mockUseEmployerDetails.mockReturnValue({
      data: {
        id: "emp-1",
        userId: "user-1",
        name: "Acme Hiring",
        email: "hr@acme.com",
        companyName: "Acme Corp",
        verificationStatus: "PendingVerification",
        rejectionReason: null,
        verifiedAt: null,
        rejectedAt: null,
        createdAt: "2026-03-01T00:00:00Z",
        updatedAt: null,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    mockUsePendingEmployers.mockReturnValue({
      data: {
        items: [
          {
            id: "emp-1",
            name: "Acme Hiring",
            email: "hr@acme.com",
            companyName: "Acme Corp",
            verificationStatus: "PendingVerification",
            rejectionReason: null,
            createdAt: "2026-03-01T00:00:00Z",
          },
          {
            id: "emp-2",
            name: "Globex HR",
            email: "jobs@globex.com",
            companyName: "Globex Industries",
            verificationStatus: "Verified",
            rejectionReason: null,
            createdAt: "2026-02-15T00:00:00Z",
          },
        ],
        page: 1,
        pageSize: 10,
        totalCount: 2,
      },
      isLoading: false,
    } as any);
  });

  it("renders page header, search bar, status dropdown, and employer rows with styled review buttons", () => {
    render(<EmployerVerificationView />);

    expect(
      screen.getByRole("heading", { name: "Employer Verification", level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Review and verify employer accounts and onboarding requests.")
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Search by name, email, or company...")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Filter by verification status" })).toBeInTheDocument();

    expect(screen.getByText("Acme Hiring")).toBeInTheDocument();
    expect(screen.getByText("hr@acme.com")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getAllByText("Pending Verification").length).toBeGreaterThan(0);

    expect(screen.getByText("Globex HR")).toBeInTheDocument();
    expect(screen.getByText("jobs@globex.com")).toBeInTheDocument();
    expect(screen.getByText("Globex Industries")).toBeInTheDocument();
    expect(screen.getAllByText("Verified").length).toBeGreaterThan(0);

    // Verify styled buttons
    const reviewBtn = screen.getByRole("button", { name: /^Review$/i });
    expect(reviewBtn).toBeInTheDocument();

    const viewDetailsBtn = screen.getByRole("button", { name: /^View Details$/i });
    expect(viewDetailsBtn).toBeInTheDocument();
  });

  it("opens employer detail modal when Review button is clicked and allows approving", async () => {
    render(<EmployerVerificationView />);

    const reviewBtn = screen.getByRole("button", { name: /^Review$/i });
    fireEvent.click(reviewBtn);

    expect(screen.getByRole("heading", { name: "Employer Details" })).toBeInTheDocument();
    expect(screen.getByText("Review employer account credentials and verification status")).toBeInTheDocument();

    const approveButton = screen.getByRole("button", { name: /approve employer/i });
    expect(approveButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(approveButton);
    });
    expect(mockApproveMutateAsync).toHaveBeenCalledWith("emp-1");
  });

  it("shows rejection reason textarea and allows rejecting with a reason inside employer detail modal", async () => {
    render(<EmployerVerificationView />);

    const reviewBtn = screen.getByRole("button", { name: /^Review$/i });
    fireEvent.click(reviewBtn);

    const reasonInput = screen.getByPlaceholderText(/provide a reason for rejection/i);
    expect(reasonInput).toBeInTheDocument();

    const rejectButton = screen.getByRole("button", { name: /reject employer/i });
    expect(rejectButton).toBeInTheDocument();

    // Test rejection without reason
    fireEvent.click(rejectButton);
    expect(screen.getByText("Please provide a reason for rejection.")).toBeInTheDocument();
    expect(mockRejectMutateAsync).not.toHaveBeenCalled();

    // Fill reason and submit
    fireEvent.change(reasonInput, { target: { value: "Invalid business registration number" } });
    await act(async () => {
      fireEvent.click(rejectButton);
    });
    expect(mockRejectMutateAsync).toHaveBeenCalledWith({
      id: "emp-1",
      reason: "Invalid business registration number",
    });
  });

  it("filters employers when status dropdown is changed", () => {
    render(<EmployerVerificationView />);

    const statusSelect = screen.getByRole("combobox", { name: "Filter by verification status" });
    fireEvent.change(statusSelect, { target: { value: "PendingVerification" } });

    expect(mockUsePendingEmployers).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: "PendingVerification" })
    );
  });
});
