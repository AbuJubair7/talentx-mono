import React from 'react';
import { render, screen } from '@testing-library/react';
import { AiScoreBadge } from '../AiScoreBadge';

describe('AiScoreBadge', () => {
  it('renders "Pending AI" when score is null', () => {
    render(<AiScoreBadge score={null} />);
    expect(screen.getByText('Pending AI')).toBeInTheDocument();
  });

  it('renders strong (deep green) ring for score >= 85', () => {
    const { container } = render(<AiScoreBadge score={85.4} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
    const greenCircle = container.querySelector('circle[stroke="#0F6E56"]');
    expect(greenCircle).toBeInTheDocument();
  });

  it('renders good (slate) ring for score >= 70', () => {
    const { container } = render(<AiScoreBadge score={72} />);
    expect(screen.getByText('72%')).toBeInTheDocument();
    const slateCircle = container.querySelector('circle[stroke="#475569"]');
    expect(slateCircle).toBeInTheDocument();
  });

  it('renders moderate (amber) ring for score >= 50', () => {
    const { container } = render(<AiScoreBadge score={55} />);
    expect(screen.getByText('55%')).toBeInTheDocument();
    const amberCircle = container.querySelector('circle[stroke="#92700C"]');
    expect(amberCircle).toBeInTheDocument();
  });

  it('renders low (light slate) ring for score < 50', () => {
    const { container } = render(<AiScoreBadge score={35} />);
    expect(screen.getByText('35%')).toBeInTheDocument();
    const lightCircle = container.querySelector('circle[stroke="#94a3b8"]');
    expect(lightCircle).toBeInTheDocument();
  });
});
