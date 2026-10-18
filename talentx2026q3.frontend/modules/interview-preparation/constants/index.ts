import { Code2, Users, Briefcase, Target, HelpCircle, LucideIcon } from 'lucide-react';
import type {
  AnswerMap,
  InterviewPreparationDto,
  PrepAnswerDto,
  PrepQuestion,
  SaveAnswerPayload,
} from '../types';

export const PREPARATION_QUERY_KEYS = {
  all: ['interview-preparation'] as const,
  detail: (invitationId: string) => [...PREPARATION_QUERY_KEYS.all, invitationId] as const,
  quota: () => [...PREPARATION_QUERY_KEYS.all, 'quota'] as const,
};

const ANSWER_KEY_SEPARATOR = '::';

export function answerKey(category: string, index: number, question: string): string {
  return `${category}${ANSWER_KEY_SEPARATOR}${index}${ANSWER_KEY_SEPARATOR}${question}`;
}

export function questionKey(categoryKey: string, index: number, question: PrepQuestion): string {
  return answerKey(categoryKey, index, question.question);
}

export function parseAnswerKey(key: string): Pick<SaveAnswerPayload, 'category' | 'questionIndex'> {
  const firstSep = key.indexOf(ANSWER_KEY_SEPARATOR);
  const secondSep = key.indexOf(ANSWER_KEY_SEPARATOR, firstSep + ANSWER_KEY_SEPARATOR.length);
  return {
    category: key.slice(0, firstSep),
    questionIndex: Number(key.slice(firstSep + ANSWER_KEY_SEPARATOR.length, secondSep)),
  };
}

export function buildAnswerMap(answers: PrepAnswerDto[] | undefined): AnswerMap {
  const map: AnswerMap = {};
  for (const answer of answers ?? []) {
    map[answerKey(answer.category, answer.questionIndex, answer.question)] = {
      text: answer.answer,
      practiced: answer.practiced,
    };
  }
  return map;
}

export const ANSWER_AUTOSAVE_DEBOUNCE_MS = 800;

export const MAX_ANSWER_LENGTH = 4000;

export type EvaluationBand = 'strong' | 'good' | 'moderate' | 'needs-practice';

export function evaluationBand(score: number): { label: string; className: string } {
  if (score >= 85) return { label: 'Strong', className: 'text-success' };
  if (score >= 70) return { label: 'Good', className: 'text-ink' };
  if (score >= 50) return { label: 'Moderate', className: 'text-amber-700' };
  return { label: 'Needs practice', className: 'text-ink-muted' };
}

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Technical: Code2,
  Behavioral: Users,
  'Experience-Based': Briefcase,
  'Role-Specific': Target,
  Additional: HelpCircle,
};

export const CATEGORY_LABELS: Record<string, string> = {
  Technical: 'Technical Questions',
  Behavioral: 'Behavioral Questions',
  'Experience-Based': 'Experience-Based Questions',
  'Role-Specific': 'Role-Specific Questions',
  Additional: 'Additional Questions',
};

export const CATEGORY_SHORT_LABELS: Record<string, string> = {
  Technical: 'Technical',
  Behavioral: 'Behavioral',
  'Experience-Based': 'Experience',
  'Role-Specific': 'Role-specific',
  Additional: 'Additional',
};

export const CATEGORY_SOURCES: Record<string, string> = {
  'Role-Specific': "Based on the job's responsibilities and required skills",
  Technical: 'Common technical expectations for this role',
  Behavioral: 'Commonly asked in this interview format',
  'Experience-Based': 'Based on your resume and work history',
  Additional: 'Generated on request',
};

export const CATEGORY_ORDER = [
  'Role-Specific',
  'Technical',
  'Behavioral',
  'Experience-Based',
  'Additional',
] as const;

export function questionsForCategory(
  prep: InterviewPreparationDto,
  category: string,
): PrepQuestion[] {
  switch (category) {
    case 'Technical':
      return prep.technicalQuestions;
    case 'Behavioral':
      return prep.behavioralQuestions;
    case 'Experience-Based':
      return prep.experienceBasedQuestions;
    case 'Role-Specific':
      return prep.roleSpecificQuestions;
    case 'Additional':
      return prep.additionalQuestions ?? [];
    default:
      return [];
  }
}

export interface CountableQuestionGroup {
  key: string;
  questions: PrepQuestion[];
}

export function countAnswers(
  groups: readonly CountableQuestionGroup[],
  answers: AnswerMap,
): { total: number; practiced: number; answered: number } {
  let total = 0;
  let practiced = 0;
  let answered = 0;

  for (const group of groups) {
    for (const [index, question] of group.questions.entries()) {
      total += 1;
      const entry = answers[questionKey(group.key, index, question)];
      if (entry?.practiced) practiced += 1;
      if ((entry?.text ?? '').trim().length > 0) answered += 1;
    }
  }

  return { total, practiced, answered };
}
