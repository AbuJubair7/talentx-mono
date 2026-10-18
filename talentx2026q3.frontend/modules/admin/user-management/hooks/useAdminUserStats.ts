import { useQuery } from "@tanstack/react-query";
import { fetchAdminUserStats } from "../services/user.service";
import { adminUserKeys } from "./useAdminUsers";

export function useAdminUserStats() {
  return useQuery({
    queryKey: adminUserKeys.stats(),
    queryFn: () => fetchAdminUserStats(),
  });
}
