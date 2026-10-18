'use client';

import { useState } from 'react';
import { Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePreparation } from '../hooks/use-preparation';
import { useGeneratePreparation } from '../hooks/use-generate-preparation';
import { useRegeneratePreparation } from '../hooks/use-regenerate-preparation';
import { useMoreQuestions } from '../hooks/use-more-questions';
import { useEvaluateAnswers } from '../hooks/use-evaluate';
import { usePreparationQuota } from '../hooks/use-preparation-quota';
import { useAnswerAutosave } from '../hooks/use-answer-autosave';
import { PrepHeader } from './PrepHeader';
import { AiGuidanceCard } from './AiGuidanceCard';
import { PrepGenerating } from './PrepGenerating';
import { GenerationError } from './GenerationError';
import { QuestionsSection } from './QuestionsSection';
import { TopicsSection } from './TopicsSection';
import { EvaluationReport } from './EvaluationReport';
import { ContextSidebar } from './ContextSidebar';
import { PreparationActions } from './PreparationActions';
import { CATEGORY_ORDER, questionsForCategory } from '../constants';

interface PreparationOverviewProps {
  invitationId: string;
}

type Tab = 'questions' | 'topics' | 'report';

export function PreparationOverview({ invitationId }: PreparationOverviewProps) {
  const { data: prep, isLoading, error, refetch, isFetching } = usePreparation(invitationId);
  const { mutate: generate, isPending: isGenerating } = useGeneratePreparation();
  const { mutate: regenerate, isPending: isRegenerating } = useRegeneratePreparation();
  const { mutate: getMore, isPending: isGettingMore } = useMoreQuestions();
  const { mutate: evaluate, isPending: isEvaluating } = useEvaluateAnswers();
  const { data: quota } = usePreparationQuota();
  const { answers, saveStates, handleAnswerChange, togglePracticed, reset: resetAnswers } =
    useAnswerAutosave(invitationId, prep);

  const [tab, setTab] = useState<Tab>('questions');
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleEvaluate() {
    evaluate(invitationId, {
      onSuccess: () => setTab('report'),
    });
  }

  if (isLoading) {
    return <PrepGenerating />;
  }

  if (error && error.status !== 404) {
    return <GenerationError onRetry={() => refetch()} isRetrying={isFetching} />;
  }

  if (!prep) {
    if (isGenerating) {
      return <PrepGenerating />;
    }

    return (
      <div className="space-y-4 rounded-md border border-ai-line bg-ai-soft p-8 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-ai/10">
          <Sparkles className="h-5 w-5 text-ai" aria-hidden />
        </span>
        <h2 className="text-xl font-bold text-ink">AI Interview Preparation</h2>
        <p className="mx-auto max-w-md text-sm leading-6 text-ink-muted">
          Generate a customized interview preparation guide based on this role, company, and
          interview type. Our AI will analyze the requirements and give you targeted practice
          questions and tips.
        </p>
        <div className="pt-2">
          <Button
            type="button"
            size="lg"
            className="gap-2 bg-brand text-white hover:bg-brand-hover focus-visible:ring-brand"
            onClick={() => generate(invitationId)}
          >
            <Sparkles className="size-4" aria-hidden />
            Generate Preparation Guide
          </Button>
          {quota && (
            <p className="pt-2 text-xs tabular-nums text-ink-subtle">
              {quota.remainingGeneratesToday} of {quota.dailyGenerateLimit} guides left today
            </p>
          )}
        </div>
      </div>
    );
  }

  const questionCount = CATEGORY_ORDER.reduce(
    (total, category) => total + questionsForCategory(prep, category).length,
    0,
  );
  const topicCount = prep.keyTopicsToPrepare.length + prep.suggestedRevisionAreas.length;
  // The report tab only exists while an evaluation does; if it disappears
  // (e.g. after a refetch), fall back to the questions panel during render.
  const activeTab: Tab = tab === 'report' && !prep.evaluation ? 'questions' : tab;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'questions', label: 'Interview questions', count: questionCount },
    { id: 'topics', label: 'Topics to prepare', count: topicCount },
    ...(prep.evaluation
      ? [{ id: 'report' as Tab, label: 'AI report', count: prep.evaluation.overallScore }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PrepHeader
        prep={prep}
        onRegenerate={() => setConfirmOpen(true)}
        regenerateDisabled={isRegenerating || isGettingMore}
        regenerating={isRegenerating}
      />

      {isRegenerating ? (
        <PrepGenerating interviewType={prep.interviewType} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            <AiGuidanceCard prep={prep} />

            <div>
              <div
                role="tablist"
                aria-label="Preparation content"
                className="flex gap-6 border-b border-line-strong"
              >
                {tabs.map((t) => {
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      id={`tab-${t.id}`}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-controls={`panel-${t.id}`}
                      onClick={() => setTab(t.id)}
                      className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        active
                          ? 'border-ink text-ink'
                          : 'border-transparent text-ink-muted hover:text-ink'
                      }`}
                    >
                      {t.label}
                      <span className="rounded-full bg-canvas px-2 py-0.5 text-xs tabular-nums text-ink-muted ring-1 ring-line">
                        {t.count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div
                id={`panel-${activeTab}`}
                role="tabpanel"
                aria-labelledby={`tab-${activeTab}`}
                className="pt-6"
              >
                {activeTab === 'questions' ? (
                  <QuestionsSection
                    prep={prep}
                    answers={answers}
                    saveStates={saveStates}
                    onTogglePracticed={togglePracticed}
                    onAnswerChange={handleAnswerChange}
                    onGenerateMore={() => getMore(invitationId)}
                    isGeneratingMore={isGettingMore}
                    onEvaluate={handleEvaluate}
                    isEvaluating={isEvaluating}
                    quota={quota}
                  />
                ) : activeTab === 'topics' ? (
                  <TopicsSection
                    topics={prep.keyTopicsToPrepare}
                    reviseAreas={prep.suggestedRevisionAreas}
                  />
                ) : prep.evaluation ? (
                  <EvaluationReport
                    prep={prep}
                    evaluation={prep.evaluation}
                    onReevaluate={handleEvaluate}
                    isEvaluating={isEvaluating}
                  />
                ) : null}
              </div>
            </div>

            <p className="flex items-start gap-2 border-t border-line pt-5 text-xs leading-5 text-ink-subtle">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              AI-generated preparation guidance. Suggestions are based only on the public job
              posting, your interview details, and your profile. They are not the employer&apos;s
              actual interview questions and never include confidential employer or other
              candidate information.
            </p>
          </div>

          <aside aria-label="Preparation sources">
            <ContextSidebar
              prep={prep}
              accessWindowMinutes={quota?.accessWindowAfterInterviewMinutes}
            />
          </aside>
        </div>
      )}

      <PreparationActions
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => {
          setConfirmOpen(false);
          setTab('questions');
          resetAnswers();
          regenerate(invitationId);
        }}
        isPending={isRegenerating}
        quota={quota}
        generationCount={prep.generationCount}
      />
    </div>
  );
}
