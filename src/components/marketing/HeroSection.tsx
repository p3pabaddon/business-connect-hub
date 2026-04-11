import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Shield, Clock, Star, CheckCircle } from "lucide-react";
import { t } from "@/lib/translations";
import { turkiyeIller } from "@/lib/turkey-locations";
import { ScrollReveal } from "@/hooks/useScrollReveal";

function AnimatedCounter({ value, duration = 2000 }: { value: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  const parseTarget = useCallback(() => {
    const cleaned = value.replace(/[+,]/g, "");
    if (cleaned.endsWith("K")) {
      return { num: parseFloat(cleaned.replace("K", "")) * 1000, suffix: "K+", divider: 1000 };
    }
    return { num: parseInt(cleaned), suffix: value.includes("+") ? "+" : "", divider: 1 };
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const { num, suffix, divider } = parseTarget();
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * num);
            if (divider > 1) {
              const display = current >= 1000 ? (current / 1000).toFixed(0) : "0";
              setDisplayValue(`${Number(display).toLocaleString("tr-TR")}${suffix}`);
            } else {
              setDisplayValue(`${current.toLocaleString("tr-TR")}${progress >= 1 ? suffix : ""}`);
            }
            if (progress < 1) requestAnimationFrame(animate);
            else setDisplayValue(value);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, parseTarget]);

  return <span ref={ref}>{displayValue}</span>;
}

// Floating animated shapes
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float-medium" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-info/5 rounded-full blur-3xl animate-float-fast" />
      {/* Decorative dots */}
      <div className="hidden lg:block absolute top-32 right-20 w-3 h-3 bg-accent/30 rounded-full animate-pulse-slow" />
      <div className="hidden lg:block absolute top-48 right-40 w-2 h-2 bg-primary/30 rounded-full animate-pulse-slow" style={{ animationDelay: "1s" }} />
      <div className="hidden lg:block absolute bottom-40 left-20 w-3 h-3 bg-success/30 rounded-full animate-pulse-slow" style={{ animationDelay: "2s" }} />
    </div>
  );
}

export function HeroSection() {
  const [selectedIl, setSelectedIl] = useState("");
  const [selectedIlce, setSelectedIlce] = useState("");
  const ilceler = turkiyeIller.find((l) => l.il === selectedIl)?.ilceler ?? [];

  const stats = [
    { label: t("hero.stat_business"), value: "2,500+" },
    { label: t("hero.stat_customer"), value: "150K+" },
    { label: t("hero.stat_appointment"), value: "500K+" },
    { label: t("hero.stat_city"), value: "81" },
  ];

  return (
    <section className="relative overflow-hidden bg-background min-h-[600px] flex items-center">
      {/* Luxury Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay dark:opacity-20"
        style={{ backgroundImage: 'url("/hero_luxury_bg.png")' }}
      />
      
      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-accent/5" />
      
      <FloatingShapes />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <ScrollReveal delay={0} duration={800}>
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t("hero.badge")}
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100} duration={800}>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight text-foreground mb-6">
              {t("hero.title_1")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                {t("hero.title_2")}
              </span>{" "}
              {t("hero.title_3")}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200} duration={800}>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </ScrollReveal>

          {/* Search Box */}
          <ScrollReveal delay={300} duration={900} distance={50}>
            <div className="bg-card rounded-2xl border border-border p-4 shadow-card max-w-4xl mx-auto mb-12 hover:shadow-card-hover transition-shadow duration-500">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t("hero.search")}
                    className="pl-10 h-12 border-0 bg-surface focus:bg-card"
                  />
                </div>
                <Select value={selectedIl} onValueChange={(v) => { setSelectedIl(v); setSelectedIlce(""); }}>
                  <SelectTrigger className="h-12 border-0 bg-surface">
                    <MapPin className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
                    <SelectValue placeholder={t("common.select_city")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 overflow-y-auto">
                    {turkiyeIller.map((loc) => (
                      <SelectItem key={loc.il} value={loc.il}>{loc.il}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedIlce} onValueChange={setSelectedIlce} disabled={!selectedIl}>
                  <SelectTrigger className="h-12 border-0 bg-surface disabled:opacity-50">
                    <SelectValue placeholder={selectedIl ? t("common.select_district") : t("common.select_city_first")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 overflow-y-auto">
                    {ilceler.map((ilce) => (
                      <SelectItem key={ilce} value={ilce}>{ilce}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="lg" className="h-12">
                  <Search className="w-4 h-4 mr-2" />
                  {t("hero.search_btn")}
                </Button>
              </div>
            </div>
          </ScrollReveal>

          {/* Popular categories */}
          <ScrollReveal delay={400} duration={800}>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
              <span className="text-sm text-muted-foreground">{t("hero.popular")}</span>
              {[
                { name: t("sectors.barber"), href: "/isletmeler" },
                { name: t("sectors.beauty"), href: "/isletmeler" },
                { name: t("sectors.spa"), href: "/isletmeler" },
                { name: t("sectors.dental"), href: "/isletmeler" },
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-primary hover:text-accent border border-border hover:border-accent px-3 py-1.5 rounded-full transition-all hover:scale-105"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </ScrollReveal>

          {/* Trust badges */}
          <ScrollReveal delay={500} duration={800}>
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {[
                { icon: CheckCircle, text: t("hero.sms_verified") },
                { icon: Star, text: t("hero.verified_biz") },
                { icon: Clock, text: t("hero.always_open") },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <badge.icon className="w-4 h-4 text-accent" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={600 + i * 100} duration={800}>
                <div className="text-center group">
                  <div className="text-3xl sm:text-4xl font-heading text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
