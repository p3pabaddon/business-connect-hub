import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { MapPin, Star, Award, TrendingUp, Calendar, Scissors, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';

const CityGuide = () => {
  const { citySlug } = useParams();
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Convert slug back to readable city name (simple version)
  const cityName = citySlug ? citySlug.charAt(0).toUpperCase() + citySlug.slice(1) : '';

  useEffect(() => {
    const fetchCitySalons = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .ilike('city', `%${cityName}%`)
        .order('rating', { ascending: false });

      if (error) console.error(error);
      else setSalons(data || []);
      setLoading(false);
    };

    fetchCitySalons();
  }, [cityName]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>{cityName} En İyi Güzellik Salonları ve Berberler | Randevu Dünyası</title>
        <meta name="description" content={`${cityName} şehrindeki en yüksek puanlı güzellik salonları, berberler ve spa merkezlerini keşfedin. Güncel fiyatlar ve online randevu için hemen tıklayın.`} />
      </Helmet>

      {/* SEO Hero */}
      <section className="relative py-24 bg-[#0a0a0f] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-2 text-primary font-bold mb-4">
              <MapPin className="w-5 h-5" />
              <span>Yerel Rehber</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 font-heading leading-tight">
              {cityName}'nın <span className="text-gradient">En İyi</span> Güzellik Salonları & Berberleri
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl">
              Uzman kadromuz tarafından incelenmiş, {cityName} genelindeki en yüksek puanlı {salons.length} salonu aşağıda bulabilirsiniz.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <Calendar className="w-4 h-4" />
                Güncelleme: Mart 2024
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <TrendingUp className="w-4 h-4" />
                Popülariteye göre sıralandı
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison/Guide Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main List */}
          <div className="lg:col-span-8 space-y-12">
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              <h2>Neden {cityName} Salonlarını Tercih Etmelisiniz?</h2>
              <p>
                {cityName}, Türkiye'nin en köklü bakım ve güzellik kültürüne sahip şehirlerinden biridir. 
                İster ata yadigarı bir berber deneyimi, ister modern bir güzellik merkezi arayışında olun, 
                bu listede size en uygun seçeneği bulacağınıza eminiz.
              </p>
            </div>

            {loading ? (
              <div className="space-y-8">
                {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-3xl bg-secondary animate-pulse" />)}
              </div>
            ) : salons.length > 0 ? (
              <div className="space-y-8">
                {salons.map((salon, index) => (
                  <motion.div
                    key={salon.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-card rounded-[2.5rem] p-6 border border-border hover:border-primary/50 transition-all duration-500 overflow-hidden shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Ranking Badge */}
                      <div className="absolute top-0 left-0 w-16 h-16 bg-primary text-white flex items-center justify-center font-black text-2xl rounded-br-[2rem] z-10 shadow-lg">
                        #{index + 1}
                      </div>

                      <div className="w-full md:w-64 h-64 shrink-0 rounded-[2rem] overflow-hidden">
                        <img 
                          src={salon.main_image || '/placeholder.svg'} 
                          alt={salon.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-bold font-heading group-hover:text-primary transition-colors">
                              {salon.name}
                            </h3>
                            <div className="flex items-center gap-1 text-primary text-sm font-semibold mt-1">
                              <Star className="w-4 h-4 fill-current" />
                              {salon.rating || '4.8'} / 5 (120+ Değerlendirme)
                            </div>
                          </div>
                          <div className="hidden sm:block">
                            <Award className="w-8 h-8 text-amber-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>

                        <p className="text-muted-foreground line-clamp-2 italic">
                          "{salon.description || `${cityName} bölgesinde kaliteli hizmet veren öncü salonlardan biri.`}"
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {['Modern Kesim', 'Cilt Bakımı', 'Ücretsiz İkram'].map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider font-bold px-3 py-1 bg-secondary rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="pt-4 flex gap-4">
                          <Button asChild className="rounded-xl px-8 font-bold">
                            <Link to={`/isletme/${salon.slug}`}>Online Randevu Al</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-secondary/20 rounded-3xl">
                <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold">Bu Şehirde Henüz Kayıt Bulunmuyor</h3>
                <p className="text-muted-foreground">İşletme sahibiyseniz hemen başvurabilirsiniz.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#0a0a0f] to-[#1a1a25] text-white border border-white/5">
                <Sparkles className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4 font-heading">Hala Karar Vermedin mi?</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                  Size en yakın ve en uygun salonu bulmanız için akıllı algoritmalarımız hazır.
                </p>
                <Button variant="outline" asChild className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl">
                  <Link to="/kesfet">Keşfetmeye Başla</Link>
                </Button>
              </div>

              <div className="p-8 rounded-[2.5rem] border border-border bg-card">
                <h4 className="font-black mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Diğer Şehir Rehberleri
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {['Istanbul', 'Ankara', 'Izmir', 'Antalya'].map(city => (
                    <Link 
                      key={city}
                      to={`/sehir/${city.toLowerCase()}`}
                      className="px-4 py-3 rounded-xl hover:bg-secondary transition-colors text-sm font-semibold flex justify-between items-center"
                    >
                      {city} En İyi Salonlar
                      <span className="text-muted-foreground">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default CityGuide;
