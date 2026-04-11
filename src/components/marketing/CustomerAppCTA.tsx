import { t } from "@/lib/translations";
import { ScrollReveal } from "@/hooks/useScrollReveal";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Smartphone } from "lucide-react";

export function CustomerAppCTA() {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="flex-1 text-center lg:text-left">
            <ScrollReveal direction="left">
              <h2 className="text-4xl md:text-5xl font-heading text-primary-foreground mb-6 leading-tight">
                {t("customer_cta.title")}
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl">
                {t("customer_cta.desc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" variant="secondary" className="px-10 h-14 text-lg font-bold rounded-xl shadow-xl hover:scale-105 transition-transform">
                  <Search className="w-5 h-5 mr-2" />
                  {t("customer_cta.btn")}
                </Button>
                <div className="flex items-center gap-4 px-6 border border-primary-foreground/20 rounded-xl bg-white/5 backdrop-blur-sm">
                  <Smartphone className="w-6 h-6 text-primary-foreground" />
                  <div className="text-left py-2">
                    <p className="text-[10px] uppercase font-bold text-primary-foreground/60 leading-none mb-1">Coming Soon</p>
                    <p className="text-sm font-bold text-primary-foreground leading-none">Mobile App</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="flex-1 w-full max-w-lg lg:max-w-xl">
            <ScrollReveal direction="right" delay={300}>
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-foreground/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="h-12 w-32 bg-white/10 rounded-lg animate-pulse" />
                    <div className="space-y-4">
                      <div className="h-4 w-full bg-white/20 rounded-md" />
                      <div className="h-4 w-4/5 bg-white/20 rounded-md" />
                      <div className="h-4 w-3/4 bg-white/10 rounded-md" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-square bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary-foreground/40" />
                        </div>
                      ))}
                    </div>
                    <div className="h-14 w-full bg-accent rounded-xl" />
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-accent rounded-2xl rotate-12 flex items-center justify-center shadow-xl animate-bounce">
                  <Search className="w-10 h-10 text-accent-foreground" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-success rounded-xl -rotate-12 flex items-center justify-center shadow-xl">
                  <Zap className="w-8 h-8 text-success-foreground" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
      </div>
    </section>
  );
}

// Helper icon
function Zap({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M4 14.5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h11l-3 6h7l-1 5" />
      <path d="M12 19.5v-2" />
      <path d="M16 19.5v-2" />
      <path d="M20 19.5v-2" />
    </svg>
  );
}
