import { Shield, UserX, Star, XCircle, Lock, Bell } from "lucide-react";
import { t } from "@/lib/translations";
import { ScrollReveal } from "@/hooks/useScrollReveal";

const features = [
  { key: "sms", icon: Shield, color: "bg-primary/10 text-primary" },
  { key: "noshow", icon: UserX, color: "bg-warning/10 text-warning" },
  { key: "reviews", icon: Star, color: "bg-accent/10 text-accent" },
  { key: "cancel", icon: XCircle, color: "bg-destructive/10 text-destructive" },
  { key: "data", icon: Lock, color: "bg-info/10 text-info" },
  { key: "notifications", icon: Bell, color: "bg-success/10 text-success" },
];

export function TrustSection() {
  return (
    <section className="py-16 sm:py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-accent mb-3 block">
              {t("trust.label")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading text-foreground mb-4">
              {t("trust.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("trust.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.key} delay={i * 100} distance={30}>
              <div className="bg-card border border-border rounded-xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-500 group">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {t(`trust.${feature.key}`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`trust.${feature.key}_desc`)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
