export { UserManagementView } from "./components/UserManagementView";
export { UserStatsCards } from "./components/UserStatsCards";
export { UserTable } from "./components/UserTable";
export { UserDetailView } from "./components/UserDetailView";
export { UserStatusConfirmDialog } from "./components/UserStatusConfirmDialog";

export {
  fetchAdminUsers,
  fetchAdminUserDetails,
  fetchAdminUserStats,
  updateUserAccountStatus,
} from "./services/user.service";

export { useAdminUsers, adminUserKeys } from "./hooks/useAdminUsers";
export { useAdminUserDetails } from "./hooks/useAdminUserDetails";
export { useAdminUserStats } from "./hooks/useAdminUserStats";
export { useUpdateUserAccountStatus } from "./hooks/useUpdateUserAccountStatus";

export type {
  AdminUserRole,
  AdminAccountStatus,
  AdminUserListItem,
  AdminUserDetails,
  AdminTalentDetailsSection,
  AdminEmployerDetailsSection,
  AdminUserStats,
  UsersQueryParams,
  StatusUpdateResponse,
  PaginatedList,
} from "./types/user";
