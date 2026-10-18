"use client";

import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QueryClientContext } from "@tanstack/react-query";

import { loginSchema, type LoginInput } from "../types";
import { login } from "../services/login.service";

export function useLoginForm(redirectTo?: string) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useContext(QueryClientContext);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    setIsSubmitting(true);
    if (queryClient) {
      queryClient.clear();
    }
    const result = await login(values, redirectTo); // on success, redirect() inside the action navigates automatically
    setIsSubmitting(false);
    if (result && !result.success) {
      setServerError(result.error ?? "Something went wrong. Please try again.");
    }
  }

  return { form, onSubmit, serverError, isSubmitting };
}