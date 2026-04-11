import { useState, useEffect } from "react";
import { 
  Ticket, Users, Plus, Zap, 
  Clock, Trash2, Loader2, X, BellRing
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getBizCoupons, addCoupon, deleteCoupon, getWaitlist, notifyWaitlist } from "@/lib/biz-api";

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
  const [notifying, setNotifying] = useState<string | null>(null);

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

  const handleNotify = async (id: string) => {
    setNotifying(id);
    try {
      await notifyWaitlist(id);
      loadWaitlist();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Notify waitlist error:", error);
    } finally {
      setNotifying(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Campaign Management */}
        <div className="bg-[#0f172a]/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-lg lg:text-xl font-heading font-black text-white flex items-center gap-3">
                 <Ticket className="w-6 h-6 text-primary" /> Kampanya Sihirbazı
              </h3>
              {!showAddForm && (
                <Button 
                   onClick={() => setShowAddForm(true)}
                   size="sm" 
                   className="bg-primary hover:bg-primary/90 text-[10px] font-bold tracking-widest px-4 h-9"
                 >
                    <Plus className="w-3.5 h-3.5 mr-2" /> YENİ KUPON
                 </Button>
               )}
            </div>
 
            {showAddForm && (
              <div className="p-6 bg-slate-900/50 border border-primary/20 rounded-2xl space-y-4 animate-in zoom-in-95">
                 <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Kupon Oluştur</p>
                    <button onClick={() => setShowAddForm(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Kampanya Başlığı" className="bg-slate-950/50 border-slate-800 h-10 text-xs" />
                    <Input value={code} onChange={e => setCode(e.target.value)} placeholder="KOD (örn: YAZ20)" className="bg-slate-950/50 border-slate-800 h-10 text-xs" />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select 
                      value={type} 
                      onChange={e => setType(e.target.value as any)}
                      className="bg-slate-950/50 border border-slate-800 rounded-lg px-3 h-10 text-xs appearance-none text-slate-300 focus:outline-none focus:border-primary/50"
                    >
                       <option value="percentage">Yüzde (%)</option>
                       <option value="fixed">Sabit (₺)</option>
                    </select>
                    <Input value={value} onChange={e => setValue(e.target.value)} placeholder="Değer" className="bg-slate-950/50 border-slate-800 h-10 text-xs" />
                 </div>
                 <Button 
                   onClick={handleAdd}
                   disabled={submitting}
                   className="w-full bg-primary hover:bg-primary/90 h-10 font-bold text-[10px] tracking-widest"
                 >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "KAMPANYAYI BAŞLAT"}
                 </Button>
              </div>
            )}
 
            <div className="space-y-4">
               {loading ? (
                  <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 text-slate-700 animate-spin" /></div>
               ) : coupons.map((camp, i) => (
                 <div key={camp.id || i} className="group p-5 lg:p-6 bg-slate-950/40 border border-slate-800 rounded-2xl hover:bg-slate-900 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-5">
                       <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary border border-primary/20 text-xs lg:text-sm">
                          {camp.discount_type === 'percentage' ? `%${camp.discount_value}` : `₺${camp.discount_value}`}
                       </div>
                       <div>
                          <h4 className="text-xs lg:text-sm font-bold text-white mb-1 truncate max-w-[120px] lg:max-w-none">{camp.title}</h4>
                          <div className="flex items-center gap-3">
                             <code className="text-[9px] lg:text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">{camp.code}</code>
                             <span className="text-[9px] lg:text-[10px] text-slate-600 font-mono">{camp.usage_count || 0} kullanım</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] lg:text-[10px]">
                         AKTİF
                       </Badge>
                       <Button 
                         onClick={() => handleDelete(camp.id)}
                         variant="ghost" 
                         size="icon" 
                         className="h-8 w-8 text-slate-600 hover:text-rose-500"
                       >
                         <Trash2 className="w-3.5 h-3.5" />
                       </Button>
                    </div>
                 </div>
               ))}
               {!loading && coupons.length === 0 && (
                 <div className="text-center py-10 text-slate-600 text-xs uppercase tracking-widest opacity-50">Henüz kampanya yok.</div>
               )}
            </div>
         </div>
 
         {/* Waitlist Intelligence */}
         <div className="bg-[#0f172a]/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-lg lg:text-xl font-heading font-black text-white flex items-center gap-3">
                  <Users className="w-6 h-6 text-violet-500" /> Bekleme Listesi (AI)
               </h3>
               <Badge variant="outline" className="border-slate-800 text-slate-500 font-mono text-[10px]">
                 {waitlist.length} Bekleyen
               </Badge>
            </div>
 
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
               {waitlistLoading ? (
                 <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 text-slate-700 animate-spin" /></div>
               ) : waitlist.map((entry, i) => (
                 <div key={entry.id || i} className="p-5 lg:p-6 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                       <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-500 uppercase text-xs">
                         {(entry.customer_name || "A")[0]}
                       </div>
                       <div>
                         <h4 className="text-xs lg:text-sm font-bold text-white mb-1">{entry.customer_name}</h4>
                         <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-[9px] lg:text-[10px] text-slate-500 uppercase tracking-tighter">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(entry.created_at).toLocaleDateString('tr-TR')}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{entry.service_name}</span>
                         </div>
                       </div>
                    </div>
                    <Button 
                      onClick={() => handleNotify(entry.id)}
                      disabled={notifying === entry.id}
                      size="sm" 
                      variant="outline" 
                      className="border-violet-500/30 text-violet-500 hover:bg-violet-500/10 h-8 lg:h-9 font-bold text-[9px] lg:text-[10px] tracking-tight whitespace-nowrap px-3"
                    >
                      {notifying === entry.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <BellRing className="w-3 h-3 mr-1" />}
                      HABER VER
                    </Button>
                 </div>
               ))}
               {!waitlistLoading && waitlist.length === 0 && (
                 <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-700 font-mono text-[10px] uppercase tracking-widest">Bekleme listesi boş.</div>
               )}
            </div>
 
            <div className="flex flex-col items-center justify-center p-8 lg:p-10 border-2 border-dashed border-slate-800 rounded-3xl space-y-4 text-center">
               <div className="w-14 h-14 lg:w-16 lg:h-16 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
                  <Zap className="w-7 h-7 lg:w-8 lg:h-8 text-slate-700" />
               </div>
               <div className="max-w-[200px]">
                  <p className="text-xs lg:text-sm font-bold text-slate-400 mb-1">Boş slot kalmadı!</p>
                  <p className="text-[9px] lg:text-[10px] text-slate-600">Randevu iptal edildiğinde bekleme listesindekilere otomatik bildirim gönderilecektir.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
