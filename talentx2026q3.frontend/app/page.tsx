import { Header } from '@/components/common/header'
import { HeroSection } from '@/modules/home/components/heroSection'
import { AudienceSplit } from '@/modules/home/components/landing/audience-split'
import { TalentSection } from '@/modules/home/components/talent/talent-section'
import { EmployerSection } from '@/modules/home/components/employer/employer-section'
import HomeModule from '@/modules/home/components/homeModule'
import { HowItWorks } from '@/modules/home/components/landing/how-it-works'
import { AISection } from '@/modules/home/components/landing/ai-section'
import { ProductPillars } from '@/modules/home/components/productPillars'
import { TrustSection } from '@/modules/home/components/landing/trust-section'
import { FinalCTA } from '@/modules/home/components/landing/final-cta'
import { Footer } from '@/components/common/footer'
import { getAuthCookies } from '@/modules/auth/shared/auth-cookies.service'
import { decodeAccessToken } from '@/lib/auth/jwt'
import { mapSessionToHeaderUser } from '@/components/common/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { accessToken } = await getAuthCookies()
  const session = accessToken ? decodeAccessToken(accessToken) : null
  const initialUser = mapSessionToHeaderUser(session)

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Header initialUser={initialUser} />
      <main className="flex-grow">
        <HeroSection />
        <HomeModule />
        <AudienceSplit />
        <TalentSection />
        <EmployerSection />
        {/* <PortalViewsShowcase /> */}
        <HowItWorks />
        <AISection />
        <ProductPillars />
        <TrustSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
