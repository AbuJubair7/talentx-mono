import type { ShowcaseSlide } from '../types/showcaseSlide'

export const SHOWCASE_AUTO_ADVANCE_INTERVAL_MS = 4000
export const SHOWCASE_SWIPE_THRESHOLD_PX = 50

export const PORTAL_SHOWCASE_SLIDES: readonly ShowcaseSlide[] = [
  {
    id: 'employer-dashboard',
    audience: 'Employer',
    title: 'Employer Recruitment Dashboard',
    subtitle: 'Monitor live requisitions, active candidate pipelines, and key recruitment metrics at a glance.',
    badge: 'Employer Experience',
    imagePath: '/images/landing/employer-founder.webp',
    windowTitle: 'TalentX — Employer Workspace — Dashboard',
  },
  {
    id: 'employer-job-post',
    audience: 'Employer',
    title: 'Multi-Step Job Posting Wizard',
    subtitle: 'Craft targeted engineering requisitions with real-time candidate view preview and AI skills matching.',
    badge: 'Employer Experience',
    imagePath: '/images/landing/candidate-sarah.webp',
    windowTitle: 'TalentX — Create Job Requisition — Wizard',
  },
  {
    id: 'employer-talent-match',
    audience: 'Employer',
    title: 'AI Talent Recommendation & Matching',
    subtitle: 'Instantly compare candidates against requisition requirements with multi-dimensional match scores.',
    badge: 'Employer Experience',
    imagePath: '/images/landing/candidate-marcus.webp',
    windowTitle: 'TalentX — AI Talent Recommendation & Matching',
  },
  {
    id: 'talent-dashboard',
    audience: 'Talent',
    title: 'Talent Career Dashboard',
    subtitle: 'Track application velocity, interview invitations, and weekly application goals in real time.',
    badge: 'Talent Experience',
    imagePath: '/images/landing/hero-candidate.webp',
    windowTitle: 'TalentX — Talent Portal — Career Dashboard',
  },
] as const
