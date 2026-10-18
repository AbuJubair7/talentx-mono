export const jobAlertKeys = {
  all: ['job-alerts'] as const,
  lists: () => [...jobAlertKeys.all, 'list'] as const,
  preferences: () => ['notification-preferences'] as const,
};
