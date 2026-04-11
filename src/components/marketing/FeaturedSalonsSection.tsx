import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Star, MapPin, Clock, Loader2, Zap } from "lucide-react";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Business } from "@/types";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function FeaturedSalonsSection() {
  const [salons, setSalons] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const { data, error } = await supabase
          .from("businesses")
          .select("*")
          .eq("is_active", true)
          .order("is_featured", { ascending: false })
          .order("rating", { ascending: false })
          .limit(3);

        if (error) throw error;
        setSalons(data || []);
      } catch (err) {
        console.error("Error fetching salons:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalons();
  }, []);

  return (
    <section className="py-24 bg-background overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h2 className="text-4xl md:text-5xl font-heading mb-4 tracking-tight font-bold">
              {t("featured_salons.title")}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              {t("featured_salons.subtitle")}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Button variant="outline" size="lg" className="rounded-full px-8 border-accent/20 hover:bg-accent/5 hover:text-accent transition-all">
              {t("hero.popular")}
            </Button>
          </motion.div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 min-h-[400px]"
        >
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-background rounded-[2rem] border border-border overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-8 space-y-4">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                  <div className="h-20 bg-muted rounded w-full" />
                </div>
              </div>
            ))
          ) : salons.length > 0 ? (
            salons.map((salon) => (
              <motion.div 
                key={salon.id} 
                variants={itemVariants}
                className="group bg-background rounded-[2rem] border border-border overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img 
                    src={salon.cover_image || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800"} 
                    alt={salon.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-sm tracking-tight">{salon.rating || "5.0"}</span>
                    <span className="text-muted-foreground text-xs font-medium">({salon.review_count || 0}+)</span>
                  </div>
                  {salon.is_featured && (
                    <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse z-20">
                      <Zap className="w-3 h-3 fill-white" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Öne Çıkan</span>
                    </div>
                  )}
                </div>
                
                <div className="p-8">
                  <div className="text-xs font-bold text-accent uppercase tracking-[0.15em] mb-4">
                    {salon.category}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors line-clamp-1 tracking-tight">
                    {salon.name}
                  </h3>
                  
                  <div className="flex flex-col gap-3 mb-8">
                    <div className="flex items-center gap-2.5 text-muted-foreground group-hover:text-foreground transition-colors">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium line-clamp-1">{salon.city || "İstanbul"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-muted-foreground group-hover:text-foreground transition-colors">
                      <Clock className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">En yakın müsaitlik: Bugün</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full rounded-2xl py-7 text-lg font-bold group-hover:bg-accent group-hover:text-accent-foreground shadow-lg group-hover:shadow-accent/20 transition-all duration-300"
                    onClick={() => window.location.href = `/isletme/${salon.id}`}
                  >
                    Randevu Al
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border">
              <p className="text-muted-foreground font-medium">Henüz vitrin işletmesi bulunmuyor.</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
