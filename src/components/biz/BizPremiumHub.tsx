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
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BizPremiumHubProps {
  business: Business;
  onUpdate: () => void;
}

export function BizPremiumHub({ business, onUpdate }: BizPremiumHubProps) {
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successItem, setSuccessItem] = useState<{title: string, icon: any} | null>(null);

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
      title: "Premium İşletme Paketi",
      desc: "Sınırsız personel, gelişmiş analitik ve özel markalama özellikleri.",
      price: "₺1200",
      period: "aylık",
      features: ["Sınırsız Personel", "Beyaz Etiket (No Branding)", "Gelişmiş AI Analizler"],
      active: business.is_premium || business.plan === "premium",
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
        // Skip approval if paying
        updates.status = "approved";
        updates.is_active = true;
      } else if (planId === "pro") {
        updates.is_premium = true;
        updates.plan = "pro";
        updates.personnel_limit = 99;
        updates.status = "approved";
        updates.is_active = true;
      } else if (planId === "branding") {
        updates.branding_config = { ...(business.branding_config || {}), custom_colors: true };
        updates.status = "approved";
        updates.is_active = true;
      }

      const { error } = await supabase
        .from("businesses")
        .update(updates)
        .eq("id", business.id);

      if (error) throw error;
      
      const plan = plans.find(p => p.id === planId);
      setSuccessItem({ title: plan?.title || "Özellik", icon: plan?.icon || CheckCircle2 });
      setShowSuccess(true);
      
      onUpdate();
    } catch (err) {
      console.error("Purchase error:", err);
      toast.error("İşlem Başarısız", {
        description: "Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyiniz.",
      });
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="relative p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary/20 blur-[80px] md:blur-[120px] -mr-32 -mt-32 md:-mr-48 md:-mt-48 rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4 md:mb-8">
              <Crown className="w-3 h-3 md:w-4 md:h-4 text-primary animate-pulse" />
              <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] text-primary uppercase">Elite Avantaj Platformu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4 leading-[1.1]">
              İşletmenizin Potansiyelini <br className="hidden sm:block"/><span className="text-primary italic">Maksimuma Çıkarın!</span>
            </h2>
            <p className="text-slate-300 text-[10px] md:text-sm lg:text-base max-w-lg font-medium opacity-80 leading-relaxed px-2 md:px-0">
              Yapay zeka destekli analizler ve sınırsız operasyonel güç ile rakiplerinizin önüne geçin.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-1 md:gap-2 bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-2xl min-w-[140px] md:min-w-[200px]">
             <div className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">{business.is_premium ? 'VIP' : 'ECO'}</div>
             <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 md:mt-2">GÜNCEL STATÜ</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={cn(
              "relative group flex flex-col p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] border transition-all duration-500 shadow-sm",
              plan.active 
                ? "bg-card border-primary/40 shadow-xl shadow-primary/5 ring-1 ring-primary/20" 
                : "bg-card border-border hover:border-primary/20 hover:shadow-xl"
            )}
          >
            {plan.active && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 md:px-6 py-1 md:py-1.5 rounded-full bg-primary text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 z-10 whitespace-nowrap">
                AKTİF ÖZELLİK
              </div>
            )}

            <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-inner border", plan.bgColor, "border-white/10")}>
              <plan.icon className={cn("w-6 h-6 md:w-7 md:h-7", plan.color)} />
            </div>

            <h3 className="text-lg md:text-xl font-black text-foreground mb-2 md:mb-3 uppercase tracking-tight">{plan.title}</h3>
            <p className="text-muted-foreground text-[10px] md:text-sm leading-relaxed mb-6 md:mb-8 font-medium italic opacity-80 line-clamp-2 md:line-clamp-none">"{plan.desc}"</p>

            <div className="space-y-3 md:space-y-4 mb-8 md:mb-10 flex-1">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2.5 md:gap-3">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                    <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-500" />
                  </div>
                  <span className="text-[10px] md:text-xs text-foreground/70 font-bold">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 md:pt-8 border-t border-border/50">
              <div>
                <span className="text-xl md:text-2xl font-black text-foreground">{plan.price}</span>
                <span className="text-[8px] md:text-[10px] font-black text-muted-foreground ml-1.5 md:ml-2 uppercase opacity-60">/ {plan.period}</span>
              </div>
              <Button 
                onClick={() => handlePurchase(plan.id)}
                disabled={plan.active || !!purchasingId}
                className={cn(
                  "px-4 md:px-6 h-10 md:h-12 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all",
                  plan.active 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default" 
                    : "bg-primary text-white hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                )}
              >
                {purchasingId === plan.id ? (
                  <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin text-white" />
                ) : (
                  plan.active ? "KULLANIMDA" : "SATIN AL"
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Account Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 pt-4">
        <div className="p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] bg-card border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] -mr-16 -mt-16 rounded-full group-hover:bg-blue-500/10 transition-colors" />
           <div className="flex items-center gap-4 mb-6 md:mb-10">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-500/10 rounded-xl md:rounded-3xl flex items-center justify-center border border-blue-500/20 shadow-inner">
                <Users className="w-5 h-5 md:w-7 md:h-7 text-blue-600" />
              </div>
              <div>
                <h4 className="text-base md:text-xl font-black text-foreground uppercase tracking-tight">Personel Kotası</h4>
                <p className="text-[7px] md:text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Kapasite Yönetimi</p>
              </div>
           </div>
           
           <div className="space-y-4 md:space-y-8">
              <div className="flex justify-between items-end px-1">
                 <span className="text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">Kullanım Bilgisi</span>
                 <span className="text-xs md:text-base font-black text-foreground bg-muted px-3 md:px-6 py-1 md:py-2 rounded-full border border-border shadow-sm">
                   6 / {business.personnel_limit}
                 </span>
              </div>
              <div className="w-full h-2 md:h-4 bg-muted rounded-full overflow-hidden shadow-inner border border-border/50">
                 <div 
                   className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                   style={{ width: `${Math.min(100, (6 / (business.personnel_limit || 2)) * 100)}%` }}
                 />
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground font-medium leading-relaxed italic opacity-80 px-1">
                 Personel sınırınızı tek tıkla artırmak için <span className="text-primary font-black uppercase not-italic">Premium Paket</span>'e geçiş yapın.
              </p>
           </div>
        </div>

        <div className="p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] bg-card border border-border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] -mr-16 -mt-16 rounded-full group-hover:bg-emerald-500/10 transition-colors" />
           <div className="flex flex-col gap-3 z-10 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                 <div className="w-9 h-9 md:w-12 md:h-12 bg-emerald-500/10 rounded-lg md:rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                   <BarChart3 className="w-4 h-4 md:w-6 md:h-6 text-emerald-600" />
                 </div>
                 <span className="text-base md:text-xl font-black text-foreground uppercase tracking-tight">AI Analitik</span>
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground font-medium max-w-[280px] leading-relaxed italic opacity-80">
                 Müşteri davranışlarını ve randevu trendlerini yapay zeka ile <span className="text-emerald-600 font-bold not-italic">derinlemesine</span> analiz edin.
              </p>
           </div>
           <Button 
             variant="outline" 
             className="w-full sm:w-auto border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-xl md:rounded-[2rem] px-6 md:px-10 h-10 md:h-14 text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em] shadow-sm hover:shadow-lg transition-all active:scale-95 z-10 shrink-0"
           >
              KİLİDİ AÇ
           </Button>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="w-[92vw] sm:max-w-md bg-slate-950 border-slate-800 rounded-[2rem] md:rounded-[3rem] overflow-hidden p-0 gap-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
          
          <div className="relative z-10 px-6 pt-10 pb-6 text-center">
            <div className="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4 md:mb-6 shadow-xl shadow-emerald-500/5">
              {successItem && <successItem.icon className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />}
            </div>
            <DialogTitle className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">KONTROL SİZDE! 🎉</DialogTitle>
            <DialogDescription className="text-slate-400 text-[11px] md:text-sm font-medium mt-3 italic leading-relaxed px-4 md:px-0">
              <strong>{successItem?.title}</strong> özelliği başarıyla aktifleştirildi. İşletmeniz artık daha güçlü ve profesyonel!
            </DialogDescription>
          </div>

          <div className="relative z-10 p-6 md:p-10 flex flex-col gap-4 md:gap-6 bg-slate-900/50">
             <div className="space-y-3 bg-white/5 border border-white/10 p-5 rounded-2xl md:rounded-3xl">
                {[
                  "Özellik anında tanımlandı",
                  "Tüm kullanıcılar için aktif",
                  "Abonelik durumu güncellendi"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] md:text-xs text-slate-300 font-bold">{text}</span>
                  </div>
                ))}
             </div>

             <Button 
               onClick={() => setShowSuccess(false)}
               className="w-full h-12 md:h-16 bg-primary text-white text-[9px] md:text-xs font-black uppercase tracking-[0.2em] rounded-xl md:rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
             >
               HARİKA, DEVAM ET
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
