import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { companyProfileService } from '../services/company-profile.service';
import { companyProfileKeys } from './querykeys';

/**
 * Deletes the company logo (`DELETE /employers/company/logo`).
 * Uploads persist immediately on the server, so removal does too —
 * there is no "save to confirm" step. Invalidates the cached profile
 * so the default brand logo shows right away.
 */
export function useDeleteCompanyLogo() {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: () => companyProfileService.deleteCompanyLogo(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: companyProfileKeys.all,
      });
      toast.success('Company logo removed. The default logo will be used.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove company logo. Please try again.');
    },
  });
}
