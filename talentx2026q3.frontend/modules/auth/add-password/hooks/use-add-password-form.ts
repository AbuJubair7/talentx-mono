"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addPassword } from "../services/add-password.service";
import { addPasswordSchema, type AddPasswordInput } from "../types";

export interface UseAddPasswordFormOptions {
  onSuccess?: () => void;
}

export function useAddPasswordForm(options?: UseAddPasswordFormOptions) {
  const queryClient = useQueryClient();

  const form = useForm<AddPasswordInput>({
    resolver: zodResolver(addPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (formValues: AddPasswordInput) => addPassword(formValues),
    onSuccess: (mutationResult) => {
      if (!mutationResult.success) {
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast.success(
        "Password added successfully. You can now sign in with either your password or Google."
      );
      options?.onSuccess?.();
    },
  });

  function onSubmit(formValues: AddPasswordInput) {
    mutation.mutate(formValues);
  }

  const serverError =
    mutation.data?.success === false
      ? mutation.data.error
      : mutation.error
        ? "Something went wrong. Please try again."
        : null;

  return {
    form,
    onSubmit,
    serverError,
    isSubmitting: mutation.isPending,
  };
}
