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
import { useNavigate } from "react-router-dom";
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

function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float-medium" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-info/5 rounded-full blur-3xl animate-float-fast" />
    </div>
  );
}

export function HeroSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIl, setSelectedIl] = useState("");
  const [selectedIlce, setSelectedIlce] = useState("");
  const ilceler = turkiyeIller.find((l) => l.il === selectedIl)?.ilceler ?? [];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedIl && selectedIl !== "all") params.append("city", selectedIl);
    if (selectedIlce && selectedIlce !== "all") params.append("district", selectedIlce);
    navigate(`/isletmeler?${params.toString()}`);
  };

  const stats = [
    { label: t("hero.stat_business"), value: "2,500+" },
    { label: t("hero.stat_customer"), value: "150K+" },
    { label: t("hero.stat_appointment"), value: "500K+" },
    { label: t("hero.stat_city"), value: "81" },
  ];

  return (
    <section className="relative overflow-hidden bg-background min-h-[600px] flex items-center">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay dark:opacity-20"
        style={{ backgroundImage: 'url("/hero_luxury_bg.png")' }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-accent/5" />
      <FloatingShapes />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-24 lg:py-32 text-center">
        <ScrollReveal delay={0} duration={800}>
          <div className="inline-flex items-center gap-2 bg-secondary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">{t("hero.badge")}</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100} duration={800}>
          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-tight text-foreground mb-4 sm:mb-6">
            {t("hero.title_1")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              {t("hero.title_2")}
            </span>{" "}
            {t("hero.title_3")}
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={200} duration={800}>
          <p className="text-base sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            {t("hero.subtitle")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={300} duration={900} distance={50}>
          <div className="bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-card max-w-4xl mx-auto mb-10 hover:shadow-card-hover transition-shadow duration-500">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  placeholder={t("hero.search")}
                  className="pl-9 sm:pl-10 h-11 sm:h-12 border-0 bg-surface focus:bg-card text-sm sm:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select value={selectedIl} onValueChange={(v) => { setSelectedIl(v); setSelectedIlce(""); }}>
                <SelectTrigger className="h-11 sm:h-12 border-0 bg-surface text-sm sm:text-base">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground mr-1.5 sm:mr-2 flex-shrink-0" />
                  <SelectValue placeholder={t("common.select_city")} />
                </SelectTrigger>
                <SelectContent className="max-h-60 sm:max-h-72 overflow-y-auto">
                  <SelectItem value="all">{t("isletmeler.all_cities")}</SelectItem>
                  {turkiyeIller.map((loc) => (
                    <SelectItem key={loc.il} value={loc.il}>{loc.il}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedIlce} onValueChange={setSelectedIlce} disabled={!selectedIl || selectedIl === "all"}>
                <SelectTrigger className="h-11 sm:h-12 border-0 bg-surface disabled:opacity-50 text-sm sm:text-base">
                  <SelectValue placeholder={selectedIl && selectedIl !== "all" ? t("common.select_district") : t("common.select_city_first")} />
                </SelectTrigger>
                <SelectContent className="max-h-60 sm:max-h-72 overflow-y-auto">
                  <SelectItem value="all">Tüm İlçeler</SelectItem>
                  {ilceler.map((ilce) => (
                    <SelectItem key={ilce} value={ilce}>{ilce}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
               <Button size="lg" className="h-11 sm:h-12 w-full font-bold" onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                {t("hero.search_btn")}
              </Button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400} duration={800}>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12 sm:mb-16">
            <span className="text-xs sm:text-sm text-muted-foreground">{t("hero.popular")}</span>
            {[
              { name: t("sectors.barber"), href: "/isletmeler?category=Berber" },
              { name: t("sectors.beauty"), href: "/isletmeler?category=Güzellik Salonu" },
              { name: t("sectors.spa"), href: "/isletmeler?category=Spa & Wellness" },
              { name: t("sectors.hairdresser"), href: "/isletmeler?category=Kuaför" },
            ].map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-[10px] sm:text-sm font-medium text-primary hover:text-accent border border-border hover:border-accent px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all hover:scale-105 whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={500} duration={800}>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-12">
            {[
              { icon: CheckCircle, text: t("hero.sms_verified") },
              { icon: Star, text: t("hero.verified_biz") },
              { icon: Clock, text: t("hero.always_open") },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm text-muted-foreground font-medium">
                <badge.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={600 + i * 100} duration={800}>
              <div className="text-center group p-3 rounded-2xl hover:bg-muted/30 transition-colors">
                <div className="text-2xl sm:text-4xl font-heading text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="text-[11px] sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
