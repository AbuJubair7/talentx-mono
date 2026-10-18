import {
  ANSWER_AUTOSAVE_DEBOUNCE_MS,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_SHORT_LABELS,
  CATEGORY_SOURCES,
  MAX_ANSWER_LENGTH,
  PREPARATION_QUERY_KEYS,
  answerKey,
  buildAnswerMap,
  countAnswers,
  evaluationBand,
  parseAnswerKey,
  questionKey,
  questionsForCategory,
} from '../constants';
import type { AnswerMap, InterviewPreparationDto, PrepAnswerDto, PrepQuestion } from '../types';

const CATEGORY_KEYS = [
  'Technical',
  'Behavioral',
  'Experience-Based',
  'Role-Specific',
  'Additional',
] as const;

describe('PREPARATION_QUERY_KEYS', () => {
  it('exposes the shared root key', () => {
    expect(PREPARATION_QUERY_KEYS.all).toEqual(['interview-preparation']);
  });

  it('nests the detail key under the root key', () => {
    expect(PREPARATION_QUERY_KEYS.detail('inv-1')).toEqual(['interview-preparation', 'inv-1']);
  });
});

describe('questionKey', () => {
  const question: PrepQuestion = { question: 'What is a closure?', category: 'Technical', tip: null };

  it('builds a stable identity from category, index, and question text', () => {
    expect(questionKey('Technical', 2, question)).toBe('Technical::2::What is a closure?');
  });

  it('differs across categories, indexes, and question text', () => {
    expect(questionKey('Technical', 0, question)).not.toBe(questionKey('Behavioral', 0, question));
    expect(questionKey('Technical', 0, question)).not.toBe(questionKey('Technical', 1, question));
    expect(questionKey('Technical', 0, question)).not.toBe(
      questionKey('Technical', 0, { ...question, question: 'Explain polymorphism' }),
    );
  });
});

describe('answerKey', () => {
  it('matches the questionKey format from plain strings', () => {
    expect(answerKey('Technical', 2, 'What is a closure?')).toBe(
      'Technical::2::What is a closure?',
    );
    expect(answerKey('Technical', 2, 'What is a closure?')).toBe(
      questionKey('Technical', 2, {
        question: 'What is a closure?',
        category: 'Technical',
        tip: null,
      }),
    );
  });
});

describe('buildAnswerMap', () => {
  it('indexes answers by their stable key', () => {
    const answers: PrepAnswerDto[] = [
      {
        category: 'Technical',
        questionIndex: 0,
        question: 'What is a closure?',
        answer: 'A scoped function.',
        practiced: true,
      },
      {
        category: 'Behavioral',
        questionIndex: 1,
        question: 'Tell me about a conflict.',
        answer: '',
        practiced: false,
      },
    ];

    expect(buildAnswerMap(answers)).toEqual({
      'Technical::0::What is a closure?': { text: 'A scoped function.', practiced: true },
      'Behavioral::1::Tell me about a conflict.': { text: '', practiced: false },
    });
  });

  it('returns an empty map for missing input', () => {
    expect(buildAnswerMap(undefined)).toEqual({});
    expect(buildAnswerMap([])).toEqual({});
  });
});

describe('answer limits', () => {
  it('debounces autosave and caps the answer length consistently', () => {
    expect(ANSWER_AUTOSAVE_DEBOUNCE_MS).toBeGreaterThan(0);
    expect(MAX_ANSWER_LENGTH).toBeGreaterThan(0);
  });
});

describe('evaluationBand', () => {
  it.each([
    [90, 'Strong'],
    [85, 'Strong'],
    [79, 'Good'],
    [70, 'Good'],
    [60, 'Moderate'],
    [50, 'Moderate'],
    [20, 'Needs practice'],
    [0, 'Needs practice'],
  ])('maps %s to the %s band', (score, label) => {
    expect(evaluationBand(score).label).toBe(label);
  });
});

describe('category maps', () => {
  it.each(CATEGORY_KEYS)('maps %s to an icon, labels, and a source', (key) => {
    expect(CATEGORY_ICONS[key]).toBeDefined();
    expect(CATEGORY_LABELS[key]).toBeTruthy();
    expect(CATEGORY_SHORT_LABELS[key]).toBeTruthy();
    expect(CATEGORY_SOURCES[key]).toBeTruthy();
  });

  it('uses the display label suffix for every full label', () => {
    expect(CATEGORY_LABELS.Technical).toBe('Technical Questions');
    expect(CATEGORY_LABELS.Behavioral).toBe('Behavioral Questions');
    expect(CATEGORY_LABELS['Experience-Based']).toBe('Experience-Based Questions');
    expect(CATEGORY_LABELS['Role-Specific']).toBe('Role-Specific Questions');
    expect(CATEGORY_LABELS.Additional).toBe('Additional Questions');
  });

  it('keeps the Additional source as generated on request', () => {
    expect(CATEGORY_SOURCES.Additional).toBe('Generated on request');
  });
});

describe('parseAnswerKey', () => {
  it('round-trips the identity produced by answerKey', () => {
    const key = answerKey('Experience-Based', 3, 'Tell me about a failure.');

    expect(parseAnswerKey(key)).toEqual({ category: 'Experience-Based', questionIndex: 3 });
  });

  it('keeps question text that itself contains the separator', () => {
    const key = answerKey('Technical', 0, 'What does A::B mean?');

    expect(parseAnswerKey(key)).toEqual({ category: 'Technical', questionIndex: 0 });
  });
});

function makePreparation(overrides: Partial<InterviewPreparationDto> = {}): InterviewPreparationDto {
  return {
    id: 'prep-1',
    interviewInvitationId: 'inv-1',
    jobId: 'job-1',
    jobTitle: 'Backend Engineer',
    companyName: 'Acme',
    interviewType: 'Technical',
    scheduledAt: null,
    status: 'Generated',
    technicalQuestions: [],
    behavioralQuestions: [],
    experienceBasedQuestions: [],
    roleSpecificQuestions: [],
    keyTopicsToPrepare: [],
    suggestedRevisionAreas: [],
    additionalQuestions: null,
    generationCount: 1,
    generatedAt: '2026-09-26T08:00:00Z',
    isAccessible: true,
    answers: [],
    evaluation: null,
    disclaimer: '',
    ...overrides,
  };
}

describe('CATEGORY_ORDER', () => {
  it('lists every category exactly once', () => {
    expect([...CATEGORY_ORDER].sort()).toEqual(
      ['Additional', 'Behavioral', 'Experience-Based', 'Role-Specific', 'Technical'].sort(),
    );
    expect(new Set(CATEGORY_ORDER).size).toBe(CATEGORY_ORDER.length);
  });
});

describe('questionsForCategory', () => {
  const prep = makePreparation({
    technicalQuestions: [{ question: 'Q1', category: 'Technical', tip: null }],
    behavioralQuestions: [{ question: 'Q2', category: 'Behavioral', tip: null }],
    experienceBasedQuestions: [{ question: 'Q3', category: 'Experience-Based', tip: null }],
    roleSpecificQuestions: [{ question: 'Q4', category: 'Role-Specific', tip: null }],
    additionalQuestions: [{ question: 'Q5', category: 'Additional', tip: null }],
  });

  it.each(CATEGORY_ORDER)('returns the %s questions', (category) => {
    expect(questionsForCategory(prep, category)).toHaveLength(1);
  });

  it('treats a missing Additional list as empty instead of null', () => {
    expect(questionsForCategory(makePreparation({ additionalQuestions: null }), 'Additional')).toEqual(
      [],
    );
  });

  it('returns an empty list for an unknown category', () => {
    expect(questionsForCategory(prep, 'Nonsense')).toEqual([]);
  });
});

describe('countAnswers', () => {
  const groups = [
    { key: 'Technical', questions: [{ question: 'Q1', category: 'Technical', tip: null }] },
    { key: 'Behavioral', questions: [{ question: 'Q2', category: 'Behavioral', tip: null }] },
  ];

  it('counts totals independently of what the candidate has typed', () => {
    expect(countAnswers(groups, {})).toEqual({ total: 2, practiced: 0, answered: 0 });
  });

  it('counts practiced and answered questions from the draft map', () => {
    const answers: AnswerMap = {
      [answerKey('Technical', 0, 'Q1')]: { text: 'An answer', practiced: true },
      [answerKey('Behavioral', 0, 'Q2')]: { text: '   ', practiced: false },
    };

    expect(countAnswers(groups, answers)).toEqual({ total: 2, practiced: 1, answered: 1 });
  });
});
