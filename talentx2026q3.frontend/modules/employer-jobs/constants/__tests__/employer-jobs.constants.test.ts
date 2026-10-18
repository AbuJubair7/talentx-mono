import { CalendarClock, FileText, Users } from 'lucide-react';
import {
  DEFAULT_JOB_DETAIL_TAB,
  DETAIL_TABS,
  STATUS_ACCENT_BORDER,
  STATUS_TABS,
  VIEW_MODE_STORAGE_KEY,
} from '../index';

describe('employer-jobs.constants', () => {
  describe('DEFAULT_JOB_DETAIL_TAB', () => {
    it('defaults to job-details', () => {
      expect(DEFAULT_JOB_DETAIL_TAB).toBe('job-details');
    });
  });

  describe('DETAIL_TABS', () => {
    it('defines 3 ordered tab options with expected labels, values, and icons', () => {
      expect(DETAIL_TABS).toHaveLength(3);
      expect(DETAIL_TABS.map((tabOption) => tabOption.value)).toEqual([
        'job-details',
        'applicants',
        'interviews',
      ]);
      expect(DETAIL_TABS.map((tabOption) => tabOption.label)).toEqual([
        'Job Details',
        'Applicants',
        'Interviews',
      ]);
      expect(DETAIL_TABS[0].icon).toBe(FileText);
      expect(DETAIL_TABS[1].icon).toBe(Users);
      expect(DETAIL_TABS[2].icon).toBe(CalendarClock);
    });
  });

  describe('VIEW_MODE_STORAGE_KEY', () => {
    it('defines expected localStorage key', () => {
      expect(VIEW_MODE_STORAGE_KEY).toBe('talentx_employer_jobs_view_mode');
    });
  });

  describe('STATUS_TABS', () => {
    it('defines every status tab option', () => {
      expect(STATUS_TABS).toHaveLength(7);
      expect(STATUS_TABS.map((tabOption) => tabOption.value)).toEqual([
        'All',
        'Active',
        'Draft',
        'Closed',
        'Expired',
        'Deactivated',
        'PendingReview',
      ]);
      // The moderation tabs read as plain English, not as the API's enum names.
      expect(STATUS_TABS.find((tab) => tab.value === 'PendingReview')?.label).toBe('Under review');
    });
  });

  describe('STATUS_ACCENT_BORDER', () => {
    it('defines border classes for all job status options', () => {
      expect(STATUS_ACCENT_BORDER.Published).toBe('border-t-emerald-500');
      expect(STATUS_ACCENT_BORDER.Draft).toBe('border-t-amber-500');
      expect(STATUS_ACCENT_BORDER.Closed).toBe('border-t-slate-400');
      expect(STATUS_ACCENT_BORDER.Expired).toBe('border-t-rose-500');
    });
  });
});
