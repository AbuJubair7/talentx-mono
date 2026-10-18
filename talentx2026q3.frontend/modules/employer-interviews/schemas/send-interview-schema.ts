import { z } from 'zod';

const baseSendInterviewShape = {
  type: z.enum(['OnlineAssessment', 'OnCall', 'OnSite']),
  assessmentUrl: z.string().trim().max(1000, 'Assessment URL must not exceed 1000 characters.').optional(),
  assessmentDeadline: z.string().optional(),
  locationOrLink: z.string().trim().max(1000, 'Must not exceed 1000 characters.').optional(),
  instructions: z.string().trim().max(4000, 'Instructions must not exceed 4000 characters.').optional(),
  timeslots: z.array(
    z.object({
      startTime: z.string().min(1, 'Start time is required.'),
      endTime: z.string().min(1, 'End time is required.'),
      meetingUrl: z.string().trim().max(1000, 'Must not exceed 1000 characters.').optional(),
    })
  ),
};

/**
 * Built as a factory (not a static schema) because the timeslot-count rule depends on how many
 * candidates are being invited in this batch — that's a prop passed to the dialog, not one of
 * the form's own fields, so it has to be closed over rather than read from `data`.
 */
export function createSendInterviewSchema(candidateCount: number) {
  return z.object(baseSendInterviewShape).superRefine((data, ctx) => {
    if (data.type === 'OnlineAssessment') {
      if (!data.assessmentUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Assessment URL is required for an online assessment.',
          path: ['assessmentUrl'],
        });
      }

      if (!data.assessmentDeadline) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A deadline is required for an online assessment.',
          path: ['assessmentDeadline'],
        });
      } else if (new Date(data.assessmentDeadline).getTime() <= Date.now()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Deadline must be in the future.',
          path: ['assessmentDeadline'],
        });
      }
    }

    if (data.type === 'OnCall' || data.type === 'OnSite') {
      if (!data.locationOrLink) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: data.type === 'OnCall' ? 'A meeting link is required.' : 'An office address is required.',
          path: ['locationOrLink'],
        });
      }

      if (data.timeslots.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please add one timeslot for each talent.',
          path: ['timeslots'],
        });
      } else if (data.timeslots.length < candidateCount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Offer at least ${candidateCount} timeslot${candidateCount > 1 ? 's' : ''} — one per invited candidate — so everyone has a slot to choose from.`,
          path: ['timeslots'],
        });
      }
    }

    const now = Date.now();
    data.timeslots.forEach((slot, index) => {
      if (slot.startTime && new Date(slot.startTime).getTime() <= now) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Start time must be in the future.',
          path: ['timeslots', index, 'startTime'],
        });
      }

      if (slot.startTime && slot.endTime && slot.endTime <= slot.startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End time must be after start time.',
          path: ['timeslots', index, 'endTime'],
        });
      }
    });
  });
}

export type SendInterviewFormValues = z.infer<ReturnType<typeof createSendInterviewSchema>>;
