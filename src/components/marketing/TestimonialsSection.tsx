import { Star, Quote } from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollReveal";

const testimonials = [
  {
    name: "Ayşe K.",
    role: "İstanbul, Güzellik Salonu Sahibi",
    text: "RandevuDunyasi ile müşterilerimiz artık 7/24 randevu alabiliyor. No-show oranımız %60 azaldı!",
    rating: 5,
    avatar: "AK",
  },
  {
    name: "Mehmet Y.",
    role: "Ankara, Berber",
    text: "Eskiden telefonla uğraşıyorduk, şimdi her şey otomatik. İşletmemiz büyüdü, müşteri memnuniyeti arttı.",
    rating: 5,
    avatar: "MY",
  },
  {
    name: "Zeynep D.",
    role: "İzmir, Spa & Wellness",
    text: "Analitik raporlar sayesinde en yoğun saatlerimizi öğrendik ve personel planlamasını optimize ettik.",
    rating: 5,
    avatar: "ZD",
  },
  {
    name: "Ali R.",
    role: "Antalya, Diş Kliniği",
    text: "Hastalarımız online randevu sistemini çok seviyor. Bekleme süreleri minimuma indi.",
    rating: 5,
    avatar: "AR",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-accent mb-3 block">
              Müşteri Yorumları
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading text-foreground mb-4">
              İşletme Sahipleri Ne Diyor?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Binlerce işletme sahibi RandevuDunyasi ile müşteri deneyimini dönüştürüyor.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((item, i) => (
            <ScrollReveal key={item.name} delay={i * 120} distance={30}>
              <div className="bg-card border border-border rounded-xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-500 relative group">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-accent/10 group-hover:text-accent/20 transition-colors" />
                
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: item.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                
                <p className="text-foreground mb-4 leading-relaxed text-sm">
                  "{item.text}"
                </p>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
