import { useQuery } from "@tanstack/react-query";
import { employerVerificationService } from "../services/employer-verification.service";
import { employerVerificationKeys } from "./query-keys";

export function useEmployerDetails(id: string) {
  return useQuery({
    queryKey: employerVerificationKeys.detail(id),
    queryFn: () => employerVerificationService.getEmployerDetails(id),
    enabled: Boolean(id),
  });
}
