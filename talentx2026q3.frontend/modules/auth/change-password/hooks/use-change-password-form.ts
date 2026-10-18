"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changePassword } from "../services/change-password.service";
import { changePasswordSchema, type ChangePasswordInput } from "../types";
import { toast } from "sonner";
import { logout } from "../../logout/services/logout.service";
import { clearWizardBackup } from "@/modules/jobposting/utils/wizard-backup";

export interface UseChangePasswordFormOptions {
  onSuccess?: () => void;
}

export function useChangePasswordForm(options?: UseChangePasswordFormOptions) {
  const queryClient = useQueryClient();

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (result) => {
      if (!result.success) return;
      queryClient.clear();
      clearWizardBackup();
      toast.success("Password changed successfully. Please log in with your new credentials.");
      options?.onSuccess?.();
      logout();
    },
  });

  function onSubmit(values: ChangePasswordInput) {
    mutation.mutate(values);
  }

  const serverError =
    mutation.data?.success === false
      ? mutation.data.error
      : mutation.error
        ? "Something went wrong. Please try again."
        : null;

  return { form, onSubmit, serverError, isSubmitting: mutation.isPending };
}