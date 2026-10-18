'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Building2,
  Edit3,
  ExternalLink,
  Globe,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';
import { FaLinkedin, FaTwitter, FaFacebook } from 'react-icons/fa';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyReviewsSection } from '@/modules/company-review';
import { DefaultCompanyLogo } from './DefaultCompanyLogo';
import { CompanyDescription } from './CompanyDescription';
import { PublicCompanyJobsList } from './PublicCompanyJobsList';
import type { PublicCompanyProfileDto } from '../types/company-profile.types';

type CompanyPublicTab = 'jobs' | 'reviews';

interface PublicCompanyProfileViewProps {
  company: PublicCompanyProfileDto;
  isOwner?: boolean;
  isPreview?: boolean;
}

export function PublicCompanyProfileView({
  company,
  isOwner = false,
  isPreview = false,
}: PublicCompanyProfileViewProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getTabFromUrl = (): CompanyPublicTab => {
    const tabParam =
      searchParams.get('tab') ??
      (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null);
    return tabParam === 'reviews' ? 'reviews' : 'jobs';
  };

  const [activeTab, setActiveTab] = React.useState<CompanyPublicTab>(getTabFromUrl);

  const handleTabChange = (tab: CompanyPublicTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'reviews') {
      params.set('tab', 'reviews');
    } else {
      params.delete('tab');
    }
    const queryString = params.toString();
    window.history.replaceState(null, '', queryString ? `${pathname}?${queryString}` : pathname);
  };

  const formattedLocation = company.location || null;

  const jobs = company.publishedJobs ?? [];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Optional Preview Banner */}
      {isPreview && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2 sticky top-0 z-20 shadow-xs">
          <Sparkles className="size-4 shrink-0" />
          <span>Preview Mode: This is how job seekers will see your public company page.</span>
        </div>
      )}

      {/* Decorative Hero Background Gradient Header */}
      <div className="relative h-44 sm:h-56 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 size-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10 space-y-8">
        {/* Company Profile Hero Card */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
              {/* Logo */}
              <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xs sm:size-28">
                {company.logoUrl ? (
                  <Image
                    src={company.logoUrl}
                    alt={`${company.name} logo`}
                    width={112}
                    height={112}
                    unoptimized
                    className="size-full object-contain p-2"
                  />
                ) : (
                  <DefaultCompanyLogo
                    companyName={company.name}
                    size="xl"
                    className="size-full rounded-none"
                  />
                )}
              </div>

              {/* Company Info */}
              <div className="min-w-0 space-y-3">
                <div>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl break-words [overflow-wrap:anywhere]">
                      {company.name}
                    </h1>
                  </div>

                  {company.industry && (
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-500">
                      <Building2 className="size-3.5 text-slate-400" />
                      {company.industry}
                    </p>
                  )}
                </div>

                {/* Metadata chips */}
                {(company.companySize || formattedLocation) && (
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    {company.companySize && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                        <Users className="size-3.5 text-slate-400" />
                        {company.companySize} employees
                      </span>
                    )}

                    {formattedLocation && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                        <MapPin className="size-3.5 text-slate-400" />
                        {formattedLocation}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions: Owner Edit Button / Website Link */}
            <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 self-center sm:justify-end sm:self-start">
              {isOwner && (
                <Link href="/company">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 cursor-pointer rounded-lg border-slate-200 px-4 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50"
                  >
                    <Edit3 className="mr-1.5 size-3.5" />
                    Edit Company Profile
                  </Button>
                </Link>
              )}

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white shadow-none transition-colors hover:bg-emerald-500"
                >
                  <Globe className="mr-1.5 size-3.5" />
                  Visit Website
                  <ExternalLink className="ml-1.5 size-3 opacity-80" />
                </a>
              )}
            </div>
          </div>

          {/* Social Links Row */}
          {(company.linkedIn ||
            company.twitter ||
            company.facebook) && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 border-t border-slate-100 pt-5 sm:justify-start">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Follow us
              </span>

              {company.linkedIn && (
                <a
                  href={company.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex size-9 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-500 transition hover:border-transparent hover:bg-[#0077B5] hover:text-white"
                >
                  <FaLinkedin className="size-4" />
                </a>
              )}

              {company.twitter && (
                <a
                  href={company.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="flex size-9 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-500 transition hover:border-transparent hover:bg-[#1DA1F2] hover:text-white"
                >
                  <FaTwitter className="size-4" />
                </a>
              )}

              {company.facebook && (
                <a
                  href={company.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex size-9 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-500 transition hover:border-transparent hover:bg-[#1877F2] hover:text-white"
                >
                  <FaFacebook className="size-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* About the Company Section */}
        {company.description && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              About {company.name}
            </h2>
            <CompanyDescription
              description={company.description}
              className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed"
            />
          </div>
        )}

        {/* Open Positions / Reviews Tabs */}
        <div className="pt-2">
          <Tabs value={activeTab} onValueChange={(val) => handleTabChange(val as CompanyPublicTab)}>
            <TabsList variant="line">
              <TabsTrigger value="jobs">Open Positions</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="jobs" className="pt-4">
              <PublicCompanyJobsList
                jobs={jobs}
                companyName={company.name}
              />
            </TabsContent>

            <TabsContent value="reviews" className="pt-4">
              <CompanyReviewsSection companyId={company.id} summary={company.reviewSummary} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
