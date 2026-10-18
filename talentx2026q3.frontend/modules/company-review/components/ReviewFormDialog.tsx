'use client';

import { useEffect } from 'react';
import { Loader2, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/errors';
import {
  COMPANY_REVIEW_COMMENT_MAX_LENGTH,
  COMPANY_REVIEW_FALLBACKS,
  RATING_AREAS,
  REVIEW_SENTIMENT_LABELS,
} from '../constants/company-review.constants';
import { useSubmitCompanyReview } from '../hooks/useSubmitCompanyReview';
import { useUpdateCompanyReview } from '../hooks/useUpdateCompanyReview';
import { companyReviewFormSchema, type CompanyReviewFormValues } from '../schemas/company-review.schema';
import type { MyCompanyReviewItemDto } from '../types/company-review.types';
import { REVIEW_SENTIMENT_VALUES } from '../types/company-review.types';
import { toFormDefaults, toReviewContentPayload } from '../utils/company-review.utils';
import { RatingStars } from './RatingStars';

interface ReviewFormDialogProps {
  item: MyCompanyReviewItemDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Creates a review, or edits the existing one when `item.review` is set. */
export function ReviewFormDialog({ item, open, onOpenChange }: ReviewFormDialogProps) {
  const isEdit = item.review !== null;
  const submitMutation = useSubmitCompanyReview();
  const updateMutation = useUpdateCompanyReview();
  const isPending = submitMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyReviewFormValues>({
    resolver: zodResolver(companyReviewFormSchema),
    defaultValues: toFormDefaults(item.review),
    mode: 'onTouched',
  });

  // Start from the saved content each time the dialog opens (or the saved review changes).
  useEffect(() => {
    if (open) reset(toFormDefaults(item.review));
  }, [open, item.review, reset]);

  const comment = useWatch({ control, name: 'comment' }) ?? '';

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return;
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values: CompanyReviewFormValues) => {
    const content = toReviewContentPayload(values);

    try {
      if (item.review) {
        const response = await updateMutation.mutateAsync({ reviewId: item.review.id, payload: content });
        toast.success(response?.message || 'Review updated and sent for moderation.');
      } else {
        await submitMutation.mutateAsync({ jobApplicationId: item.jobApplicationId, ...content });
        toast.success('Thanks! Your review was submitted and is awaiting moderation.');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(
        getErrorMessage(err, isEdit ? COMPANY_REVIEW_FALLBACKS.ERROR_UPDATE : COMPANY_REVIEW_FALLBACKS.ERROR_SUBMIT)
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogTitle>{isEdit ? 'Edit your review' : 'Review this company'}</DialogTitle>
        <DialogDescription>
          Your experience applying for &quot;{item.jobTitle}&quot; at {item.companyName}. Reviews are anonymous and
          checked by TalentX before they appear publicly.
        </DialogDescription>

        {isEdit && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Saving your changes sends the review back for moderation. It won&apos;t be public until it is approved
            again.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 pt-1">
          <div className="space-y-1.5">
            <span id="review-sentiment-label" className="block text-sm font-medium text-slate-900">
              Overall, was your experience positive or negative?{' '}
              <span className="font-normal text-rose-600">required</span>
            </span>
            <Controller
              control={control}
              name="sentiment"
              render={({ field }) => (
                <div role="radiogroup" aria-labelledby="review-sentiment-label" className="grid grid-cols-2 gap-2">
                  {REVIEW_SENTIMENT_VALUES.map((sentiment) => {
                    const selected = field.value === sentiment;
                    const isPositive = sentiment === 'Positive';
                    const Icon = isPositive ? ThumbsUp : ThumbsDown;

                    return (
                      <button
                        key={sentiment}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => field.onChange(sentiment)}
                        className={cn(
                          'flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30',
                          selected
                            ? isPositive
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                              : 'border-rose-600 bg-rose-50 text-rose-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {REVIEW_SENTIMENT_LABELS[sentiment]}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.sentiment && <p className="text-xs text-rose-600">{errors.sentiment.message}</p>}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900">
              Ratings <span className="font-normal text-slate-500">optional</span>
            </p>
            <div className="space-y-2">
              {RATING_AREAS.map((area) => (
                <div key={area.key} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-slate-700">{area.label}</span>
                  <Controller
                    control={control}
                    name={`ratings.${area.key}`}
                    render={({ field }) => (
                      <RatingStars
                        value={field.value ?? null}
                        onChange={field.onChange}
                        label={area.label}
                        clearable
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="review-comment" className="block text-sm font-medium text-slate-900">
              Written feedback <span className="font-normal text-slate-500">optional</span>
            </label>
            <Textarea
              id="review-comment"
              rows={4}
              placeholder="What was the hiring process like?"
              aria-invalid={errors.comment ? true : undefined}
              {...register('comment')}
            />
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-rose-600">{errors.comment?.message}</p>
              <p
                className={cn(
                  'shrink-0 text-xs',
                  comment.trim().length > COMPANY_REVIEW_COMMENT_MAX_LENGTH ? 'text-rose-600' : 'text-slate-400'
                )}
              >
                {comment.trim().length}/{COMPANY_REVIEW_COMMENT_MAX_LENGTH}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                'Save changes'
              ) : (
                'Submit review'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
