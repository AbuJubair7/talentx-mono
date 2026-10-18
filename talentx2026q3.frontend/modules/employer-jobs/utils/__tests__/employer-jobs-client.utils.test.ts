import { STATUS_TABS, VIEW_MODE_STORAGE_KEY } from '../../constants';
import {
  buildEmployerJobsUrl,
  calculatePaginationRange,
  getInitialEmployerJobsQueryParams,
  resolveJobTitle,
  syncEmployerJobsUrl,
} from '../employer-jobs-client.utils';

describe('employer-jobs-client.utils', () => {
  describe('Constants', () => {
    it('defines VIEW_MODE_STORAGE_KEY with expected localStorage key', () => {
      expect(VIEW_MODE_STORAGE_KEY).toBe('talentx_employer_jobs_view_mode');
    });

    it('defines STATUS_TABS with every status option', () => {
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

  describe('getInitialEmployerJobsQueryParams', () => {
    it('returns default pagination and undefined searchTerm when options are empty', () => {
      const initialQueryParams = getInitialEmployerJobsQueryParams({});
      expect(initialQueryParams).toEqual({
        page: 1,
        pageSize: 10,
        searchTerm: undefined,
      });
    });

    it('sets isExpired to true when urlIsExpiredParam is "true"', () => {
      const initialQueryParams = getInitialEmployerJobsQueryParams({
        urlIsExpiredParam: 'true',
      });
      expect(initialQueryParams).toEqual({
        page: 1,
        pageSize: 10,
        isExpired: true,
        searchTerm: undefined,
      });
    });

    it('sets isExpired to true when urlStatusParam is "Expired"', () => {
      const initialQueryParams = getInitialEmployerJobsQueryParams({
        urlStatusParam: 'Expired',
      });
      expect(initialQueryParams).toEqual({
        page: 1,
        pageSize: 10,
        isExpired: true,
        searchTerm: undefined,
      });
    });

    it('sets status to Published and isExpired to false when urlStatusParam is "Active"', () => {
      const initialQueryParams = getInitialEmployerJobsQueryParams({
        urlStatusParam: 'Active',
      });
      expect(initialQueryParams).toEqual({
        page: 1,
        pageSize: 10,
        status: 'Published',
        isExpired: false,
        searchTerm: undefined,
      });
    });

    it('sets status to Published and isExpired to false when urlStatusParam is "Published"', () => {
      const initialQueryParams = getInitialEmployerJobsQueryParams({
        urlStatusParam: 'Published',
      });
      expect(initialQueryParams).toEqual({
        page: 1,
        pageSize: 10,
        status: 'Published',
        isExpired: false,
        searchTerm: undefined,
      });
    });

    it('sets status to Draft when urlStatusParam is "Draft"', () => {
      const initialQueryParams = getInitialEmployerJobsQueryParams({
        urlStatusParam: 'Draft',
      });
      expect(initialQueryParams).toEqual({
        page: 1,
        pageSize: 10,
        status: 'Draft',
        searchTerm: undefined,
      });
    });

    it('sets status to Closed when urlStatusParam is "Closed"', () => {
      const initialQueryParams = getInitialEmployerJobsQueryParams({
        urlStatusParam: 'Closed',
      });
      expect(initialQueryParams).toEqual({
        page: 1,
        pageSize: 10,
        status: 'Closed',
        searchTerm: undefined,
      });
    });

    it('does not set status or isExpired when urlStatusParam is "All"', () => {
      const initialQueryParams = getInitialEmployerJobsQueryParams({
        urlStatusParam: 'All',
      });
      expect(initialQueryParams).toEqual({
        page: 1,
        pageSize: 10,
        searchTerm: undefined,
      });
    });

    it('does not set status for unknown status values', () => {
      const initialQueryParams = getInitialEmployerJobsQueryParams({
        urlStatusParam: 'UnknownStatus',
      });
      expect(initialQueryParams).toEqual({
        page: 1,
        pageSize: 10,
        searchTerm: undefined,
      });
    });

    it('trims and sets initialUrlSearchParam as searchTerm when non-empty', () => {
      const initialQueryParams = getInitialEmployerJobsQueryParams({
        initialUrlSearchParam: '  AI Researcher  ',
      });
      expect(initialQueryParams.searchTerm).toBe('AI Researcher');
    });

    it('sets searchTerm to undefined when initialUrlSearchParam is whitespace only', () => {
      const initialQueryParams = getInitialEmployerJobsQueryParams({
        initialUrlSearchParam: '    ',
      });
      expect(initialQueryParams.searchTerm).toBeUndefined();
    });

    it('combines status and search term properly', () => {
      const initialQueryParams = getInitialEmployerJobsQueryParams({
        urlStatusParam: 'Active',
        initialUrlSearchParam: 'Frontend',
      });
      expect(initialQueryParams).toEqual({
        page: 1,
        pageSize: 10,
        status: 'Published',
        isExpired: false,
        searchTerm: 'Frontend',
      });
    });
  });

  describe('buildEmployerJobsUrl', () => {
    it('returns clean pathname when no optional search parameters are provided', () => {
      const builtUrl = buildEmployerJobsUrl({
        pathname: '/job/job-listing',
      });
      expect(builtUrl).toBe('/job/job-listing');
    });

    it('appends status parameter when status is Active', () => {
      const builtUrl = buildEmployerJobsUrl({
        pathname: '/job/job-listing',
        status: 'Active',
      });
      expect(builtUrl).toBe('/job/job-listing?status=Active');
    });

    it('appends status parameter when status is Published', () => {
      const builtUrl = buildEmployerJobsUrl({
        pathname: '/job/job-listing',
        status: 'Published',
      });
      expect(builtUrl).toBe('/job/job-listing?status=Published');
    });

    it('appends status=Active when status is Published and isExpired is false', () => {
      const builtUrl = buildEmployerJobsUrl({
        pathname: '/job/job-listing',
        status: 'Published',
        isExpired: false,
      });
      expect(builtUrl).toBe('/job/job-listing?status=Active');
    });

    it('omits status when status is "All"', () => {
      const builtUrl = buildEmployerJobsUrl({
        pathname: '/job/job-listing',
        status: 'All',
      });
      expect(builtUrl).toBe('/job/job-listing');
    });

    it('appends isExpired parameter when isExpired is true', () => {
      const builtUrl = buildEmployerJobsUrl({
        pathname: '/job/job-listing',
        isExpired: true,
      });
      expect(builtUrl).toBe('/job/job-listing?isExpired=true');
    });

    it('appends isExpired parameter when status is "Expired"', () => {
      const builtUrl = buildEmployerJobsUrl({
        pathname: '/job/job-listing',
        status: 'Expired',
      });
      expect(builtUrl).toBe('/job/job-listing?isExpired=true');
    });

    it('appends trimmed search parameter when non-empty search is provided', () => {
      const builtUrl = buildEmployerJobsUrl({
        pathname: '/job/job-listing',
        search: '  Senior Engineer  ',
      });
      expect(builtUrl).toBe('/job/job-listing?search=Senior+Engineer');
    });

    it('omits search parameter when search is whitespace only', () => {
      const builtUrl = buildEmployerJobsUrl({
        pathname: '/job/job-listing',
        search: '   ',
      });
      expect(builtUrl).toBe('/job/job-listing');
    });

    it('combines status and search query parameters in order', () => {
      const builtUrl = buildEmployerJobsUrl({
        pathname: '/job/job-listing',
        status: 'Published',
        search: 'AI',
      });
      expect(builtUrl).toBe('/job/job-listing?status=Published&search=AI');
    });

    it('combines isExpired and search query parameters in order', () => {
      const builtUrl = buildEmployerJobsUrl({
        pathname: '/job/job-listing',
        isExpired: true,
        search: 'Intern',
      });
      expect(builtUrl).toBe('/job/job-listing?isExpired=true&search=Intern');
    });

    it('strips existing query parameters from pathname before building new URL', () => {
      const builtUrl = buildEmployerJobsUrl({
        pathname: '/job/job-listing?oldParam=123',
        status: 'Draft',
      });
      expect(builtUrl).toBe('/job/job-listing?status=Draft');
    });

    it('falls back to window.location.pathname when pathname is omitted', () => {
      window.history.pushState({}, '', '/job/job-listing');
      const builtUrl = buildEmployerJobsUrl({
        status: 'Published',
      });
      expect(builtUrl).toBe('/job/job-listing?status=Published');
    });
  });

  describe('syncEmployerJobsUrl', () => {
    let replaceStateSpy: jest.SpyInstance;

    beforeEach(() => {
      replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    });

    afterEach(() => {
      replaceStateSpy.mockRestore();
    });

    it('calls window.history.replaceState with built target URL', () => {
      syncEmployerJobsUrl({
        pathname: '/job/job-listing',
        status: 'Published',
        search: 'Engineer',
      });

      expect(replaceStateSpy).toHaveBeenCalledWith(
        window.history.state,
        '',
        '/job/job-listing?status=Published&search=Engineer'
      );
    });

    it('falls back to window.location.pathname if pathname is omitted', () => {
      window.history.pushState({}, '', '/job/job-listing');
      syncEmployerJobsUrl({
        isExpired: true,
      });

      expect(replaceStateSpy).toHaveBeenCalledWith(
        window.history.state,
        '',
        '/job/job-listing?isExpired=true'
      );
    });
  });

  describe('calculatePaginationRange', () => {
    it('returns 0 for both items when totalCount is zero or negative', () => {
      expect(calculatePaginationRange(1, 10, 0)).toEqual({
        fromItem: 0,
        toItem: 0,
      });
      expect(calculatePaginationRange(1, 10, -5)).toEqual({
        fromItem: 0,
        toItem: 0,
      });
    });

    it('calculates first page range correctly', () => {
      expect(calculatePaginationRange(1, 10, 25)).toEqual({
        fromItem: 1,
        toItem: 10,
      });
    });

    it('calculates middle page range correctly', () => {
      expect(calculatePaginationRange(2, 10, 25)).toEqual({
        fromItem: 11,
        toItem: 20,
      });
    });

    it('caps toItem at totalCount on the last page', () => {
      expect(calculatePaginationRange(3, 10, 25)).toEqual({
        fromItem: 21,
        toItem: 25,
      });
    });

    it('handles single page where totalCount is less than pageSize', () => {
      expect(calculatePaginationRange(1, 10, 4)).toEqual({
        fromItem: 1,
        toItem: 4,
      });
    });

    it('clamps non-positive page number and page size to minimum of 1', () => {
      expect(calculatePaginationRange(0, 0, 15)).toEqual({
        fromItem: 1,
        toItem: 1,
      });
    });
  });

  describe('resolveJobTitle', () => {
    const mockJobList = [
      { id: 'job-1', title: 'Senior AI Engineer' },
      { id: 'job-2', title: '   ' },
      { id: 'job-3', title: 'Machine Learning Specialist' },
    ];

    it('returns trimmed title from jobList when matching job is found', () => {
      const resolvedTitle = resolveJobTitle('job-1', mockJobList);
      expect(resolvedTitle).toBe('Senior AI Engineer');
    });

    it('returns fallbackTitle when jobId is not found in jobList', () => {
      const resolvedTitle = resolveJobTitle('job-nonexistent', mockJobList, 'Fallback Title');
      expect(resolvedTitle).toBe('Fallback Title');
    });

    it('falls back to fallbackTitle when matched job has whitespace or empty title', () => {
      const resolvedTitle = resolveJobTitle('job-2', mockJobList, 'Fallback Title');
      expect(resolvedTitle).toBe('Fallback Title');
    });

    it('returns empty string when neither jobList nor fallbackTitle provides a title', () => {
      const resolvedTitle = resolveJobTitle('job-nonexistent', mockJobList);
      expect(resolvedTitle).toBe('');
    });

    it('trims whitespace on resolved fallbackTitle', () => {
      const resolvedTitle = resolveJobTitle('job-nonexistent', [], '  Data Scientist  ');
      expect(resolvedTitle).toBe('Data Scientist');
    });
  });
});
