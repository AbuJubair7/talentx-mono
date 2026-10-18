import { z } from "zod";

const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const addPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(256, "New password must not exceed 256 characters")
      .regex(
        passwordPolicy,
        "Password must include an uppercase letter, a lowercase letter, a number, and a special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((formValues) => formValues.newPassword === formValues.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AddPasswordInput = z.infer<typeof addPasswordSchema>;

export type AddPasswordState = {
  success: boolean;
  error?: string;
};
