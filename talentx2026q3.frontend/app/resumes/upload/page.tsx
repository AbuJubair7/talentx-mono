'use client'

import React, { useState } from 'react'
import { Header } from '@/components/common/header'
import { Footer } from '@/components/common/footer'
import { BrandAmbientBackground } from '@/components/brand-ambient-background'
import { ResumeUploadDropzone } from '@/modules/resumes/components/ResumeUploadDropzone'
import { ExtractedProfileReview } from '@/modules/resumes/components/ExtractedProfileReview'
import { ResumeExtractionResult } from '@/modules/resumes/types/resume.types'
import { Sparkles } from 'lucide-react'

export default function ResumeUploadPage() {
  const [extractedProfile, setExtractedProfile] = useState<ResumeExtractionResult | null>(null)

  return (
    <BrandAmbientBackground className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-10 px-4 min-[600px]:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>AI-Powered Extraction</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Resume Parser &amp; Profile Builder
          </h1>

          <p className="text-sm sm:text-base text-slate-600">
            Upload your resume in PDF or DOCX format. Our AI automatically extracts your work experience, education, and technical skills to streamline your application.
          </p>
        </div>

        <div className="mx-auto w-full max-w-4xl">
          {!extractedProfile ? (
            <ResumeUploadDropzone onExtractionSuccess={(result) => setExtractedProfile(result)} />
          ) : (
            <ExtractedProfileReview
              data={extractedProfile}
              onReset={() => setExtractedProfile(null)}
            />
          )}
        </div>
      </main>

      <Footer />
    </BrandAmbientBackground>
  )
}
