import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Users, Shield, Globe, Award } from "lucide-react";
import { t } from "@/lib/translations";
import { SEOHead } from "@/components/SEOHead";

const HakkimizdaPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title={t("about.title")}
      />
      <Header />
      <main className="flex-1">
        <section className="py-16 sm:py-24 bg-background">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-heading text-foreground mb-4">{t("about.title")}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("business.landing_subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
              {[
                { icon: Users, title: t("about.stat1_title"), desc: t("about.stat1_desc") },
                { icon: Shield, title: t("about.stat2_title"), desc: t("about.stat2_desc") },
                { icon: Globe, title: t("about.stat3_title"), desc: t("about.stat3_desc") },
                { icon: Award, title: t("about.stat4_title"), desc: t("about.stat4_desc") },
              ].map((item) => (
                <div key={item.title} className="bg-card border border-border rounded-xl p-6 shadow-card">
                  <item.icon className="w-10 h-10 text-accent mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-heading text-foreground">{t("about.mission_title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.mission_desc")}
              </p>
              <h2 className="text-2xl font-heading text-foreground mt-8">{t("about.vision_title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.vision_desc")}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HakkimizdaPage;
