import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { t } from "@/lib/translations";
import { ScrollReveal } from "@/hooks/useScrollReveal";

export function CTASection() {
  const benefits = [
    t("cta.benefit1"),
    t("cta.benefit2"),
    t("cta.benefit3"),
    t("cta.benefit4"),
  ];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-primary via-primary to-accent relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary-foreground/5 rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-foreground/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-foreground/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal direction="none" duration={900}>
          <h2 className="text-3xl sm:text-4xl font-heading text-primary-foreground mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            {t("cta.subtitle")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-2 text-primary-foreground/90 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/isletme-basvuru">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:scale-105 transition-all duration-300">
                {t("cta.apply_btn")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/isletmeler">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:scale-105 transition-all duration-300">
                {t("cta.explore_btn")}
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
