"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  Archive,
  ArrowRight,
  Briefcase,
  Building2,
  Clock,
  FileText,
  Hourglass,
  Moon,
  ShieldAlert,
  Plus,
  Sun,
  SunMedium,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { ApiError } from "@/lib/api/axios";
import { PortalPageContainer } from "@/components/layout";
import { useHeaderSession } from "@/components/common/use-header-session";
import { useCurrentEmployer } from "@/modules/jobposting/hooks/useCurrentEmployer";
import { meService } from "@/modules/jobposting/services/me.service";
import { VerificationStatusDialog } from "@/modules/employer-verification";
import { CandidateHiringPipelineCard } from "./CandidateHiringPipelineCard";
import { JobActionConfirmDialog } from "./JobActionConfirmDialog";
import { JobActionDropdown } from "./JobActionDropdown";
import { JobStatusBadge } from "./JobStatusBadge";
import { PipelineDistributionCard } from "./PipelineDistributionCard";
import { EmployerDashboardSkeleton } from "./EmployerDashboardSkeleton";
import { useEmployerDashboard } from "../hooks/useEmployerDashboard";
import { useCloseJob } from "../hooks/useCloseJob";
import { useDeleteJob } from "../hooks/useDeleteJob";
import { usePublishJob } from "../hooks/usePublishJob";
import { useReopenJob } from "../hooks/useReopenJob";
import {
  formatDisplayDate,
  getGreetingPrefix,
  getTimeOfDay,
  getTimeOfDayIconType,
  parseJobStatus,
  resolveGreetingRecipient,
} from "../utils";
import type {
  EmployerDashboardClientProps,
  EmployerDashboardMetricCard,
  JobActionDialogState,
} from "../types/employer-job.types";

function getJobActivityStatusConfig(statusString: string): {
  icon: typeof Zap;
  className: string;
} {
  const parsedStatus = parseJobStatus(statusString);
  switch (parsedStatus) {
    case "Published":
      return {
        icon: Zap,
        className: "text-emerald-700 bg-emerald-50 border-emerald-200",
      };
    case "Draft":
      return {
        icon: FileText,
        className: "text-amber-700 bg-amber-50 border-amber-200",
      };
    case "Closed":
      return {
        icon: Archive,
        className: "text-slate-600 bg-slate-100 border-slate-200",
      };
    case "Expired":
      return {
        icon: Clock,
        className: "text-rose-700 bg-rose-50 border-rose-200",
      };
    case "Deactivated":
      return {
        icon: ShieldAlert,
        className: "text-rose-800 bg-rose-50 border-rose-300",
      };
    case "PendingReview":
      return {
        icon: Hourglass,
        className: "text-amber-800 bg-amber-50 border-amber-300",
      };
  }
}

// Employer dashboard: stat cards, pipeline chart and recent activity.
export function EmployerDashboardClient({
  className,
  userName,
  userEmail,
}: EmployerDashboardClientProps) {
  const { user: sessionUser } = useHeaderSession();

  const sessionName =
    sessionUser?.name &&
    sessionUser.name !== "Employer User" &&
    sessionUser.name !== "Talent User"
      ? sessionUser.name
      : null;
  const effectiveUserName = userName !== undefined ? userName : sessionName;
  const effectiveUserEmail =
    userEmail !== undefined ? userEmail : (sessionUser?.email ?? null);

  const timeOfDay = useMemo(() => getTimeOfDay(), []);
  const greetingPrefix = useMemo(
    () => getGreetingPrefix(timeOfDay),
    [timeOfDay],
  );
  const timeOfDayIconType = useMemo(
    () => getTimeOfDayIconType(timeOfDay),
    [timeOfDay],
  );
  const recipientName = useMemo(
    () => resolveGreetingRecipient(effectiveUserName, effectiveUserEmail),
    [effectiveUserName, effectiveUserEmail],
  );
  const {
    data: dashboardData,
    isPending: isDashboardPending,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useEmployerDashboard();

  const closeJobMutation = useCloseJob();
  const deleteJobMutation = useDeleteJob();
  const reopenJobMutation = useReopenJob();
  const publishJobMutation = usePublishJob();

  const queryClient = useQueryClient();
  const { data: currentEmployer } = useCurrentEmployer();

  const reApplyMutation = useMutation({
    mutationFn: meService.reApply,
    onSuccess: () => {
      toast.success(
        "Re-application submitted. Your account is now pending verification.",
      );
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => {
      toast.error("Failed to re-apply. Please try again.");
    },
  });

  const [actionDialogState, setActionDialogState] =
    useState<JobActionDialogState>({
      isOpen: false,
      jobId: "",
      jobTitle: "",
      intent: "close",
    });

  const handleOpenCloseDialog = (
    selectedJobId: string,
    selectedJobTitle: string,
  ) => {
    setActionDialogState({
      isOpen: true,
      jobId: selectedJobId,
      jobTitle: selectedJobTitle,
      intent: "close",
    });
  };

  const handleOpenDeleteDialog = (
    selectedJobId: string,
    selectedJobTitle: string,
  ) => {
    setActionDialogState({
      isOpen: true,
      jobId: selectedJobId,
      jobTitle: selectedJobTitle,
      intent: "delete",
    });
  };

  const handleOpenReopenDialog = (
    selectedJobId: string,
    selectedJobTitle: string,
  ) => {
    setActionDialogState({
      isOpen: true,
      jobId: selectedJobId,
      jobTitle: selectedJobTitle,
      intent: "reopen",
    });
  };

  const handleOpenPublishDialog = (
    selectedJobId: string,
    selectedJobTitle: string,
  ) => {
    setActionDialogState({
      isOpen: true,
      jobId: selectedJobId,
      jobTitle: selectedJobTitle,
      intent: "publish",
    });
  };

  const handleDialogChange = (isNextOpen: boolean) => {
    setActionDialogState((previousState) => ({
      ...previousState,
      isOpen: isNextOpen,
    }));
  };

  const handleConfirmJobAction = () => {
    const dialogSettledCallback = {
      onSettled: () => {
        setActionDialogState((previousState) => ({
          ...previousState,
          isOpen: false,
        }));
      },
    };

    switch (actionDialogState.intent) {
      case "close":
        closeJobMutation.mutate(actionDialogState.jobId, dialogSettledCallback);
        break;
      case "delete":
        deleteJobMutation.mutate(
          actionDialogState.jobId,
          dialogSettledCallback,
        );
        break;
      case "reopen":
        reopenJobMutation.mutate(
          actionDialogState.jobId,
          dialogSettledCallback,
        );
        break;
      case "publish":
        publishJobMutation.mutate(
          actionDialogState.jobId,
          dialogSettledCallback,
        );
        break;
    }
  };

  const recentJobs = useMemo(() => {
    return dashboardData?.recentJobs ?? [];
  }, [dashboardData?.recentJobs]);

  if (isDashboardPending || isDashboardLoading) {
    return <EmployerDashboardSkeleton className={className} />;
  }

  if (isDashboardError) {
    const apiError = dashboardError as unknown as ApiError | null;
    const errorMessage =
      apiError?.userResponse?.message ??
      apiError?.message ??
      "Failed to load dashboard data.";

    return (
      <PortalPageContainer className={cn("py-16", className)}>
        <section
          aria-labelledby="dashboard-error-heading"
          className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-md border border-red-200 bg-red-50/90 p-6 text-center shadow-xs sm:p-8"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <AlertCircle className="size-6" aria-hidden="true" />
          </div>
          <div role="alert" aria-live="assertive" className="space-y-1.5">
            <h2
              id="dashboard-error-heading"
              className="text-xl font-bold tracking-tight text-slate-900"
            >
              Could not load dashboard
            </h2>
            <p className="break-words text-sm text-slate-600">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => refetchDashboard()}
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 shadow-xs transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:w-auto"
          >
            Retry
          </button>
        </section>
      </PortalPageContainer>
    );
  }

  const totalPostedJobs = dashboardData?.totalPostedJobs ?? 0;
  const totalHires = dashboardData?.totalHires ?? 0;
  const activeJobsCount = dashboardData?.activeJobsCount ?? 0;
  const draftJobsCount = dashboardData?.draftJobsCount ?? 0;
  const closedJobsCount = dashboardData?.closedJobsCount ?? 0;
  const expiredJobsCount = dashboardData?.expiredJobsCount ?? 0;
  const deactivatedJobsCount = dashboardData?.deactivatedJobsCount ?? 0;
  const pendingReviewJobsCount = dashboardData?.pendingReviewJobsCount ?? 0;
  const candidatePipeline = dashboardData?.candidatePipeline;

  const metricCards: EmployerDashboardMetricCard[] = [
    {
      identifier: "total-posted-jobs",
      label: "Total Posted Jobs",
      value: totalPostedJobs,
      icon: Briefcase,
      iconColorClassName: "text-slate-700",
      valueColorClassName: "text-slate-900",
      caption: "All-time listings",
      iconBgClassName: "bg-slate-100 text-slate-700 border-slate-200/80",
      accentBorderClassName: "hover:border-slate-300",
      href: "/job/job-listing?status=All",
    },
    {
      identifier: "total-hires",
      label: "Total Hires",
      value: totalHires,
      icon: UserCheck,
      iconColorClassName: "text-emerald-700",
      valueColorClassName: "text-slate-900",
      caption: "Talent secured",
      iconBgClassName: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      accentBorderClassName: "hover:border-emerald-300",
      href: "/job/job-listing?status=All",
    },
    {
      identifier: "active-jobs",
      label: "Active",
      value: activeJobsCount,
      icon: Zap,
      iconColorClassName: "text-amber-700",
      valueColorClassName: "text-slate-900",
      caption: "Live on market",
      iconBgClassName: "bg-amber-50 text-amber-700 border-amber-200/80",
      accentBorderClassName: "hover:border-amber-300",
      href: "/job/job-listing?status=Active",
    },
  ];

  return (
    <PortalPageContainer className={cn("space-y-6", className)}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between min-w-0">
        <header className="space-y-2 max-w-xl min-w-0 flex-1">
          <div className="flex items-start gap-3 min-w-0">
            {timeOfDayIconType === "sun" && (
              <Sun
                className="size-6 text-amber-500 shrink-0 mt-0.5 sm:mt-1"
                aria-hidden="true"
              />
            )}
            {timeOfDayIconType === "sun-medium" && (
              <SunMedium
                className="size-6 text-amber-600 shrink-0 mt-0.5 sm:mt-1"
                aria-hidden="true"
              />
            )}
            {timeOfDayIconType === "moon" && (
              <Moon
                className="size-6 text-indigo-400 shrink-0 mt-0.5 sm:mt-1"
                aria-hidden="true"
              />
            )}
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-[28px] break-words [overflow-wrap:anywhere] min-w-0">
              {recipientName
                ? `${greetingPrefix}, ${recipientName}`
                : `${greetingPrefix}.`}
            </h1>
          </div>

          <p className="text-sm text-zinc-500 leading-relaxed">
            Keep your open roles moving and stay close to the work that matters
            most.
          </p>
        </header>

        <section
          aria-label="Recruitment metrics"
          className="shrink-0 space-y-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {metricCards.map((metricCard) => {
              const IconComponent = metricCard.icon;
              return (
                <Link
                  key={metricCard.identifier}
                  href={metricCard.href ?? "/job/job-listing"}
                  aria-label={`View ${metricCard.label} listings`}
                  className={cn(
                    "flex items-center gap-4 rounded-md border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
                    metricCard.accentBorderClassName,
                  )}
                >
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-md border",
                      metricCard.iconBgClassName,
                    )}
                  >
                    <IconComponent
                      className={cn("size-5", metricCard.iconColorClassName)}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-2xl font-mono font-bold tracking-tight text-slate-900 tabular-nums">
                      {metricCard.value}
                    </span>
                    <span className="block text-xs font-medium text-slate-500 truncate">
                      {metricCard.label}
                    </span>
                    {metricCard.caption && (
                      <span className="block text-[11px] text-slate-400 truncate">
                        {metricCard.caption}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <section
        aria-label="Quick actions"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <Link
          href="/job/jobpost"
          className="group flex items-center justify-between gap-4 rounded-md border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-emerald-200/80 bg-emerald-50 text-emerald-700">
              <Briefcase className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-slate-900">
                Post a Job
              </p>
              <p className="text-xs text-slate-500">Start hiring today</p>
            </div>
          </div>
          <ArrowRight
            className="size-4 text-slate-400 shrink-0 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>

        <Link
          href="/company"
          className="group flex items-center justify-between gap-4 rounded-md border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-blue-200/80 bg-blue-50 text-blue-700">
              <Building2 className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-slate-900">
                View Company Profile
              </p>
              <p className="text-xs text-slate-500">
                Keep your company profile up to date
              </p>
            </div>
          </div>
          <ArrowRight
            className="size-4 text-slate-400 shrink-0 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </section>

      <section
        aria-label="Recruitment and hiring analytics"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <PipelineDistributionCard
          totalPostedJobs={totalPostedJobs}
          activeJobsCount={activeJobsCount}
          draftJobsCount={draftJobsCount}
          closedJobsCount={closedJobsCount}
          expiredJobsCount={expiredJobsCount}
          deactivatedJobsCount={deactivatedJobsCount}
          pendingReviewJobsCount={pendingReviewJobsCount}
          className="h-full"
        />

        <CandidateHiringPipelineCard
          appliedCount={candidatePipeline?.appliedCount ?? 0}
          shortlistedCount={candidatePipeline?.shortlistedCount ?? 0}
          invitedCount={candidatePipeline?.invitedCount ?? 0}
          interviewCount={candidatePipeline?.interviewCount ?? 0}
          rejectedCount={candidatePipeline?.rejectedCount ?? 0}
          hiredCount={candidatePipeline?.hiredCount ?? totalHires}
          className="h-full"
        />
      </section>

      <section
        role="region"
        aria-labelledby="recent-jobs-heading"
        className="flex w-full flex-col rounded-md border border-slate-200/90 bg-white p-5 shadow-xs"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <h2
              id="recent-jobs-heading"
              className="text-base font-bold tracking-tight text-slate-900"
            >
              Recent Activity
            </h2>
            {recentJobs.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
                {recentJobs.length}{" "}
                {recentJobs.length === 1 ? "listing" : "listings"}
              </span>
            )}
          </div>
          <Link
            href="/job/job-listing"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 rounded-sm"
          >
            <span>View all</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
          >
            <div className="flex size-12 items-center justify-center rounded-md border border-emerald-200/80 bg-emerald-50 text-emerald-700 shadow-xs">
              <Briefcase className="size-6" aria-hidden="true" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-sm font-bold tracking-tight text-slate-900">
                No jobs posted yet.
              </h3>
              <p className="text-xs leading-relaxed text-slate-500">
                Create your first job listing to begin receiving applications
                from qualified candidates.
              </p>
            </div>
            <Link
              href="/job/jobpost"
              className="mt-2 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              <span>Post a Job</span>
            </Link>
          </div>
        ) : (
          <div className="flex-1">
            <div className="hidden md:grid md:grid-cols-12 items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <span className="md:col-span-4">Job Role</span>
              <span className="md:col-span-3">Applicants</span>
              <span className="md:col-span-2">Openings</span>
              <span className="md:col-span-2">Date Posted</span>
              <span className="md:col-span-1 text-right">Actions</span>
            </div>
            <div className="divide-y divide-slate-100">
              {recentJobs.map((recentJob) => {
                const statusConfig = getJobActivityStatusConfig(
                  recentJob.status,
                );
                const StatusIcon = statusConfig.icon;
                const parsedStatus = parseJobStatus(recentJob.status);

                return (
                  <article
                    key={recentJob.id}
                    className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 py-3.5 px-3 rounded-md transition-colors hover:bg-slate-50/70"
                  >
                    <div className="flex min-w-0 items-center gap-3 md:col-span-4">
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-md border",
                          statusConfig.className,
                        )}
                      >
                        <StatusIcon className="size-4" aria-hidden="true" />
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Link
                          href={"/job/job-listing/" + recentJob.id}
                          className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors truncate block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 rounded-xs"
                        >
                          {recentJob.title}
                        </Link>
                        <JobStatusBadge status={parsedStatus} />
                      </div>
                    </div>

                    <div className="flex items-center md:col-span-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700">
                        <Users
                          className="size-3.5 text-slate-400"
                          aria-hidden="true"
                        />
                        <span>
                          {recentJob.applicantCount}{" "}
                          {recentJob.applicantCount === 1
                            ? "applicant"
                            : "applicants"}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 md:col-span-2">
                      <Briefcase
                        className="size-3.5 text-slate-400"
                        aria-hidden="true"
                      />
                      <span>
                        {recentJob.vacancies}{" "}
                        {recentJob.vacancies === 1 ? "opening" : "openings"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 md:col-span-2">
                      <Clock
                        className="size-3.5 text-slate-400"
                        aria-hidden="true"
                      />
                      <span>
                        Posted {formatDisplayDate(recentJob.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-end md:col-span-1">
                      <JobActionDropdown
                        jobId={recentJob.id}
                        jobTitle={recentJob.title}
                        jobStatus={parsedStatus}
                        isExpired={recentJob.status === "Expired"}
                        expireAt={recentJob.expireAt}
                        onClose={(selectedJobId: string) =>
                          handleOpenCloseDialog(selectedJobId, recentJob.title)
                        }
                        onDelete={(selectedJobId: string) =>
                          handleOpenDeleteDialog(selectedJobId, recentJob.title)
                        }
                        onReopen={(selectedJobId: string) =>
                          handleOpenReopenDialog(selectedJobId, recentJob.title)
                        }
                        onPublish={(selectedJobId: string) =>
                          handleOpenPublishDialog(
                            selectedJobId,
                            recentJob.title,
                          )
                        }
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <JobActionConfirmDialog
        open={actionDialogState.isOpen}
        onOpenChange={handleDialogChange}
        jobTitle={actionDialogState.jobTitle}
        intent={actionDialogState.intent}
        isPending={
          closeJobMutation.isPending ||
          deleteJobMutation.isPending ||
          reopenJobMutation.isPending ||
          publishJobMutation.isPending
        }
        onConfirm={handleConfirmJobAction}
      />

      <VerificationStatusDialog
        verificationStatus={
          currentEmployer?.verificationStatus ?? "PendingVerification"
        }
        rejectionReason={currentEmployer?.rejectionReason}
        onReApply={() => reApplyMutation.mutate()}
        isReApplying={reApplyMutation.isPending}
      />
    </PortalPageContainer>
  );
}
