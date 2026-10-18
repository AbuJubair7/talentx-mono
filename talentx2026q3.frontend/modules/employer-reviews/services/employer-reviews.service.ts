import { apiClient } from '@/lib/api/axios';
import { EMPLOYER_REVIEW_ENDPOINTS } from '../constants/employer-reviews.constants';
import type {
  EmployerCompanyReviewDto,
  EmployerCompanyReviewSummaryDto,
  GetEmployerCompanyReviewsQueryParams,
  PaginatedEmployerCompanyReviewList,
} from '../types/employer-reviews.types';

export const employerReviewsService = {
  getReviews: async (
    params?: GetEmployerCompanyReviewsQueryParams,
    signal?: AbortSignal
  ): Promise<PaginatedEmployerCompanyReviewList<EmployerCompanyReviewDto>> => {
    const { data } = await apiClient.get<PaginatedEmployerCompanyReviewList<EmployerCompanyReviewDto>>(
      EMPLOYER_REVIEW_ENDPOINTS.reviews(),
      { params, signal }
    );
    return data;
  },

  getSummary: async (signal?: AbortSignal): Promise<EmployerCompanyReviewSummaryDto> => {
    const { data } = await apiClient.get<EmployerCompanyReviewSummaryDto>(
      EMPLOYER_REVIEW_ENDPOINTS.summary(),
      { signal }
    );
    return data;
  },
};
