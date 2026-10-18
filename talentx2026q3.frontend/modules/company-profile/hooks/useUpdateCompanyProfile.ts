import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { companyProfileService } from '../services/company-profile.service';
import type { CompanyProfileDto, UpdateCompanyProfilePayload } from '../types/company-profile.types';
import { companyProfileKeys } from './querykeys';

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();

  return useMutation<CompanyProfileDto, Error, UpdateCompanyProfilePayload>({
    mutationFn: (payload) => companyProfileService.updateMyCompanyProfile(payload),
    onSuccess: (updatedProfile) => {
      // Invalidate and optimistically set queries
      queryClient.setQueryData(companyProfileKeys.mine(), updatedProfile);
      if (updatedProfile.id) {
        queryClient.invalidateQueries({
          queryKey: companyProfileKeys.publicProfile(updatedProfile.id),
        });
      }
      queryClient.invalidateQueries({
        queryKey: companyProfileKeys.all,
      });

      toast.success('Company profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update company profile. Please try again.');
    },
  });
}
