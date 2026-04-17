import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { MapPin, Star, Award, TrendingUp, Calendar, Scissors, Sparkles, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { turkiyeIller } from '@/lib/turkey-locations';

const CityGuide = () => {
  const { citySlug } = useParams();
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Find the actual city object from turkiyeIller
  const cityObj = turkiyeIller.find(c => c.il.toLowerCase() === citySlug?.toLowerCase()) || 
                  turkiyeIller.find(c => c.il.toLowerCase().replace('ı','i').replace('ü','u').replace('ö','o').replace('ş','s').replace('ç','c').replace('ğ','g') === citySlug?.toLowerCase());
  
  const cityName = cityObj?.il || (citySlug ? citySlug.charAt(0).toUpperCase() + citySlug.slice(1) : '');

  useEffect(() => {
    const fetchCitySalons = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .ilike('city', `%${cityName}%`)
        .order('rating', { ascending: false })
        .limit(10);

      if (error) console.error(error);
      else setSalons(data || []);
      setLoading(false);
    };

    if (cityName) {
      fetchCitySalons();
    }
  }, [cityName]);

  const stats = [
    { label: "Onaylı İşletme", value: salons.length > 0 ? `${salons.length}+` : "10+" },
    { label: "Aktif Kullanıcı", value: "500+" },
    { label: "Başarılı Randevu", value: "2000+" },
    { label: "Müşteri Puanı", value: "4.8" }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 selection:bg-primary/30">
      <SEOHead 
        title={`${cityName} En İyi Güzellik Salonları, Berberler ve Spa Merkezleri`}
        description={`${cityName} şehrinde en yüksek puan alan salonları keşfedin. ${salons.length > 0 ? salons[0].name + ' gibi ' : ''}seçkin işletmelerden anında ücretsiz randevu alın.`}
        type="website"
      />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-[#050505] overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center lg:text-left">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8">
                <MapPin className="w-4 h-4" />
                <span>Şehir Rehberi: {cityName}</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 font-heading leading-tight tracking-tighter">
                {cityName}'nın <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic">Zirvesindeki</span> Salonlar
              </h1>
              <p className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
                {cityName} sokaklarında stilinizi parlatacak en iyi ismi mi arıyorsunuz? Uzmanlarımızın seçtiği en seçkin işletmeleri keşfedin.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button size="lg" className="rounded-2xl h-14 px-8 font-bold shadow-xl shadow-primary/20 group">
                  Hemen Keşfet 
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <div className="flex -space-x-4 items-center">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-gray-800 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" />
                    </div>
                  ))}
                  <div className="pl-6 text-sm text-gray-500 font-medium">+1200 {cityName}'lı burada</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, i) => (
                <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm text-center transform hover:-translate-y-2 transition-transform duration-500">
                  <div className="text-3xl font-black text-primary mb-2 tracking-tighter">{stat.value}</div>
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Detailed Guide & List */}
          <div className="lg:col-span-8 flex-1">
            <div className="mb-16">
              <h2 className="text-3xl font-black mb-6 uppercase tracking-tight">Neden {cityName} Salonları?</h2>
              <div className="grid sm:grid-cols-2 gap-8 text-gray-400 leading-relaxed text-sm">
                <div className="space-y-4">
                  <p className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{cityName}'nın en köklü ve güvenilir işletmeleri titizlikle seçildi.</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Gerçek kullanıcı yorumları ve şeffaf puanlama sistemi.</span>
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Sıra beklemeden, mobil cihazınızdan 7/24 randevu imkanı.</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Özel kampanyalar ve müdavim programları ile daha karlı hizmet.</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-12">
              <h3 className="text-2xl font-black uppercase tracking-tight border-b-4 border-primary pb-2">{cityName} Top 10 Listesi</h3>
            </div>

            {loading ? (
              <div className="space-y-12">
                {[1, 2, 3].map(i => (
                   <div key={i} className="h-80 rounded-[2.5rem] bg-white/5 animate-pulse border border-white/10" />
                ))}
              </div>
            ) : salons.length > 0 ? (
              <div className="space-y-12">
                {salons.map((salon, index) => (
                  <motion.div
                    key={salon.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group relative bg-[#fafafa] dark:bg-white/5 rounded-[2.5rem] p-4 sm:p-8 border border-border dark:border-white/10 hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                       <div className="relative w-full md:w-80 h-64 sm:h-80 shrink-0 rounded-[2rem] overflow-hidden shadow-2xl">
                          <img 
                            src={salon.logo || `/placeholder.svg`} 
                            alt={salon.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                          <div className="absolute top-4 left-4 bg-primary text-white font-black px-4 py-2 rounded-xl text-lg shadow-lg">
                            #{index + 1}
                          </div>
                       </div>
                       
                       <div className="flex-1 flex flex-col justify-between py-2">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-2xl sm:text-3xl font-black mb-1 group-hover:text-primary transition-colors">{salon.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500 font-bold uppercase tracking-widest italic">
                                  {salon.category} • {salon.district}
                                </div>
                              </div>
                              <Award className="w-10 h-10 text-amber-500 opacity-20 group-hover:opacity-100 transition-opacity hidden sm:block" />
                            </div>
                            
                            <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3 italic">
                              "{salon.description || `${cityName} bölgesinde kalitenin yeni adresi.`}"
                            </p>

                            <div className="flex flex-wrap gap-2 mb-8">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-bold uppercase transition-all hover:bg-primary/20 cursor-default">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {salon.rating || '4.9'}
                              </div>
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-xl text-xs font-bold uppercase transition-all hover:bg-accent/20 cursor-default">
                                <TrendingUp className="w-3.5 h-3.5" />
                                Popüler
                              </div>
                            </div>
                          </div>

                          <Button asChild size="lg" className="rounded-2xl h-14 font-black text-sm uppercase tracking-widest group shadow-lg">
                            <Link to={`/isletme/${salon.slug}`}>
                              Online Randevu Al
                              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10">
                <Scissors className="w-16 h-16 text-gray-700 mx-auto mb-6 opacity-30" />
                <h3 className="text-2xl font-bold mb-2">Şu An Kimseyi Bulamadık</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Bu şehirde henüz listelenen işletme bulunmuyor. Yakında burada olacağız!</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-96 space-y-12">
            <div className="sticky top-24 space-y-12">
               <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-accent/10 border border-white/10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                  <Sparkles className="w-12 h-12 text-primary mb-8 animate-bounce" />
                  <h4 className="text-3xl font-black mb-4 leading-tight">Yerinizi Alın!</h4>
                  <p className="text-gray-400 text-sm mb-10 leading-relaxed font-medium">
                    İşletme sahibi misiniz? {cityName}'lı müşterilere ulaşmanın en şovalyece yoluna katılın.
                  </p>
                  <Button asChild size="lg" variant="secondary" className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">
                    <Link to="/isletme-basvuru">BAŞVURU YAP</Link>
                  </Button>
               </div>

               <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10">
                  <h4 className="text-xl font-black mb-8 uppercase tracking-widest border-b border-white/10 pb-4">Diğer Şehirler</h4>
                  <div className="space-y-4">
                    {['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Eskişehir'].map(city => (
                      <Link 
                        key={city}
                        to={`/sehir/${city.toLowerCase().replace('ı','i').replace('ş','s').replace('ü','u').replace('ö','o').replace('ç','c').replace('ğ','g')}`}
                        className="flex items-center justify-between text-sm font-bold text-gray-500 hover:text-white transition-all group py-2"
                      >
                        {city} Rehberi
                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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

// Simple ArrowRight component if lucide one fails for some reason or as a fallback
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default CityGuide;
