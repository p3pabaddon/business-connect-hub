import { useState, useEffect } from "react";
import { 
  Ticket, Users, Plus, Zap, 
  Clock, Trash2, Loader2, X, BellRing, TrendingUp, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBizCoupons, addCoupon, deleteCoupon, getWaitlist, removeFromWaitlist } from "@/lib/biz-api";

interface Props {
  businessId: string;
  onRefresh?: () => void;
}

export function BizMarketing({ businessId, onRefresh }: Props) {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [waitlistLoading, setWaitlistLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (businessId) {
      loadCoupons();
      loadWaitlist();
    }
  }, [businessId]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await getBizCoupons(businessId);
      setCoupons(data || []);
    } catch (error) {
       console.error("Load coupons error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadWaitlist = async () => {
    setWaitlistLoading(true);
    try {
      const data = await getWaitlist(businessId);
      setWaitlist(data || []);
    } catch (error) {
       console.error("Load waitlist error:", error);
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!title || !code || !value) return;
    setSubmitting(true);
    try {
       await addCoupon(businessId, title, code.toUpperCase(), type, Number(value));
       setShowAddForm(false);
       setTitle(""); setCode(""); setValue("");
       loadCoupons();
    } catch (error) {
       console.error("Add coupon error:", error);
    } finally {
       setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kampanyayı bitirmek istediğinize emin misiniz?")) return;
    try {
      await deleteCoupon(id);
      loadCoupons();
    } catch (error) {
      console.error("Delete coupon error:", error);
    }
  };

  const handleRemoveFromWaitlist = async (id: string) => {
    setRemoving(id);
    try {
      await removeFromWaitlist(id);
      loadWaitlist();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Remove from waitlist error:", error);
    } finally {
      setRemoving(null);
    }
  };

  return (    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Campaign Management */}
        <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 lg:p-10 space-y-8 lg:space-y-10 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16" />
           <div className="flex items-center justify-between relative z-10">
              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-foreground flex items-center gap-3 sm:gap-4 tracking-tight">
                   <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                    <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                   </div>
                   Kampanya Sihirbazı
                </h3>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2 ml-12 sm:ml-14 opacity-60">Kupon ve İndirim Yönetimi</p>
              </div>
              {!showAddForm && (
                <Button 
                   onClick={() => setShowAddForm(true)}
                   size="sm" 
                   className="bg-primary hover:bg-primary/90 text-white text-[9px] sm:text-[10px] font-black tracking-[0.1em] sm:tracking-[0.2em] h-10 sm:h-12 px-4 sm:px-6 shadow-xl shadow-primary/20 rounded-xl sm:rounded-2xl group transition-all"
                 >
                    <Plus className="w-3.5 h-3.5 mr-1.5 sm:mr-2 group-hover:rotate-90 transition-transform" /> YENİ KUPON
                 </Button>
               )}
            </div>
 
            {showAddForm && (
               <div className="p-5 sm:p-8 bg-muted/30 border border-primary/20 rounded-[2rem] space-y-5 sm:space-y-6 animate-in zoom-in-95 shadow-inner relative">
                  <div className="flex items-center justify-between mb-2">
                     <p className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest">Kupon Konfigürasyonu</p>
                     <button onClick={() => setShowAddForm(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-background transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Kampanya Başlığı</Label>
                      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Örn: Yaz Fırsatı" className="bg-background border-border h-12 text-sm shadow-sm rounded-xl focus:ring-primary/20 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Kupon Kodu</Label>
                      <Input value={code} onChange={e => setCode(e.target.value)} placeholder="Örn: YAZ20" className="bg-background border-border h-12 text-sm shadow-sm rounded-xl focus:ring-primary/20 font-black text-primary uppercase" />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2 relative">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">İndirim Türü</Label>
                      <select 
                        value={type} 
                        onChange={e => setType(e.target.value as any)}
                        className="w-full bg-background border border-border rounded-xl px-4 h-12 text-sm appearance-none text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 shadow-sm font-bold"
                      >
                         <option value="percentage">Yüzde (%)</option>
                         <option value="fixed">Sabit (₺)</option>
                      </select>
                      <div className="absolute right-4 top-[42px] pointer-events-none text-muted-foreground">
                        <Plus className="w-4 h-4 rotate-45 opacity-40" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">İndirim Değeri</Label>
                      <Input value={value} onChange={e => setValue(e.target.value)} placeholder="Değer" className="bg-background border-border h-12 text-sm shadow-sm rounded-xl focus:ring-primary/20 font-black" />
                    </div>
                 </div>
                 <Button 
                   onClick={handleAdd}
                   disabled={submitting}
                   className="w-full bg-primary hover:bg-primary/90 text-white h-14 font-black text-[11px] tracking-[0.2em] shadow-xl shadow-primary/20 rounded-2xl transition-all active:scale-[0.98]"
                 >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "KAMPANYAYI YAYINLA"}
                 </Button>
              </div>
            )}
 
            <div className="space-y-5 relative z-10">
               {loading ? (
                  <div className="py-20 flex flex-col items-center gap-4 opacity-40">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Tarayıcılar Yükleniyor</p>
                  </div>
               ) : coupons.map((camp, i) => (
                 <div key={camp.id || i} className="group p-5 sm:p-6 bg-muted/40 border border-border rounded-[2rem] hover:bg-primary/[0.03] hover:shadow-2xl hover:shadow-primary/10 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-transparent hover:border-primary/20">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center font-black text-primary border border-primary/10 shadow-inner text-base group-hover:scale-110 transition-transform">
                          {camp.discount_type === 'percentage' ? `%${camp.discount_value}` : `₺${camp.discount_value}`}
                       </div>
                       <div>
                          <h4 className="text-base font-black text-foreground mb-1 tracking-tight group-hover:text-primary transition-colors">{camp.title}</h4>
                          <div className="flex items-center gap-4">
                             <code className="text-[10px] text-primary font-black bg-primary/10 px-3 py-1 rounded-full border border-primary/10 font-mono tracking-widest">{camp.code}</code>
                             <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">{camp.usage_count || 0} KULLANIM</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
                       <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-black text-[9px] sm:text-[10px] tracking-widest px-2 sm:px-3 py-1">
                         AKTİF
                       </Badge>
                       <Button 
                         onClick={() => handleDelete(camp.id)}
                         variant="ghost" 
                         size="icon" 
                         className="h-10 w-10 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-xl"
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                 </div>
               ))}
               {!loading && coupons.length === 0 && (
                 <div className="text-center py-20 border-2 border-dashed border-border rounded-[2.5rem] opacity-30">
                  <Ticket className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Aktif Kampanya Bulunmuyor</p>
                 </div>
               )}
            </div>
         </div>
 
         {/* Waitlist Intelligence */}
         <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 lg:p-10 space-y-8 lg:space-y-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-bl-full -mr-16 -mt-16" />
            <div className="flex items-center justify-between relative z-10">
                <div>
                 <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-foreground flex items-center gap-3 sm:gap-4 tracking-tight">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/20">
                     <Users className="w-5 h-5 sm:w-6 sm:h-6 text-violet-500" />
                    </div>
                    Bekleme Listesi
                 </h3>
                 <p className="text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2 ml-12 sm:ml-14 opacity-60">AI Destekli Akıllı Sıra</p>
                </div>
               <Badge variant="outline" className="border-border text-muted-foreground font-black text-xs px-4 py-1.5 rounded-full bg-muted/30">
                 {waitlist.length} BEKLEYEN
               </Badge>
            </div>
 
            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 relative z-10">
               {waitlistLoading ? (
                  <div className="py-20 flex flex-col items-center gap-4 opacity-40">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Müşteriler Sorgulanıyor</p>
                  </div>
               ) : waitlist.map((entry, i) => (
                 <div key={entry.id || i} className="p-5 sm:p-6 bg-muted/40 border border-border rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-sm transition-all hover:bg-violet-500/[0.02] hover:shadow-2xl hover:shadow-violet-500/10 border-transparent hover:border-violet-500/20">
                    <div className="flex items-center gap-4 sm:gap-6">
                       <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-card border border-border flex items-center justify-center font-black text-violet-500 uppercase text-base sm:text-lg shadow-inner group-hover:scale-110 transition-transform">
                         {(entry.user_id || "?").substring(0, 2)}
                       </div>
                       <div>
                         <h4 className="text-base font-black text-foreground mb-1 tracking-tight group-hover:text-violet-500 transition-colors">{entry.desired_date || "Tarih Yok"}</h4>
                         <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-violet-500 opacity-60" /> {new Date(entry.created_at).toLocaleDateString('tr-TR')}</span>
                            {entry.desired_time && <span className="text-foreground/80 font-black">Saat: {entry.desired_time}</span>}
                         </div>
                       </div>
                    </div>
                    <Button 
                      onClick={() => handleRemoveFromWaitlist(entry.id)}
                      disabled={removing === entry.id}
                      size="sm" 
                      variant="outline"
                      className="h-10 w-full sm:w-auto font-black text-[10px] tracking-widest rounded-xl transition-all active:scale-95 text-rose-500 border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/40"
                    >
                      {removing === entry.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                      KALDIR
                    </Button>
                 </div>
               ))}
               {!waitlistLoading && waitlist.length === 0 && (
                 <div className="text-center py-24 border-2 border-dashed border-border rounded-[2.5rem] opacity-30">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Şu An Bekleyen Bulunmuyor</p>
                 </div>
               )}
            </div>
 
            <div className="flex flex-col items-center justify-center p-8 sm:p-10 bg-primary/5 border border-primary/10 rounded-[2.5rem] space-y-6 text-center group cursor-help transition-all hover:bg-primary/10">
               <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/10 group-hover:scale-110 transition-transform font-black text-primary">
                  <Zap className="w-8 h-8 text-primary group-hover:fill-primary selection:fill-primary" />
               </div>
               <div className="max-w-[280px]">
                  <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2 opacity-80">AKILLI ASİSTAN</p>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-wide italic leading-relaxed">
                    "Boşalan slotlar için bekleme listesindeki en yüksek gelire sahip müşterilere öncelikli bildirim göndermek isterseniz yapay zeka ayarlarınızı güncelleyebilirsiniz."
                  </p>
               </div>
            </div>
         </div>

        {/* Landing Page Optimizer (A/B Test) */}
        <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-32 -mt-32 blur-3xl" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 mb-10">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-4 tracking-tight">
                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                   </div>
                   Sayfa Optimizasyonu (A/B Test)
                </h3>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2 ml-14 sm:ml-16 opacity-60">Dönüşüm Oranlarını Yapay Zeka ile Artırın</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-foreground uppercase tracking-wider">Mevcut Durum</p>
                  <p className="text-xs font-bold text-emerald-600">%8.4 Dönüşüm Artışı</p>
                </div>
                <div className="h-10 w-px bg-border mx-2 hidden sm:block" />
                <Button className="bg-foreground text-background hover:bg-foreground/90 font-black text-[10px] tracking-widest px-6 h-12 rounded-2xl shadow-xl">
                  YENİ TEST BAŞLAT
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
              {/* Variant A */}
              <div className="p-6 bg-muted/30 border border-border/50 rounded-[2rem] space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-500 text-white font-black text-[9px] px-3 py-1 rounded-lg">VARYASYON A (KONTROL)</Badge>
                  <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">%50 TRAFİK</span>
                </div>
                <div className="space-y-4">
                  <div className="h-32 bg-background rounded-2xl border border-border/50 overflow-hidden relative group cursor-zoom-in">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
                    <div className="p-3">
                      <div className="h-3 w-1/2 bg-muted rounded-full mb-2" />
                      <div className="h-2 w-3/4 bg-muted/50 rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/50 rounded-xl border border-border/50">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">GÖSTERİM</p>
                      <p className="text-sm font-black text-foreground">1,240</p>
                    </div>
                    <div className="p-3 bg-white/50 rounded-xl border border-border/50">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">DÖNÜŞÜM</p>
                      <p className="text-sm font-black text-foreground">%12.4</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variant B */}
              <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] space-y-4 relative">
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse border-4 border-background">
                  <Zap className="w-4 h-4 fill-white" />
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-500 text-white font-black text-[9px] px-3 py-1 rounded-lg">VARYASYON B (ADAY)</Badge>
                  <span className="text-[10px] font-black text-emerald-600 uppercase opacity-60 font-black uppercase tracking-widest">%50 TRAFİK</span>
                </div>
                <div className="space-y-4">
                  <div className="h-32 bg-background rounded-2xl border border-emerald-500/20 overflow-hidden relative group cursor-zoom-in">
                    <div className="absolute inset-0 bg-emerald-500/5" />
                    <div className="p-3">
                      <div className="h-3 w-1/2 bg-emerald-500/20 rounded-full mb-2" />
                      <div className="h-2 w-3/4 bg-emerald-500/10 rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/80 rounded-xl border border-emerald-500/10">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">GÖSTERİM</p>
                      <p className="text-sm font-black text-foreground">1,232</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">DÖNÜŞÜM</p>
                      <p className="text-sm font-black text-emerald-600 uppercase font-black tracking-widest">%20.8 🚀</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="p-8 bg-foreground text-background rounded-[2rem] space-y-6 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-16 -mt-16" />
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Yapay Zeka Kararı</p>
                  </div>
                  <h4 className="text-lg font-black leading-tight">Varyasyon B istatistiksel olarak daha başarılı görünüyor.</h4>
                  <p className="text-xs text-background/60 font-medium leading-relaxed">
                    "B varyasyonunda kullanılan 'Hemen Randevu Al' butonu ve koyu tema vurgusu, akşam saatlerinde gelen trafik için %35 daha fazla etkileşim yarattı."
                  </p>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] tracking-widest h-12 rounded-xl mt-4 border-none shadow-xl shadow-emerald-500/20">
                     SÜREKLİ UYGULA
                  </Button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
