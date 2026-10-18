import type { EmployerVerificationQueryParams } from "../types/employer-verification";

export const employerVerificationKeys = {
  all: ["admin", "employers"] as const,
  list: (params?: EmployerVerificationQueryParams) =>
    [...employerVerificationKeys.all, "list", params] as const,
  detail: (id: string) => [...employerVerificationKeys.all, "detail", id] as const,
};
