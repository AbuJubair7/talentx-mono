'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Building2,
  Edit3,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  RefreshCw,
  Star,
  Users,
} from 'lucide-react';
import { FaLinkedin, FaTwitter, FaFacebook } from 'react-icons/fa';

import { Button } from '@/components/ui/button';
import { PortalPageContainer, PortalPageHeader } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployerReviewsView } from '@/modules/employer-reviews';

import { useCompanyProfile } from '../hooks/useCompanyProfile';
import { useUpdateCompanyProfile } from '../hooks/useUpdateCompanyProfile';
import { CompanyProfileForm } from './CompanyProfileForm';
import { CompanyDescription } from './CompanyDescription';
import { DefaultCompanyLogo } from './DefaultCompanyLogo';
import { getCompanyProfilePath } from '../utils/company-slug';

import type { UpdateCompanyProfilePayload } from '../types/company-profile.types';

type CompanyPageTab = 'details' | 'reviews';

export function EmployerCompanyPage() {
  const { data: profile, isLoading, isError, refetch } =
    useCompanyProfile();

  const updateMutation = useUpdateCompanyProfile();

  const [isEditing, setIsEditing] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeTab: CompanyPageTab = searchParams.get('tab') === 'reviews' ? 'reviews' : 'details';

  const handleTabChange = (tab: CompanyPageTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'reviews') {
      params.set('tab', 'reviews');
    } else {
      params.delete('tab');
    }
    const queryString = params.toString();
    window.history.replaceState(null, '', queryString ? `${pathname}?${queryString}` : pathname);
  };

  /* ─────────────────────────────────────────────
     Loading
  ───────────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
        <div className="flex size-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <Loader2 className="size-5 animate-spin text-slate-700" />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">
            Loading company profile
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Please wait a moment...
          </p>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     Error
  ───────────────────────────────────────────── */

  if (isError || !profile) {
    return (
      <div className="min-h-[60vh] bg-slate-50/70 px-4 py-10">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-xl bg-rose-50">
            <Building2 className="size-6 text-rose-500" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-900">
            Unable to load company profile
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            There was a problem retrieving your company information.
            Please try again.
          </p>

          <Button
            onClick={() => refetch()}
            variant="outline"
            className="
              mt-6 h-9 gap-2 rounded-lg
              border-slate-200
              px-4 text-sm font-medium
              text-slate-700
              hover:bg-slate-50
            "
          >
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     Update
  ───────────────────────────────────────────── */

  const handleUpdate = async (payload: UpdateCompanyProfilePayload) => {
  try {
    await updateMutation.mutateAsync(payload);
     setIsEditing(false); // only reached on success, so the form stays open on error
    } catch {
      // Toast is already shown by useUpdateCompanyProfile's onError.
    }
  };

  const publicPath = getCompanyProfilePath(profile.id);

  const formattedLocation = profile.location || null;

  const hasSocials = Boolean(profile.linkedIn || profile.twitter || profile.facebook);

  /* ─────────────────────────────────────────────
     Edit Mode
  ───────────────────────────────────────────── */

  if (isEditing) {
    return (
      <PortalPageContainer>
        <div className="space-y-6">
          <PortalPageHeader
            title="Edit company profile"
            subtitle="Update how your company appears to talents."
          />

          {/* Form Card */}
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-7">
              <p className="text-xs font-medium text-slate-500">
                Profile information
              </p>
            </div>

            <div className="p-5 sm:p-7">
              <CompanyProfileForm
                initialData={profile}
                onSubmit={handleUpdate}
                isSubmitting={updateMutation.isPending}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          </div>
        </div>
      </PortalPageContainer>
    );
  }

  /* ─────────────────────────────────────────────
     View Mode
  ───────────────────────────────────────────── */

  return (
    <PortalPageContainer>
      <div className="space-y-6">
        <PortalPageHeader
          title=""
          subtitle=""
        />

        {/* Company Hero */}
        <section className="relative overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm mt-4">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-slate-100 via-white to-slate-100" />

          {/* Hero actions */}
          <div className="absolute right-5 top-5 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTabChange('reviews')}
              title="Company reviews"
              aria-label="Company reviews"
              className="
                flex size-9 cursor-pointer items-center justify-center
                rounded-full border border-slate-200
                bg-white/90 text-slate-500
                shadow-sm backdrop-blur transition
                hover:border-slate-300
                hover:text-slate-900
                hover:shadow
              "
            >
              <Star className="size-4" />
            </button>

            <Link
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              title="View public profile"
              aria-label="View public profile"
              className="
                flex size-9 items-center justify-center
                rounded-full border border-slate-200
                bg-white/90 text-slate-500
                shadow-sm backdrop-blur transition
                hover:border-slate-300
                hover:text-slate-900
                hover:shadow
              "
            >
              <ExternalLink className="size-4" />
            </Link>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="Edit profile"
              aria-label="Edit profile"
              className="
                flex size-9 cursor-pointer items-center justify-center
                rounded-full border border-slate-200
                bg-white/90 text-slate-500
                shadow-sm backdrop-blur transition
                hover:border-slate-300
                hover:text-slate-900
                hover:shadow
              "
            >
              <Edit3 className="size-4" />
            </button>
          </div>

          <div className="relative px-5 pb-7 pt-6 sm:px-7">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">

              {/* Logo */}
              <div
                className="
                  flex size-24 shrink-0
                  items-center justify-center
                  overflow-hidden rounded-md
                  border border-slate-200
                  bg-white
                  shadow-md
                  ring-4 ring-white
                "
              >
                {profile.logoUrl ? (
                  <Image
                    src={profile.logoUrl}
                    alt={`${profile.name} logo`}
                    width={96}
                    height={96}
                    unoptimized
                    className="size-full object-contain p-2"
                  />
                ) : (
                  <DefaultCompanyLogo
                    companyName={profile.name}
                    size="lg"
                    className="size-full rounded-none"
                  />
                )}
              </div>

              {/* Company Info */}
              <div className="min-w-0 flex-1">

                <h1 className="truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {profile.name}
                </h1>

                {profile.industry && (
                  <p className="mt-1 text-sm text-slate-500">
                    {profile.industry}
                  </p>
                )}

                {/* Metadata */}
                <div className="mt-4 flex flex-wrap gap-2">

                  {profile.companySize && (
                    <span
                      className="
                        inline-flex items-center gap-1.5
                        rounded-full
                        bg-slate-100
                        px-3 py-1.5
                        text-xs font-medium
                        text-slate-600
                      "
                    >
                      <Users className="size-3.5" />
                      {profile.companySize} employees
                    </span>
                  )}

                  {formattedLocation && (
                    <span
                      className="
                        inline-flex items-center gap-1.5
                        rounded-full
                        bg-slate-100
                        px-3 py-1.5
                        text-xs font-medium
                        text-slate-600
                      "
                    >
                      <MapPin className="size-3.5" />
                      {formattedLocation}
                    </span>
                  )}

                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex items-center gap-1.5
                        rounded-full
                        bg-emerald-50
                        px-3 py-1.5
                        text-xs font-medium
                        text-emerald-700
                        transition
                        hover:bg-emerald-100
                      "
                    >
                      <Globe className="size-3.5" />

                      Website

                      <ExternalLink className="size-3" />
                    </a>
                  )}

                </div>
              </div>
            </div>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as CompanyPageTab)}>
          <TabsList variant="line">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* ═══════════════════════════════════════
                Company Details
            ═══════════════════════════════════════ */}

            <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">

              {/* Section Header */}
              <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">

                  <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100">
                    <Building2 className="size-4 text-slate-600" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Company Details
                    </h2>

                    <p className="text-xs text-slate-400">
                      Basic information about your company
                    </p>
                  </div>

                </div>
              </div>

              {/* Details */}
              <dl className="grid sm:grid-cols-2">

                <DetailItem
                  label="Company Name"
                  value={profile.name}
                />

                <DetailItem
                  label="Industry"
                  value={profile.industry}
                />

                <DetailItem
                  label="Company Size"
                  value={
                    profile.companySize
                      ? `${profile.companySize} employees`
                      : null
                  }
                />

                <DetailItem
                  label="Headquarters"
                  value={formattedLocation}
                />

                <div className="sm:col-span-2">
                  <DetailItem
                    label="Website"
                    value={
                      profile.website ? (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            inline-flex items-center gap-1.5
                            font-medium
                            text-emerald-700
                            hover:text-emerald-800
                            hover:underline
                          "
                        >
                          {profile.website.replace(/^https?:\/\//, '')}

                          <ExternalLink className="size-3" />
                        </a>
                      ) : null
                    }
                  />
                </div>

              </dl>
            </section>

            {/* ═══════════════════════════════════════
                About Company
            ═══════════════════════════════════════ */}

            {profile.description && (
              <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                  <h2 className="text-sm font-semibold text-slate-900">
                    About the Company
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    How your company is presented to talents
                  </p>
                </div>

                <div className="px-5 py-6 sm:px-7">
                  <CompanyDescription
                    description={profile.description}
                    className="text-sm leading-7 text-slate-600"
                  />
                </div>

              </section>
            )}

            {/* ═══════════════════════════════════════
                Social Links
            ═══════════════════════════════════════ */}

            {(profile.linkedIn ||
              profile.twitter ||
              profile.facebook) && (
              <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Social & Online Presence
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Connect your company with its social profiles
                  </p>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-7">

                  {profile.linkedIn && (
                    <SocialCard
                      href={profile.linkedIn}
                      icon={<FaLinkedin className="size-5" />}
                      label="LinkedIn"
                      value={profile.linkedIn.replace(/^https?:\/\//, '')}
                    />
                  )}

                  {profile.twitter && (
                    <SocialCard
                      href={profile.twitter}
                      icon={<FaTwitter className="size-5" />}
                      label="X / Twitter"
                      value={profile.twitter.replace(/^https?:\/\//, '')}
                    />
                  )}

                  {profile.facebook && (
                    <SocialCard
                      href={profile.facebook}
                      icon={<FaFacebook className="size-5" />}
                      label="Facebook"
                      value={profile.facebook.replace(/^https?:\/\//, '')}
                    />
                  )}

                </div>
              </section>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <EmployerReviewsView />
          </TabsContent>
        </Tabs>

      </div>
    </PortalPageContainer>
  );
}

/* ─────────────────────────────────────────────
   Detail Item
───────────────────────────────────────────── */

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode | string | null | undefined;
}) {
  const isEmpty =
    value === null ||
    value === undefined ||
    value === '';

  return (
    <div
      className="
        border-b border-slate-100
        px-5 py-5
        last:border-b-0
        sm:px-7
        sm:nth-[3]:border-b-0
      "
    >
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>

      <dd className="mt-1.5 text-sm font-medium text-slate-700">
        {isEmpty ? (
          <span className="font-normal italic text-slate-400">
            Not specified
          </span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Social Card
───────────────────────────────────────────── */

function SocialCard({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group flex items-center gap-3
        rounded-xl
        border border-slate-200
        bg-slate-50/50
        p-4
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:bg-white
        hover:shadow-sm
      "
    >
      {/* Icon */}
      <div
        className="
          flex size-10 shrink-0
          items-center justify-center
          rounded-lg
          border border-slate-200
          bg-white
          text-slate-500
          transition-colors
          group-hover:text-slate-900
        "
      >
        {icon}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs text-slate-400">
          {value}
        </p>
      </div>

      {/* External icon */}
      <ExternalLink
        className="
          size-3.5 shrink-0
          text-slate-300
          transition-colors
          group-hover:text-slate-500
        "
      />
    </a>
  );
}