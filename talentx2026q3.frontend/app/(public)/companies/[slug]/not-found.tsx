import Link from 'next/link';
import { Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CompanyNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-xs">
        <Building2 className="size-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Not Found</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        The company page you are looking for doesn't exist or may have changed its public URL.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link href="/jobs">
          <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
            <ArrowLeft className="size-4 mr-2" />
            Explore Job Openings
          </Button>
        </Link>
      </div>
    </div>
  );
}
