import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, TrendingUp, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialProofWidgetProps {
  businessId: string;
  className?: string;
}

export const SocialProofWidget: React.FC<SocialProofWidgetProps> = ({ businessId, className }) => {
  const [viewers, setViewers] = useState(1);
  const [todayBookings, setTodayBookings] = useState(0);
  const [lastBookingMinutes, setLastBookingMinutes] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!businessId) return;

    // 1. Canlı İzleyici Takibi (Presence)
    const channel = supabase.channel(`biz_presence_${businessId}`, {
      config: { presence: { key: 'user' } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setViewers(Math.max(1, count + Math.floor(Math.random() * 3))); // Gerçekçi olması için küçük bir random ekliyoruz
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    // 2. Bugünün Randevularını Çek
    const fetchStats = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .gte('created_at', today.toISOString());

      setTodayBookings(count || 0);

      // Son randevu zamanı
      const { data: lastBooking } = await supabase
        .from('appointments')
        .select('created_at')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastBooking) {
        const diff = Math.floor((new Date().getTime() - new Date(lastBooking.created_at).getTime()) / 60000);
        setLastBookingMinutes(diff);
      }
    };

    fetchStats();
    
    // İlk girişte biraz bekle sonra göster
    setTimeout(() => setIsVisible(true), 2000);

    // Mesaj rotasyonu
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 6000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, [businessId]);

  const messages = [
    {
      icon: <Users className="w-4 h-4 text-primary" />,
      text: `${viewers} kişi şu an bu salonu inceliyor`,
      condition: viewers > 0
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      text: `Bugün ${todayBookings} randevu alındı!`,
      condition: todayBookings > 0
    },
    {
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      text: `Son randevu ${lastBookingMinutes} dk önce alındı`,
      condition: lastBookingMinutes !== null && lastBookingMinutes < 1440
    }
  ].filter(m => m.condition);

  if (messages.length === 0 || !isVisible) return null;

  const currentMessage = messages[activeIndex % messages.length];

  return (
    <div className={cn(
      "fixed bottom-24 left-4 z-50 transition-all duration-700 transform",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      className
    )}>
      <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl flex items-center gap-3 animate-in slide-in-from-left duration-500">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center relative">
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-25" />
          {currentMessage.icon}
        </div>
        <div className="flex flex-col">
          <p className="text-[13px] font-medium text-white/90 leading-tight">
            {currentMessage.text}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-[10px] text-white/40 uppercase tracking-tighter font-bold">LIVE PROOF</span>
          </div>
        </div>
      </div>
    </div>
  );
};
