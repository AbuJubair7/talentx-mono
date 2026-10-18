'use client';

import { Switch } from '@/components/ui/switch';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/modules/job-alerts';
import { SettingsRow } from './settings-row';

export function JobAlertNotificationRow() {
  const { data: preferences, isPending } = useNotificationPreferences();
  const updatePreferencesMutation = useUpdateNotificationPreferences();

  const isEmailEnabled = preferences?.jobAlertsEmailEnabled ?? true;

  const handleToggle = (checked: boolean) => {
    updatePreferencesMutation.mutate({
      jobAlertsEmailEnabled: checked,
    });
  };

  return (
    <SettingsRow
      title="Job Alert Emails"
      description="Get an email when new roles match your saved searches."
      badge={
        isEmailEnabled ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Active
          </span>
        ) : null
      }
      control={
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-muted-foreground">
            {isEmailEnabled ? 'Enabled' : 'Paused'}
          </span>
          <Switch
            checked={isEmailEnabled}
            onCheckedChange={handleToggle}
            disabled={isPending || updatePreferencesMutation.isPending}
            aria-label="Toggle job alert email notifications"
          />
        </div>
      }
    />
  );
}
