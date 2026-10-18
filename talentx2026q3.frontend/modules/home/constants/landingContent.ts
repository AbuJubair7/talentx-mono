import {
  BadgeCheckIcon,
  BarChart3Icon,
  BellRingIcon,
  EyeIcon,
  FileCheck2Icon,
  FileTextIcon,
  HandshakeIcon,
  LayersIcon,
  ListChecksIcon,
  MessagesSquareIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TargetIcon,
  UploadIcon,
  UserRoundIcon,
  UsersIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type AudienceItem = { icon: LucideIcon; text: string }

export const talentAudience: AudienceItem[] = [
  { icon: SearchIcon, text: 'Relevant roles come to you' },
  { icon: FileCheck2Icon, text: 'Apply first, no registration form' },
  { icon: MessagesSquareIcon, text: 'Interview prep for each role' },
]

export const employerAudience: AudienceItem[] = [
  { icon: UsersIcon, text: 'Matched candidates, not just applicants' },
  { icon: ListChecksIcon, text: 'Applicant pipeline with match signals' },
  { icon: BarChart3Icon, text: 'Hiring insights in one place' },
]

export type LandingFeature = {
  id: string
  number: string
  title: string
  body: string
  flow: string[]
}

export const talentFeatures: LandingFeature[] = [
  {
    id: 'apply',
    number: '01',
    title: 'Apply without friction',
    body: 'Apply first. We verify your email and create your account from your application, so there’s no registration form.',
    flow: ['Job', 'Apply', 'Verify email', 'Account created', 'Ready'],
  },
  {
    id: 'prep',
    number: '02',
    title: 'Prepare smarter for interviews',
    body: 'Preparation built around the specific role, the interview format and your own experience, not generic advice.',
    flow: ['Interview', 'AI analysis', 'Personalized prep', 'Report'],
  },
  {
    id: 'alerts',
    number: '03',
    title: 'Get job alerts automatically',
    body: 'Stop searching on repeat. When a new role matches your profile and preferences, it comes to you.',
    flow: ['Your profile', 'Matching rules', 'Relevant jobs', 'Alert'],
  },
]

export const employerFeatures: LandingFeature[] = [
  {
    id: 'matching',
    number: '01',
    title: 'AI talent matching',
    body: 'Describe the role once. TalentX compares it with structured profiles across seven signals and shows you who is worth a conversation.',
    flow: ['Job requirements', 'Talent pool', 'AI matching', 'Relevant candidates'],
  },
  {
    id: 'scoring',
    number: '02',
    title: 'Review applicants with match signals',
    body: 'Each applicant is compared against your requirements, with the reasoning shown. Your team reviews faster and decides with more context.',
    flow: ['Applicants', 'Match signals', 'Skills · experience · relevance', 'Insights'],
  },
  {
    id: 'intelligence',
    number: '03',
    title: 'Hiring intelligence',
    body: 'Go from hundreds of applications to a focused shortlist. Filters and match signals explain every recommendation.',
    flow: ['Hundreds of applications', 'Relevant candidates', 'Informed decisions'],
  },
]

export type LandingStep = { actor: string; title: string; body: string; icon: LucideIcon }

export const howItWorksSteps: LandingStep[] = [
  {
    actor: 'Talent',
    title: 'Apply or build a profile',
    body: 'Apply to a role. Your CV becomes structured data.',
    icon: UserRoundIcon,
  },
  {
    actor: 'TalentX',
    title: 'Understand skills & experience',
    body: 'Skills, seniority and preferences are mapped against role requirements.',
    icon: LayersIcon,
  },
  {
    actor: 'AI',
    title: 'Match talent with opportunities',
    body: 'People and roles are compared on the signals that matter.',
    icon: SparklesIcon,
  },
  {
    actor: 'Connection',
    title: 'Talent & employers connect',
    body: 'Relevant introductions, with the context each side needs.',
    icon: HandshakeIcon,
  },
]

export type AiCapability = {
  title: string
  body: string
  uses: string
  produces: string
  icon: LucideIcon
}

export const aiCapabilities: AiCapability[] = [
  {
    title: 'AI matching',
    body: 'Find relevant talent and opportunities.',
    uses: 'Profiles, job requirements',
    produces: 'Ranked, explained matches',
    icon: TargetIcon,
  },
  {
    title: 'AI interview preparation',
    body: 'Prepare for the specific interview, based on your profile.',
    uses: 'Interview details, job, CV',
    produces: 'Personalized prep report',
    icon: MessagesSquareIcon,
  },
  {
    title: 'AI resume extraction',
    body: 'Turn an uploaded CV into a structured profile in seconds.',
    uses: 'Your uploaded CV',
    produces: 'Structured candidate profile',
    icon: UploadIcon,
  },
  {
    title: 'Smart job alerts',
    body: 'Surface relevant opportunities automatically.',
    uses: 'Preferences, new listings',
    produces: 'Timely, relevant alerts',
    icon: BellRingIcon,
  },
]

export const aiInputs = [
  'Structured profiles',
  'Job requirements',
  'Applications',
  'Interview details',
]

export type TrustItem = { icon: LucideIcon; title: string; body: string }

export const trustItems: TrustItem[] = [
  {
    icon: ShieldCheckIcon,
    title: 'Secure account workflows',
    body: 'Accounts are activated only after email verification.',
  },
  {
    icon: BadgeCheckIcon,
    title: 'Verified employers',
    body: 'Companies are reviewed before their roles go live.',
  },
  {
    icon: FileTextIcon,
    title: 'Structured candidate profiles',
    body: 'Consistent profiles make comparison fair and fast.',
  },
  {
    icon: TargetIcon,
    title: 'Intelligent matching',
    body: 'Recommendations are based on skills, experience and preferences.',
  },
  {
    icon: EyeIcon,
    title: 'Transparent AI assistance',
    body: 'Every score shows the signals behind it.',
  },
  {
    icon: UsersIcon,
    title: 'Human decision-making',
    body: 'AI informs. People shortlist, interview and hire.',
  },
]

export const audiencePanels = {
  talent: {
    audience: 'For Talent',
    statement: 'Discover opportunities, apply easily and prepare intelligently.',
    href: '#for-talent',
    cta: 'Explore talent features',
  },
  employer: {
    audience: 'For Employers',
    statement: 'Discover relevant candidates and review applicants faster.',
    href: '#for-employers',
    cta: 'Explore employer features',
  },
}

export const heroApplySteps = [
  { label: 'Job selected', detail: 'Data Platform Engineer · Remote' },
  { label: 'Application submitted', detail: 'CV and 2 screening answers' },
  { label: 'Email verified', detail: 'Ownership of your email confirmed' },
  { label: 'Account created automatically', detail: 'Profile built from your CV' },
  { label: 'Ready to go', detail: 'Track status and apply in one click' },
]

export const prepQuestions = [
  'Walk us through a pipeline you designed end to end.',
  'How would you handle late-arriving events in a streaming job?',
  'Tell us about a data quality incident and how you resolved it.',
]

export const prepTopics = [
  { name: 'Streaming architecture', readiness: 40 },
  { name: 'Data modeling', readiness: 85 },
  { name: 'Testing with dbt', readiness: 70 },
]

export const prepAskThem = [
  'How is data ownership split across teams?',
  'What does success look like in 90 days?',
]

export const alertPreferences = [
  'Data Engineering',
  'Remote · EU',
  '€80k+',
  'Full-time',
  'Python · Spark',
]

export const jobAlerts = [
  {
    title: 'Senior Data Engineer',
    meta: 'Payments · Remote (EU) · €90–105k',
    why: 'Matches 5 of 5 preferences',
    time: 'Just now',
  },
  {
    title: 'Analytics Engineer',
    meta: 'Healthtech · Lisbon or remote · €80–92k',
    why: 'Strong skills overlap: dbt, Python',
    time: '2h ago',
  },
  {
    title: 'Data Platform Engineer',
    meta: 'Logistics · Remote (EU) · €85–100k',
    why: 'Matches your target seniority',
    time: 'Yesterday',
  },
]

export type SignalState = 'met' | 'partial' | 'gap'

export const matchSignalNames = ['Skills', 'Exp.', 'Role', 'Industry', 'Location', 'Education', 'Salary']

export const jobRequirements = [
  { k: 'Skills', v: 'Go, PostgreSQL, Kubernetes' },
  { k: 'Experience', v: '5+ years' },
  { k: 'Role', v: 'Backend / Platform' },
  { k: 'Industry', v: 'Fintech preferred' },
  { k: 'Location', v: 'Remote · EU' },
  { k: 'Education', v: 'CS degree or equivalent' },
  { k: 'Salary', v: '€90–110k' },
]

export const matchedCandidates: {
  initials: string
  name: string
  title: string
  label: 'Strong match' | 'Good match' | 'Partial match'
  signals: SignalState[]
}[] = [
  {
    initials: 'JL',
    name: 'Jonas Lindqvist',
    title: 'Backend Engineer · 7 yrs',
    label: 'Strong match',
    signals: ['met', 'met', 'met', 'met', 'met', 'met', 'partial'],
  },
  {
    initials: 'NO',
    name: 'Nadia Okafor',
    title: 'Platform Engineer · 5 yrs',
    label: 'Good match',
    signals: ['met', 'met', 'met', 'partial', 'met', 'met', 'met'],
  },
  {
    initials: 'TR',
    name: 'Tomás Reyes',
    title: 'Software Engineer · 4 yrs',
    label: 'Partial match',
    signals: ['partial', 'gap', 'met', 'met', 'met', 'met', 'met'],
  },
]

export const scoredApplicants = [
  {
    initials: 'JL',
    name: 'Jonas Lindqvist',
    applied: 'Applied 2 days ago',
    fit: 'Strong fit',
    scores: [
      { k: 'Skills', v: 92 },
      { k: 'Experience', v: 88 },
      { k: 'Relevance', v: 90 },
    ],
    insight: 'Built Go payment services at scale. Kubernetes in production for 3 years.',
  },
  {
    initials: 'NO',
    name: 'Nadia Okafor',
    applied: 'Applied 4 days ago',
    fit: 'Good fit',
    scores: [
      { k: 'Skills', v: 84 },
      { k: 'Experience', v: 72 },
      { k: 'Relevance', v: 79 },
    ],
    insight: 'Strong platform background. No fintech experience listed.',
  },
]

export const funnel = [
  { label: 'Applications', value: '248' },
  { label: 'Relevant candidates', value: '36' },
  { label: 'Shortlisted', value: '8' },
]

export const discoveryFilters = [
  {
    group: 'Match strength',
    options: [
      { label: 'Strong', on: true },
      { label: 'Good', on: true },
      { label: 'Partial', on: false },
    ],
  },
  {
    group: 'Location',
    options: [
      { label: 'Remote · EU', on: true },
      { label: 'On-site', on: false },
    ],
  },
  {
    group: 'Experience',
    options: [
      { label: '5+ years', on: true },
      { label: '3–5 years', on: false },
    ],
  },
]

export const discoveryCandidates: {
  initials: string
  name: string
  title: string
  label: 'Strong match' | 'Good match' | 'Partial match'
  tags: string[]
  why: string
}[] = [
  {
    initials: 'JL',
    name: 'Jonas Lindqvist',
    title: 'Backend Engineer · 7 yrs',
    label: 'Strong match',
    tags: ['Go', 'Fintech', 'Remote EU'],
    why: 'Led migration of a payments service to Go',
  },
  {
    initials: 'NO',
    name: 'Nadia Okafor',
    title: 'Platform Engineer · 5 yrs',
    label: 'Good match',
    tags: ['Kubernetes', 'PostgreSQL'],
    why: 'Runs multi-region clusters in production',
  },
  {
    initials: 'ES',
    name: 'Elif Sahin',
    title: 'Senior Engineer · 8 yrs',
    label: 'Strong match',
    tags: ['Go', 'Banking', 'Remote EU'],
    why: 'Designed ledger systems for a retail bank',
  },
  {
    initials: 'MK',
    name: 'Marek Kowal',
    title: 'Backend Engineer · 6 yrs',
    label: 'Good match',
    tags: ['Go', 'gRPC'],
    why: 'Salary expectation slightly above range',
  },
]

export const discoveryInsights = [
  { k: 'Most common skill gap', v: 'Kubernetes', note: 'Missing in 61% of applicants' },
  { k: 'Within salary range', v: '72%', note: 'Of relevant candidates' },
  { k: 'Median experience', v: '6.5 yrs', note: 'Across the shortlist' },
]
