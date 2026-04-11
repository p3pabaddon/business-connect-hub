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
import { t } from "@/lib/translations";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("seo.index_title") || "Türkiye'nin Randevu Platformu"}
        description={t("seo.index_desc") || "Berber, güzellik salonu, spa ve diş kliniği randevularınızı kolayca alın. Türkiye genelinde binlerce işletme ile güvenli randevu deneyimi."}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "RandevuDunyasi",
          "url": "https://randevudunyasi.com",
          "description": "Türkiye'nin online randevu platformu",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "TRY" },
        }}
      />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <SectorsSection />
        <CustomerBenefitsSection />
        <FeaturedSalonsSection />
        <HowItWorksSection />
        <TrustSection />
        <TestimonialsSection />
        <CustomerAppCTA />
        <FeaturedCitiesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
