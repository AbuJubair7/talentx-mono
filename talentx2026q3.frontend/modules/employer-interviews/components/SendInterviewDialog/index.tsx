'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getErrorMessage } from '@/lib/errors';
import { INTERVIEW_TYPE_OPTIONS } from '../../constants/interview.constants';
import { useSendInterviewInvitations } from '../../hooks/useSendInterviewInvitations';
import { createSendInterviewSchema, type SendInterviewFormValues } from '../../schemas/send-interview-schema';
import type {
  InterviewType,
  SendInterviewBatchPayload,
  SendInterviewBatchResponse,
} from '../../types/interview.types';
import { TimeslotFieldArray } from './TimeslotFieldArray';
import { BatchInviteResultsModal } from '../BatchInviteResultsModal';

interface SendInterviewDialogProps {
  jobId: string;
  applicationIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent: () => void;
}

function toIsoOrUndefined(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function SendInterviewDialog({
  jobId,
  applicationIds,
  open,
  onOpenChange,
  onSent,
}: SendInterviewDialogProps) {
  const sendMutation = useSendInterviewInvitations(jobId);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [inviteResult, setInviteResult] = useState<SendInterviewBatchResponse | null>(null);
  const [lastInvitePayload, setLastInvitePayload] = useState<Omit<SendInterviewBatchPayload, 'applicationIds'> | null>(
    null,
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SendInterviewFormValues>({
    resolver: zodResolver(createSendInterviewSchema(applicationIds.length)),
    defaultValues: {
      type: 'OnlineAssessment',
      assessmentUrl: '',
      assessmentDeadline: '',
      locationOrLink: '',
      instructions: '',
      timeslots: [],
    },
    mode: 'onTouched',
  });

  const type: InterviewType = useWatch({ control, name: 'type' });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  // Clear whichever group of fields belongs to the type being switched away from, so stale
  // values from an abandoned choice can't leak into the submitted payload (or reappear if the
  // employer switches back and forth).
  const handleTypeChange = (nextType: InterviewType) => {
    if (nextType === 'OnlineAssessment') {
      setValue('locationOrLink', '');
      setValue('timeslots', []);
    } else {
      setValue('assessmentUrl', '');
      setValue('assessmentDeadline', '');
    }
    setValue('type', nextType);
  };

  const onSubmit = async (values: SendInterviewFormValues) => {
    const isOnlineAssessment = values.type === 'OnlineAssessment';

    const payload: Omit<SendInterviewBatchPayload, 'applicationIds'> = {
      type: values.type,
      assessmentUrl: isOnlineAssessment ? values.assessmentUrl?.trim() || undefined : undefined,
      assessmentDeadline: isOnlineAssessment ? toIsoOrUndefined(values.assessmentDeadline) : undefined,
      locationOrLink: isOnlineAssessment ? undefined : values.locationOrLink?.trim() || undefined,
      instructions: values.instructions?.trim() || undefined,
      timeslots: isOnlineAssessment
        ? undefined
        : values.timeslots
            .filter((slot) => slot.startTime && slot.endTime)
            .map((slot) => ({
              startTime: toIsoOrUndefined(slot.startTime) as string,
              endTime: toIsoOrUndefined(slot.endTime) as string,
              meetingUrl: slot.meetingUrl?.trim() || undefined,
            })),
    };

    try {
      const response = await sendMutation.mutateAsync({ applicationIds, ...payload });

      setInviteResult(response);
      setLastInvitePayload(payload);
      setResultsModalOpen(true);

      reset();
      onSent();
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to send interview invitations.'));
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invite to Interview</DialogTitle>
            <DialogDescription>
              Sending an interview invitation to {applicationIds.length} candidate
              {applicationIds.length > 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-900 mb-1.5 block">Interview type</label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(value) => handleTypeChange(value as InterviewType)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVIEW_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {type === 'OnlineAssessment' ? (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-1.5 block">
                    Assessment URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    aria-invalid={Boolean(errors.assessmentUrl)}
                    placeholder="https://..."
                    {...register('assessmentUrl')}
                  />
                  {errors.assessmentUrl ? (
                    <p className="mt-1 text-xs text-red-600">{errors.assessmentUrl.message}</p>
                  ) : null}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-1.5 block">
                    Deadline <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="assessmentDeadline"
                    render={({ field }) => (
                      <DateTimePicker
                        id="assessmentDeadline"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        aria-invalid={Boolean(errors.assessmentDeadline)}
                      />
                    )}
                  />
                  {errors.assessmentDeadline ? (
                    <p className="mt-1 text-xs text-red-600">{errors.assessmentDeadline.message}</p>
                  ) : null}
                </div>
              </>
            ) : (
              <div>
                <label className="text-sm font-medium text-slate-900 mb-1.5 block">
                  {type === 'OnCall' ? 'Meeting link' : 'Office address'} <span className="text-red-500">*</span>
                </label>
                <Input
                  aria-invalid={Boolean(errors.locationOrLink)}
                  placeholder={type === 'OnCall' ? 'https://meet...' : '123 Main St, Dhaka'}
                  {...register('locationOrLink')}
                />
                {errors.locationOrLink ? (
                  <p className="mt-1 text-xs text-red-600">{errors.locationOrLink.message}</p>
                ) : null}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-900 mb-1.5 block">
                Instructions <span className="font-normal text-slate-500">optional</span>
              </label>
              <Textarea rows={3} {...register('instructions')} />
            </div>

            {(type === 'OnCall' || type === 'OnSite') && (
              <div>
                <TimeslotFieldArray control={control} register={register} errors={errors} />
                {(() => {
                  const timeslotsListError = errors.timeslots?.message ?? errors.timeslots?.root?.message;
                  return timeslotsListError ? (
                    <p className="mt-1.5 text-xs text-red-600">{timeslotsListError}</p>
                  ) : null;
                })()}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                {sendMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Send invitation{applicationIds.length > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BatchInviteResultsModal
        open={resultsModalOpen}
        onOpenChange={setResultsModalOpen}
        result={inviteResult}
        jobId={jobId}
        originalPayload={lastInvitePayload!}
        onResultUpdate={setInviteResult}
      />
    </>
  );
}
