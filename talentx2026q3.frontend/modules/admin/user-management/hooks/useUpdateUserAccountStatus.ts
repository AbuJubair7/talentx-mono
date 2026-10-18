"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/api/axios";
import { auditLogKeys } from "@/modules/admin/audit-log/hooks/use-audit-logs";
import { updateUserAccountStatus } from "../services/user.service";
import { adminUserKeys } from "./useAdminUsers";
import type { AdminAccountStatus } from "../types/user";

export function useUpdateUserAccountStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: AdminAccountStatus }) =>
      updateUserAccountStatus(id, newStatus),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.stats() });
      queryClient.invalidateQueries({ queryKey: auditLogKeys.all });
      toast.success(_data.message);
    },
    onError: (mutationError: ApiError | Error) => {
      toast.error(mutationError.message || "Failed to update account status.");
    },
  });
}
