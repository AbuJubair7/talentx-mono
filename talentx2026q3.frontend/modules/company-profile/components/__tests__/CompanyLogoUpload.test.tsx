import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompanyLogoUpload } from '../CompanyLogoUpload';
import { companyProfileService } from '../../services/company-profile.service';

jest.mock('../../services/company-profile.service', () => ({
  companyProfileService: {
    uploadCompanyLogo: jest.fn(),
    deleteCompanyLogo: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('CompanyLogoUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders default logo when no custom logo is provided', () => {
    renderWithClient(
      <CompanyLogoUpload
        companyName="Starlight Tech"
        logoUrl={null}
        onLogoChange={jest.fn()}
      />
    );

    expect(screen.getByTestId('default-company-logo')).toBeInTheDocument();
    expect(screen.getByText('ST')).toBeInTheDocument();
  });

  it('renders custom logo image when logoUrl is provided', () => {
    renderWithClient(
      <CompanyLogoUpload
        companyName="Starlight Tech"
        logoUrl="https://example.com/logo.png"
        onLogoChange={jest.fn()}
      />
    );

    const img = screen.getByAltText(/Starlight Tech logo/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('calls onLogoChange when file is selected and uploaded', async () => {
    const handleLogoChange = jest.fn();
    (companyProfileService.uploadCompanyLogo as jest.Mock).mockResolvedValueOnce({
      logoUrl: 'https://example.com/new-logo.png',
    });

    renderWithClient(
      <CompanyLogoUpload
        companyName="Starlight Tech"
        logoUrl={null}
        onLogoChange={handleLogoChange}
      />
    );

    const file = new File(['mock-image-bytes'], 'logo.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('company-logo-file-input');

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(companyProfileService.uploadCompanyLogo).toHaveBeenCalledWith(file);
      expect(handleLogoChange).toHaveBeenCalledWith('https://example.com/new-logo.png');
    });
  });

  it('removes custom logo via the API and triggers onLogoChange with null', async () => {
    const handleLogoChange = jest.fn();
    (companyProfileService.deleteCompanyLogo as jest.Mock).mockResolvedValueOnce(undefined);
    renderWithClient(
      <CompanyLogoUpload
        companyName="Starlight Tech"
        logoUrl="https://example.com/logo.png"
        onLogoChange={handleLogoChange}
      />
    );

    const removeBtn = screen.getByRole('button', { name: /Remove \(Use Default\)/i });
    await userEvent.click(removeBtn);

    await waitFor(() => {
      expect(companyProfileService.deleteCompanyLogo).toHaveBeenCalledTimes(1);
      expect(handleLogoChange).toHaveBeenCalledWith(null);
    });
  });

  it('keeps the logo and shows an error when removal fails', async () => {
    const handleLogoChange = jest.fn();
    (companyProfileService.deleteCompanyLogo as jest.Mock).mockRejectedValueOnce(
      new Error('Removal failed')
    );
    renderWithClient(
      <CompanyLogoUpload
        companyName="Starlight Tech"
        logoUrl="https://example.com/logo.png"
        onLogoChange={handleLogoChange}
      />
    );

    const removeBtn = screen.getByRole('button', { name: /Remove \(Use Default\)/i });
    await userEvent.click(removeBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent('Removal failed');
    expect(handleLogoChange).not.toHaveBeenCalled();
  });
});
