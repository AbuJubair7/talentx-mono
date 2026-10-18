import { apiClient } from "@/lib/api/axios";
import { EMPLOYER_VERIFICATION_CONSTANTS } from "../constants/employer-verification.constants";
import type {
  EmployerVerificationQueryParams,
  PaginatedList,
  PendingEmployer,
  EmployerDetail,
} from "../types/employer-verification";

export const employerVerificationService = {
  async getEmployers(
    params?: EmployerVerificationQueryParams
  ): Promise<PaginatedList<PendingEmployer>> {
    const { data } = await apiClient.get<PaginatedList<PendingEmployer>>("/admin/employers", {
      params: {
        searchTerm: params?.searchQuery,
        status: params?.status,
        page: params?.page ?? EMPLOYER_VERIFICATION_CONSTANTS.DEFAULT_PAGE_NUMBER,
        pageSize: params?.pageSize ?? EMPLOYER_VERIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE,
      },
    });
    return data;
  },

  async getEmployerDetails(id: string): Promise<EmployerDetail> {
    const { data } = await apiClient.get<EmployerDetail>(`/admin/employers/${id}`);
    return data;
  },

  async approveEmployer(id: string): Promise<void> {
    await apiClient.post(`/admin/employers/${id}/approve`);
  },

  async rejectEmployer(id: string, reason: string): Promise<void> {
    await apiClient.post(`/admin/employers/${id}/reject`, { reason });
  },
};
