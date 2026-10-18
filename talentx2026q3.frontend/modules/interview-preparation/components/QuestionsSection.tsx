'use client';

import { useState } from 'react';
import { Loader2, Plus, Sparkles, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  AnswerMap,
  InterviewPreparationDto,
  InterviewPreparationQuota,
  PrepQuestion,
  SaveState,
} from '../types';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_SHORT_LABELS,
  CATEGORY_SOURCES,
  countAnswers,
  questionsForCategory,
} from '../constants';
import { QuestionCategoryCard } from './QuestionCategoryCard';

interface QuestionGroup {
  key: string;
  label: string;
  short: string;
  source: string;
  icon: LucideIcon;
  questions: PrepQuestion[];
}

function buildGroups(prep: InterviewPreparationDto): QuestionGroup[] {
  return CATEGORY_ORDER.map((key) => ({
    key,
    label: CATEGORY_LABELS[key] ?? key,
    short: CATEGORY_SHORT_LABELS[key] ?? key,
    source: CATEGORY_SOURCES[key] ?? '',
    icon: CATEGORY_ICONS[key] ?? CATEGORY_ICONS['Additional'],
    questions: questionsForCategory(prep, key),
  })).filter((group) => group.questions.length > 0);
}

interface QuestionsSectionProps {
  prep: InterviewPreparationDto;
  answers: AnswerMap;
  saveStates?: Record<string, SaveState>;
  onTogglePracticed: (key: string) => void;
  onAnswerChange: (key: string, text: string) => void;
  onGenerateMore: () => void;
  isGeneratingMore: boolean;
  onEvaluate: () => void;
  isEvaluating: boolean;
  quota?: InterviewPreparationQuota | null;
}

type Filter = 'all' | string;

export function QuestionsSection({
  prep,
  answers,
  saveStates = {},
  onTogglePracticed,
  onAnswerChange,
  onGenerateMore,
  isGeneratingMore,
  onEvaluate,
  isEvaluating,
  quota,
}: QuestionsSectionProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const groups = buildGroups(prep);

  const { total: totalCount, practiced: practicedCount, answered: answeredCount } = countAnswers(
    groups,
    answers,
  );
  const progress = totalCount ? (practicedCount / totalCount) * 100 : 0;
  const visible = filter === 'all' ? groups : groups.filter((g) => g.key === filter);

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: totalCount },
    ...groups.map((g) => ({ id: g.key, label: g.short, count: g.questions.length })),
  ];

  if (totalCount === 0) {
    return (
      <p className="rounded-md border border-dashed border-line-strong bg-surface px-5 py-8 text-center text-sm text-ink-muted">
        No questions in this preparation yet. Use &ldquo;Generate more questions&rdquo; below to
        create some.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filter questions" className="flex flex-wrap gap-1.5">
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.id)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  active ? 'bg-ink text-white' : 'bg-surface text-ink-muted ring-1 ring-line-strong hover:text-ink'
                }`}
              >
                {f.label}
                <span className={`tabular-nums ${active ? 'text-white/70' : 'text-ink-subtle'}`}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <div
            className="h-1.5 w-28 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-valuenow={practicedCount}
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-label="Questions practiced"
          >
            <div
              className="h-full rounded-full bg-success transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="whitespace-nowrap text-sm tabular-nums text-ink-muted">
            {practicedCount} of {totalCount} practiced
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {visible.map((g) => (
          <QuestionCategoryCard
            key={g.key}
            categoryKey={g.key}
            title={g.label}
            source={g.source}
            icon={g.icon}
            questions={g.questions}
            answers={answers}
            saveStates={saveStates}
            onTogglePracticed={onTogglePracticed}
            onAnswerChange={onAnswerChange}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-md border border-line bg-surface px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            type="button"
            onClick={onEvaluate}
            disabled={isEvaluating || answeredCount === 0}
            className="gap-2 bg-brand text-white hover:bg-brand-hover focus-visible:ring-brand"
          >
            {isEvaluating ? (
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            {isEvaluating ? 'Evaluating your answers…' : 'Evaluate my answers'}
          </Button>
          {isEvaluating ? (
            <div className="mt-2 max-w-md">
              <div
                className="h-1.5 overflow-hidden rounded-full bg-line"
                role="progressbar"
                aria-label="Evaluation in progress"
              >
                <div
                  className="h-full w-1/3 animate-pulse rounded-full bg-brand motion-reduce:animate-none"
                />
              </div>
              <p className="mt-1.5 text-xs leading-5 text-ink-muted">
                Reviewing {answeredCount} answer{answeredCount === 1 ? '' : 's'} against the
                rubric — this can take up to about 15 seconds. Keep this tab open while the
                report is written.
              </p>
            </div>
          ) : (
            <p className="mt-1.5 text-xs leading-5 text-ink-subtle">
              {answeredCount} of {totalCount} answered &middot; AI reviews only answered
              questions and produces a full report.
            </p>
          )}
        </div>
        <div className="self-start sm:self-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={onGenerateMore}
            disabled={isGeneratingMore}
            className="gap-2 px-0 text-sm font-medium text-brand hover:text-brand-hover disabled:text-ink-subtle"
          >
            {isGeneratingMore ? (
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
            {isGeneratingMore ? 'Generating questions…' : 'Generate more questions'}
          </Button>
          {quota && (
            <p
              className={`mt-1.5 text-right text-xs leading-5 tabular-nums ${
                quota.remainingGenerationsToday === 0 ? 'text-warning' : 'text-ink-subtle'
              }`}
            >
              {quota.remainingGenerationsToday} of {quota.dailyGenerationLimit} generations
              left today
            </p>
          )}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {isEvaluating
          ? 'Evaluating your answers'
          : isGeneratingMore
            ? 'Generating more questions'
            : ''}
      </p>
    </div>
  );
}
