import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Sparkles } from "lucide-react";
import { t } from "@/lib/translations";
import { motion } from "framer-motion";

export function PricingSection() {
  const plans = [
    {
      name: t("pricing.free_name"),
      price: t("pricing.free_price"),
      currency: t("pricing.currency"),
      period: t("pricing.month"),
      description: t("pricing.free_desc"),
      badge: null,
      features: [
        t("pricing.free_feature1"),
        t("pricing.free_feature2"),
        t("pricing.free_feature3"),
        t("pricing.free_feature4"),
        t("pricing.free_feature5"),
        t("pricing.free_feature6"),
      ],
      cta: t("pricing.free_cta"),
      variant: "outline" as const,
      color: "primary",
    },
    {
      name: t("pricing.premium_name"),
      price: t("pricing.premium_price"),
      currency: t("pricing.currency"),
      period: t("pricing.month"),
      description: t("pricing.premium_desc"),
      badge: t("pricing.best_value"),
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
      cta: t("pricing.premium_cta"),
      variant: "default" as const,
      color: "accent",
      popular: true,
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold tracking-[0.2em] uppercase text-accent bg-accent/10 px-4 py-1.5 rounded-full"
          >
            {t("pricing.badge") || "Fiyatlandırma"}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-heading text-foreground tracking-tight"
          >
            {t("pricing.title")}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            {t("pricing.subtitle") || "İşletmenizi bir üst seviyeye taşıyacak esnek planlarımızı keşfedin."}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
              className={`relative flex flex-col bg-card border rounded-3xl p-8 sm:p-10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group ${
                plan.popular
                  ? "border-accent/30 shadow-accent/5 scale-[1.05] z-10 bg-gradient-to-b from-card to-accent/5"
                  : "border-border shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-accent to-amber-500 text-white border-none px-6 py-1.5 shadow-xl rounded-full text-xs font-bold uppercase tracking-wider animate-bounce">
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="mb-10 flex items-baseline gap-1">
                <span className="text-5xl sm:text-6xl font-heading font-black text-foreground group-hover:scale-110 transition-transform duration-500 inline-block">
                  {plan.currency}{plan.price}
                </span>
                <span className="text-muted-foreground font-medium text-lg ml-1">{plan.period}</span>
              </div>

              <div className="space-y-5 mb-12 flex-grow">
                {plan.features.map((f, idx) => (
                  <motion.li 
                    key={f} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (idx * 0.1) }}
                    className="flex items-start gap-4 text-sm text-foreground/80 list-none group/item"
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${plan.popular ? "bg-accent/20 text-accent group-hover/item:scale-125" : "bg-primary/10 text-primary group-hover/item:rotate-12"}`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="leading-tight">{f}</span>
                  </motion.li>
                ))}
              </div>

              <Link to="/isletme-basvuru" className="mt-auto">
                <Button 
                  variant={plan.variant} 
                  className={`w-full h-14 text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-95 ${
                    plan.popular 
                    ? "bg-accent hover:bg-accent/90 text-white shadow-accent/20 border-none px-8" 
                    : "hover:bg-primary hover:text-white border-2"
                  }`}
                >
                  {plan.cta}
                  {plan.popular && <Zap className="w-5 h-5 ml-2 fill-current" />}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
}
