import { motion } from "framer-motion";
import { Brain, Zap, TrendingUp, Sparkles, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Sparkles,
    title: "Master Stylist AI",
    description: "Yapay zeka görsel analiz teknolojisi ile müşterinizin yüz hatlarına en uygun saç ve sakal modelini saniyeler içinde önerin.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Churn Sentinel",
    description: "Gelme sıklığı azalan veya gelmeyi bırakmak üzere olan müşterileri önceden tespit edin, otomatik kampanyalarla geri kazanın.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Brain,
    title: "Biz AI Advisor",
    description: "Sadece veriyi değil, stratejiyi de sunar. Gelirlerinizi artırmak için yapay zeka destekli yönetim danışmanımız emrinizde.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: MessageSquare,
    title: "AI Voice Assistant",
    description: "n8n ve yapay zeka destekli sesli asistanımız ile mesai saatleri dışında dahi telefon randevularınız otomatik olarak alınır.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  }
];

export function AIShowcaseSection() {
  return (
    <section className="py-24 sm:py-32 bg-slate-950 text-white overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#3b82f6,transparent_50%),radial-gradient(circle_at_80%_70%,#8b5cf6,transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold tracking-widest uppercase mb-6">
                Yapay Zeka Devrimi
              </span>
              <h2 className="text-4xl sm:text-6xl font-heading font-black mb-8 leading-tight tracking-tight">
                Sadece bir takvim değil, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-emerald-400">
                  Dükkanınızın Beyni.
                </span>
              </h2>
              <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
                Randevu Dünyası, klasik randevu sistemlerinin çok ötesinde. İşletmenizi büyüten, kayıpları engelleyen ve prestij kazandıran ileri seviye yapay zeka modülleriyle tanışın.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/isletmeler-icin">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white text-lg font-bold px-10 rounded-2xl h-16 shadow-2xl shadow-accent/20">
                    Özellikleri Keşfet
                  </Button>
                </Link>
                <Link to="/isletme-basvuru">
                  <Button size="lg" variant="outline" className="border-slate-800 hover:bg-slate-900 text-slate-300 text-lg font-bold px-10 rounded-2xl h-16">
                    Hemen Başla
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-accent/50 transition-all duration-500 group"
              >
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed leading-relaxed font-medium">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
