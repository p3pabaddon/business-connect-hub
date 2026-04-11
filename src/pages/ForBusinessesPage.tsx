import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ForBusinessSection } from "@/components/marketing/ForBusinessSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { CTASection } from "@/components/marketing/CTASection";
import { SEOHead } from "@/components/SEOHead";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ScrollReveal } from "@/hooks/useScrollReveal";
import { DemoVideoSection } from "@/components/marketing/DemoVideoSection";
import { Cpu, Zap, Brain, Package, Shield, TrendingUp, ChevronRight } from "lucide-react";

export default function ForBusinessesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title={t("nav.for_business")}
        description={t("business.landing_subtitle")}
      />
      <Header />
      <main className="flex-1">
        {/* Business Hero */}
        <section className="bg-slate-950 pt-20 pb-32 text-white relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <ScrollReveal direction="down" distance={20}>
              <span className="text-accent font-semibold tracking-wider uppercase text-sm mb-4 block">
                {t("nav.for_business")}
              </span>
              <h1 className="text-4xl md:text-6xl font-heading mb-6 max-w-4xl mx-auto leading-tight">
                {t("business.landing_title")}
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                {t("business.landing_subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8" onClick={() => navigate("/isletme-basvuru")}>
                  {t("cta.apply_btn")}
                </Button>
                <Button size="lg" variant="outline" className="border-slate-800 hover:bg-slate-900 text-white px-8" onClick={() => navigate("/iletisim")}>
                  {t("nav.contact")}
                </Button>
              </div>
            </ScrollReveal>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/10 to-transparent pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
        </section>

        {/* Reusing existing sections but with a business focus */}
        <ForBusinessSection />
        
        <DemoVideoSection />


        {/* AI & Automation Showcase */}
        <section className="py-24 bg-slate-950 overflow-hidden relative">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent_50%)]" />
           
           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-16">
                 <div className="lg:w-1/2">
                    <ScrollReveal direction="left">
                       <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-primary/30">
                          <Cpu className="w-6 h-6 text-primary" />
                       </div>
                       <h2 className="text-3xl md:text-5xl font-heading text-white mb-6 leading-tight">
                          {t("business.ai_section_title")}
                       </h2>
                       <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                          {t("business.ai_section_subtitle")} Sistemimiz her randevu sonrası yorumları analiz eder, 
                          müşteri kayıp risklerini hesaplar ve dükkan performansınızı yapay zeka ile raporlar.
                       </p>
                       
                       <div className="space-y-4">
                          {[
                            { title: "AI Yorum Analizi", desc: "Binlerce yorumu saniyeler içinde özetler." },
                            { title: "Churn Sentinel", desc: "Gelme ihtimali düşük müşterileri önceden yakalar." },
                            { title: "Akıllı Tahminler", desc: "Yoğun saatleri ve personel verimliliğini analiz eder." }
                          ].map(item => (
                            <div key={item.title} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-primary/30 transition-colors">
                               <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                                  <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                               </div>
                               <div>
                                  <h4 className="text-white font-bold">{item.title}</h4>
                                  <p className="text-sm text-slate-500">{item.desc}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </ScrollReveal>
                 </div>
                 
                 <div className="lg:w-1/2">
                    <ScrollReveal direction="right" distance={50}>
                       <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl">
                             <div className="flex items-center gap-4 mb-8">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <div className="ml-auto text-[10px] text-slate-500 font-mono tracking-tighter uppercase">AI Brain Terminal v1.0</div>
                             </div>
                             
                             <div className="space-y-6">
                                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                   <div className="flex items-center gap-3 mb-2">
                                      <Brain className="w-4 h-4 text-accent" />
                                      <p className="text-xs font-bold text-accent uppercase">CEO Insight</p>
                                   </div>
                                   <p className="text-sm text-slate-300 italic">"Bu hafta müşteri memnuniyeti %12 arttı. Ancak akşam saatlerinde personel verimliliği %15 düştü. Ekip toplantısı öneriyorum."</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                      <p className="text-[10px] text-slate-500 uppercase font-bold">Risk Faktörü</p>
                                      <p className="text-xl font-bold text-emerald-500">DÜŞÜK</p>
                                   </div>
                                   <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                      <p className="text-[10px] text-slate-500 uppercase font-bold">Üretkenlik</p>
                                      <p className="text-xl font-bold text-primary">%94</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </ScrollReveal>
                 </div>
              </div>
           </div>
        </section>

        <section className="py-24 bg-white dark:bg-[#020617]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-heading mb-4">Geleceğin Operasyonel Gücü</h2>
               <p className="text-muted-foreground max-w-2xl mx-auto italic">Takvimden fazlası: Gerçek dükkan yönetimi.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[4, 5, 6].map((i) => (
                <div key={i} className="bg-background group p-10 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                   <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                   
                   <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-accent group-hover:text-white transition-colors duration-500">
                      {i === 4 && <Brain className="w-7 h-7" />}
                      {i === 5 && <Package className="w-7 h-7" />}
                      {i === 6 && <TrendingUp className="w-7 h-7" />}
                   </div>
                   
                   <h3 className="text-2xl font-black mb-4 tracking-tight">{t(`business.feature${i}_title`)}</h3>
                   <p className="text-muted-foreground leading-relaxed mb-8">{t(`business.feature${i}_desc`)}</p>
                   
                   <div className="flex items-center text-primary font-bold text-sm gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                      Detayları Gör <ChevronRight className="w-4 h-4" />
                   </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PricingSection />
        
        <section className="py-20 bg-primary text-primary-foreground text-center">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-3xl md:text-4xl font-heading mb-6">{t("business.cta_title")}</h2>
            <p className="text-lg opacity-90 mb-10">{t("business.cta_desc")}</p>
            <Button size="lg" variant="secondary" className="px-10" onClick={() => navigate("/isletme-basvuru")}>
              {t("cta.apply_btn")}
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
