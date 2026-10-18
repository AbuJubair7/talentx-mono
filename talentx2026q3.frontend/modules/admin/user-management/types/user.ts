import type { PaginatedList } from "@/modules/admin/audit-log/types/audit-log";

export type AdminUserRole = "Talent" | "Employer" | "Guest";
export type AdminAccountStatus = "Active" | "Deactivated";

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  isVerified: boolean;
  status: AdminAccountStatus;
  createdAt: string;
}

export interface AdminTalentDetailsSection {
  tagline: string | null;
  shortBio: string | null;
  location: string | null;
  phone: string | null;
  linkedInUrl: string | null;
  additionalUrls: string[];
  totalYearsExperience: number | null;
  expectedSalary: number | null;
  skillPropositions: string[];
  technicalSkills: string[];
  softSkills: string[];
  toolsAndPlatforms: string[];
}

export interface AdminEmployerDetailsSection {
  companyName: string;
  verificationStatus: 'PendingVerification' | 'Verified' | 'Rejected';
}

export interface AdminUserDetails extends AdminUserListItem {
  talentDetails: AdminTalentDetailsSection | null;
  employerDetails: AdminEmployerDetailsSection | null;
}

export interface AdminUserStats {
  totalUsers: number;
  talentsCount: number;
  employersCount: number;
  guestsCount: number;
  deactivatedCount: number;
}

export interface UsersQueryParams {
  searchQuery?: string;
  role?: AdminUserRole;
  status?: AdminAccountStatus;
  page?: number;
  pageSize?: number;
}

export interface StatusUpdateResponse {
  message?: string;
}

export type { PaginatedList };
