import { formatRelativeTime } from '../utils/format';
import { formatEmploymentType, formatExperienceLevel, formatWorkArrangement, formatLocation, formatSalaryRange } from '../utils/format';

describe('Job Format Utils', () => {
  describe('formatEmploymentType', () => {
    it('formats FullTime correctly', () => {
      expect(formatEmploymentType('FullTime')).toBe('Full Time');
    });
    it('formats Internship correctly', () => {
      expect(formatEmploymentType('Internship')).toBe('Internship');
    });
    it('formats PartTime correctly', () => {
      expect(formatEmploymentType('PartTime')).toBe('Part Time');
    });
    it('returns raw value for unknown type', () => {
      expect(formatEmploymentType('Unknown')).toBe('Unknown');
    });
  });

  describe('formatExperienceLevel', () => {
    it('formats EntryLevel correctly', () => {
      expect(formatExperienceLevel('EntryLevel')).toBe('Entry Level');
    });
    it('formats SeniorLevel correctly', () => {
      expect(formatExperienceLevel('SeniorLevel')).toBe('Senior Level');
    });
    it('formats Lead correctly', () => {
      expect(formatExperienceLevel('Lead')).toBe('Lead');
    });
    it('formats Executive correctly', () => {
      expect(formatExperienceLevel('Executive')).toBe('Executive');
    });
  });

  describe('formatWorkArrangement', () => {
    it('formats OnSite correctly', () => {
      expect(formatWorkArrangement('OnSite')).toBe('On-Site');
    });
    it('formats FullRemote correctly', () => {
      expect(formatWorkArrangement('FullRemote')).toBe('Full Remote');
    });
    it('formats Hybrid correctly', () => {
      expect(formatWorkArrangement('Hybrid')).toBe('Hybrid');
    });
    it('formats RemoteButAccessible correctly', () => {
      expect(formatWorkArrangement('RemoteButAccessible')).toBe('Remote But Accessible');
    });
    it('title-cases unknown values', () => {
      expect(formatWorkArrangement('remoteButAccessible')).toBe('Remote But Accessible');
    });
  });

  describe('formatLocation', () => {
    it('returns the trimmed location', () => {
      expect(formatLocation('Dhaka, Bangladesh')).toBe('Dhaka, Bangladesh');
    });
    it('returns null if location is empty', () => {
      expect(formatLocation('')).toBeNull();
    });
    it('returns null if location is null', () => {
      expect(formatLocation(null)).toBeNull();
    });
    it('trims whitespace', () => {
      expect(formatLocation('  Dhaka  ')).toBe('Dhaka');
    });
  });

  describe('formatSalaryRange', () => {
    it('returns Negotiable when salary type is missing or Negotiable', () => {
      expect(formatSalaryRange(null, 80000, 120000, 'BDT', 'PerMonth')).toBe('Negotiable');
      expect(formatSalaryRange('Negotiable', 80000, 120000, 'BDT', 'PerMonth')).toBe('Negotiable');
    });
    it('returns Negotiable when currency or minimum amount is missing', () => {
      expect(formatSalaryRange('Range', 80000, 120000, null, 'PerMonth')).toBe('Negotiable');
      expect(formatSalaryRange('Range', null, 120000, 'BDT', 'PerMonth')).toBe('Negotiable');
    });
    it('formats a range with the currency code and monthly period, without a currency symbol', () => {
      expect(formatSalaryRange('Range', 80000, 120000, 'BDT', 'PerMonth')).toBe(
        '80,000-120,000 BDT/month'
      );
    });
    it('formats a fixed salary as a single amount with yearly period', () => {
      expect(formatSalaryRange('Fixed', 90000, 90000, 'USD', 'PerYear')).toBe(
        '90,000 USD/year'
      );
    });
    it('omits the period suffix when the period is missing instead of assuming yearly', () => {
      expect(formatSalaryRange('Fixed', 90000, 90000, 'USD', null)).toBe('90,000 USD');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns Today for same-day date', () => {
      const today = new Date().toISOString();
      expect(formatRelativeTime(today)).toBe('Today');
    });
    it('returns "1 day ago" for yesterday', () => {
      const yesterday = new Date(Date.now() - 86_400_000).toISOString();
      expect(formatRelativeTime(yesterday)).toBe('1 day ago');
    });
    it('returns "N days ago" for recent dates', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 86_400_000).toISOString();
      expect(formatRelativeTime(fiveDaysAgo)).toBe('5 days ago');
    });
    it('returns empty string for null', () => {
      expect(formatRelativeTime(null)).toBe('');
    });
     it('returns Today when the server clock is slightly ahead of the browser', () => {
      const justReopened = new Date(Date.now() + 5_000).toISOString();
      expect(formatRelativeTime(justReopened)).toBe('Today');
    });
  });
});
