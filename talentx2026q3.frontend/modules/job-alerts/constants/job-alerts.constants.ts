export const JOB_ALERT_CONSTANTS = {
  MAX_ALERTS_PER_TALENT: 10,
  DEFAULT_PAGE_NUMBER: 1,
  DEFAULT_PAGE_SIZE: 10,
} as const;

export const JOB_ALERTS_API_ENDPOINTS = {
  JOB_ALERTS: '/job-alerts',
  NOTIFICATION_PREFERENCES: '/notification-preferences',
} as const;
