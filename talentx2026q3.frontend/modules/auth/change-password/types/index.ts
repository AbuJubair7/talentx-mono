import { z } from "zod";

// Adjust the regex to match your backend's actual configured password policy
const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().trim().min(1, "Current password is required"),
    newPassword: z
      .string()
      .trim()
      .min(8, "New password must be at least 8 characters")
      .regex(
        passwordPolicy,
        "Password must include an uppercase letter, a lowercase letter, a number, and a special character"
      ),
    confirmPassword: z.string().trim().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password cannot be the same as your current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type ChangePasswordState = {
  success: boolean;
  error?: string;
};