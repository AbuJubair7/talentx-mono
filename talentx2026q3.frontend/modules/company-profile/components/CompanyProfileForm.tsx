'use client';

import React from 'react';
import { Controller, useForm, UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Save,
  X,
} from 'lucide-react';

import {
  FaFacebook,
  FaLinkedin,
  FaTwitter,
} from 'react-icons/fa';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldWrapper, fieldDescribedBy } from '@/components/common/form/FieldWrapper';
import { fieldInputClass } from '@/components/common/form/field-styles';

import {
  COMPANY_SIZE_OPTIONS,
  INDUSTRY_OPTIONS,
  isCompanySizeOption,
  isIndustryOption,
  type CompanyProfileDto,
  type UpdateCompanyProfilePayload,
} from '../types/company-profile.types';
import {
  companyProfileSchema,
  type CompanyProfileFormValues,
} from '../schemas/company-profile.schema';

import { CompanyLogoUpload } from './CompanyLogoUpload';

import {
  normalizeUrl,
  slugifyCompanyName,
} from '../utils/company-slug';

const DESCRIPTION_LIMIT = 5000;

interface CompanyProfileFormProps {
  initialData?: CompanyProfileDto | null;
  onSubmit: (data: UpdateCompanyProfilePayload) => Promise<void> | void;
  isSubmitting?: boolean;
  onPreview?: () => void;
  onCancel?: () => void;
}

export function CompanyProfileForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  onPreview,
  onCancel,
}: CompanyProfileFormProps) {
  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    mode: 'onTouched',
    defaultValues: {
      companyName: initialData?.name || '',
      logoUrl: initialData?.logoUrl || null,
      description: initialData?.description || '',
      // Stored values predate the fixed option lists, so only keep them
      // when they are still valid — otherwise start blank and let the
      // schema guide the user to a valid pick.
      industry: isIndustryOption(initialData?.industry) ? initialData.industry : '',
      companySize: isCompanySizeOption(initialData?.companySize)
        ? initialData.companySize
        : '',
      website: initialData?.website || '',
      location: initialData?.location || '',
      linkedin: initialData?.linkedIn || '',
      twitter: initialData?.twitter || '',
      facebook: initialData?.facebook || '',
      slug: initialData ? slugifyCompanyName(initialData.name) : '',
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const currentCompanyName = watch('companyName');
  const currentLogoUrl = watch('logoUrl');
  const descriptionValue = watch('description') || '';

  const handleFormSubmit = async (values: CompanyProfileFormValues) => {
    // Payload matches backend UpdateCompanyProfileCommand (no slug/logo/socialLinks wrapper).
    const payload: UpdateCompanyProfilePayload = {
      companyName: values.companyName.trim(),
      description: values.description?.trim() || null,
      industry: values.industry?.trim() || null,
      companySize: values.companySize || null,
      website: values.website ? normalizeUrl(values.website) : null,
      location: values.location?.trim() || null,
      linkedIn: values.linkedin ? normalizeUrl(values.linkedin) : null,
      twitter: values.twitter ? normalizeUrl(values.twitter) : null,
      facebook: values.facebook ? normalizeUrl(values.facebook) : null,
    };

    await onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-5"
      noValidate
    >
      {/* COMPANY INFORMATION */}
      <FormSection
        title="Company Information"
        description="Tell candidates who you are and what your organization does."
      >
        {/* Logo */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5">
          <p className="text-sm font-semibold text-slate-800">
            Company Logo
          </p>

          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            Use a clear logo that represents your organization.
          </p>

          <div className="mt-4">
            <CompanyLogoUpload
              companyName={
                currentCompanyName ||
                initialData?.name ||
                'Company'
              }
              logoUrl={currentLogoUrl}
              onLogoChange={(newLogo) => {
                setValue('logoUrl', newLogo, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Company name */}
        <FieldWrapper
          label="Company Name"
          htmlFor="companyName"
          required
          error={errors.companyName?.message}
        >
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

            <Input
              id="companyName"
              placeholder="e.g. Acme Technologies"
              disabled={isSubmitting}
              className={`${fieldInputClass} h-11 pl-10`}
              aria-describedby={fieldDescribedBy('companyName', Boolean(errors.companyName), false)}
              {...register('companyName')}
            />
          </div>
        </FieldWrapper>

        {/* Industry + Size */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FieldWrapper
            label="Industry"
            htmlFor="industry"
            error={errors.industry?.message}
          >
            <Controller
              name="industry"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="industry"
                    className="h-11 w-full rounded-lg border-slate-200 bg-white text-sm shadow-none"
                  >
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    alignItemWithTrigger={false}
                    className="w-[var(--radix-select-trigger-width)]"
                  >
                    {INDUSTRY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Company Size"
            htmlFor="companySize"
            error={errors.companySize?.message}
          >
            <Controller
              name="companySize"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="companySize"
                    className="h-11 w-full rounded-lg border-slate-200 bg-white text-sm shadow-none"
                  >
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>

                  <SelectContent
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    alignItemWithTrigger={false}
                    className="w-[var(--anchor-width)]"
                  >
                    {COMPANY_SIZE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldWrapper>
        </div>

        {/* Location */}
        <FieldWrapper
          label="Headquarters / Location"
          htmlFor="location"
          error={errors.location?.message}
        >
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

            <Input
              id="location"
              placeholder="e.g. Dhaka, Bangladesh"
              disabled={isSubmitting}
              className={`${fieldInputClass} h-11 pl-10`}
              aria-describedby={fieldDescribedBy('location', Boolean(errors.location), false)}
              {...register('location')}
            />
          </div>
        </FieldWrapper>
      </FormSection>

      {/* ONLINE PRESENCE */}
      <FormSection
        title="Online Presence"
        description="Help candidates learn more about your company outside TalentX."
      >
        {/* Two links per row on larger screens, one per row on phones */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <SocialField
            label="Company Website"
            hint="Your official company website"
            icon={<Globe className="size-4" />}
            htmlFor="website"
            placeholder="https://example.com"
            error={errors.website?.message}
            disabled={isSubmitting}
            register={register('website')}
          />

          <SocialField
            label="LinkedIn"
            hint="Company LinkedIn page"
            icon={<FaLinkedin className="size-4" />}
            htmlFor="linkedin"
            placeholder="https://linkedin.com/company/example"
            error={errors.linkedin?.message}
            disabled={isSubmitting}
            register={register('linkedin')}
          />

          <SocialField
            label="X / Twitter"
            hint="Company X profile"
            icon={<FaTwitter className="size-4" />}
            htmlFor="twitter"
            placeholder="https://x.com/example"
            error={errors.twitter?.message}
            disabled={isSubmitting}
            register={register('twitter')}
          />

          <SocialField
            label="Facebook"
            hint="Company Facebook page"
            icon={<FaFacebook className="size-4" />}
            htmlFor="facebook"
            placeholder="https://facebook.com/example"
            error={errors.facebook?.message}
            disabled={isSubmitting}
            register={register('facebook')}
          />
        </div>
      </FormSection>

      {/* ABOUT COMPANY */}
      <FormSection
        title="About Your Company"
        description="Give talented people a reason to learn more about your organization."
      >
        <FieldWrapper
          label="Company Description"
          htmlFor="description"
          error={errors.description?.message}
          hint="Keep your description clear, authentic, and candidate-focused."
          trailing={
            <span className="font-mono text-[11px] font-medium text-slate-400">
              {descriptionValue.length} / {DESCRIPTION_LIMIT}
            </span>
          }
        >
          <Textarea
            id="description"
            rows={6}
            placeholder="Tell candidates about your mission, products, workplace culture, achievements, benefits, and what makes your company a great place to work..."
            disabled={isSubmitting}
            className={`${fieldInputClass} min-h-36 resize-y leading-6`}
            aria-describedby={fieldDescribedBy('description', Boolean(errors.description), true)}
            {...register('description')}
          />
        </FieldWrapper>
      </FormSection>

      {/* SAVE BAR */}
      <div className="sticky bottom-4 z-10">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white/95 px-5 py-4 shadow-xs backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">
              Ready to update your profile?
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Your changes will appear on your public company profile.
            </p>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="h-10 flex-1 rounded-lg border-slate-200 px-4 text-sm font-semibold text-slate-700 shadow-none hover:bg-slate-50 sm:flex-none"
              >
                <X className="mr-1.5 size-4" />
                Cancel
              </Button>
            )}

            {onPreview && (
              <Button
                type="button"
                variant="outline"
                onClick={onPreview}
                disabled={isSubmitting}
                className="h-10 flex-1 rounded-lg border-slate-200 px-4 text-sm font-semibold text-slate-700 shadow-none hover:bg-slate-50 sm:flex-none"
              >
                <ExternalLink className="mr-1.5 size-4" />
                Preview
              </Button>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 flex-1 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-none hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-500 sm:flex-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-slate-100 bg-white shadow-xs">
      <header className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-base font-bold tracking-tight text-slate-900">
          {title}
        </h2>

        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      </header>

      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
        {children}
      </div>
    </section>
  );
}

function SocialField({
  label,
  hint,
  icon,
  htmlFor,
  placeholder,
  error,
  disabled,
  register,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  htmlFor: string;
  placeholder: string;
  error?: string;
  disabled: boolean;
  register: UseFormRegisterReturn;
}) {
  return (
    <FieldWrapper
      label={label}
      htmlFor={htmlFor}
      hint={hint}
      error={error}
    >
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>

        <Input
          id={htmlFor}
          type="url"
          placeholder={placeholder}
          disabled={disabled}
          className={`${fieldInputClass} h-10 pl-10`}
          aria-describedby={fieldDescribedBy(htmlFor, Boolean(error), true)}
          {...register}
        />
      </div>
    </FieldWrapper>
  );
}
