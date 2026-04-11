import { MapPin, Zap, Bell, ShieldCheck } from "lucide-react";
import { t } from "@/lib/translations";
import { ScrollReveal } from "@/hooks/useScrollReveal";

const benefits = [
  { key: "item1", icon: MapPin, color: "text-primary" },
  { key: "item2", icon: Zap, color: "text-accent" },
  { key: "item3", icon: Bell, color: "text-info" },
  { key: "item4", icon: ShieldCheck, color: "text-success" },
];

export function CustomerBenefitsSection() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/30 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-heading mb-6 tracking-tight">
              {t("customer_benefits.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("customer_benefits.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {benefits.map((benefit, i) => (
            <ScrollReveal key={benefit.key} delay={i * 150} distance={40}>
              <div className="bg-background p-10 rounded-[2.5rem] border border-border shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                <div className={`w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {t(`customer_benefits.${benefit.key}_title`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t(`customer_benefits.${benefit.key}_desc`)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2 pointer-events-none" />
    </section>
  );
}
