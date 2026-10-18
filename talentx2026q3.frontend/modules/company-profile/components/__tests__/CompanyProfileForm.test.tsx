import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper';
import { CompanyProfileForm } from '../CompanyProfileForm';
import type { CompanyProfileDto } from '../../types/company-profile.types';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// CompanyLogoUpload now hosts the delete-logo mutation, so the form needs
// a QueryClient like the real portal layout provides.
function renderWithClient(ui: React.ReactElement) {
  return render(ui, { wrapper: createQueryWrapper() });
}

describe('CompanyProfileForm', () => {
  const mockInitialData: CompanyProfileDto = {
    id: '11111111-1111-1111-1111-111111111111',
    employerId: 'emp-1',
    name: 'Acme Corp',
    logoUrl: null,
    description: 'We build awesome software.',
    industry: 'Technology & Software',
    companySize: '51-200',
    website: 'https://acme.com',
    location: 'San Francisco, CA',
    linkedIn: 'https://linkedin.com/company/acme',
    twitter: 'https://twitter.com/acme',
    facebook: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial form values correctly', () => {
    renderWithClient(<CompanyProfileForm initialData={mockInitialData} onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/Company Name/i)).toHaveValue('Acme Corp');
    expect(screen.getByLabelText(/Company Description/i)).toHaveValue('We build awesome software.');
    expect(screen.getByLabelText(/Company Website/i)).toHaveValue('https://acme.com');
    expect(screen.getByLabelText(/Headquarters \/ Location/i)).toHaveValue('San Francisco, CA');
    expect(screen.getByLabelText(/LinkedIn/i)).toHaveValue('https://linkedin.com/company/acme');
  });

  it('renders numbered sections', () => {
    renderWithClient(<CompanyProfileForm initialData={mockInitialData} onSubmit={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Company Information' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Online Presence' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'About Your Company' })).toBeInTheDocument();

    expect(screen.getByText('Company Logo')).toBeInTheDocument();
    expect(screen.getByText(/\/ 5000/)).toBeInTheDocument();
  });

  it('renders website and social initial values', () => {
    renderWithClient(<CompanyProfileForm initialData={mockInitialData} onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/Company Website/i)).toHaveValue('https://acme.com');
    expect(screen.getByLabelText(/X \/ Twitter/i)).toHaveValue('https://twitter.com/acme');
    expect(screen.getByLabelText(/Facebook/i)).toHaveValue('');
  });

  it('validates mandatory company name before submitting', async () => {
    const handleSubmit = jest.fn();
    renderWithClient(<CompanyProfileForm initialData={mockInitialData} onSubmit={handleSubmit} />);

    const companyNameInput = screen.getByLabelText(/Company Name/i);
    await userEvent.clear(companyNameInput);
    await userEvent.type(companyNameInput, 'A');

    const submitBtn = screen.getByRole('button', { name: /Save Changes/i });
    await userEvent.click(submitBtn);

    expect(await screen.findByText(/Company name must be at least 2 characters/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits updated company details with backend payload shape', async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    renderWithClient(<CompanyProfileForm initialData={mockInitialData} onSubmit={handleSubmit} />);

    const companyNameInput = screen.getByLabelText(/Company Name/i);
    await userEvent.clear(companyNameInput);
    await userEvent.type(companyNameInput, 'Acme Global Inc');

    const submitBtn = screen.getByRole('button', { name: /Save Changes/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          companyName: 'Acme Global Inc',
        }),
      );
    });
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const handleCancel = jest.fn();
    renderWithClient(
      <CompanyProfileForm
        initialData={mockInitialData}
        onSubmit={jest.fn()}
        onCancel={handleCancel}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /^Cancel$/i }));

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('does not render a Cancel button when onCancel is not provided', () => {
    renderWithClient(<CompanyProfileForm initialData={mockInitialData} onSubmit={jest.fn()} />);

    expect(screen.queryByRole('button', { name: /^Cancel$/i })).not.toBeInTheDocument();
  });

  it('calls onPreview when Preview button is clicked', async () => {
    const handlePreview = jest.fn();
    renderWithClient(
      <CompanyProfileForm
        initialData={mockInitialData}
        onSubmit={jest.fn()}
        onPreview={handlePreview}
      />,
    );

    const previewButtons = screen.getAllByRole('button', { name: /Preview/i });
    await userEvent.click(previewButtons[0]);

    expect(handlePreview).toHaveBeenCalled();
  });
});
