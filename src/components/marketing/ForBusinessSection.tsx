import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/translations";
import { ScrollReveal } from "@/hooks/useScrollReveal";
import { 
  Calendar, Users, BarChart3, Shield, 
  TrendingUp, Smartphone, Cpu, Package, 
  Gift, Zap 
} from "lucide-react";

const features = [
  { icon: Calendar, title: t("business.feat_appointment_title"), desc: t("business.feat_appointment_desc") },
  { icon: Smartphone, title: t("business.feat_mobile_title"), desc: t("business.feat_mobile_desc") },
  { icon: Cpu, title: t("business.feature4_title"), desc: t("business.feature4_desc") },
  { icon: Package, title: t("business.feature5_title"), desc: t("business.feature5_desc") },
  { icon: Gift, title: t("business.feature6_title"), desc: t("business.feature6_desc") },
  { icon: Shield, title: t("business.feat_noshow_title"), desc: t("business.feat_noshow_desc") },
];

export function ForBusinessSection() {
  return (
    <section className="py-16 sm:py-24 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <ScrollReveal direction="left">
              <span className="text-xs font-bold tracking-widest uppercase text-accent mb-3 block">
                {t("nav.for_business")}
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading text-foreground mb-6">
                {t("business.title")}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {t("business.landing_subtitle")}
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((f, i) => (
                <ScrollReveal key={f.title} delay={i * 80} direction="left" distance={30}>
                  <div className="flex items-start gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                      <f.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{f.title}</h4>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={500} direction="left">
              <Link to="/isletme-basvuru">
                <Button size="lg" className="hover:scale-105 transition-transform">
                  {t("cta.apply_btn")}
                </Button>
              </Link>
            </ScrollReveal>
          </div>

          <ScrollReveal direction="right" distance={60} duration={900}>
            <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary-foreground/5 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary-foreground/5 rounded-full" />

              <h3 className="text-2xl font-heading mb-6 relative z-10">{t("business.why_title")}</h3>
              <ul className="space-y-4 relative z-10">
                {[
                  t("business.why_item1"),
                  t("business.why_item2"),
                  t("business.why_item3"),
                  t("business.why_item4"),
                  t("business.why_item5"),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs">✓</span>
                    </div>
                    <span className="text-sm opacity-90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
