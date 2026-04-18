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
      title: "Pro İşletme Paketi",
      desc: "Sınırsız personel, gelişmiş analitik ve özel markalama özellikleri.",
      price: "₺1200",
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="relative p-10 rounded-[3rem] bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] -mr-48 -mt-48 rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Crown className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">Elite Avantaj Platformu</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4 leading-tight">
              İşletmenizin Potansiyelini <br/><span className="text-primary italic">Maksimuma Çıkarın!</span>
            </h2>
            <p className="text-slate-300 text-sm lg:text-base max-w-lg font-medium opacity-80">
              Yapay zeka detekli analizler ve sınırsız operasyonel güç ile rakiplerinizin önüne geçin.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] shadow-2xl min-w-[200px]">
             <div className="text-5xl font-black text-white italic tracking-tighter">{business.is_premium ? 'VIP' : 'ECO'}</div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">GÜNCEL STATÜ</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={cn(
              "relative group flex flex-col p-8 rounded-[3rem] border transition-all duration-500 shadow-sm",
              plan.active 
                ? "bg-card border-primary/40 shadow-xl shadow-primary/5 ring-1 ring-primary/20" 
                : "bg-card border-border hover:border-primary/20 hover:shadow-xl"
            )}
          >
            {plan.active && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 z-10">
                AKTİF ÖZELLİK
              </div>
            )}

            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner border", plan.bgColor, "border-white/10")}>
              <plan.icon className={cn("w-7 h-7", plan.color)} />
            </div>

            <h3 className="text-xl font-black text-foreground mb-3 uppercase tracking-tight">{plan.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-medium italic opacity-80">"{plan.desc}"</p>

            <div className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="text-xs text-foreground/70 font-bold">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-border/50">
              <div>
                <span className="text-2xl font-black text-foreground">{plan.price}</span>
                <span className="text-[10px] font-black text-muted-foreground ml-2 opacity-60">/ {plan.period}</span>
              </div>
              <Button 
                onClick={() => handlePurchase(plan.id)}
                disabled={plan.active || !!purchasingId}
                className={cn(
                  "px-6 h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  plan.active 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default" 
                    : "bg-primary text-white hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                )}
              >
                {purchasingId === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  plan.active ? "KULLANIMDA" : "SATIN AL"
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Account Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="p-8 rounded-[3rem] bg-card border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] -mr-16 -mt-16 rounded-full group-hover:bg-blue-500/10 transition-colors" />
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-black text-foreground uppercase tracking-tight">Personel Kotası</h4>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Kapasite Yönetimi</p>
              </div>
           </div>
           
           <div className="space-y-6">
              <div className="flex justify-between items-end px-1">
                 <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">Kullanım Bilgisi</span>
                 <span className="text-sm font-black text-foreground bg-muted px-4 py-1 rounded-full border border-border shadow-sm">
                   6 / {business.personnel_limit}
                 </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden shadow-inner border border-border/50">
                 <div 
                   className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                   style={{ width: `${Math.min(100, (6 / (business.personnel_limit || 2)) * 100)}%` }}
                 />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed italic opacity-80">
                 Personel sınırınızı tek tıkla artırmak için <span className="text-primary font-black uppercase not-italic">Pro Paket</span>'e geçiş yapın.
              </p>
           </div>
        </div>

        <div className="p-8 rounded-[3rem] bg-card border border-border shadow-sm hover:shadow-md transition-all flex items-center justify-between group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] -mr-16 -mt-16 rounded-full group-hover:bg-emerald-500/10 transition-colors" />
           <div className="flex flex-col gap-3 z-10">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                   <BarChart3 className="w-5 h-5 text-emerald-600" />
                 </div>
                 <span className="text-lg font-black text-foreground uppercase tracking-tight">AI Analitik</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium max-w-[240px] leading-relaxed italic opacity-80">
                 Müşteri davranışlarını ve randevu trendlerini yapay zeka ile <span className="text-emerald-600 font-bold not-italic">derinlemesine</span> analiz edin.
              </p>
           </div>
           <Button 
             variant="outline" 
             className="border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-2xl px-6 h-12 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:shadow-lg transition-all active:scale-95 z-10 shrink-0 ml-4"
           >
              KİLİDİ AÇ
           </Button>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 rounded-[2.5rem] overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
          
          <DialogHeader className="relative z-10 pt-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4 shadow-xl shadow-emerald-500/5">
              {successItem && <successItem.icon className="w-10 h-10 text-emerald-500" />}
            </div>
            <DialogTitle className="text-2xl font-black text-white text-center uppercase tracking-tight">KONTROL SİZDE! 🎉</DialogTitle>
            <DialogDescription className="text-slate-400 text-center text-sm font-medium pt-2 italic leading-relaxed">
              <strong>{successItem?.title}</strong> başarıyla aktifleştirildi. İşletmeniz artık daha güçlü ve profesyonel!
            </DialogDescription>
          </DialogHeader>

          <div className="relative z-10 p-6 flex flex-col gap-4">
             <div className="space-y-3 bg-white/5 border border-white/10 p-5 rounded-3xl">
                <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                   <span className="text-xs text-slate-300 font-bold">Özellik anında tanımlandı</span>
                </div>
                <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                   <span className="text-xs text-slate-300 font-bold">Tüm kullanıcılar için aktif</span>
                </div>
                <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                   <span className="text-xs text-slate-300 font-bold">Abonelik durumu güncellendi</span>
                </div>
             </div>

             <Button 
               onClick={() => setShowSuccess(false)}
               className="w-full h-14 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
             >
               HARİKA, DEVAM ET
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
