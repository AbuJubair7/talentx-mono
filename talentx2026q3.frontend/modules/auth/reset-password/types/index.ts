import { z } from "zod";

const passwordPolicy =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        passwordPolicy,
        "Password must include an uppercase letter, a lowercase letter, a number, and a special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine(
    (formValues) => formValues.newPassword === formValues.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordState {
  success: boolean;
  error?: string;
}
