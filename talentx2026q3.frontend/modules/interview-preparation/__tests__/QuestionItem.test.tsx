import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { QuestionItem } from '../components/QuestionItem';
import type { PrepQuestion, SaveState } from '../types';

const question: PrepQuestion = {
  question: 'What is a closure?',
  category: 'Technical',
  tip: 'Describe scope and capture with a small example.',
};

interface ItemProps {
  question?: PrepQuestion;
  practiced?: boolean;
  answer?: string;
  saveState?: SaveState;
  onTogglePracticed?: () => void;
  onAnswerChange?: (text: string) => void;
}

function renderItem({
  question: q = question,
  practiced = false,
  answer = '',
  saveState = 'idle',
  onTogglePracticed = jest.fn(),
  onAnswerChange = jest.fn(),
}: ItemProps = {}) {
  return render(
    <QuestionItem
      question={q}
      practiced={practiced}
      answer={answer}
      saveState={saveState}
      onTogglePracticed={onTogglePracticed}
      onAnswerChange={onAnswerChange}
    />,
  );
}

afterEach(() => jest.clearAllMocks());

describe('QuestionItem', () => {
  it('renders the question text unpracticed by default', () => {
    renderItem();

    expect(screen.getByText('What is a closure?')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Mark as practiced' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('toggles the practiced state through the checkbox', async () => {
    const onTogglePracticed = jest.fn();
    renderItem({ onTogglePracticed });

    await userEvent.click(screen.getByRole('checkbox', { name: 'Mark as practiced' }));

    expect(onTogglePracticed).toHaveBeenCalledTimes(1);
  });

  it('labels the checkbox as un-practicing when already practiced', () => {
    renderItem({ practiced: true });

    expect(screen.getByRole('checkbox', { name: 'Mark as not practiced' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('expands and collapses the tip from the lightbulb button when one exists', async () => {
    renderItem();

    const toggle = screen.getByRole('button', { name: 'Show how to approach' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('How to approach it')).not.toBeInTheDocument();

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('How to approach it')).toBeInTheDocument();
    expect(
      screen.getByText('Describe scope and capture with a small example.'),
    ).toBeInTheDocument();

    await userEvent.click(toggle);

    // framer-motion keeps the panel mounted until its exit animation finishes
    await waitFor(() =>
      expect(screen.queryByText('How to approach it')).not.toBeInTheDocument(),
    );
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders the question text as plain text, not a button', () => {
    renderItem();

    expect(screen.getByText('What is a closure?')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /What is a closure\?/ }),
    ).not.toBeInTheDocument();
  });

  it('renders no lightbulb control when the tip is missing', () => {
    renderItem({ question: { ...question, tip: null } });

    expect(screen.getByText('What is a closure?')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show how to approach' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { expanded: false })).not.toBeInTheDocument();
  });

  it('renders an answer chatbox seeded with the saved answer', () => {
    renderItem({ answer: 'A closure captures its lexical scope.' });

    const input = screen.getByLabelText('Your answer to: What is a closure?');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('A closure captures its lexical scope.');
    expect(input).toHaveAttribute('placeholder', 'Type your answer…');
  });

  it('reports typed text through onAnswerChange', async () => {
    const onAnswerChange = jest.fn();
    renderItem({ onAnswerChange });

    await userEvent.type(
      screen.getByLabelText('Your answer to: What is a closure?'),
      'hi',
    );

    // The textarea is controlled: each keystroke reports the value at that moment,
    // which resets to the last committed prop value when the parent does not update it.
    expect(onAnswerChange).toHaveBeenNthCalledWith(1, 'h');
    expect(onAnswerChange).toHaveBeenNthCalledWith(2, 'i');
  });

  it('reflects the latest committed value after the parent updates it', () => {
    const onAnswerChange = jest.fn();
    const { rerender } = renderItem({ onAnswerChange });

    rerender(
      <QuestionItem
        question={question}
        practiced={false}
        answer="h"
        onTogglePracticed={jest.fn()}
        onAnswerChange={onAnswerChange}
      />,
    );

    expect(screen.getByLabelText('Your answer to: What is a closure?')).toHaveValue('h');
  });

  it('shows the save lifecycle in an aria-live indicator', () => {
    const { rerender } = renderItem({ saveState: 'idle' });
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();

    rerender(
      <QuestionItem
        question={question}
        practiced={false}
        answer=""
        saveState="saving"
        onTogglePracticed={jest.fn()}
        onAnswerChange={jest.fn()}
      />,
    );
    expect(screen.getByText('Saving…')).toBeInTheDocument();

    rerender(
      <QuestionItem
        question={question}
        practiced={false}
        answer=""
        saveState="saved"
        onTogglePracticed={jest.fn()}
        onAnswerChange={jest.fn()}
      />,
    );
    expect(screen.getByText('Saved')).toBeInTheDocument();

    rerender(
      <QuestionItem
        question={question}
        practiced={false}
        answer=""
        saveState="error"
        onTogglePracticed={jest.fn()}
        onAnswerChange={jest.fn()}
      />,
    );
    expect(screen.getByText('Not saved')).toBeInTheDocument();
  });

  it('caps the answer at the server-side maximum length', () => {
    renderItem();

    expect(screen.getByLabelText('Your answer to: What is a closure?')).toHaveAttribute(
      'maxlength',
      '4000',
    );
  });

  it('hides the character counter when the answer is empty', () => {
    renderItem({ answer: '' });

    expect(screen.queryByText('0 / 4000')).not.toBeInTheDocument();
    expect(screen.queryByText(/\/ 4000/)).not.toBeInTheDocument();
  });

  it('shows a live character counter once an answer is entered', () => {
    renderItem({ answer: 'A closure captures its lexical scope.' });

    expect(screen.getByText('37 / 4000')).toBeInTheDocument();
    expect(screen.getByText('37 / 4000')).toHaveClass('text-ink-subtle');
  });

  it('warns with color as the answer approaches the limit', () => {
    const { rerender } = renderItem({ answer: 'a'.repeat(3600) });

    expect(screen.getByText('3600 / 4000')).toHaveClass('text-amber-700');

    rerender(
      <QuestionItem
        question={question}
        practiced={false}
        answer={'a'.repeat(4000)}
        onTogglePracticed={jest.fn()}
        onAnswerChange={jest.fn()}
      />,
    );

    expect(screen.getByText('4000 / 4000')).toHaveClass('text-danger');
  });
});
