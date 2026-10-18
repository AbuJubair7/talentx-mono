import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Code2 } from 'lucide-react';

import { QuestionCategoryCard } from '../components/QuestionCategoryCard';
import { questionKey } from '../constants';
import type { AnswerMap, PrepQuestion } from '../types';

const questions: PrepQuestion[] = [
  { question: 'What is a closure?', category: 'Technical', tip: null },
  { question: 'Explain polymorphism', category: 'Technical', tip: null },
];

interface CardProps {
  questions?: PrepQuestion[];
  answers?: AnswerMap;
  onTogglePracticed?: (key: string) => void;
  onAnswerChange?: (key: string, text: string) => void;
}

function renderCard({
  questions: qs = questions,
  answers = {},
  onTogglePracticed = jest.fn(),
  onAnswerChange = jest.fn(),
}: CardProps = {}) {
  return render(
    <QuestionCategoryCard
      categoryKey="Technical"
      title="Technical Questions"
      source="Common technical expectations for this role"
      icon={Code2}
      questions={qs}
      answers={answers}
      onTogglePracticed={onTogglePracticed}
      onAnswerChange={onAnswerChange}
    />,
  );
}

afterEach(() => jest.clearAllMocks());

describe('QuestionCategoryCard', () => {
  it('renders nothing when there are no questions', () => {
    const { container } = render(
      <QuestionCategoryCard
        categoryKey="Technical"
        title="Technical Questions"
        icon={Code2}
        questions={[]}
        answers={{}}
        onTogglePracticed={jest.fn()}
        onAnswerChange={jest.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the title, count badge, and source line', () => {
    renderCard();

    expect(
      screen.getByRole('heading', { level: 3, name: /Technical Questions/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('Common technical expectations for this role')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('omits the source line when none is given', () => {
    render(
      <QuestionCategoryCard
        categoryKey="Technical"
        title="Technical Questions"
        icon={Code2}
        questions={questions}
        answers={{}}
        onTogglePracticed={jest.fn()}
        onAnswerChange={jest.fn()}
      />,
    );

    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    expect(screen.queryByText('Common technical expectations for this role')).not.toBeInTheDocument();
  });

  it('marks practiced questions by their stable key and reports the same key back', async () => {
    const onTogglePracticed = jest.fn();
    const answers: AnswerMap = {
      [questionKey('Technical', 0, questions[0])]: { text: '', practiced: true },
    };

    renderCard({ answers, onTogglePracticed });

    const boxes = screen.getAllByRole('checkbox');
    expect(boxes[0]).toHaveAttribute('aria-checked', 'true');
    expect(boxes[1]).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(boxes[1]);

    expect(onTogglePracticed).toHaveBeenCalledWith(
      questionKey('Technical', 1, questions[1]),
    );
  });

  it('seeds each chatbox from the answers map and reports changes with the key', async () => {
    const onAnswerChange = jest.fn();
    const answers: AnswerMap = {
      [questionKey('Technical', 0, questions[0])]: { text: 'Saved answer', practiced: false },
    };

    renderCard({ answers, onAnswerChange });

    expect(
      screen.getByLabelText('Your answer to: What is a closure?'),
    ).toHaveValue('Saved answer');
    expect(
      screen.getByLabelText('Your answer to: Explain polymorphism'),
    ).toHaveValue('');

    await userEvent.type(
      screen.getByLabelText('Your answer to: Explain polymorphism'),
      'x',
    );

    expect(onAnswerChange).toHaveBeenCalledWith(
      questionKey('Technical', 1, questions[1]),
      'x',
    );
  });
});
