'use client'

import { useState } from 'react'
import Image from 'next/image'
import { avatarColor, companyInitials } from '../../utils/format'

interface CompanyLogoProps {
  name: string
  logoUrl?: string | null
  size?: 'md' | 'sm'
}

export function CompanyLogo({ name, logoUrl, size = 'md' }: CompanyLogoProps) {
  const [failed, setFailed] = useState(false)
  const box = size === 'md' ? 'size-11 rounded-xl text-sm' : 'size-9 rounded-lg text-xs'

  if (logoUrl && !failed) {
    return (
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={44}
        height={44}
        unoptimized
        onError={() => setFailed(true)}
        className={`${box} shrink-0 border border-slate-200 bg-white object-cover`}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={`${name} logo`}
      className={`${box} ${avatarColor(name)} flex shrink-0 items-center justify-center font-semibold tracking-tight text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]`}
    >
      {companyInitials(name)}
    </div>
  )
}
