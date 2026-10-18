'use client';

import { useState } from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';
import { FaFacebook, FaLinkedin } from 'react-icons/fa';

interface ShareJobButtonsProps {
  jobTitle: string;
  companyName: string;
  jobId: string;
}

export function ShareJobButtons({ jobTitle, companyName, jobId }: ShareJobButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/jobs/${jobId}` : '';
  const shareText = `${jobTitle} at ${companyName}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        <Share2 className="size-3.5" />
        <span>Share this job</span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleLinkedIn}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
          title="Share on LinkedIn"
        >
          <FaLinkedin className="size-4 text-[#0A66C2]" />
          LinkedIn
        </button>
        <button
          type="button"
          onClick={handleFacebook}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
          title="Share on Facebook"
        >
          <FaFacebook className="size-4 text-[#1877F2]" />
          Facebook
        </button>
      </div>
      <button
        type="button"
        onClick={handleCopyUrl}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
        title="Copy link"
      >
        {copied ? (
          <>
            <Check className="size-4 text-emerald-500" />
            Copied!
          </>
        ) : (
          <>
            <LinkIcon className="size-4" />
            Copy URL
          </>
        )}
      </button>
    </div>
  );
}
