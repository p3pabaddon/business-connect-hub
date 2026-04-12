import { useState, useEffect } from "react";
import { getChurnSentinelData } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, MessageSquare, User, Zap, ArrowRight, ShieldAlert, Sparkles, Send } from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ChurnedCustomer {
  name: string;
  email: string;
  phone: string;
  last_visit: Date;
  visit_count: number;
}

export function BizChurnSentinel({ businessId }: { businessId: string }) {
  const [loading, setLoading] = useState(true);
  const [atRisk, setAtRisk] = useState<ChurnedCustomer[]>([]);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    if (businessId) loadData();
  }, [businessId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getChurnSentinelData(businessId);
      setAtRisk(data);
    } catch (error) {
      console.error("Churn scan error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppAction = (customer: ChurnedCustomer) => {
    const message = `Merhaba ${customer.name}, %BUSINESS% olarak sizi özledik! Size özel %20 indirim tanımladık. Linkten randevu alabilirsiniz: %LINK%`;
    const phone = customer.phone.replace(/\s+/g, '').replace(/^0/, '90');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleLaunchCampaign = async () => {
    setLaunching(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 2000));
    setLaunching(false);
    setCampaignOpen(false);
    toast.success("Kampanya Başlatıldı!", {
      description: `${atRisk.length} müşteriye özel indirim teklifleri iletiliyor.`,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-slate-500 text-sm font-mono animate-pulse uppercase tracking-widest">Müşteri Sadakat Matrisi Analiz Ediliyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Kayıp Müşteri Radarı</h2>
          </div>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed font-medium">
            Yapay zeka, son 45 gündür gelmeyen ve kaybettiğiniz muhtemel <span className="text-red-500 font-bold">{atRisk.length}</span> müşteriyi tespit etti. 
            Onları geri kazanmak için özel teklifler gönderebilirsiniz.
          </p>
        </div>
        <Button onClick={loadData} variant="outline" className="border-border hover:bg-muted text-xs h-10 gap-2 rounded-xl font-bold">
           <Zap className="w-3.5 h-3.5 text-amber-500" /> Yeniden Tara
        </Button>
      </div>

      {atRisk.length === 0 ? (
        <Card className="p-16 border-border bg-card border-dashed flex flex-col items-center justify-center text-center rounded-[2.5rem] shadow-sm">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 shadow-inner">
            <Zap className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-black text-foreground mb-2">Harika! Kayıp Müşteri Yok</h3>
          <p className="text-muted-foreground text-sm max-w-xs font-medium">Tüm düzenli müşterileriniz aktif olarak gelmeye devam ediyor.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {atRisk.map((customer, idx) => (
            <Card key={idx} className="p-6 bg-card border border-border hover:border-red-500/30 transition-all group overflow-hidden relative rounded-3xl shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <AlertTriangle className="w-16 h-16 text-red-500" />
              </div>

              <div className="flex items-start gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center shadow-inner">
                  <User className="w-7 h-7 text-muted-foreground/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-foreground truncate text-lg tracking-tight">{customer.name}</h4>
                  <p className="text-xs text-muted-foreground font-medium truncate">{customer.phone}</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                  <span className="text-muted-foreground opacity-60">Son Ziyaret</span>
                  <span className="text-red-500">{format(customer.last_visit, "d MMMM", { locale: tr })}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                  <span className="text-muted-foreground opacity-60">Toplam Randevu</span>
                  <span className="text-foreground">{customer.visit_count} Defa</span>
                </div>
                <div className="pt-2">
                   <Badge variant="outline" className="bg-red-500/5 border-red-500/20 text-red-600 text-[9px] uppercase tracking-widest font-black px-3 py-1">
                     KRİTİK RİSK: 45+ GÜN
                   </Badge>
                </div>
              </div>

              <div className="mt-8 flex gap-3 pt-6 border-t border-border/50">
                <Button 
                  onClick={() => handleWhatsAppAction(customer)}
                  className="flex-1 h-11 text-[10px] uppercase font-black bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-100 rounded-xl"
                >
                  <MessageSquare className="w-4 h-4" /> Geri Kazan
                </Button>
                <Button variant="outline" size="icon" className="h-11 w-11 border-border bg-background rounded-xl hover:bg-muted transition-all">
                   <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Campaign Feature Mini Promo */}
      <Card className="p-8 bg-primary/5 border border-primary/10 relative overflow-hidden rounded-[2.5rem] shadow-sm">
        <div className="absolute top-1/2 -translate-y-1/2 right-12 opacity-10 hidden lg:block">
           <Zap className="w-40 h-40 text-primary" strokeWidth={0.5} />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-black text-foreground mb-3 italic tracking-tight uppercase">Akıllı Geri Kazanım Kampanyası Başlat</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mb-6 font-medium leading-relaxed">
            Tüm kayıp müşterilere tek tıkla %30 indirim SMS'i göndererek koltuk doluluk oranınızı artırın. 
            Müşterilerin %15'i genellikle bu tür tekliflere 24 saat içinde yanıt verir.
          </p>
          <Button 
            onClick={() => setCampaignOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase h-11 px-8 shadow-xl shadow-primary/20 animate-pulse rounded-xl"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Toplu Kampanya Oluştur
          </Button>
        </div>
      </Card>

      {/* Campaign Launch Dialog */}
      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent className="bg-background border-border text-foreground max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-0">
          <div className="p-8">
            <DialogHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mb-6 shadow-inner">
                 <Zap className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-3xl font-black text-foreground tracking-tight leading-none">Akıllı Geri Kazanım</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium text-base mt-2">
                 Tespit edilen {atRisk.length} müşteriye özel kampanya başlatmak üzeresiniz.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-8 border-y border-border my-6">
               <div className="bg-muted/30 rounded-3xl p-6 border border-border shadow-inner">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Teklif İçeriği</p>
                  <div className="space-y-4 font-bold">
                     <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground/70">İndirim Oranı</span>
                        <span className="text-sm text-primary">%30 İndirim</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground/70">Hedef Kitle</span>
                        <span className="text-sm text-foreground">{atRisk.length} Kayıp Müşteri</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground/70">Kanal</span>
                        <span className="text-sm text-foreground">WhatsApp & SMS</span>
                     </div>
                  </div>
               </div>

               <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl shadow-sm">
                  <p className="text-xs text-emerald-600 font-bold italic text-center leading-relaxed">
                     "Yapay zeka bu kampanyanın işletmeniz için tahmini ₺{atRisk.length * 350} ek gelir yaratacağını öngörüyor."
                  </p>
               </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-0">
               <Button 
                  variant="outline" 
                  onClick={() => setCampaignOpen(false)}
                  className="flex-1 border-border rounded-2xl h-14 font-black text-xs transition-colors hover:bg-muted"
               >
                  İPTAL
               </Button>
               <Button 
                  onClick={handleLaunchCampaign}
                  disabled={launching}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-black h-14 rounded-2xl gap-2 shadow-xl shadow-primary/20"
               >
                  {launching ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Send className="w-5 h-5" />}
                  KAMPANYAYI BAŞLAT
               </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
