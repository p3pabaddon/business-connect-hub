import { motion } from "framer-motion";
import { CheckCircle2, Search, Calendar, TrendingUp, Sparkles, UserCheck } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-surface">
      <SEOHead 
        title="Sistem Nasıl Çalışır? | Randevu Dünyası"
        description="Randevu Dünyası platformunun işleyiş mantığını, müşteriler ve işletmeler için sunduğu avantajları öğrenin."
      />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.15),transparent)]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-6xl font-black mb-8 tracking-tight leading-tight"
              >
                Randevu Dünyası <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">Nasıl Çalışır?</span>
              </motion.h1>
              <p className="text-xl text-slate-400 leading-relaxed font-medium">
                İşletmenizi dijital dünyaya taşıyın ve müşterilerinizle saniyeler içinde buluşun. İşte platformumuzun uçtan uca işleyiş mantığı.
              </p>
            </div>
          </div>
        </section>

        {/* Customer Journey */}
        <section className="py-24 bg-white dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-foreground">Kullanıcılar İçin Yolculuk</h2>
              <p className="text-muted-foreground mt-2">Müşterileriniz sizi nasıl bulur ve randevu alır?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: Search,
                  title: "1. Keşfet",
                  description: "Kullanıcılar kategoriye, şehre veya yakındaki işletmelere göre arama yaparak sizi keşfeder.",
                  color: "bg-blue-500/10 text-blue-500"
                },
                {
                  icon: Calendar,
                  title: "2. Randevu Al",
                  description: "İstediği hizmeti ve personeli seçer, uygun saatleri görerek anında randevusunu oluşturur.",
                  color: "bg-purple-500/10 text-purple-500"
                },
                {
                  icon: Sparkles,
                  title: "3. Deneyimin Tadını Çıkar",
                  description: "Randevu saati yaklaştığında bildirim alırsınız ve hiçbir sırayla uğraşmadan hizmetinizi alırsınız.",
                  color: "bg-amber-500/10 text-amber-500"
                }
              ].map((step, index) => (
                <div key={index} className="relative p-8 rounded-3xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-6`}>
                    <step.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Business Partnership */}
        <section className="py-24 bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  İşletmeler İçin Akıllı Çözümler
                </h2>
                <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                  İşletmenizi kaydettiğiniz andan itibaren yönetim paneliniz üzerinden tüm randevu trafiğinizi, personel programlarınızı ve müşteri analizlerinizi takip edebilirsiniz.
                </p>

                <div className="space-y-6">
                  {[
                    "Kendi dijital vitrininizi oluşturun",
                    "7/24 kesintisiz randevu talebi alın",
                    "Yapay zeka asistanı ile verimliliği artırın",
                    "Gelişmiş raporlama ve analiz araçları"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-foreground font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                    <TrendingUp className="w-10 h-10 text-green-500 mb-4" />
                    <h4 className="font-bold mb-2">Gelir Artışı</h4>
                    <p className="text-sm text-muted-foreground">Boş saatlerinizi otomatik doldurun.</p>
                  </div>
                  <div className="bg-card border border-border p-6 rounded-3xl shadow-sm translate-x-4">
                    <UserCheck className="w-10 h-10 text-orange-500 mb-4" />
                    <h4 className="font-bold mb-2">Müşteri Sadakati</h4>
                    <p className="text-sm text-muted-foreground">Düzenli müşterileriniz için özel kampanya yapın.</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                    <Sparkles className="w-10 h-10 text-purple-500 mb-4" />
                    <h4 className="font-bold mb-2">Prestij</h4>
                    <p className="text-sm text-muted-foreground">Dijitalleşen işletmeler her zaman öndedir.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-primary via-primary to-accent rounded-[3rem] p-10 sm:p-20 text-center text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50" />
              
              <div className="relative z-10">
                <h2 className="text-4xl sm:text-5xl font-black mb-8 leading-tight">Şimdi Başlamaya Hazır Mısınız?</h2>
                <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                  İster müşteri olun ister işletme sahibi, Randevu Dünyası sizin için en verimli çalışma ortamını ve en kolay randevu deneyimini sağlar.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <a href="/isletme-basvuru" className="px-10 py-5 bg-white text-primary text-lg font-black rounded-2xl hover:scale-105 transition-all shadow-xl hover:bg-slate-50">
                    İşletmemi Kaydet
                  </a>
                  <a href="/kesfet" className="px-10 py-5 bg-primary-foreground/10 text-white text-lg font-black rounded-2xl hover:bg-primary-foreground/20 transition-all border border-white/20 hover:scale-105">
                    Hemen Keşfet
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HowItWorks;
