import { useState, useEffect } from "react";
import { 
  Building2, MapPin, Globe, Phone, Mail, 
  Settings2, Save, Clock, Trash2, Plus,
  Camera, Briefcase, ExternalLink, ShieldCheck,
  Zap, TrendingUp, Sparkles, Palette
} from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
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
import { Slider } from "@/components/ui/slider";

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
    if (!hours[day]) hours[day] = { start: "09:00", end: "18:00", closed: false, break_start: "12:00", break_end: "13:00" };
    
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-card p-6 rounded-3xl border border-border shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
            <Settings2 className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Dükkan Ayarları</h2>
            <p className="text-muted-foreground text-sm font-medium">Profilinizi, adresinizi ve çalışma saatlerinizi yönetin.</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="rounded-2xl h-12 px-8 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-200 font-bold transition-all hover:scale-105 active:scale-95"
        >
          {saving ? <Plus className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Değişiklikleri Kaydet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column - General Info */}
        <div className="md:col-span-12 lg:col-span-6 space-y-8">
          {/* Main Info */}
          <SectionCard 
            icon={Building2} 
            title="Genel Bilgiler" 
            desc="İşletmenizin müşterilere görünen temel kimliği."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest">İşletme Adı</Label>
                <Input 
                  value={business.name} 
                  onChange={(e) => setBusiness({...business, name: e.target.value})}
                  className="bg-muted/30 border-border focus:ring-primary/20 h-12 rounded-xl font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Kategori</Label>
                <Select value={business.category} onValueChange={(v) => setBusiness({...business, category: v})}>
                  <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border text-foreground rounded-xl shadow-xl">
                    <SelectItem value="berber">Berber</SelectItem>
                    <SelectItem value="guzellik-salonu">Güzellik Salonu</SelectItem>
                    <SelectItem value="spa-masaj">Spa & Masaj</SelectItem>
                    <SelectItem value="kuafor">Kuaför</SelectItem>
                    <SelectItem value="tirnak">Tırnail Salonu</SelectItem>
                    <SelectItem value="sistem-yonetimi">Sistem Yönetimi</SelectItem>
                    <SelectItem value="dovme-piercing">Dövme & Piercing</SelectItem>
                    <SelectItem value="veteriner">Veteriner</SelectItem>
                    <SelectItem value="dis-klinigi">Diş Kliniği</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Kısa Açıklama</Label>
                <Textarea 
                  value={business.description} 
                  onChange={(e) => setBusiness({...business, description: e.target.value})}
                  className="bg-muted/30 border-border focus:ring-primary/20 rounded-xl min-h-[100px] font-medium"
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
                <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Telefon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <Input 
                    value={business.phone} 
                    onChange={(e) => setBusiness({...business, phone: e.target.value})}
                    className="bg-muted/30 border-border pl-10 h-12 rounded-xl font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <Input 
                    value={business.email} 
                    onChange={(e) => setBusiness({...business, email: e.target.value})}
                    className="bg-muted/30 border-border pl-10 h-12 rounded-xl font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest">İl</Label>
                <Input 
                  value={business.city} 
                  onChange={(e) => setBusiness({...business, city: e.target.value})}
                  className="bg-muted/30 border-border h-12 rounded-xl font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest">İlçe</Label>
                <Input 
                  value={business.district} 
                  onChange={(e) => setBusiness({...business, district: e.target.value})}
                  className="bg-muted/30 border-border h-12 rounded-xl font-medium"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Tam Adres</Label>
                <Textarea 
                  value={business.address} 
                  onChange={(e) => setBusiness({...business, address: e.target.value})}
                  className="bg-muted/30 border-border focus:ring-primary/20 rounded-xl font-medium"
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
                <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Dükkan URL'i (Slug)</Label>
                <div className="flex items-center gap-2">
                  <div className="bg-muted border border-border h-12 rounded-xl px-4 flex items-center text-muted-foreground text-xs font-bold whitespace-nowrap shadow-inner">
                    randevudunyasi.com/isletme/
                  </div>
                  <Input 
                    value={business.slug} 
                    onChange={(e) => setBusiness({...business, slug: e.target.value.toLowerCase().replace(/\s/g, '-')})}
                    className="bg-muted/30 border-border h-12 rounded-xl font-black text-primary"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-5 bg-muted/20 border border-border rounded-2xl">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                       <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                       <p className="text-sm font-black text-foreground uppercase tracking-tight">Online Randevu Kabul Et</p>
                       <p className="text-xs text-muted-foreground font-medium">Müşteriler profilinizden randevu alabilir.</p>
                    </div>
                 </div>
                 <Switch 
                  checked={business.is_active} 
                  onCheckedChange={(v) => setBusiness({...business, is_active: v})}
                 />
              </div>
            </div>
          </SectionCard>

          {/* Dynamic Pricing */}
          <SectionCard 
            icon={Zap} 
            title="Dinamik Fiyatlandırma" 
            desc="Yoğun ve sakin günlere özel otomatik fiyat kuralları."
          >
            <div className="space-y-6">
              {/* Peak Pricing */}
              <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-500/10 rounded-lg flex items-center justify-center border border-rose-500/20">
                      <TrendingUp className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-foreground uppercase tracking-tight">Yoğun Gün Artışı</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Artış:</span>
                    <Input 
                      type="number" 
                      step="0.05"
                      value={business.dynamic_pricing?.peak_multiplier || 1.1}
                      onChange={(e) => setBusiness({
                        ...business, 
                        dynamic_pricing: { 
                          ...(business.dynamic_pricing || {}), 
                          peak_multiplier: parseFloat(e.target.value) 
                        }
                      })}
                      className="w-20 h-8 text-center font-bold rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day.key}
                      onClick={() => {
                        const current = business.dynamic_pricing?.peak_days || [];
                        const next = current.includes(day.key) 
                          ? current.filter((d: string) => d !== day.key)
                          : [...current, day.key];
                        setBusiness({
                          ...business,
                          dynamic_pricing: { ...(business.dynamic_pricing || {}), peak_days: next }
                        });
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                        (business.dynamic_pricing?.peak_days || []).includes(day.key)
                          ? "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200"
                          : "bg-white text-muted-foreground border-border hover:border-rose-300"
                      )}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slow Day Pricing */}
              <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-foreground uppercase tracking-tight">Sakin Gün İndirimi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Çarpan:</span>
                    <Input 
                      type="number" 
                      step="0.05"
                      value={business.dynamic_pricing?.slow_multiplier || 0.9}
                      onChange={(e) => setBusiness({
                        ...business, 
                        dynamic_pricing: { 
                          ...(business.dynamic_pricing || {}), 
                          slow_multiplier: parseFloat(e.target.value) 
                        }
                      })}
                      className="w-20 h-8 text-center font-bold rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day.key}
                      onClick={() => {
                        const current = business.dynamic_pricing?.slow_days || [];
                        const next = current.includes(day.key) 
                          ? current.filter((d: string) => d !== day.key)
                          : [...current, day.key];
                        setBusiness({
                          ...business,
                          dynamic_pricing: { ...(business.dynamic_pricing || {}), slow_days: next }
                        });
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                        (business.dynamic_pricing?.slow_days || []).includes(day.key)
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-200"
                          : "bg-white text-muted-foreground border-border hover:border-emerald-300"
                      )}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Custom Branding Colors */}
          <SectionCard 
            icon={Palette} 
            title="Özel Markalama" 
            desc="Dükkanınızın profilinde kendi kurumsal renklerinizi kullanın."
          >
            <div className="space-y-6">
              {!business.branding_config?.custom_colors ? (
                <div className="p-6 bg-amber-500/5 border border-dashed border-amber-500/30 rounded-3xl text-center space-y-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                    <Sparkles className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground uppercase tracking-tight">Premium Özellik</h4>
                    <p className="text-muted-foreground text-xs font-medium mt-1">Bu dükkan için henüz "Kendi Renklerin" paketi tanımlanmamış.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10 rounded-xl font-bold"
                    onClick={() => {
                        // Mock purchase activation
                        setBusiness({
                          ...business,
                          branding_config: { 
                            ...(business.branding_config || {}), 
                            custom_colors: true,
                            primary_color: "#0d9488",
                            secondary_color: "#f0fdfa"
                          }
                        });
                        toast({ title: "Tebrikler!", description: "Özel markalama özelliği dükkanınız için aktif edildi." });
                    }}
                  >
                    Hemen Satın Al (Demo)
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Ana Renk (Primary)</Label>
                    <div className="flex gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl border border-border shrink-0 shadow-inner"
                        style={{ backgroundColor: business.branding_config?.primary_color || "#0d9488" }}
                      />
                      <Input 
                        type="color"
                        value={business.branding_config?.primary_color || "#0d9488"} 
                        onChange={(e) => setBusiness({
                          ...business, 
                          branding_config: { 
                            ...business.branding_config, 
                            primary_color: e.target.value 
                          }
                        })}
                        className="h-12 flex-1 rounded-xl p-1 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Yardımcı Renk (Secondary)</Label>
                    <div className="flex gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl border border-border shrink-0 shadow-inner"
                        style={{ backgroundColor: business.branding_config?.secondary_color || "#f0fdfa" }}
                      />
                      <Input 
                        type="color"
                        value={business.branding_config?.secondary_color || "#f0fdfa"} 
                        onChange={(e) => setBusiness({
                          ...business, 
                          branding_config: { 
                            ...business.branding_config, 
                            secondary_color: e.target.value 
                          }
                        })}
                        className="h-12 flex-1 rounded-xl p-1 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3 pt-6 border-t border-border">
                    <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Profil Başlık Görseli (Banner)</Label>
                    <ImageUpload
                      onUpload={(url) => setBusiness({
                        ...business, 
                        branding_config: { 
                          ...business.branding_config, 
                          header_banner: url 
                        }
                      })}
                      defaultValue={business.branding_config?.header_banner || ""}
                      label="Banner Görseli Yükle"
                    />
                    
                    {business.branding_config?.header_banner && (
                      <div className="space-y-4 pt-4 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Görsel Kaydırma (Dikey Hizalama)</Label>
                          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">%{business.branding_config?.header_banner_position || 50}</span>
                        </div>
                        <Slider 
                          defaultValue={[business.branding_config?.header_banner_position || 50]} 
                          max={100} 
                          step={1} 
                          onValueChange={(vals) => setBusiness({
                            ...business,
                            branding_config: {
                              ...business.branding_config,
                              header_banner_position: vals[0]
                            }
                          })}
                          className="py-4"
                        />
                        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-border bg-muted/20">
                           <img 
                              src={business.branding_config.header_banner} 
                              alt="Banner Preview" 
                              className="w-full h-full object-cover" 
                              style={{ objectPosition: `center ${business.branding_config.header_banner_position || 50}%` }}
                           />
                           <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-y border-white/20 h-px pointer-events-none" />
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[9px] text-white font-black uppercase tracking-widest">
                                Önizleme
                              </div>
                           </div>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-[10px] text-muted-foreground font-medium italic">
                      Tavsiye edilen boyut: 1920x400. Bu görsel dükkan profilinizin en üstünde arka plan olarak görünecektir.
                    </p>
                  </div>
                  <div className="md:col-span-2 p-4 bg-muted/30 rounded-2xl border border-border">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-relaxed">
                      💡 İPUCU: Bu renkler ve başlık görseli işletme detay sayfanızda otomatik olarak uygulanacaktır.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right Column - Working Hours & Branding */}
        <div className="md:col-span-12 lg:col-span-6 space-y-8">
          {/* Working Hours */}
          <SectionCard 
            icon={Clock} 
            title="Çalışma Saatleri" 
            desc="Mesai düzenini yönetin."
          >
            <div className="space-y-4">
              {DAYS.map((day) => {
                const hour = business.working_hours?.[day.key] || { start: "09:00", end: "18:00", closed: false, break_start: "12:00", break_end: "13:00" };
                return (
                  <div 
                    key={day.key} 
                    className={cn(
                      "group flex items-center justify-between gap-6 p-6 rounded-[2.5rem] border transition-all duration-300",
                      hour.closed 
                        ? "bg-muted/30 border-border/50 opacity-60" 
                        : "bg-card border-border hover:border-primary/40 hover:bg-muted/5 shadow-md shadow-black/5"
                    )}
                  >
                    {/* Left: Day Info */}
                    <div className="flex items-center gap-4 w-[140px] shrink-0">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 shrink-0 shadow-inner",
                        hour.closed 
                          ? "bg-muted border-border text-muted-foreground/40" 
                          : "bg-primary/5 border-primary/20 text-primary"
                      )}>
                        <span className="text-xs font-black uppercase tracking-tighter">{day.label.slice(0, 3)}</span>
                      </div>
                      <div className="flex flex-col">
                        <p className={cn(
                          "text-base font-black tracking-tight leading-none",
                          hour.closed ? "text-muted-foreground/60" : "text-foreground"
                        )}>{day.label}</p>
                        <p className={cn(
                          "text-[9px] uppercase font-black tracking-widest mt-1",
                          hour.closed ? 'text-rose-500/80' : 'text-emerald-500'
                        )}>
                          {hour.closed ? 'KAPALI' : 'AÇIK'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Middle: Time Selectors */}
                    <div className="flex-1 flex items-center justify-center px-4">
                      {!hour.closed ? (
                        <div className="flex items-center gap-4">
                           <div className="flex flex-col gap-1.5">
                              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">AÇILIŞ</span>
                              <Input 
                                type="time" 
                                value={hour.start} 
                                onChange={(e) => updateWorkingHour(day.key, "start", e.target.value)}
                                className="bg-background border-border h-12 text-base w-36 text-center rounded-2xl font-black focus:ring-1 focus:ring-primary/20 shadow-inner"
                              />
                           </div>
                           
                           <div className="mt-6 text-muted-foreground/30 font-light text-2xl prose-2xl px-2">–</div>
 
                           <div className="flex flex-col gap-1.5">
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2 opacity-60">KAPANIŞ</span>
                              <Input 
                                type="time" 
                                value={hour.end} 
                                onChange={(e) => updateWorkingHour(day.key, "end", e.target.value)}
                                className="bg-background border-border h-12 text-base w-36 text-center rounded-2xl font-black focus:ring-1 focus:ring-primary/20 shadow-inner"
                              />
                           </div>
                        </div>
                      ) : (
                        <div className="text-[9px] text-muted-foreground/40 font-mono tracking-[0.3em] uppercase italic bg-muted/30 px-6 py-2 rounded-2xl border border-dashed border-border">
                           MAĞAZA KAPALI
                        </div>
                      ) }
                    </div>
 
                    {/* Right: Actions */}
                    <div className="flex items-center justify-end w-[60px] shrink-0 border-l border-border/50 pl-4">
                        <Switch 
                          checked={!hour.closed} 
                          onCheckedChange={(v) => updateWorkingHour(day.key, "closed", !v)}
                          className="data-[state=checked]:bg-emerald-500 scale-110"
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
            desc="Görsel kimlik ayarları."
          >
              <div className="space-y-6">
                <div className="space-y-3">
                   <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Dükkan Logosu</Label>
                   <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-muted border border-border rounded-3xl flex items-center justify-center overflow-hidden shadow-inner">
                         {business.logo ? (
                           <img src={business.logo} alt="Logo" className="w-full h-full object-cover" />
                         ) : (
                           <Briefcase className="w-8 h-8 text-muted-foreground/20" />
                         )}
                      </div>
                      <div className="flex-1">
                         <ImageUpload
                           onUpload={(url) => setBusiness({...business, logo: url})}
                           defaultValue={business.logo || ""}
                           label="Logo Yükle"
                         />
                      </div>
                   </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-border">
                   <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Kapak Fotoğrafı</Label>
                   <ImageUpload
                     onUpload={(url) => setBusiness({...business, cover_image: url})}
                     defaultValue={business.cover_image || ""}
                     label="Kapak Fotoğrafı Yükle"
                   />
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
    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 bg-muted border border-border rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
          <Icon className="w-6 h-6 text-primary/70" />
        </div>
        <div>
          <h3 className="text-xl font-black text-foreground tracking-tight leading-none">{title}</h3>
          <p className="text-muted-foreground text-sm mt-2 font-medium">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
