import { companyProfileSchema } from '../company-profile.schema';

describe('companyProfileSchema', () => {
  it('validates a valid company profile with mandatory and optional fields', () => {
    const validData = {
      companyName: 'Acme Corporation',
      logoUrl: 'https://example.com/logo.png',
      description: 'A leading tech company.',
      industry: 'Technology & Software',
      companySize: '51-200',
      website: 'https://acme.com',
      location: 'San Francisco, CA',
      linkedin: 'https://linkedin.com/company/acme',
      twitter: 'https://twitter.com/acme',
      facebook: 'https://facebook.com/acme',
    };

    const result = companyProfileSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects an empty or too short company name', () => {
    const invalidData = {
      companyName: 'A',
    };

    const result = companyProfileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 2 characters');
    }
  });

  it('rejects invalid URLs', () => {
    const invalidData = {
      companyName: 'Acme Corp',
      website: 'not-a-valid-url-at-all::::',
    };

    const result = companyProfileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('allows empty string or undefined for optional fields', () => {
    const minimalData = {
      companyName: 'Acme Corp',
      description: '',
      industry: '',
      companySize: '',
      website: '',
      linkedin: '',
    };

    const result = companyProfileSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
  });

  it('rejects an industry outside the known options', () => {
    const result = companyProfileSchema.safeParse({
      companyName: 'Acme Corp',
      industry: 'Underwater Basket Weaving',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a company size outside the known options', () => {
    const result = companyProfileSchema.safeParse({
      companyName: 'Acme Corp',
      companySize: '99999',
    });

    expect(result.success).toBe(false);
  });
});
