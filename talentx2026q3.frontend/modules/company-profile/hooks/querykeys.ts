export const companyProfileKeys = {
  all: ['company-profile'] as const,
  mine: () => [...companyProfileKeys.all, 'mine'] as const,
  publicProfile: (slugOrId: string) => [...companyProfileKeys.all, 'public', slugOrId] as const,
  publicJobs: (slugOrId: string) => [...companyProfileKeys.all, 'public-jobs', slugOrId] as const,
};
