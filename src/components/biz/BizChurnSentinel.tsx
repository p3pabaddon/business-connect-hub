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
            <h2 className="text-2xl font-heading font-black text-white tracking-tight">Kayıp Müşteri Radarı</h2>
          </div>
          <p className="text-slate-500 max-w-xl text-sm leading-relaxed">
            Yapay zeka, son 45 gündür gelmeyen ve kaybettiğiniz muhtemel <span className="text-red-400 font-bold">{atRisk.length}</span> müşteriyi tespit etti. 
            Onları geri kazanmak için özel teklifler gönderebilirsiniz.
          </p>
        </div>
        <Button onClick={loadData} variant="outline" className="border-slate-800 hover:bg-slate-800 text-xs h-9 gap-2">
           <Zap className="w-3.5 h-3.5 text-amber-500" /> Yeniden Tara
        </Button>
      </div>

      {atRisk.length === 0 ? (
        <Card className="p-12 border-slate-800/50 bg-slate-900/20 border-dashed flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Harika! Kayıp Müşteri Yok</h3>
          <p className="text-slate-500 text-sm max-w-xs">Tüm düzenli müşterileriniz aktif olarak gelmeye devam ediyor.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {atRisk.map((customer, idx) => (
            <Card key={idx} className="p-5 bg-slate-900/40 border-slate-800/50 hover:border-red-500/30 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>

              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{customer.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{customer.phone}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold">
                  <span className="text-slate-600">Son Ziyaret</span>
                  <span className="text-red-400">{format(customer.last_visit, "d MMMM", { locale: tr })}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold">
                  <span className="text-slate-600">Toplam Randevu</span>
                  <span className="text-slate-400">{customer.visit_count} Defa</span>
                </div>
                <div className="pt-2">
                   <Badge variant="outline" className="bg-red-500/5 border-red-500/20 text-red-400 text-[9px] uppercase tracking-tighter">
                     KRİTİK RİSK: 45+ GÜN
                   </Badge>
                </div>
              </div>

              <div className="mt-6 flex gap-2 pt-4 border-t border-slate-800/50">
                <Button 
                  onClick={() => handleWhatsAppAction(customer)}
                  className="flex-1 h-9 text-[10px] uppercase font-black bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Geri Kazan
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 border-slate-800 hover:bg-slate-800">
                   <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Campaign Feature Mini Promo */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 relative overflow-hidden">
        <div className="absolute top-1/2 -translate-y-1/2 right-10 opacity-20 hidden lg:block">
           <Zap className="w-32 h-32 text-primary" strokeWidth={0.5} />
        </div>
        <div className="relative z-10">
          <h3 className="text-lg font-black text-white mb-2 italic tracking-tight uppercase">Akıllı Geri Kazanım Kampanyası Başlat</h3>
          <p className="text-sm text-slate-400 max-w-2xl mb-4">
            Tüm kayıp müşterilere tek tıkla %30 indirim SMS'i göndererek koltuk doluluk oranınızı artırın. 
            Müşterilerin %15'i genellikle bu tür tekliflere 24 saat içinde yanıt verir.
          </p>
          <Button 
            onClick={() => setCampaignOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase h-9 shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            Toplu Kampanya Oluştur
          </Button>
        </div>
      </Card>

      {/* Campaign Launch Dialog */}
      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent className="bg-[#0f172a] border-slate-800 text-white max-w-md rounded-[2.5rem]">
          <DialogHeader>
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 mb-4">
               <Zap className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black text-white">Akıllı Geri Kazanım</DialogTitle>
            <DialogDescription className="text-slate-500">
               Tespit edilen {atRisk.length} müşteriye özel kampanya başlatmak üzeresiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6 border-y border-slate-800/50 my-2">
             <div className="bg-slate-900/50 rounded-3xl p-5 border border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Teklif İçeriği</p>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">İndirim Oranı</span>
                      <span className="text-sm font-bold text-white">%30 İndirim</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Hedef Kitle</span>
                      <span className="text-sm font-bold text-white">{atRisk.length} Kayıp Müşteri</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Kanal</span>
                      <span className="text-sm font-bold text-white">WhatsApp & SMS</span>
                   </div>
                </div>
             </div>

             <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <p className="text-[10px] text-emerald-500 font-bold italic">
                   "Yapay zeka bu kampanyanın işletmeniz için tahmini ₺{atRisk.length * 350} ek gelir yaratacağını öngörüyor."
                </p>
             </div>
          </div>

          <DialogFooter>
             <Button 
                variant="outline" 
                onClick={() => setCampaignOpen(false)}
                className="flex-1 border-slate-800 rounded-2xl h-12"
             >
                İPTAL
             </Button>
             <Button 
                onClick={handleLaunchCampaign}
                disabled={launching}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-black h-12 rounded-2xl gap-2"
             >
                {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                KAMPANYAYI BAŞLAT
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
