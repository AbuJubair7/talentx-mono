'use client';

import { useRouter } from 'next/navigation';
import { UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ApplyLoginWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
}

export function ApplyLoginWarningDialog({
  open,
  onOpenChange,
  jobId,
}: ApplyLoginWarningDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="space-y-3 text-center sm:text-left">
          <div className="size-11 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mx-auto sm:mx-0">
            <UserRound className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Already have a TalentX account?
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 leading-relaxed">
            Sign in first and we&apos;ll apply with your saved profile and resume. Otherwise
            you&apos;ll end up filling in the same details all over again as a guest.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Continue as guest
          </Button>
          <Button
            type="button"
            onClick={() => router.push(`/login?redirect=/jobs/${jobId}/apply`)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 transition-all cursor-pointer"
          >
            Sign in to apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
