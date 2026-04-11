import { useState, useEffect } from "react";
import { 
  Building2, MapPin, Globe, Phone, Mail, 
  Settings2, Save, Clock, Trash2, Plus,
  Camera, Briefcase, ExternalLink, ShieldCheck
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { updateMyBusiness } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const DAYS = [
  { key: "monday", label: "Pazartesi" },
  { key: "tuesday", label: "Salı" },
  { key: "wednesday", label: "Çarşamba" },
  { key: "thursday", label: "Perşembe" },
  { key: "friday", label: "Cuma" },
  { key: "saturday", label: "Cumartesi" },
  { key: "sunday", label: "Pazar" },
];

export function BizSettingsTab({ businessId }: { businessId: string }) {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (businessId) loadBusiness();
  }, [businessId]);

  const loadBusiness = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();
      
      if (error) throw error;
      setBusiness(data);
    } catch {
      toast({ title: "Hata", description: "Dükkan bilgileri yüklenemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyBusiness(businessId, business);
      toast({ 
        title: "Başarılı", 
        description: "Dükkan ayarları güncellendi.",
        variant: "default"
      });
      loadBusiness();
    } catch (err) {
      toast({ 
        title: "Hata", 
        description: "Ayarlar kaydedilirken bir sorun oluştu.", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  const updateWorkingHour = (day: string, field: string, value: any) => {
    const hours = { ...business.working_hours };
    if (!hours[day]) hours[day] = { start: "09:00", end: "18:00", closed: false };
    
    hours[day] = { ...hours[day], [field]: value };
    setBusiness({ ...business, working_hours: hours });
  };

  if (loading) {
    return (
      <div className="p-20 flex justify-center">
        <div className="w-12 h-12 border-t-2 border-primary border-solid rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/40 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
            <Settings2 className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Dükkan Ayarları</h2>
            <p className="text-slate-500 text-sm">Profilinizi, adresinizi ve çalışma saatlerinizi yönetin.</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="rounded-2xl h-12 px-8 gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
        >
          {saving ? <Plus className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Değişiklikleri Kaydet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column - General Info */}
        <div className="md:col-span-12 lg:col-span-7 space-y-8">
          {/* Main Info */}
          <SectionCard 
            icon={Building2} 
            title="Genel Bilgiler" 
            desc="İşletmenizin müşterilere görünen temel kimliği."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-400">İşletme Adı</Label>
                <Input 
                  value={business.name} 
                  onChange={(e) => setBusiness({...business, name: e.target.value})}
                  className="bg-slate-950/50 border-slate-800 focus:border-primary/50 h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Kategori</Label>
                <Select value={business.category} onValueChange={(v) => setBusiness({...business, category: v})}>
                  <SelectTrigger className="bg-slate-950/50 border-slate-800 h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-slate-800 text-white">
                    <SelectItem value="berber">Berber</SelectItem>
                    <SelectItem value="guzellik-salonu">Güzellik Salonu</SelectItem>
                    <SelectItem value="spa-masaj">Spa & Masaj</SelectItem>
                    <SelectItem value="kuafor">Kuaför</SelectItem>
                    <SelectItem value="tirnak">Tırnak Salonu</SelectItem>
                    <SelectItem value="sistem-yonetimi">Sistem Yönetimi</SelectItem>
                    <SelectItem value="dovme-piercing">Dövme & Piercing</SelectItem>
                    <SelectItem value="veteriner">Veteriner</SelectItem>
                    <SelectItem value="dis-klinigi">Diş Kliniği</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-slate-400">Kısa Açıklama</Label>
                <Textarea 
                  value={business.description} 
                  onChange={(e) => setBusiness({...business, description: e.target.value})}
                  className="bg-slate-950/50 border-slate-800 focus:border-primary/50 rounded-xl min-h-[100px]"
                  placeholder="Müşterilere kendinizi tanıtın..."
                />
              </div>
            </div>
          </SectionCard>

          {/* Contact & Location */}
          <SectionCard 
            icon={MapPin} 
            title="İletişim & Konum" 
            desc="Müşterilerin size ulaşmasını sağlayın."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-400">Telefon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input 
                    value={business.phone} 
                    onChange={(e) => setBusiness({...business, phone: e.target.value})}
                    className="bg-slate-950/50 border-slate-800 pl-10 h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input 
                    value={business.email} 
                    onChange={(e) => setBusiness({...business, email: e.target.value})}
                    className="bg-slate-950/50 border-slate-800 pl-10 h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">İl</Label>
                <Input 
                  value={business.city} 
                  onChange={(e) => setBusiness({...business, city: e.target.value})}
                  className="bg-slate-950/50 border-slate-800 h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">İlçe</Label>
                <Input 
                  value={business.district} 
                  onChange={(e) => setBusiness({...business, district: e.target.value})}
                  className="bg-slate-950/50 border-slate-800 h-12 rounded-xl"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-slate-400">Tam Adres</Label>
                <Textarea 
                  value={business.address} 
                  onChange={(e) => setBusiness({...business, address: e.target.value})}
                  className="bg-slate-950/50 border-slate-800 focus:border-primary/50 rounded-xl"
                />
              </div>
            </div>
          </SectionCard>

          {/* Online Presence */}
          <SectionCard 
            icon={Globe} 
            title="Online Görünürlük" 
            desc="Dükkanınızın URL adresi ve online ayarları."
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-400 font-bold">Dükkan URL'i (Slug)</Label>
                <div className="flex items-center gap-2">
                  <div className="bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 flex items-center text-slate-500 text-sm whitespace-nowrap">
                    randevudunyasi.com/isletme/
                  </div>
                  <Input 
                    value={business.slug} 
                    onChange={(e) => setBusiness({...business, slug: e.target.value.toLowerCase().replace(/\s/g, '-')})}
                    className="bg-slate-950/50 border-slate-800 h-12 rounded-xl font-bold text-primary"
                  />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">
                  Dükkan adresini değiştirmek SEO ve linklerinizi etkileyebilir.
                </p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <div>
                       <p className="text-sm font-bold text-white">Online Randevu Kabul Et</p>
                       <p className="text-xs text-slate-500">Müşteriler profilinizden randevu alabilir.</p>
                    </div>
                 </div>
                 <Switch 
                  checked={business.is_active} 
                  onCheckedChange={(v) => setBusiness({...business, is_active: v})}
                 />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column - Working Hours & Branding */}
        <div className="md:col-span-12 lg:col-span-5 space-y-8">
          {/* Working Hours */}
          <SectionCard 
            icon={Clock} 
            title="Çalışma Saatleri" 
            desc="İşletmenizin haftalık mesai düzenini buradan yönetin."
          >
            <div className="space-y-3">
              {DAYS.map((day) => {
                const hour = business.working_hours?.[day.key] || { start: "09:00", end: "18:00", closed: false };
                return (
                  <div 
                    key={day.key} 
                    className={cn(
                      "group flex items-center justify-between gap-4 p-4 rounded-3xl border transition-all duration-300",
                      hour.closed 
                        ? "bg-slate-950/20 border-slate-900/50 opacity-60" 
                        : "bg-slate-900/40 border-slate-800/80 hover:border-primary/40 hover:bg-slate-900/60 shadow-xl shadow-black/10"
                    )}
                  >
                    {/* Left: Day Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-[140px]">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300",
                        hour.closed 
                          ? "bg-slate-950 border-slate-900 text-slate-700" 
                          : "bg-primary/20 border-primary/30 text-primary"
                      )}>
                        <span className="text-[10px] font-black uppercase tracking-tighter">{day.label.slice(0, 3)}</span>
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm font-black tracking-tight",
                          hour.closed ? "text-slate-600" : "text-white"
                        )}>{day.label}</p>
                        <p className={cn(
                          "text-[8px] uppercase font-black tracking-widest",
                          hour.closed ? 'text-rose-500/80' : 'text-emerald-500'
                        )}>
                          {hour.closed ? 'KAPALI' : 'AÇIK'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Middle: Time Selectors */}
                    <div className="flex items-center justify-center gap-2 flex-[2]">
                      {!hour.closed ? (
                        <div className="flex items-center gap-2">
                           <div className="flex flex-col">
                              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-0.5">AÇILIŞ</span>
                              <Input 
                                type="time" 
                                value={hour.start} 
                                onChange={(e) => updateWorkingHour(day.key, "start", e.target.value)}
                                className="bg-slate-950/50 border-slate-800 h-9 text-xs w-24 text-center rounded-xl focus:ring-1 focus:ring-primary/20"
                              />
                           </div>
                           
                           <div className="mt-3 text-slate-800">–</div>

                           <div className="flex flex-col">
                              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-0.5">KAPANIŞ</span>
                              <Input 
                                type="time" 
                                value={hour.end} 
                                onChange={(e) => updateWorkingHour(day.key, "end", e.target.value)}
                                className="bg-slate-950/50 border-slate-800 h-9 text-xs w-24 text-center rounded-xl focus:ring-1 focus:ring-primary/20"
                              />
                           </div>
                        </div>
                      ) : (
                        <div className="text-[8px] text-slate-700 font-mono tracking-[0.2em] uppercase italic bg-slate-950/40 px-6 py-2 rounded-xl border border-dashed border-slate-800">
                           MAĞAZA KAPALI
                        </div>
                      ) }
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-end flex-1">
                        <Switch 
                          checked={!hour.closed} 
                          onCheckedChange={(v) => updateWorkingHour(day.key, "closed", !v)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Branding Previews */}
          <SectionCard 
            icon={Camera} 
            title="Markalama" 
            desc="Logo ve kapak fotoğrafı ayarları."
          >
             <div className="space-y-6">
                <div className="space-y-3">
                   <Label className="text-xs text-slate-500 uppercase font-black tracking-widest">Dükkan Logosu</Label>
                   <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center overflow-hidden">
                         {business.logo ? (
                           <img src={business.logo} alt="Logo" className="w-full h-full object-cover" />
                         ) : (
                           <Briefcase className="w-8 h-8 text-slate-700" />
                         )}
                      </div>
                      <div className="flex-1 space-y-2">
                         <Input 
                          placeholder="Logo URL'i" 
                          value={business.logo || ""}
                          onChange={(e) => setBusiness({...business, logo: e.target.value})}
                          className="bg-slate-950 border-slate-800 h-10 rounded-xl text-xs"
                         />
                         <p className="text-[10px] text-slate-600 uppercase">Önerilen: 500x500 PNG Kare</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800/30">
                   <Label className="text-xs text-slate-500 uppercase font-black tracking-widest">Kapak Fotoğrafı</Label>
                   <div className="w-full h-32 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative group">
                      {business.cover_image ? (
                        <img src={business.cover_image} alt="C" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Plus className="w-10 h-10 text-slate-800" />
                        </div>
                      )}
                      <div className="absolute inset-x-4 bottom-4">
                         <Input 
                          placeholder="Kapak Fotoğrafı URL'i" 
                          value={business.cover_image || ""}
                          onChange={(e) => setBusiness({...business, cover_image: e.target.value})}
                          className="bg-slate-950/80 border-slate-700 h-9 rounded-xl text-[10px] text-white backdrop-blur-sm"
                         />
                      </div>
                   </div>
                </div>
             </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, desc, children }: any) {
  return (
    <div className="bg-[#0f172a]/40 border border-slate-800/50 rounded-[2.5rem] p-8 backdrop-blur-sm shadow-xl shadow-black/10">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
          <Icon className="w-6 h-6 text-primary/70" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
          <p className="text-slate-500 text-sm">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
