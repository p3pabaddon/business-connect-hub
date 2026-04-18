import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/marketing/HeroSection";
import { SectorsSection } from "@/components/marketing/SectorsSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { TrustSection } from "@/components/marketing/TrustSection";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { FeaturedCitiesSection } from "@/components/marketing/FeaturedCitiesSection";
import { SEOHead } from "@/components/SEOHead";
import { CustomerBenefitsSection } from "@/components/marketing/CustomerBenefitsSection";
import { FeaturedSalonsSection } from "@/components/marketing/FeaturedSalonsSection";
import { CustomerAppCTA } from "@/components/marketing/CustomerAppCTA";
import { AIShowcaseSection } from "@/components/marketing/AIShowcaseSection";
import { t } from "@/lib/translations";
import { PublicAiAdvisor } from "@/components/layout/PublicAiAdvisor";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Randevu Dünyası | Berber, Kuaför ve Güzellik Salonu Online Randevu Al"
        description="Türkiye'nin en büyük online randevu sistemi. Berber, güzellik merkezi, kuaför, spa ve kliniklerden anında online randevu al, sıra beklemeden işlemlerini hallet."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Randevu Dünyası - Online Randevu Platformu",
          "url": "https://randevudunyasi.com",
          "description": "Berber, kuaför, güzellik salonu ve spa merkezleri için 7/24 ücretsiz online randevu alma uygulaması.",
          "applicationCategory": "LifestyleApplication",
          "operatingSystem": "Web, iOS, Android",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "TRY" },
          "keywords": "randevu al, online randevu, berber randevusu, güzellik salonu randevu, kuaför randevu al, randevu dünyası, ücretsiz randevu"
        }}
      />
      <main className="flex-1">
        <HeroSection />
        <SectorsSection />
        <FeaturedSalonsSection />
        <AIShowcaseSection />
        <CustomerBenefitsSection />
        <HowItWorksSection />
        <TrustSection />
        <TestimonialsSection />
        <CustomerAppCTA />
        <FeaturedCitiesSection />
      </main>
      <PublicAiAdvisor />
    </div>
  );
};

export default Index;
