'use client';

import { Info, RefreshCw, Sparkles, Target, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { evaluationBand } from '../constants';
import type { EvaluationDto, InterviewPreparationDto } from '../types';
import { QuestionFeedbackItem } from './QuestionFeedbackItem';
import { ScoreDial } from './ScoreDial';

interface EvaluationReportProps {
  prep: InterviewPreparationDto;
  evaluation: EvaluationDto;
  onReevaluate: () => void;
  isEvaluating: boolean;
}

export function EvaluationReport({
  prep,
  evaluation,
  onReevaluate,
  isEvaluating,
}: EvaluationReportProps) {
  const band = evaluationBand(evaluation.overallScore);

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-ai-line bg-ai-soft p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ScoreDial score={evaluation.overallScore} label={band.label} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-ink">Your AI evaluation report</h3>
              <span className={`text-sm font-medium ${band.className}`}>{band.label}</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-ink-muted">{evaluation.summary}</p>
            <p className="mt-1 text-xs text-ink-subtle">
              Answered {evaluation.answeredCount} of {evaluation.totalCount} questions &middot;
              Evaluated{' '}
              {new Date(evaluation.evaluatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onReevaluate}
            disabled={isEvaluating}
            className="shrink-0 gap-2 self-start sm:self-auto"
          >
            {isEvaluating ? (
              <RefreshCw className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            {isEvaluating ? 'Re-running…' : 'Re-run evaluation'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-md border border-line bg-surface p-5 shadow-card">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <ThumbsUp className="h-4 w-4 text-success" aria-hidden />
            What you did well
          </h4>
          <ul className="mt-3 space-y-2">
            {evaluation.strengths.length === 0 && (
              <li className="text-sm text-ink-muted">No standout strengths recorded.</li>
            )}
            {evaluation.strengths.map((strength) => (
              <li key={strength} className="flex gap-2 text-sm leading-6 text-ink-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden />
                {strength}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-md border border-line bg-surface p-5 shadow-card">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Target className="h-4 w-4 text-amber-700" aria-hidden />
            Where to improve
          </h4>
          <ul className="mt-3 space-y-2">
            {evaluation.areasToImprove.length === 0 && (
              <li className="text-sm text-ink-muted">No specific improvements flagged.</li>
            )}
            {evaluation.areasToImprove.map((area) => (
              <li key={area} className="flex gap-2 text-sm leading-6 text-ink-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" aria-hidden />
                {area}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <h4 className="text-sm font-semibold text-ink">
          Feedback per answered question ({evaluation.questionFeedback.length})
        </h4>
        <div className="mt-3 overflow-hidden rounded-md border border-line bg-surface shadow-card">
          <ul className="divide-y divide-line">
            {evaluation.questionFeedback.length === 0 && (
              <li className="px-4 py-5 text-sm text-ink-muted sm:px-5">
                No per-question feedback was returned for this evaluation.
              </li>
            )}
            {evaluation.questionFeedback.map((item) => (
              <QuestionFeedbackItem
                key={`${item.category}::${item.questionIndex}`}
                prep={prep}
                item={item}
              />
            ))}
          </ul>
        </div>
      </section>

      <p className="flex items-start gap-2 border-t border-line pt-5 text-xs leading-5 text-ink-subtle">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        AI-generated formative feedback based on your practice answers. It is coaching guidance
        only &mdash; not an employer assessment and not a prediction of interview outcomes.
      </p>
    </div>
  );
}
