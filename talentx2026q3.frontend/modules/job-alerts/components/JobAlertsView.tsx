'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  Edit2,
  Plus,
  Sliders,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PortalPageContainer, PortalPageHeader } from '@/components/layout';
import {
  formatDate,
  formatEmploymentType,
  formatExperienceLevel,
  formatWorkArrangement,
} from '@/modules/job-listing';
import { CreateJobAlertDialog } from '@/modules/job-listing/components/CreateJobAlertDialog';
import { JOB_ALERT_CONSTANTS } from '../constants';
import {
  useJobAlerts,
  useNotificationPreferences,
  useToggleJobAlert,
  useUpdateNotificationPreferences,
} from '../hooks';
import type { JobAlert } from '../types';
import { DeleteJobAlertDialog } from './DeleteJobAlertDialog';
import { EditJobAlertDialog } from './EditJobAlertDialog';

export function JobAlertsView() {
  const { data: alerts = [], isPending, isError, error, refetch } = useJobAlerts();
  const { data: preferences } = useNotificationPreferences();
  const updatePreferencesMutation = useUpdateNotificationPreferences();
  const toggleAlertMutation = useToggleJobAlert();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);
  const [deletingAlert, setDeletingAlert] = useState<JobAlert | null>(null);

  const isGlobalEmailEnabled = preferences?.jobAlertsEmailEnabled ?? true;
  const isAlertLimitReached =
    alerts.length >= JOB_ALERT_CONSTANTS.MAX_ALERTS_PER_TALENT;

  const handleGlobalEmailToggle = (checked: boolean) => {
    updatePreferencesMutation.mutate({ jobAlertsEmailEnabled: checked });
  };

  const handleToggleAlert = (alertId: string, currentEnabledState: boolean) => {
    toggleAlertMutation.mutate({
      id: alertId,
      isEnabled: !currentEnabledState,
    });
  };

  return (
    <PortalPageContainer>
      <PortalPageHeader
        eyebrow={
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-semibold text-emerald-800">
            <Sparkles className="size-3 text-emerald-600 animate-pulse" />
            <span>Search Subscriptions</span>
          </div>
        }
        title="Job Search Alerts"
        subtitle="Manage your saved search criteria and automated email notifications for newly posted jobs."
        actions={
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700">
              <span className="font-mono font-bold text-slate-900">{alerts.length}</span>
              <span className="text-slate-400">/</span>
              <span>{JOB_ALERT_CONSTANTS.MAX_ALERTS_PER_TALENT} Saved</span>
            </div>

            <Button
              type="button"
              disabled={isAlertLimitReached}
              onClick={() => setIsCreateOpen(true)}
              className="h-10 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm px-4 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 transition-all disabled:opacity-50"
            >
              <Plus className="size-4" />
              <span>New Alert</span>
            </Button>
          </div>
        }
      />
      <div className="space-y-8">
        {/* Global Email Notification Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border ${
              isGlobalEmailEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            {isGlobalEmailEnabled ? (
              <BellRing className="size-5 text-emerald-700" />
            ) : (
              <BellOff className="size-5 text-slate-400" />
            )}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Email Notifications for Saved Alerts
              </h2>
              {isGlobalEmailEnabled && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/60">
                  <CheckCircle2 className="size-3" />
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              When turned on, you will receive emails when new positions match any of your enabled job alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <span className="text-xs font-semibold text-slate-600">
            {isGlobalEmailEnabled ? 'Enabled' : 'Paused'}
          </span>
          <Switch
            checked={isGlobalEmailEnabled}
            onCheckedChange={handleGlobalEmailToggle}
            disabled={updatePreferencesMutation.isPending}
            aria-label="Toggle email notifications for saved alerts"
          />
        </div>
      </div>

      {/* Alerts Content Area */}
      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((placeholderKey) => (
            <div
              key={placeholderKey}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-40 rounded-md bg-slate-200" />
                <div className="h-6 w-11 rounded-full bg-slate-200" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-24 rounded-lg bg-slate-100" />
                <div className="h-6 w-20 rounded-lg bg-slate-100" />
              </div>
              <div className="h-4 w-32 rounded-md bg-slate-100" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center rounded-2xl bg-white border border-slate-200 p-8 shadow-xs">
          <p className="text-base font-bold text-slate-900">Couldn&apos;t load job alerts</p>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            {(error as { message?: string })?.message ??
              'Something went wrong while fetching your job alerts.'}
          </p>
          <Button
            type="button"
            onClick={() => refetch()}
            className="mt-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Retry
          </Button>
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-slate-300 bg-white shadow-xs space-y-4">
          <div className="size-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
            <Bell className="size-7 text-emerald-700" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h2 className="text-lg font-bold text-slate-900">No Job Alerts Configured</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Create an alert with your target role, location, and work arrangement to get notified immediately when matching positions open up.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 transition-all shadow-xs"
          >
            <Plus className="size-4 mr-1.5" />
            <span>Create Your First Alert</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl border bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-5 transition-all hover:shadow-sm ${
                alert.isEnabled
                  ? 'border-slate-200/90'
                  : 'border-slate-200/60 bg-slate-50/50 opacity-90'
              }`}
            >
              <div className="space-y-3.5">
                {/* Alert Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 line-clamp-1">
                        {alert.name}
                      </h2>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                          alert.isEnabled
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {alert.isEnabled ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Created on {formatDate(alert.createdAt)}
                    </p>
                  </div>

                  <Switch
                    checked={alert.isEnabled}
                    onCheckedChange={() => handleToggleAlert(alert.id, alert.isEnabled)}
                    disabled={toggleAlertMutation.isPending}
                    aria-label={`Toggle alert for ${alert.name}`}
                  />
                </div>

                {/* Criteria Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50/80 px-2.5 py-1 text-xs font-semibold text-emerald-900 border border-emerald-200/70">
                    <Sliders className="size-3 text-emerald-700" />
                    Role: {alert.title}
                  </span>

                  {alert.location && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200/80">
                      Location: {alert.location}
                    </span>
                  )}

                  {alert.employmentType && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200/80">
                      {formatEmploymentType(alert.employmentType)}
                    </span>
                  )}

                  {alert.experienceLevel && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200/80">
                      {formatExperienceLevel(alert.experienceLevel)}
                    </span>
                  )}

                  {alert.workArrangement && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200/80">
                      {formatWorkArrangement(alert.workArrangement)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {(() => {
                  const parameters = new URLSearchParams();
                  if (alert.title) parameters.set('keyword', alert.title);
                  if (alert.location) parameters.set('location', alert.location);
                  if (alert.employmentType) parameters.set('employmentType', alert.employmentType);
                  if (alert.experienceLevel) parameters.set('experienceLevel', alert.experienceLevel);
                  if (alert.workArrangement) parameters.set('workArrangement', alert.workArrangement);
                  const matchingJobsUrl = parameters.toString() ? `/jobs?${parameters.toString()}` : '/jobs';

                  return (
                    <Link
                      href={matchingJobsUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-md py-1"
                    >
                      <span>View Matching Jobs</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  );
                })()}

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingAlert(alert)}
                    className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg"
                    aria-label={`Edit ${alert.name}`}
                  >
                    <Edit2 className="size-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingAlert(alert)}
                    className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                    aria-label={`Delete ${alert.name}`}
                  >
                    <Trash2 className="size-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog Modals */}
      <CreateJobAlertDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <EditJobAlertDialog
        alert={editingAlert}
        open={Boolean(editingAlert)}
        onOpenChange={(open) => {
          if (!open) setEditingAlert(null);
        }}
      />

      <DeleteJobAlertDialog
        alert={deletingAlert}
        open={Boolean(deletingAlert)}
        onOpenChange={(open) => {
          if (!open) setDeletingAlert(null);
        }}
      />
    </div>
  </PortalPageContainer>
);
}
