import { useState, useEffect } from "react";
import { Gift, Save, CheckCircle2, AlertCircle, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Props {
  businessId: string;
}

export const BizLoyaltySettings = ({ businessId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [program, setProgram] = useState<any>({
    target_stamps: 10,
    reward_title: "",
    reward_type: "free_service",
    is_active: false
  });
  const [referral, setReferral] = useState<any>({
    is_referral_active: false,
    referral_reward_type: "fixed",
    referral_reward_value: 50,
    referral_reward_target: "both"
  });

  useEffect(() => {
    loadData();
  }, [businessId]);

  const loadData = async () => {
    try {
      const [programRes, bizRes] = await Promise.all([
        supabase.from("loyalty_programs").select("*").eq("business_id", businessId).single(),
        supabase.from("businesses").select("is_referral_active, referral_reward_type, referral_reward_value, referral_reward_target").eq("id", businessId).single()
      ]);

      if (programRes.data) setProgram(programRes.data);
      if (bizRes.data) setReferral(bizRes.data);
    } catch (err) {
      console.error("Yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: pError } = await supabase
        .from("loyalty_programs")
        .upsert({
          ...program,
          business_id: businessId,
          updated_at: new Date().toISOString()
        }, { onConflict: 'business_id' });

      if (pError) throw pError;

      const { error: bError } = await supabase
        .from("businesses")
        .update(referral)
        .eq("id", businessId);

      if (bError) throw bError;

      toast.success("Ayarlar başarıyla güncellendi");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>;

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-6 animate-in fade-in duration-700">
      <Card className="border border-border shadow-sm overflow-hidden rounded-[2rem] bg-card">
        <div className="h-1.5 bg-primary/20" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                Sadakat Programı
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium ml-13">
                Müşterilerinizi dijital damga kartıyla ödüllendirin.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-2xl border border-border">
              <Label htmlFor="active-toggle" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1">Aktif</Label>
              <Switch 
                id="active-toggle"
                checked={program.is_active}
                onCheckedChange={(checked) => setProgram({...program, is_active: checked})}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Hedef Damga Sayısı</Label>
              <Select 
                value={String(program.target_stamps)} 
                onValueChange={(val) => setProgram({...program, target_stamps: Number(val)})}
              >
                <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl focus:ring-primary/20 font-medium">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground rounded-xl shadow-xl">
                  {[5, 10, 15, 20].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} Randevu</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Ödül Türü</Label>
              <Select 
                value={program.reward_type} 
                onValueChange={(val) => setProgram({...program, reward_type: val})}
              >
                <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl focus:ring-primary/20 font-medium">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground rounded-xl shadow-xl">
                  <SelectItem value="free_service">Ücretsiz Hizmet</SelectItem>
                  <SelectItem value="discount_fixed">Sabit İndirim (₺)</SelectItem>
                  <SelectItem value="discount_percent">Yüzde İndirim (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Ödül Açıklaması</Label>
            <Input 
              placeholder="Örn: Ücretsiz Saç Kesimi"
              value={program.reward_title}
              onChange={(e) => setProgram({...program, reward_title: e.target.value})}
              className="bg-muted/30 border-border h-12 rounded-xl focus:ring-primary/20 font-medium"
            />
          </div>

          {program.reward_type !== "free_service" && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">İndirim Değeri</Label>
              <Input 
                type="number"
                value={program.reward_value || 0}
                onChange={(e) => setProgram({...program, reward_value: Number(e.target.value)})}
                className="bg-muted/30 border-border h-12 rounded-xl focus:ring-primary/20 font-black text-primary"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Campaign Card */}
      <Card className="border border-border shadow-sm overflow-hidden rounded-[2rem] bg-card">
        <div className="h-1.5 bg-accent/20" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                Referans Kampanyası
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium ml-13">
                Arkadaşını getiren müşterilerinize ayrıcalık tanımlayın.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-2xl border border-border">
              <Label htmlFor="ref-toggle" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1">Aktif</Label>
              <Switch 
                id="ref-toggle"
                checked={referral.is_referral_active}
                onCheckedChange={(checked) => setReferral({...referral, is_referral_active: checked})}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Ödül Türü</Label>
              <Select 
                value={referral.referral_reward_type} 
                onValueChange={(val) => setReferral({...referral, referral_reward_type: val})}
              >
                <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl focus:ring-primary/20 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground rounded-xl shadow-xl">
                  <SelectItem value="fixed">Sabit Tutar (₺)</SelectItem>
                  <SelectItem value="percent">Yüzde İndirim (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Ödül Miktarı</Label>
              <Input 
                type="number"
                value={referral.referral_reward_value}
                onChange={(e) => setReferral({...referral, referral_reward_value: Number(e.target.value)})}
                className="bg-muted/30 border-border h-12 rounded-xl focus:ring-primary/20 font-black text-accent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Hedef Kitle</Label>
            <Select 
              value={referral.referral_reward_target} 
              onValueChange={(val) => setReferral({...referral, referral_reward_target: val})}
            >
              <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl focus:ring-primary/20 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border text-foreground rounded-xl shadow-xl">
                <SelectItem value="referrer">Sadece Davet Eden Kazansın</SelectItem>
                <SelectItem value="referee">Sadece Gelen Arkadaş Kazansın</SelectItem>
                <SelectItem value="both">Her İkisi de Kazansın</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground font-medium italic mt-2 opacity-60">Başarılı bir referans sonrası kim ödül alacak?</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          size="lg" 
          className="rounded-2xl h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          {saving ? "GÜNCELLENİYOR..." : (
            <>
              <Save className="w-5 h-5 mr-3" /> TÜM AYARLARI KAYDET
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
