'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { employerJobsService } from '../services/employer-jobs.service';
import { employerJobKeys } from './query-keys';
import { normalizeSalaryAmount, resolveLocationPayload } from '../utils/employer-jobs.utils';
import type {
  UpdateJobMutationVariables,
  UpdateJobPayload,
} from '../types/employer-job.types';

export function useUpdateJob(jobId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ values, publish }: UpdateJobMutationVariables) => {
      const resolvedLocation = resolveLocationPayload(
        values.location,
        values.city,
        values.country,
        values.workArrangement
      );

      const normalizedSalaryType = values.salaryType || null;
      const resolvedSalaryMin = normalizeSalaryAmount(values.salaryMin);
      const resolvedSalaryMax = normalizeSalaryAmount(values.salaryMax);

      const payload: UpdateJobPayload = {
        title: values.title.trim(),
        companyName: values.companyName.trim(),
        description: values.description.trim() || undefined,
        requirements: values.requirements.trim() || undefined,
        location: resolvedLocation || undefined,
        // Mandatory only for On-Site and Hybrid, but kept whenever the employer fills them in.
        city: values.city.trim() || null,
        country: values.country.trim() || null,
        minOverlapHours:
          values.workArrangement === 'FullRemote' ? values.minOverlapHours : null,
        employmentType: values.employmentType,
        experienceLevel: values.experienceLevel,
        workArrangement: values.workArrangement,
        requiredSkills: values.requiredSkills,
        vacancies: values.vacancies,
        expireAt: values.expireAt ? new Date(values.expireAt).toISOString() : undefined,
        salaryType: normalizedSalaryType,
        salaryMin: resolvedSalaryMin,
        salaryMax:
          normalizedSalaryType === 'Fixed' ? resolvedSalaryMin : resolvedSalaryMax,
        salaryCurrency: values.salaryCurrency || null,
        salaryPeriod: values.salaryPeriod || null,
        publish,
      };

      return employerJobsService.updateJob(jobId, payload);
    },
    onSuccess: (_responseData, variables) => {
      queryClient.invalidateQueries({ queryKey: employerJobKeys.all });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['home', 'recent-jobs'] });
      queryClient.invalidateQueries({ queryKey: employerJobKeys.detail(jobId) });

      if (variables.publish) {
        toast.success(variables.successMessage || 'Job published successfully');
        router.push('/job/job-listing');
      } else {
        toast.success(variables.successMessage || 'Job saved as draft');
      }
    },
    onError: (mutationError: unknown) => {
      const errorData = (
        mutationError as {
          response?: {
            data?: {
              message?: string;
              errors?: string[] | Record<string, string[]>;
            };
          };
        }
      )?.response?.data;

      let errorMessage =
        errorData?.message ||
        (mutationError as Error)?.message ||
        'Failed to save changes';

      if (Array.isArray(errorData?.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors.join(' ');
      }
      toast.error(errorMessage);
    },
  });
}
