import { CheckCircle2, Zap, BarChart3, Bot } from 'lucide-react'

export function ProductPillars() {
  return (
    <section id="features" className="py-20 bg-slate-50/70 border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Platform Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-2 text-balance">
            Built for modern engineering teams &amp; ambitious startups
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Everything you need to hire elite AI talent or advance your career without the friction of legacy job boards.
          </p>
        </div>

        {/* 3 Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Pillar 1 */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-300 bg-white p-8 shadow-sm transition-all hover:shadow-md cursor-pointer">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Zap className="size-6" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900 tracking-tight">
                Post &amp; Hire for $0 Forever
              </h3>

              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Publish unlimited technical roles, access a built-in applicant management pipeline, and receive qualified inbound applications without hidden subscription walls.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Unlimited active job listings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Built-in lightweight ATS pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Direct Candidate Invitations</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-300 bg-white p-8 shadow-sm transition-all hover:shadow-md cursor-pointer">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Bot className="size-6" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900 tracking-tight">
                AI Sourcing &amp; Vetting
              </h3>

              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Our AI matching engine scores candidate experience, verified GitHub repositories, and stack proficiency against your job requirements to surface the top 1%.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
                  <span>Automated resume extraction</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
                  <span>Skill &amp; overlap scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
                  <span>Verified technical credentials</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-300 bg-white p-8 shadow-sm transition-all hover:shadow-md cursor-pointer">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <BarChart3 className="size-6" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900 tracking-tight">
                Salary &amp; Equity Transparency
              </h3>

              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Never waste time guessing comp. Every position lists clear base salary ranges, equity grants, and remote timezone overlap requirements upfront.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-purple-600 shrink-0" />
                  <span>Transparent salary brackets</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-purple-600 shrink-0" />
                  <span>Real-time market compensation data</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-purple-600 shrink-0" />
                  <span>Clear timezone &amp; work mode requirements</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
