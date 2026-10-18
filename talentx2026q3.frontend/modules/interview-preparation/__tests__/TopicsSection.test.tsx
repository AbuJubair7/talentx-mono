import { render, screen } from '@testing-library/react';

import { TopicsSection } from '../components/TopicsSection';

describe('TopicsSection', () => {
  it('renders both topic lists when both are present', () => {
    render(<TopicsSection topics={['Idempotency', 'Backpressure']} reviseAreas={['SQL tuning']} />);

    expect(screen.getByRole('heading', { name: 'Key topics to prepare' })).toBeInTheDocument();
    expect(screen.getByText('Idempotency')).toBeInTheDocument();
    expect(screen.getByText('Backpressure')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Suggested areas to revise' })).toBeInTheDocument();
    expect(screen.getByText('SQL tuning')).toBeInTheDocument();
  });

  it('renders only the topics list when there are no revision areas', () => {
    render(<TopicsSection topics={['Idempotency']} reviseAreas={[]} />);

    expect(screen.getByRole('heading', { name: 'Key topics to prepare' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Suggested areas to revise' })).not.toBeInTheDocument();
  });

  it('renders only the revision list when there are no topics', () => {
    render(<TopicsSection topics={[]} reviseAreas={['SQL tuning']} />);

    expect(screen.queryByRole('heading', { name: 'Key topics to prepare' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Suggested areas to revise' })).toBeInTheDocument();
  });

  it('shows an empty state when nothing was generated', () => {
    render(<TopicsSection topics={[]} reviseAreas={[]} />);

    expect(
      screen.getByText(/No topics were included in this preparation/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
