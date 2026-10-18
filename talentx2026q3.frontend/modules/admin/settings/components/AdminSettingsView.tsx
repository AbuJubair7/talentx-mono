"use client";

import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { PortalPageContainer, PortalPageHeader } from "@/components/layout";
import { InterviewPrepConfigForm } from "@/modules/admin/interview-prep-config";
import { AiConfigForm } from "./AiConfigForm";

type SettingsTab = "interview-prep" | "ai-config";

export function AdminSettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("interview-prep");

  return (
    <PortalPageContainer>
      <PortalPageHeader
        title="Settings"
        subtitle="Manage global system settings and feature configurations."
      />

      <div className="space-y-6">
        <div className="border-b border-zinc-200 dark:border-slate-800">
          <nav className="-mb-px flex space-x-6" aria-label="Settings tabs">
            <button
              type="button"
              onClick={() => setActiveTab("interview-prep")}
              className={`inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === "interview-prep"
                  ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Interview Preparation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ai-config")}
              className={`inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === "ai-config"
                  ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Bot className="h-4 w-4" />
              AI Configuration
            </button>
          </nav>
        </div>

        {activeTab === "interview-prep" && <InterviewPrepConfigForm />}
        {activeTab === "ai-config" && <AiConfigForm />}
      </div>
    </PortalPageContainer>
  );
}
