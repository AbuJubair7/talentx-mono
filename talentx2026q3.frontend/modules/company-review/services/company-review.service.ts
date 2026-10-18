import { apiClient } from '@/lib/api/axios';
import { COMPANY_REVIEW_ENDPOINTS } from '../constants/company-review.constants';
import type {
  CompanyReviewActionResponse,
  GetMyCompanyReviewsQueryParams,
  GetPublicCompanyReviewsQueryParams,
  MyCompanyReviewItemDto,
  PaginatedCompanyReviewList,
  PublicCompanyReviewDto,
  SubmitCompanyReviewPayload,
  UpdateCompanyReviewPayload,
} from '../types/company-review.types';

export const companyReviewService = {
  getMyReviews: async (
    params?: GetMyCompanyReviewsQueryParams,
    signal?: AbortSignal
  ): Promise<PaginatedCompanyReviewList<MyCompanyReviewItemDto>> => {
    const { data } = await apiClient.get<PaginatedCompanyReviewList<MyCompanyReviewItemDto>>(
      COMPANY_REVIEW_ENDPOINTS.myReviews(),
      { params, signal }
    );
    return data;
  },

  /** Resolves to the id of the newly created review. */
  submit: async (payload: SubmitCompanyReviewPayload): Promise<string> => {
    const { data } = await apiClient.post<string>(COMPANY_REVIEW_ENDPOINTS.myReviews(), payload);
    return data;
  },

  update: async (
    reviewId: string,
    payload: UpdateCompanyReviewPayload
  ): Promise<CompanyReviewActionResponse> => {
    const { data } = await apiClient.put<CompanyReviewActionResponse>(
      COMPANY_REVIEW_ENDPOINTS.review(reviewId),
      payload
    );
    return data ?? {};
  },

  withdraw: async (reviewId: string): Promise<CompanyReviewActionResponse> => {
    const { data } = await apiClient.post<CompanyReviewActionResponse>(
      COMPANY_REVIEW_ENDPOINTS.withdraw(reviewId)
    );
    return data ?? {};
  },

  getPublicReviews: async (
    companyId: string,
    params?: GetPublicCompanyReviewsQueryParams,
    signal?: AbortSignal
  ): Promise<PaginatedCompanyReviewList<PublicCompanyReviewDto>> => {
    const { data } = await apiClient.get<PaginatedCompanyReviewList<PublicCompanyReviewDto>>(
      COMPANY_REVIEW_ENDPOINTS.publicReviews(companyId),
      { params, signal }
    );
    return data;
  },
};
