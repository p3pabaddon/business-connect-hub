import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, ImageIcon, Layout, Sparkles, Save, Eye, EyeOff, Upload, ArrowRight, RefreshCw, Wand2, Check } from "lucide-react";
import { IsletmeDetailContent } from "@/pages/IsletmeDetailPage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateBusiness } from "@/lib/biz-api";
import { Slider } from "@/components/ui/slider";
import { ImageUpload } from "@/components/ImageUpload";
import { Link } from "lucide-react";

interface BizPageEditorProps {
  business: any;
  onUpdate: () => void;
}

export function BizPageEditor({ business, onUpdate }: BizPageEditorProps) {
  const [localBusiness, setLocalBusiness] = useState(business);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setLocalBusiness(business);
  }, [business]);

  const branding = localBusiness.branding_config || {
    primary_color: "#7c3aed",
    secondary_color: "#7c3aed",
    header_banner: "",
    header_banner_position: 50,
    custom_colors: true
  };

  const handleUpdateBranding = (updates: any) => {
    setLocalBusiness((prev: any) => ({
      ...prev,
      branding_config: {
        ...branding,
        ...updates,
        custom_colors: true
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBusiness(business.id, {
        branding_config: localBusiness.branding_config,
        name: localBusiness.name,
        description: localBusiness.description
      });
      toast.success("Değişiklikler kaydedildi! ✨");
      onUpdate();
    } catch (err) {
      toast.error("Hata oluştu", { description: "Değişiklikler kaydedilemedi." });
    } finally {
      setIsSaving(false);
    }
  };

  const generateAIBranding = () => {
    setIsGenerating(true);
    // Simulating AI generation for now
    setTimeout(() => {
      const palettes = [
        { primary: "#f43f5e", secondary: "#fb7185" }, // Rose
        { primary: "#0ea5e9", secondary: "#38bdf8" }, // Sky
        { primary: "#10b981", secondary: "#34d399" }, // Emerald
        { primary: "#8b5cf6", secondary: "#a78bfa" }, // Violet
        { primary: "#f59e0b", secondary: "#fbbf24" }, // Amber
      ];
      const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
      
      handleUpdateBranding({
        primary_color: randomPalette.primary,
        secondary_color: randomPalette.secondary
      });
      setIsGenerating(false);
      toast.success("Yeni bir marka stili oluşturuldu! ✨");
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Top Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Layout className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-black tracking-tight uppercase">Sayfa Tasarım Stüdyosu</h1>
            <p className="text-xs text-muted-foreground font-medium italic">İşletmenizin dijital vitrinini özelleştirin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-xl font-bold border-border"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? "Editör" : "Önizleme"} 
          </Button>
          <Button 
            className="rounded-xl font-black bg-primary px-8 shadow-xl shadow-primary/20"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            YAYINLA
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Editor Panel */}
        <div className={cn(
          "flex-1 overflow-y-auto p-8 custom-scrollbar transition-all duration-500",
          showPreview ? "max-w-0 p-0 opacity-0 overflow-hidden" : "max-w-full opacity-100"
        )}>
          <div className="max-w-3xl mx-auto space-y-12">
            
            {/* AI Branding Section */}
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-heading font-black tracking-tight uppercase border-b-4 border-primary w-fit pb-1">Sayfa Tasarımı</h2>
              <p className="text-muted-foreground font-medium italic">İşletmenizin karakterini yansıtan renkleri ve görselleri seçin.</p>
            </div>

            {/* Basic Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  <span className="font-black text-xs">01</span>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">Temel Bilgiler</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-card border border-border rounded-[2rem] shadow-sm">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">İşletme Adı</Label>
                  <Input 
                    value={localBusiness.name} 
                    onChange={(e) => setLocalBusiness({...localBusiness, name: e.target.value})}
                    className="h-12 rounded-xl focus-visible:ring-primary/20 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Kategori</Label>
                  <Input value={localBusiness.category} disabled className="h-12 rounded-xl bg-muted/50 border-border" />
                </div>
                <div className="col-span-full space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Kısa Açıklama</Label>
                  <Textarea 
                    value={localBusiness.description} 
                    onChange={(e) => setLocalBusiness({...localBusiness, description: e.target.value})}
                    placeholder="Müşterilerinize işletmenizi birkaç cümleyle tanıtın..."
                    className="min-h-[120px] rounded-[1.5rem] p-5 focus-visible:ring-primary/20 border-border/80"
                  />
                </div>
              </div>
            </div>

            {/* Branding Colors */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  <span className="font-black text-xs">02</span>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">Görsel Kimlik & Renkler</h3>
              </div>
              
              <div className="space-y-8 p-8 bg-card border border-border rounded-[2rem] shadow-sm">
                {/* Manual Pickers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Ana Renk</Label>
                      <span className="text-[10px] font-mono p-1 px-2 bg-muted rounded uppercase">{branding.primary_color}</span>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div 
                          className="w-14 h-14 rounded-2xl shadow-inner border border-border shrink-0" 
                          style={{ backgroundColor: branding.primary_color }} 
                        />
                        <Input 
                          type="color" 
                          value={branding.primary_color}
                          onChange={(e) => handleUpdateBranding({ primary_color: e.target.value })}
                          className="h-14 w-full rounded-2xl border-border cursor-pointer p-1" 
                        />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Vurgu Rengi</Label>
                      <span className="text-[10px] font-mono p-1 px-2 bg-muted rounded uppercase">{branding.secondary_color}</span>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div 
                          className="w-14 h-14 rounded-2xl shadow-inner border border-border shrink-0" 
                          style={{ backgroundColor: branding.secondary_color }} 
                        />
                        <Input 
                          type="color" 
                          value={branding.secondary_color}
                          onChange={(e) => handleUpdateBranding({ secondary_color: e.target.value })}
                          className="h-14 w-full rounded-2xl border-border cursor-pointer p-1" 
                        />
                    </div>
                  </div>
                </div>

                {/* Color Palette Presets (Renk Skalası) */}
                <div className="pt-6 border-t border-border/50">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4 block ml-1">Popüler Renk Seçenekleri (Renk Skalası)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {[
                      { name: "Asalet", primary: "#7c3aed", secondary: "#a78bfa" },
                      { name: "Okyanus", primary: "#0ea5e9", secondary: "#38bdf8" },
                      { name: "Doğa", primary: "#10b981", secondary: "#34d399" },
                      { name: "Gül", primary: "#f43f5e", secondary: "#fb7185" },
                      { name: "Altın", primary: "#f59e0b", secondary: "#fbbf24" },
                      { name: "Gece", primary: "#1e293b", secondary: "#475569" },
                      { name: "Laminant", primary: "#78350f", secondary: "#92400e" },
                      { name: "Zeytin", primary: "#3f6212", secondary: "#4d7c0f" },
                      { name: "Vişne", primary: "#991b1b", secondary: "#b91c1c" },
                      { name: "Lavanta", primary: "#6d28d9", secondary: "#7c3aed" }
                    ].map((palette) => (
                      <button
                        key={palette.name}
                        onClick={() => handleUpdateBranding({ 
                          primary_color: palette.primary, 
                          secondary_color: palette.secondary 
                        })}
                        className={cn(
                          "group p-3 rounded-2xl border border-border bg-muted/20 hover:bg-muted/50 transition-all text-left",
                          branding.primary_color === palette.primary && "border-primary/50 bg-primary/5 ring-2 ring-primary/10"
                        )}
                      >
                        <div className="flex gap-1 mb-2">
                          <div className="w-full h-2 rounded-full" style={{ backgroundColor: palette.primary }} />
                          <div className="w-1/2 h-2 rounded-full" style={{ backgroundColor: palette.secondary }} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground group-hover:text-foreground transition-colors">
                          {palette.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Visuals */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  <span className="font-black text-xs">03</span>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">Görsel Varlıklar</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-card border border-border rounded-[2rem] shadow-sm">
                <div className="space-y-4">
                   <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Logo</Label>
                   <ImageUpload 
                     defaultValue={localBusiness.logo}
                     onUpload={(url) => setLocalBusiness({...localBusiness, logo: url})}
                     path={`${localBusiness.id}/logos`}
                     label="Logo Yükle"
                   />
                   <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5 opacity-60">
                        <Link className="w-3 h-3" /> Veya Direkt URL
                      </Label>
                      <Input 
                        value={localBusiness.logo || ""} 
                        onChange={(e) => setLocalBusiness({...localBusiness, logo: e.target.value})}
                        placeholder="https://örnek.com/logo.png"
                        className="h-10 rounded-xl text-xs border-border bg-muted/20"
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Kapak Fotoğrafı</Label>
                   <ImageUpload 
                     defaultValue={branding.header_banner}
                     onUpload={(url) => handleUpdateBranding({ header_banner: url })}
                     path={`${localBusiness.id}/covers`}
                     label="Kapak Fotoğrafı Yükle"
                   />
                   
                   {branding.header_banner && (
                     <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Banner Dikey Konumu</Label>
                          <span className="text-[10px] font-bold text-primary">%{branding.header_banner_position || 50}</span>
                        </div>
                        <Slider 
                          defaultValue={[branding.header_banner_position || 50]} 
                          max={100} 
                          step={1} 
                          onValueChange={(vals) => handleUpdateBranding({ header_banner_position: vals[0] })}
                          className="py-2"
                        />
                        <p className="text-[10px] text-muted-foreground italic leading-tight">
                          * Fotoğrafın hangi kısmının görüneceğini yukarı/aşağı kaydırarak ayarlayın.
                        </p>
                     </div>
                   )}

                   <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5 opacity-60">
                        <Link className="w-3 h-3" /> Veya Direkt URL
                      </Label>
                      <Input 
                        value={branding.header_banner || ""} 
                        onChange={(e) => handleUpdateBranding({ header_banner: e.target.value })}
                        placeholder="https://örnek.com/banner.jpg"
                        className="h-10 rounded-xl text-xs border-border bg-muted/20"
                      />
                   </div>
                </div>
              </div>
            </div>

            <div className="pb-20">
               <Button className="w-full h-16 rounded-[1.5rem] bg-slate-900 border border-slate-700 text-white font-black text-sm uppercase tracking-[3px] shadow-2xl hover:bg-black transition-all group" onClick={handleSave} disabled={isSaving}>
                 {isSaving ? "Kaydediliyor..." : "SİTEYİ GÜNCELLE VE YAYINLA"}
                 {!isSaving && <Check className="w-5 h-5 ml-2 group-hover:scale-125 transition-transform" />}
               </Button>
            </div>
          </div>
        </div>

        {/* Floating Preview Button for Mobile */}
        {!showPreview && (
          <Button 
            className="fixed bottom-8 right-8 lg:hidden rounded-full w-14 h-14 p-0 shadow-2xl z-50 bg-primary"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="w-6 h-6" />
          </Button>
        )}

        {/* Desktop Mini Preview (Sidebar always visible on right if screen allows) */}
        {!showPreview && (
          <div className="hidden xl:flex w-[500px] border-l border-border bg-card/10 flex-col">
            <div className="p-6 border-b border-border bg-card/50">
               <h4 className="font-black uppercase tracking-tight text-xs flex items-center gap-2">
                 <Eye className="w-3.5 h-3.5" /> Canlı Hızlı Önizleme
               </h4>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none pointer-events-none p-4">
               <div className="origin-top-left scale-[0.38] w-[1200px] bg-surface shadow-2xl rounded-[3rem] overflow-hidden border border-border">
                  <IsletmeDetailContent biz={localBusiness} isPreview={true} />
               </div>
            </div>
            <div className="p-6 border-t border-border bg-muted/30">
               <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                 * Sayfanızın hızlı özetidir. Kaydırma çubuğu ile tüm sayfayı görebilirsiniz.
               </p>
            </div>
          </div>
        )}

        {/* Full Preview Layer */}
        {showPreview && (
          <div className="absolute inset-0 z-30 bg-surface overflow-y-auto animate-in fade-in slide-in-from-bottom duration-500">
            <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border p-3 flex justify-center">
               <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Canlı Önizleme Modu</span>
                  <div className="h-4 w-px bg-border mx-2" />
                  <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} className="h-8 px-4 rounded-xl text-xs font-bold hover:bg-primary/10 hover:text-primary transition-all">
                    TASARIMA DÖN
                  </Button>
               </div>
            </div>
            <IsletmeDetailContent biz={localBusiness} isPreview={true} />
          </div>
        )}
      </div>
    </div>
  );
}
