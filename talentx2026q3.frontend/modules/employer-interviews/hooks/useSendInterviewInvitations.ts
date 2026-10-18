import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APPLICANT_QUERY_KEYS } from '@/modules/employer-applicants';
import { INTERVIEW_QUERY_KEYS } from '../constants/interview.constants';
import { interviewService } from '../services/interview.service';
import type { SendInterviewBatchPayload } from '../types/interview.types';

export function useSendInterviewInvitations(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendInterviewBatchPayload) => interviewService.sendBatch(jobId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.jobLists(jobId) });
      // A sent invite moves the linked applications to `Invited` — refresh the applicant list
      // so their status column reflects that without a manual page reload.
      queryClient.invalidateQueries({ queryKey: APPLICANT_QUERY_KEYS.jobLists(jobId) });
    },
  });
}
