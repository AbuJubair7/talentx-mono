import { z } from "zod";

export type DeleteAccountRole = "talent" | "employer";

export const deleteAccountSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code sent to your email"),
  isConfirmed: z.boolean().refine((value) => value === true, {
    message: "Please confirm you understand this action is permanent",
  }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

export type DeleteAccountState = {
  success: boolean;
  error?: string;
};

export const DELETE_ACCOUNT_STEPS = ["warning", "otp"] as const;
export type DeleteAccountStep = (typeof DELETE_ACCOUNT_STEPS)[number];

export const DELETE_ACCOUNT_WARNING: Record<DeleteAccountRole, string> = {
  talent: "Your current applied job will be impacted by this action.",
  employer:
    "Your current job posting will be removed from the public job listing by this action.",
};
