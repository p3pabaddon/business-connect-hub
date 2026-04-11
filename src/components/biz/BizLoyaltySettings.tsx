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
    <div className="space-y-8 max-w-2xl mx-auto py-6">
      <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-heading flex items-center gap-2">
                <Gift className="w-6 h-6 text-primary" /> Sadakat Programı
              </CardTitle>
              <CardDescription>
                Müşterilerinizi dijital damga kartıyla ödüllendirin.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
              <Label htmlFor="active-toggle" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aktif</Label>
              <Switch 
                id="active-toggle"
                checked={program.is_active}
                onCheckedChange={(checked) => setProgram({...program, is_active: checked})}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Hedef Damga Sayısı</Label>
              <Select 
                value={String(program.target_stamps)} 
                onValueChange={(val) => setProgram({...program, target_stamps: Number(val)})}
              >
                <SelectTrigger className="bg-muted/50 border-none">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} Randevu</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ödül Türü</Label>
              <Select 
                value={program.reward_type} 
                onValueChange={(val) => setProgram({...program, reward_type: val})}
              >
                <SelectTrigger className="bg-muted/50 border-none">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free_service">Ücretsiz Hizmet</SelectItem>
                  <SelectItem value="discount_fixed">Sabit İndirim (₺)</SelectItem>
                  <SelectItem value="discount_percent">Yüzde İndirim (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ödül Açıklaması</Label>
            <Input 
              placeholder="Örn: Ücretsiz Saç Kesimi"
              value={program.reward_title}
              onChange={(e) => setProgram({...program, reward_title: e.target.value})}
              className="bg-muted/50 border-none"
            />
          </div>

          {program.reward_type !== "free_service" && (
            <div className="space-y-2">
              <Label>İndirim Değeri</Label>
              <Input 
                type="number"
                value={program.reward_value || 0}
                onChange={(e) => setProgram({...program, reward_value: Number(e.target.value)})}
                className="bg-muted/50 border-none"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Campaign Card */}
      <Card className="border-2 border-accent/20 shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-accent via-primary to-accent" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-heading flex items-center gap-2">
                <Users className="w-6 h-6 text-accent" /> Referans Kampanyası
              </CardTitle>
              <CardDescription>
                Arkadaşını getiren müşterilerinize ayrıcalık tanımlayın.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
              <Label htmlFor="ref-toggle" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aktif</Label>
              <Switch 
                id="ref-toggle"
                checked={referral.is_referral_active}
                onCheckedChange={(checked) => setReferral({...referral, is_referral_active: checked})}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Ödül Türü</Label>
              <Select 
                value={referral.referral_reward_type} 
                onValueChange={(val) => setReferral({...referral, referral_reward_type: val})}
              >
                <SelectTrigger className="bg-muted/50 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Sabit Tutar (₺)</SelectItem>
                  <SelectItem value="percent">Yüzde İndirim (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ödül Miktarı</Label>
              <Input 
                type="number"
                value={referral.referral_reward_value}
                onChange={(e) => setReferral({...referral, referral_reward_value: Number(e.target.value)})}
                className="bg-muted/50 border-none font-bold text-accent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hedef Kitle</Label>
            <Select 
              value={referral.referral_reward_target} 
              onValueChange={(val) => setReferral({...referral, referral_reward_target: val})}
            >
              <SelectTrigger className="bg-muted/50 border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="referrer">Sadece Davet Eden Kazansın</SelectItem>
                <SelectItem value="referee">Sadece Gelen Arkadaş Kazansın</SelectItem>
                <SelectItem value="both">Her İkisi de Kazansın</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground italic">Başarılı bir referans sonrası kim ödül alacak?</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end p-2">
        <Button onClick={handleSave} disabled={saving} size="xl" className="shadow-lg shadow-primary/20">
          {saving ? "Güncelleniyor..." : (
            <>
              <Save className="w-5 h-5 mr-3" /> Tüm Ayarları Kaydet
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
