import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { SalonCard } from '@/components/Discover/SalonCard';
import { Loader2, MapPin, Sparkles, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';

const Discover = () => {
  const { user, loading: authLoading } = useAuth();
  const { coords, loading: geoLoading, error: geoError, getPosition } = useGeolocation();
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getPosition();
  }, [getPosition]);

  useEffect(() => {
    const fetchSalons = async () => {
      setLoading(true);
      try {
        if (coords) {
          const { data, error } = await supabase.rpc('find_businesses_near', {
            lat: coords.latitude,
            lng: coords.longitude,
            radius_meters: 100000 
          });
          
          if (error) {
            console.error('RPC Error:', error);
            throw new Error('RPC_FAILED');
          }

          if (data && data.length > 0) {
            const ids = data.map((d: any) => d.id);
            const { data: businessData, error: bError } = await supabase
              .from('businesses')
              .select('*')
              .in('id', ids);
            
            if (bError) throw bError;
            
            if (businessData) {
              const merged = businessData.map(b => ({
                ...b,
                distance: data.find((d: any) => d.id === b.id)?.dist_meters
              })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
              
              setSalons(merged);
              return;
            }
          }
        }

        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .is('is_active', true)
          .limit(20);

        if (error) throw error;
        setSalons(data || []);
      } catch (error: any) {
        console.error('Error fetching salons:', error);
        if (error.message !== 'RPC_FAILED') {
          toast.error('Salonlar yüklenirken bir hata oluştu.');
        } else {
          const { data, error: fbError } = await supabase
            .from('businesses')
            .select('*')
            .limit(20);
          if (!fbError) setSalons(data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSalons();
  }, [coords]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentSalon = salons[currentIndex];
    
    if (direction === 'right' && user && currentSalon) {
      try {
        console.log('Favori ekleme işlemi başlıyor:', { userId: user.id, businessId: currentSalon.id });
        
        // Önce var olup olmadığını kontrol edelim (Upsert kısıtlama hatası verirse diye)
        const { data: existing } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('business_id', currentSalon.id)
          .maybeSingle();

        if (!existing) {
          const { error: insError } = await supabase
            .from('favorites')
            .insert({
              user_id: user.id,
              business_id: currentSalon.id
            });

          if (insError) throw insError;
          
          toast.success(`${currentSalon.name} favorilere eklendi!`, {
            icon: '💖'
          });
        } else {
          toast.info(`${currentSalon.name} zaten favorilerinde.`);
        }
      } catch (err) {
        console.error('Favori ekleme hatası:', err);
        toast.error('Favorilere eklenirken bir teknik sorun oluştu.');
      }
    } else if (direction === 'right' && !user) {
      toast.error('Favorilere eklemek için giriş yapmalısınız.');
    }
    
    setCurrentIndex(prev => prev + 1);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    getPosition();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background flex flex-col items-center p-4 md:p-8 relative overflow-hidden">
      <SEOHead 
        title="Yeni İşletmeler Keşfet | Yakınındaki En İyi Salonlar"
        description="Sana en yakın berber, kuaför ve güzellik salonlarını keşfetmenin en eğlenceli yolu. Sağa kaydır ve favorini bul!"
      />
      
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />

      <div className="text-center mb-8 z-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-3">
          <Sparkles className="text-amber-500 w-8 h-8" />
          Etrafındaki Dünyayı Keşfet
        </h1>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Yakınındaki en iyi salonlar
        </p>
      </div>

      <div className="relative w-full flex-1 flex justify-center items-center">
        {loading || geoLoading || authLoading ? (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="animate-pulse">Senin için en yakın salonlar aranıyor...</p>
          </div>
        ) : salons.length > 0 && currentIndex < salons.length ? (
          <AnimatePresence>
            {salons.slice(currentIndex, currentIndex + 3).reverse().map((salon, index) => (
              <SalonCard 
                key={salon.id} 
                salon={salon} 
                onSwipe={handleSwipe}
              />
            ))}
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 max-w-md"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <RefreshCcw className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Harika Keşifler Yaptın!</h2>
            <p className="text-muted-foreground">
              Şu an için gösterilecek başka salon kalmadı. Aramanı genişletebilir veya baştan başlayabilirsin.
            </p>
            <button 
              onClick={handleReset}
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
            >
              Yeniden Ara
            </button>
          </motion.div>
        )}
      </div>

      <div className="mt-8 flex gap-8 z-10 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          Sola: Geç
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          Sağa: Favori
        </div>
      </div>
    </div>
  );
};

export default Discover;
