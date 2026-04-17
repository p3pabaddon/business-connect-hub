import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { t } from "@/lib/translations";
import { ScrollReveal } from "@/hooks/useScrollReveal";

const cities = [
  { name: "İstanbul", count: 1250 },
  { name: "Ankara", count: 480 },
  { name: "İzmir", count: 380 },
  { name: "Bursa", count: 220 },
  { name: "Antalya", count: 190 },
  { name: "Adana", count: 140 },
  { name: "Konya", count: 120 },
  { name: "Gaziantep", count: 110 },
];

export function FeaturedCitiesSection() {
  return (
    <section className="py-16 sm:py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-accent mb-3 block">
              {t("cities.label")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading text-foreground mb-4">
              {t("cities.title")}
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {cities.map((city, i) => (
            <ScrollReveal key={city.name} delay={i * 80} distance={20}>
              <Link
                to="/isletmeler"
                className="group bg-card border border-border rounded-xl p-5 hover:border-accent/30 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-500 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{city.name}</h3>
                  <p className="text-xs text-muted-foreground">{city.count}+ {t("sectors.business_count")}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
