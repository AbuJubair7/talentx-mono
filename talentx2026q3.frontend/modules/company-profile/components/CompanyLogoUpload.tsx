'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DefaultCompanyLogo } from './DefaultCompanyLogo';
import { companyProfileService } from '../services/company-profile.service';
import { useDeleteCompanyLogo } from '../hooks/useDeleteCompanyLogo';

interface CompanyLogoUploadProps {
  companyName: string;
  logoUrl?: string | null;
  onLogoChange: (newLogoUrl: string | null) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

export function CompanyLogoUpload({
  companyName,
  logoUrl,
  onLogoChange,
  disabled = false,
}: CompanyLogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const deleteLogoMutation = useDeleteCompanyLogo();

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setErrorMessage('Please upload a valid image (PNG, JPG, SVG, or WEBP).');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setIsUploading(true);
    setImageLoadError(false);

    try {
      const result = await companyProfileService.uploadCompanyLogo(file);
      onLogoChange(result.logoUrl);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to upload logo. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleRemoveLogo = () => {
    // Removal persists immediately on the server (DELETE /employers/company/logo),
    // mirroring uploads — no save step needed. Only clear the form on success.
    setErrorMessage(null);
    deleteLogoMutation.mutate(undefined, {
      onSuccess: () => {
        onLogoChange(null);
        setImageLoadError(false);
      },
      onError: (error) => {
        setErrorMessage(error.message || 'Failed to remove logo. Please try again.');
      },
    });
  };

  const hasValidCustomLogo = Boolean(logoUrl && !imageLoadError);
  const isRemoving = deleteLogoMutation.isPending;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Logo Preview Avatar */}
        <div className="relative group shrink-0">
          <div className="size-24 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center shadow-xs">
            {hasValidCustomLogo ? (
              <Image
                src={logoUrl!}
                alt={`${companyName || 'Company'} logo`}
                width={96}
                height={96}
                unoptimized
                onError={() => setImageLoadError(true)}
                className="size-full object-contain p-2"
              />
            ) : (
              <DefaultCompanyLogo companyName={companyName} size="lg" className="size-full rounded-none" />
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-2xs">
                <Loader2 className="size-6 text-white animate-spin" />
              </div>
            )}
          </div>

          {!disabled && !isUploading && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload company logo"
              className="absolute -bottom-1.5 -right-1.5 size-7 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md hover:bg-slate-800 transition-transform active:scale-95 cursor-pointer"
            >
              <Camera className="size-3.5" />
            </button>
          )}
        </div>

        {/* Upload Dropzone / Actions */}
        <div className="flex-1 w-full space-y-2">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'border border-dashed rounded-xl p-3 sm:p-4 text-center transition-all',
              isDragOver
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40',
              disabled && 'opacity-60 pointer-events-none'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES.join(',')}
              onChange={handleFileInputChange}
              disabled={disabled || isUploading}
              className="hidden"
              data-testid="company-logo-file-input"
            />

            <div className="flex items-center justify-center gap-2">
              <UploadCloud className="size-4 text-slate-500" />
              <p className="text-xs text-slate-600 font-medium">
                Drag &amp; drop or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isUploading}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2 cursor-pointer inline"
                >
                  browse your logo
                </button>
              </p>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              PNG, JPG, WEBP, or SVG up to {MAX_FILE_SIZE_MB}MB. If no logo is provided, a default brand logo will be used.
            </p>
          </div>

          {/* Action buttons */}
          {hasValidCustomLogo && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                disabled={disabled || isUploading || isRemoving}
                className="h-8 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
              >
                {isRemoving ? (
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5 mr-1.5" />
                )}
                {isRemoving ? 'Removing…' : 'Remove (Use Default)'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <p className="text-xs font-medium text-rose-600" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
