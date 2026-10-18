import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchAdminUsers } from "../services/user.service";
import type { UsersQueryParams } from "../types/user";

export const adminUserKeys = {
  all: ["admin", "users"] as const,
  list: (params: UsersQueryParams) =>
    [...adminUserKeys.all, "list", params] as const,
  detail: (id: string) => [...adminUserKeys.all, "detail", id] as const,
  stats: () => [...adminUserKeys.all, "stats"] as const,
};

export function useAdminUsers(params: UsersQueryParams) {
  return useQuery({
    queryKey: adminUserKeys.list(params),
    queryFn: () => fetchAdminUsers(params),
    placeholderData: keepPreviousData,
  });
}
