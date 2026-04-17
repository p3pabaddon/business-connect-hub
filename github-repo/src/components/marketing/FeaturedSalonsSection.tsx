import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Star, MapPin, Clock, Loader2, Zap } from "lucide-react";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Business } from "@/types";
import { Link } from "react-router-dom";

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
    <section className="py-16 sm:py-24 bg-background overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading mb-3 sm:mb-4 tracking-tight font-bold">
              {t("featured_salons.title")}
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
              {t("featured_salons.subtitle")}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden sm:block"
          >
            <Link to="/isletmeler">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-accent/20 hover:bg-accent/5 hover:text-accent transition-all">
                Tümünü Gör
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 min-h-[400px]"
        >
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-background rounded-[1.5rem] sm:rounded-[2rem] border border-border overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-6 sm:p-8 space-y-4">
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
                className="group bg-background rounded-[1.5rem] sm:rounded-[2rem] border border-border overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img 
                    src={salon.cover_image || `https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800`} 
                    alt={salon.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-xs sm:text-sm tracking-tight">{salon.rating || "5.0"}</span>
                    <span className="text-muted-foreground text-[10px] sm:text-xs font-medium">({salon.review_count || 0})</span>
                  </div>
                  {salon.is_featured && (
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-amber-500 text-white px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse z-20">
                      <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
                      <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Öne Çıkan</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 sm:p-8">
                  <div className="text-[10px] sm:text-xs font-bold text-accent uppercase tracking-[0.15em] mb-2 sm:mb-4">
                    {salon.category}
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-accent transition-colors line-clamp-1 tracking-tight">
                    {salon.name}
                  </h3>
                  
                  <div className="flex flex-col gap-2.5 mb-6 sm:mb-8">
                    <div className="flex items-center gap-2.5 text-muted-foreground group-hover:text-foreground transition-colors text-xs sm:text-sm">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span className="font-medium line-clamp-1">{salon.district}, {salon.city}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-muted-foreground group-hover:text-foreground transition-colors text-xs sm:text-sm">
                      <Clock className="w-4 h-4 text-accent" />
                      <span className="font-medium">Anında Onaylı Randevu</span>
                    </div>
                  </div>
                  
                  <Link to={`/isletme/${salon.slug || salon.id}`}>
                    <Button 
                      className="w-full rounded-2xl py-6 sm:py-7 text-base sm:text-lg font-bold group-hover:bg-accent group-hover:text-accent-foreground shadow-lg group-hover:shadow-accent/20 transition-all duration-300"
                    >
                      Randevu Al
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border">
              <p className="text-muted-foreground font-medium">Henüz vitrin işletmesi bulunmuyor.</p>
            </div>
          )}
        </motion.div>
        
        <div className="mt-12 text-center sm:hidden">
            <Link to="/isletmeler">
                <Button variant="outline" size="lg" className="w-full rounded-full border-accent/20">
                    Tüm İşletmeleri Keşfet
                </Button>
            </Link>
        </div>
      </div>
    </section>
  );
}
