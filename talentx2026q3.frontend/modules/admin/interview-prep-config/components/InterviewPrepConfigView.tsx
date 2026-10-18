"use client";

import { useState, useEffect } from "react";
import { PortalPageContainer, PortalPageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useInterviewPrepConfig } from "../hooks/useInterviewPrepConfig";
import { useUpdateInterviewPrepConfig } from "../hooks/useUpdateInterviewPrepConfig";

export function InterviewPrepConfigView() {
  const { data: config, isLoading } = useInterviewPrepConfig();
  const { mutate: updateConfig, isPending } = useUpdateInterviewPrepConfig();

  const [formData, setFormData] = useState({
    dailyGenerateLimit: 1,
    dailyGenerationLimit: 1,
    maxRegenerationCount: 1,
    accessWindowAfterInterviewMinutes: 1,
  });

  useEffect(() => {
    if (config) {
      setFormData({
        dailyGenerateLimit: config.dailyGenerateLimit,
        dailyGenerationLimit: config.dailyGenerationLimit,
        maxRegenerationCount: config.maxRegenerationCount,
        accessWindowAfterInterviewMinutes: config.accessWindowAfterInterviewMinutes,
      });
    }
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Math.max(1, parseInt(value, 10) || 1),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
  };

  if (isLoading) {
    return (
      <PortalPageContainer>
        <PortalPageHeader 
          title="Interview Preparation Settings" 
          subtitle="Configure limits and policies for interview preparation features." 
        />
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>
        </div>
      </PortalPageContainer>
    );
  }

  return (
    <PortalPageContainer>
      <PortalPageHeader 
        title="Interview Preparation Settings" 
        subtitle="Configure limits and policies for interview preparation features." 
      />

      <div className="rounded-md border border-zinc-200/80 bg-white/95 p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/95">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-slate-300">
              Daily Generate Limit
            </label>
            <input
              type="number"
              name="dailyGenerateLimit"
              min="1"
              value={formData.dailyGenerateLimit}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
            <p className="text-xs text-zinc-400 dark:text-slate-500">
              Maximum number of items a user can generate per day.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-slate-300">
              Daily Generation Limit
            </label>
            <input
              type="number"
              name="dailyGenerationLimit"
              min="1"
              value={formData.dailyGenerationLimit}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
            <p className="text-xs text-zinc-400 dark:text-slate-500">
              Maximum overall generations allowed per day.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-slate-300">
              Max Regeneration Count
            </label>
            <input
              type="number"
              name="maxRegenerationCount"
              min="1"
              value={formData.maxRegenerationCount}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
            <p className="text-xs text-zinc-400 dark:text-slate-500">
              Maximum number of times a user can regenerate a response.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-slate-300">
              Access Window After Interview (minutes)
            </label>
            <input
              type="number"
              name="accessWindowAfterInterviewMinutes"
              min="1"
              value={formData.accessWindowAfterInterviewMinutes}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
            <p className="text-xs text-zinc-400 dark:text-slate-500">
              Time in minutes the user can access prep materials after the interview starts.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
            
            {config?.updatedAt && (
              <div className="text-sm text-zinc-500 dark:text-slate-400">
                Last updated: {new Date(config.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </form>
      </div>
    </PortalPageContainer>
  );
}
