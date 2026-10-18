export interface PendingEmployer {
  id: string;
  name: string;
  email: string;
  companyName: string;
  verificationStatus: string;
  rejectionReason: string | null;
  createdAt: string;
}

export interface EmployerDetail {
  id: string;
  userId: string;
  name: string;
  email: string;
  companyName: string;
  verificationStatus: string;
  rejectionReason: string | null;
  verifiedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface EmployerVerificationQueryParams {
  searchQuery?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}
