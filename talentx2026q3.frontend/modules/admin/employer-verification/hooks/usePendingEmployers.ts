import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { employerVerificationService } from "../services/employer-verification.service";
import type {
  EmployerVerificationQueryParams,
  PendingEmployer,
  PaginatedList,
} from "../types/employer-verification";
import { employerVerificationKeys } from "./query-keys";

export function usePendingEmployers(params?: EmployerVerificationQueryParams) {
  return useQuery<PaginatedList<PendingEmployer>, Error>({
    queryKey: employerVerificationKeys.list(params),
    queryFn: () => employerVerificationService.getEmployers(params),
    placeholderData: keepPreviousData,
  });
}
