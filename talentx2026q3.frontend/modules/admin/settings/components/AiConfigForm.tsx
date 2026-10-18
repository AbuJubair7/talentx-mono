"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  CUSTOM_MODEL_VALUE,
  DEFAULT_MODEL_NAME,
  PREDEFINED_MODELS,
} from "../constants/ai-config.constants";
import { useAiConfiguration, useUpdateAiConfiguration } from "../hooks/useAiConfig";
import type { UpdateAiConfigRequest } from "../types/ai-config";

export function AiConfigForm() {
  const { data: config, isLoading } = useAiConfiguration();
  const { mutate: updateConfig, isPending } = useUpdateAiConfiguration();

  const [prevConfig, setPrevConfig] = useState(config);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    if (!config) return DEFAULT_MODEL_NAME;
    const isPredefined = PREDEFINED_MODELS.some(
      (model) => model === config.modelName
    );
    return isPredefined ? config.modelName : CUSTOM_MODEL_VALUE;
  });
  const [customModelName, setCustomModelName] = useState<string>(() => {
    if (!config) return "";
    const isPredefined = PREDEFINED_MODELS.some(
      (model) => model === config.modelName
    );
    return isPredefined ? "" : config.modelName || "";
  });
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  if (config !== prevConfig) {
    setPrevConfig(config);
    if (config) {
      const isPredefined = PREDEFINED_MODELS.some(
        (model) => model === config.modelName
      );
      if (isPredefined) {
        setSelectedModel(config.modelName);
        setCustomModelName("");
      } else {
        setSelectedModel(CUSTOM_MODEL_VALUE);
        setCustomModelName(config.modelName || "");
      }
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const effectiveModelName =
      selectedModel === CUSTOM_MODEL_VALUE
        ? customModelName.trim()
        : selectedModel;

    if (!effectiveModelName) {
      return;
    }

    const payload: UpdateAiConfigRequest = {
      modelName: effectiveModelName,
    };

    if (apiKey.trim()) {
      payload.apiKey = apiKey.trim();
    }

    updateConfig(payload, {
      onSuccess: () => {
        setApiKey("");
      },
    });
  };

  if (isLoading) {
    return (
      <div
        data-testid="ai-config-loading"
        className="flex h-40 items-center justify-center rounded-md border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-slate-100">
          AI Configuration
        </h3>
        <p className="text-sm text-zinc-500 dark:text-slate-400">
          Manage Google Gemini model settings and API credentials for AI features.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label
            htmlFor="model-select"
            className="block text-sm font-medium text-zinc-700 dark:text-slate-300"
          >
            Model Name
          </label>
          <select
            id="model-select"
            aria-label="Model Name"
            value={selectedModel}
            onChange={(event) => setSelectedModel(event.target.value)}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 cursor-pointer"
          >
            {PREDEFINED_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
            <option value={CUSTOM_MODEL_VALUE}>custom</option>
          </select>
        </div>

        {selectedModel === CUSTOM_MODEL_VALUE && (
          <div className="space-y-2">
            <label
              htmlFor="custom-model-input"
              className="block text-sm font-medium text-zinc-700 dark:text-slate-300"
            >
              Custom Model Name
            </label>
            <input
              id="custom-model-input"
              type="text"
              value={customModelName}
              onChange={(event) => setCustomModelName(event.target.value)}
              placeholder="e.g. gemini-1.5-pro"
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="api-key-input"
              className="block text-sm font-medium text-zinc-700 dark:text-slate-300"
            >
              Gemini API Key
            </label>
            {config?.maskedApiKey && (
              <span className="text-xs text-zinc-500 dark:text-slate-400">
                Current: <span className="font-mono">{config.maskedApiKey}</span>
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="api-key-input"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={config?.hasCustomKey ? "••••••••" : "Enter API key"}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white pl-3 pr-10 text-sm text-zinc-900 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-sm p-1"
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-slate-400">
            Leave blank to keep existing configured key.
          </p>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>

          {config?.updatedAt && (
            <div className="text-xs text-zinc-500 dark:text-slate-400">
              Last updated: {new Date(config.updatedAt).toLocaleString()}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
