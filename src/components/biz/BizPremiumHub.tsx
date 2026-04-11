import React, { useState } from "react";
import { 
  Zap, 
  Star, 
  Layout, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Crown,
  ShieldCheck,
  BarChart3,
  Loader2
} from "lucide-react";
import { Business } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface BizPremiumHubProps {
  business: Business;
  onUpdate: () => void;
}

export function BizPremiumHub({ business, onUpdate }: BizPremiumHubProps) {
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handlePurchase = async (planId: string) => {
    setPurchasingId(planId);
    try {
      const updates: any = {};
      const now = new Date();
      
      if (planId === "boost") {
        updates.is_featured = true;
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        updates.featured_until = tomorrow.toISOString();
      } else if (planId === "pro") {
        updates.is_premium = true;
        updates.personnel_limit = 99;
      } else if (planId === "branding") {
        updates.branding_config = { ...(business.branding_config || {}), custom_colors: true };
      }

      const { error } = await supabase
        .from("businesses")
        .update(updates)
        .eq("id", business.id);

      if (error) throw error;
      
      alert("Tebrikler! Özellik başarıyla aktifleştirildi.");
      onUpdate();
    } catch (err) {
      console.error("Purchase error:", err);
      alert("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setPurchasingId(null);
    }
  };

  const plans = [
    {
      id: "boost",
      icon: Zap,
      title: "Aramada Öne Çık",
      desc: "İşletmenizi arama sonuçlarında en tepeye taşıyın ve 3 kat daha fazla randevu alın.",
      price: "₺49",
      period: "günlük",
      features: ["En üst sıra garantisi", "Öne Çıkanlar rozeti", "Ana sayfa vitrini"],
      active: business.is_featured,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      id: "pro",
      icon: Crown,
      title: "Pro İşletme Paketi",
      desc: "Sınırsız personel, gelişmiş analitik ve özel markalama özellikleri.",
      price: "₺299",
      period: "aylık",
      features: ["Sınırsız Personel", "Beyaz Etiket (No Branding)", "Gelişmiş AI Analizler"],
      active: business.is_premium,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      id: "branding",
      icon: Layout,
      title: "Özel Markalama",
      desc: "Müşterileriniz sadece sizin logonuzu ve renklerinizi görsün.",
      price: "₺149",
      period: "tek seferlik",
      features: ["Özel Renk Paleti", "Logo Vurgusu", "Reklamsız Sayfa"],
      active: !!business.branding_config?.custom_colors,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Crown className="w-3 h-3 text-primary animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-primary uppercase">Avantajlar Merkezi</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-2">
              İşletmenizin Gücünü <span className="text-primary">Artırın!</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-md">
              Daha fazla müşteriye ulaşmak ve operasyonunuzu profesyonelleştirmek için premium özellikleri kullanın.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-1">
             <div className="text-4xl font-black text-white">{business.is_premium ? 'VIP' : 'STANDART'}</div>
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Güncel Statü</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={cn(
              "relative group flex flex-col p-6 rounded-[2rem] border transition-all duration-500",
              plan.active 
                ? "bg-slate-900/80 border-primary/40 shadow-xl shadow-primary/5" 
                : "bg-slate-900/20 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40"
            )}
          >
            {plan.active && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                AKTİF ÖZELLİK
              </div>
            )}

            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", plan.bgColor)}>
              <plan.icon className={cn("w-6 h-6", plan.color)} />
            </div>

            <h3 className="text-lg font-black text-white mb-2">{plan.title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">{plan.desc}</p>

            <div className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500/60" />
                  <span className="text-[11px] text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
              <div>
                <span className="text-xl font-black text-white">{plan.price}</span>
                <span className="text-[10px] text-slate-500 ml-1">/ {plan.period}</span>
              </div>
              <Button 
                onClick={() => handlePurchase(plan.id)}
                disabled={plan.active || !!purchasingId}
                className={cn(
                  "px-4 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  plan.active 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                    : "bg-white text-black hover:bg-primary hover:text-white"
                )}
              >
                {purchasingId === plan.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  plan.active ? "SATIN ALINDI" : "SEÇ"
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Account Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-[2rem] bg-slate-950/50 border border-slate-900">
           <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-blue-500" />
              <h4 className="text-sm font-bold text-white uppercase tracking-tight">Personel Kotası</h4>
           </div>
           
           <div className="space-y-4">
              <div className="flex justify-between items-end">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Kullanım</span>
                 <span className="text-xs font-black text-white">6 / {business.personnel_limit}</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-blue-500 transition-all duration-1000" 
                   style={{ width: `${(6 / (business.personnel_limit || 2)) * 100}%` }}
                 />
              </div>
              <p className="text-[10px] text-slate-500">
                 Personel sınırınızı artırmak için <strong>Pro Paket</strong>'e geçebilirsiniz.
              </p>
           </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-slate-950/50 border border-slate-900 flex items-center justify-between">
           <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                 <BarChart3 className="w-4 h-4 text-emerald-500" />
                 <span className="text-xs font-bold text-white">Gelişmiş Analitik</span>
              </div>
              <p className="text-[10px] text-slate-500 max-w-[200px]">
                 Müşteri davranışlarını ve pazar trendlerini AI ile analiz edin.
              </p>
           </div>
           <Button variant="outline" className="border-slate-800 rounded-xl text-[10px] font-bold h-9">
              KİLİDİ AÇ
           </Button>
        </div>
      </div>
    </div>
  );
}
