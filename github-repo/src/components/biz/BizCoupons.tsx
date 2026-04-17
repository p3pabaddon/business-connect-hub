import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Ticket, Plus, Trash2, Clock, 
  CheckCircle2, XCircle, Tag, 
  Percent, Banknote, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_active: boolean;
  expires_at: string | null;
  usage_count: number;
}

export function BizCoupons({ businessId }: { businessId: string }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // New coupon form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState("");
  const [expiry, setExpiry] = useState<Date | undefined>();

  useEffect(() => {
    loadCoupons();
  }, [businessId]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      toast.error("Kuponlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!code || !value) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .insert({
          business_id: businessId,
          code: code.toUpperCase(),
          discount_type: type,
          discount_value: Number(value),
          expires_at: expiry ? format(expiry, "yyyy-MM-dd") : null,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setCoupons([data, ...coupons]);
      setCode("");
      setValue("");
      setExpiry(undefined);
      toast.success("Kupon oluşturuldu! 🎫");
    } catch (err) {
      toast.error("Kupon oluşturulamadı");
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
      toast.success("Durum güncellendi");
    } catch (err) {
      toast.error("Güncelleme başarısız");
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
      setCoupons(coupons.filter(c => c.id !== id));
      toast.success("Kupon silindi");
    } catch (err) {
      toast.error("Silinemedi");
    }
  };

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
            <Ticket className="w-8 h-8 text-primary" /> İndirim Kuponları
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Müşterilerinize özel indirimler ve fırsatlar sunun.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Create Form */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Plus className="w-4 h-4 text-emerald-500" /> Yeni Kupon Tanımla
              </h3>
              
              <div className="space-y-5">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Kupon Kodu</Label>
                    <Input 
                      value={code} 
                      onChange={(e) => setCode(e.target.value.toUpperCase())} 
                      placeholder="YAZ2024" 
                      className="bg-muted/30 border-border h-12 rounded-xl font-bold uppercase tracking-widest"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">İndirim Tipi</Label>
                       <Select value={type} onValueChange={(v: any) => setType(v)}>
                          <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl font-bold">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-border text-foreground">
                             <SelectItem value="percentage">Yüzde (%)</SelectItem>
                             <SelectItem value="fixed">Sabit (₺)</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Değer</Label>
                       <Input 
                         type="number"
                         value={value} 
                         onChange={(e) => setValue(e.target.value)} 
                         placeholder="20" 
                         className="bg-muted/30 border-border h-12 rounded-xl font-bold"
                       />
                    </div>
                 </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Son Kullanma (Opsiyonel)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full bg-muted/30 border-border h-12 rounded-xl font-bold justify-start text-left",
                            !expiry && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                          {expiry ? format(expiry, "d MMMM yyyy", { locale: tr }) : <span>Tarih seçin</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-[2rem] border-border shadow-2xl" align="start">
                        <Calendar
                          mode="single"
                          selected={expiry}
                          onSelect={setExpiry}
                          disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          className="p-4"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                 <Button 
                   onClick={handleCreateCoupon}
                   disabled={creating}
                   className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 mt-4"
                 >
                    {creating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Tag className="w-5 h-5 mr-2" />}
                    KUPONU OLUŞTUR
                 </Button>
              </div>
           </div>
        </div>

        {/* Coupon List */}
        <div className="lg:col-span-8 space-y-4">
           {coupons.length === 0 ? (
             <div className="h-64 border-2 border-dashed border-border rounded-[3rem] flex flex-col items-center justify-center opacity-40">
                <Ticket className="w-12 h-12 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest">Henüz kuponunuz yok</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coupons.map((coupon) => (
                  <div 
                    key={coupon.id} 
                    className={cn(
                      "bg-card border border-border p-6 rounded-[2.5rem] relative group overflow-hidden transition-all duration-500 hover:shadow-xl",
                      !coupon.is_active && "opacity-60 grayscale-[0.5]"
                    )}
                  >
                     <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-muted rounded-2xl border border-border">
                           {coupon.discount_type === 'percentage' ? <Percent className="w-5 h-5 text-violet-500" /> : <Banknote className="w-5 h-5 text-emerald-500" />}
                        </div>
                        <div className="flex items-center gap-2">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                             className="rounded-xl"
                           >
                             {coupon.is_active ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             onClick={() => deleteCoupon(coupon.id)}
                             className="rounded-xl text-muted-foreground hover:text-destructive"
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <h4 className="text-2xl font-black text-foreground tracking-tighter uppercase">{coupon.code}</h4>
                           <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-border bg-muted/30">
                              {coupon.discount_type === 'percentage' ? `%${coupon.discount_value}` : `₺${coupon.discount_value}`}
                           </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                           <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">
                                 {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : "SÜRESİZ"}
                              </span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Tag className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">
                                 {coupon.usage_count || 0} KULLANIM
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* Progress Mockup */}
                     <div className="absolute bottom-0 left-0 w-full h-1 bg-muted">
                        <div 
                          className={cn("h-full transition-all duration-1000", coupon.is_active ? "bg-primary" : "bg-muted-foreground opacity-30")} 
                          style={{ width: '100%' }}
                        />
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
