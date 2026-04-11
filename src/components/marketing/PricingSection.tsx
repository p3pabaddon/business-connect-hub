import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { t } from "@/lib/translations";
import { ScrollReveal } from "@/hooks/useScrollReveal";

const plans = [
  {
    name: t("pricing.free_name"), price: "0", period: t("pricing.month"),
    description: t("pricing.free_desc"), badge: null,
    features: [
      t("pricing.free_feature1"),
      t("pricing.free_feature2"),
      t("pricing.free_feature3"),
      t("pricing.free_feature4"),
      t("pricing.free_feature5"),
      t("pricing.free_feature6")
    ],
    cta: t("pricing.free_cta"), variant: "outline" as const,
  },
  {
    name: t("pricing.premium_name"), price: "800", period: t("pricing.month"),
    description: t("pricing.premium_desc"), badge: t("pricing.best_value"),
    features: [
      t("pricing.premium_feature1"),
      t("pricing.premium_feature2"),
      t("pricing.premium_feature3"),
      t("pricing.premium_feature4"),
      t("pricing.premium_feature5"),
      t("pricing.premium_feature6"),
      t("pricing.premium_feature7"),
      t("pricing.premium_feature8"),
      t("pricing.premium_feature9"),
      t("pricing.premium_feature10")
    ],
    cta: t("pricing.premium_cta"), variant: "default" as const,
  },
];

export function PricingSection() {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-accent mb-3 block">
              Fiyatlandırma
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading text-foreground mb-4">
              {t("pricing.title")}
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 150} distance={40}>
              <div
                className={`relative bg-card border rounded-xl p-6 sm:p-8 transition-all duration-500 hover:shadow-card-hover hover:-translate-y-2 group ${
                  plan.badge
                    ? "border-accent shadow-card-hover scale-[1.02]"
                    : "border-border shadow-card"
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                    {plan.badge}
                  </Badge>
                )}
                <h3 className="text-lg font-semibold text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-heading text-foreground group-hover:text-primary transition-colors duration-300">₺{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/isletme-basvuru">
                  <Button variant={plan.variant} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
