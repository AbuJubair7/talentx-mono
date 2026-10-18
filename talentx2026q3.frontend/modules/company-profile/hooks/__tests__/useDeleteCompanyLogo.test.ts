import { renderHook, waitFor } from "@testing-library/react";

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper";

import { useDeleteCompanyLogo } from "../useDeleteCompanyLogo";
import { companyProfileService } from "../../services/company-profile.service";

jest.mock("../../services/company-profile.service");
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedService = companyProfileService as jest.Mocked<typeof companyProfileService>;

describe("useDeleteCompanyLogo", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("calls deleteCompanyLogo and reports success", async () => {
    mockedService.deleteCompanyLogo.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteCompanyLogo(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedService.deleteCompanyLogo).toHaveBeenCalledTimes(1);
  });

  it("surfaces a mutation error", async () => {
    mockedService.deleteCompanyLogo.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useDeleteCompanyLogo(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
