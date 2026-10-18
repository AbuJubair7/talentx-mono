import Link from 'next/link'
import { BrandLogo } from '@/components/common/brand-logo'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center group py-1">
              <BrandLogo className="h-8.5 w-auto text-emerald-700" />
            </Link>

            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              The modern job marketplace and AI recruiting platform connecting visionary startups with pre-vetted AI, ML, and software engineering talent.
            </p>

            <div className="flex items-center gap-4 pt-2 text-slate-400">
              {/* X / Twitter */}
              <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-slate-700 transition-colors">
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-slate-700 transition-colors">
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              {/* GitHub */}
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-700 transition-colors">
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
              For Candidates
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/jobs" className="hover:text-slate-900 transition-colors">
                  Explore Startup Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?remote=true" className="hover:text-slate-900 transition-colors">
                  Remote AI Roles
                </Link>
              </li>
              <li>
                <Link href="/jobs?q=LLM" className="hover:text-slate-900 transition-colors">
                  LLM &amp; Generative AI
                </Link>
              </li>
              <li>
                <Link href="/jobs?q=Engineering" className="hover:text-slate-900 transition-colors">
                  Software Engineering
                </Link>
              </li>
            </ul>
          </div>

          {/* For Startups & Recruiters */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
              For Startups
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/signup" className="hover:text-slate-900 transition-colors">
                  Post a Job ($0 Free)
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-slate-900 transition-colors">
                  AI Talent Sourcing
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-slate-900 transition-colors">
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-slate-900 transition-colors">
                  Hiring Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Legal */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform &amp; Legal
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/about" className="hover:text-slate-900 transition-colors">
                  About TalentX
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-slate-900 transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} TalentX Inc. All rights reserved.</p>
        </div>

      </div>
    </footer>
  )
}
