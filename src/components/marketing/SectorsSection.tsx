import { Link } from "react-router-dom";
import { Scissors, Sparkles, Heart, Stethoscope, ArrowRight } from "lucide-react";
import { t } from "@/lib/translations";
import { ScrollReveal } from "@/hooks/useScrollReveal";

const sectors = [
  { key: "barber", icon: Scissors, color: "bg-primary/10 text-primary", count: 850 },
  { key: "beauty", icon: Sparkles, color: "bg-accent/10 text-accent", count: 620 },
  { key: "spa", icon: Heart, color: "bg-success/10 text-success", count: 340 },
  { key: "dental", icon: Stethoscope, color: "bg-info/10 text-info", count: 280 },
];

export function SectorsSection() {
  return (
    <section className="py-16 sm:py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-accent mb-3 block">
              {t("sectors.label")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading text-foreground mb-4">
              {t("sectors.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("sectors.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sectors.map((sector, i) => (
            <ScrollReveal key={sector.key} delay={i * 120} direction="up" distance={50}>
              <Link
                to="/isletmeler"
                className="group bg-card border border-border rounded-xl p-6 sm:p-8 shadow-card hover:shadow-card-hover hover:-translate-y-2 hover:border-accent/30 transition-all duration-500 block"
              >
                <div className={`w-14 h-14 rounded-xl ${sector.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <sector.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t(`sectors.${sector.key}`)}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t(`sectors.${sector.key}_desc`)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {sector.count}+ {t("sectors.business_count")}
                  </span>
                  <ArrowRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
