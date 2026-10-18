"use client"

import React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { formatBytes } from "../utils/resume-format"
import type { FileMeta } from "../types/upload.types"

interface ExtractionProcessingProps {
  file: FileMeta
}

const SKELETON_ROWS = ["w-2/5", "w-4/5", "w-3/5"]

export function ExtractionProcessing({ file }: ExtractionProcessingProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex flex-col items-center px-2 py-6 text-center" role="status" aria-live="polite">
      <div className="relative flex h-16 w-16 items-center justify-center">
        {!reduceMotion && (
          <motion.span
            className="absolute inset-0 rounded-full bg-emerald-500/20"
            initial={{ scale: 0.9, opacity: 0.6 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            aria-hidden="true"
          />
        )}
        <span className="absolute inset-0 rounded-full border border-emerald-100 bg-emerald-50" aria-hidden="true" />
        <motion.svg
          viewBox="0 0 64 64"
          className="absolute inset-0 h-16 w-16"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          aria-hidden="true"
        >
          <circle
            cx="32"
            cy="32"
            r="29"
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="46 200"
          />
        </motion.svg>
        <Sparkles className="relative h-6 w-6 text-emerald-600" strokeWidth={1.75} aria-hidden="true" />
      </div>

      <h2 className="mt-6 text-base font-semibold text-slate-900">Extracting resume details with AI...</h2>
      <p className="mt-1 text-sm text-slate-500">Parsing experience, skills, and education...</p>

      <div className="mt-6 w-full max-w-sm">
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="absolute inset-y-0 w-1/3 rounded-full bg-emerald-600"
            initial={{ x: "-100%" }}
            animate={{ x: "300%" }}
            transition={{ duration: 1.4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
          />
        </div>
        <p className="mt-2 truncate text-xs text-slate-400">
          {file.name} · {formatBytes(file.size)}
        </p>
      </div>

      <div className="mt-6 w-full max-w-sm rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-left" aria-hidden="true">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200/80" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-slate-200/80" />
            <div className="h-2 w-1/2 animate-pulse rounded-full bg-slate-200/60" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {SKELETON_ROWS.map((w) => (
            <div key={w} className={`h-2 ${w} animate-pulse rounded-full bg-slate-200/60`} />
          ))}
        </div>
      </div>
      <span className="sr-only">Processing {file.name}</span>
    </div>
  )
}
