'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle } from 'lucide-react'

import { invitationService } from '@/modules/job-listing/services/invitation.service'

export function InvitationBanner() {
  const searchParams = useSearchParams()
  const token = searchParams.get('invitation')
  const [invitation, setInvitation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [responding, setResponding] = useState(false)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    invitationService.getInvitationByToken(token).then(
      (data) => {
        setInvitation(data)
        setIsLoading(false)
      },
      (error) => {
        console.error('Failed to load invitation:', error)
        toast.error('Failed to load invitation')
        setIsLoading(false)
      }
    )
  }, [token])

  const handleAccept = async () => {
    if (!token) return
    setResponding(true)
    try {
      await invitationService.respondByToken(token, true)
      setInvitation((prev: any) => ({ ...prev, status: 'Accepted' }))
      toast.success('Invitation accepted!')
    } catch (err) {
      toast.error('Failed to accept invitation')
    } finally {
      setResponding(false)
    }
  }

  const handleDecline = async () => {
    if (!token) return
    setResponding(true)
    try {
      await invitationService.respondByToken(token, false)
      setInvitation((prev: any) => ({ ...prev, status: 'Declined' }))
      toast.success('Invitation declined!')
    } catch (err) {
      toast.error('Failed to decline invitation')
    } finally {
      setResponding(false)
    }
  }

  if (!token || isLoading || !invitation) return null

  const status = invitation.status

  if (status === 'Accepted') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold text-emerald-900">
              Invitation accepted for <strong>{invitation.jobTitle}</strong> at <strong>{invitation.companyName}</strong>
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              You can now apply for this role directly.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'Declined') {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-slate-500 mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold text-slate-700">
              Invitation declined for <strong>{invitation.jobTitle}</strong> at <strong>{invitation.companyName}</strong>
            </p>
            <p className="mt-1 text-sm text-slate-500">
              You can still browse and apply to other roles on TalentX.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'Withdrawn') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold text-amber-900">
              This invitation has been withdrawn by the employer.
            </p>
            <p className="mt-1 text-sm text-amber-700">
              You can still browse and apply to other roles on TalentX.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'Expired') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold text-red-900">
              This invitation has expired.
            </p>
            <p className="mt-1 text-sm text-red-700">
              You can still browse and apply to other roles on TalentX.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="size-5 text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-bold text-blue-900">
            You&apos;ve been invited to apply for <strong>{invitation.jobTitle}</strong> at <strong>{invitation.companyName}</strong>
          </p>
          <p className="mt-1 text-sm text-blue-700">
            This invitation expires on{' '}
            {new Date(invitation.expiresAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAccept}
              disabled={responding}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {responding ? 'Processing...' : 'Accept & Apply'}
            </button>
            <button
              onClick={handleDecline}
              disabled={responding}
              className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
