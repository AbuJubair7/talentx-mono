import { useQuery } from "@tanstack/react-query";
import { fetchAdminUserDetails } from "../services/user.service";
import { adminUserKeys } from "./useAdminUsers";

export function useAdminUserDetails(id: string | undefined) {
  return useQuery({
    queryKey: adminUserKeys.detail(id ?? ""),
    queryFn: () => fetchAdminUserDetails(id as string),
    enabled: Boolean(id),
  });
}
