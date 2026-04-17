import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { turkiyeIller } from "@/lib/turkey-locations";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { t } from "@/lib/translations";
import { SEOHead } from "@/components/SEOHead";

const businessTypes = [
  { value: "Berber", key: "barber" },
  { value: "Kuaför", key: "hairdresser" },
  { value: "Güzellik Salonu", key: "beauty" },
  { value: "Spa & Masaj", key: "massage" },
  { value: "Tırnak Salonu", key: "nails" },
  { value: "Dövme & Piercing", key: "tattoo" },
  { value: "Diş Kliniği", key: "dental" },
  { value: "Veteriner", key: "vet" },
  { value: "Fitness & Spor", key: "fitness" },
  { value: "Diğer", key: "other" },
];

const IsletmeBasvuruPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedIl, setSelectedIl] = useState("");
  const [selectedIlce, setSelectedIlce] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    phone: "",
    email: "",
    address: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
      .replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 6);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Giriş yapmalısınız", description: "İşletme başvurusu için giriş yapın.", variant: "destructive" });
      navigate("/giris");
      return;
    }

    if (!form.name || !form.category || !form.phone) {
      toast({ title: "Eksik bilgi", description: "Zorunlu alanları doldurun.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("businesses").insert({
      owner_id: user.id,
      name: form.name,
      slug: generateSlug(form.name),
      category: form.category,
      description: form.description || null,
      phone: form.phone,
      email: form.email || null,
      city: selectedIl || null,
      district: selectedIlce || null,
      address: form.address || null,
      is_active: false,
      status: "pending",
      working_hours: {
        Pazartesi: "09:00 - 18:00",
        Salı: "09:00 - 18:00",
        Çarşamba: "09:00 - 18:00",
        Perşembe: "09:00 - 18:00",
        Cuma: "09:00 - 18:00",
        Cumartesi: "10:00 - 16:00",
        Pazar: "Kapalı",
      },
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Başvuru hatası", description: error.message, variant: "destructive" });
    } else {
      setIsSubmitted(true);
      toast({ 
        title: "Başvurunuz alındı!", 
        description: "En yakın zamanda dönüş yapılacak başvurunuzun durumunu profilinizden takip edebilirsiniz",
      });
      
      // Auto redirect to home after 4 seconds
      setTimeout(() => {
        navigate("/");
      }, 4000);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 bg-background relative flex items-center justify-center p-4 overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-24 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float-medium" />
          </div>

          <div className="relative z-10 max-w-md w-full bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-2xl animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-25" />
              <CheckCircle className="w-12 h-12 text-emerald-500 relative z-10" />
            </div>
            <h1 className="text-3xl font-heading text-foreground mb-4 tracking-tight">Başvurunuz Alındı!</h1>
            <p className="text-muted-foreground mb-10 text-sm sm:text-base leading-relaxed">
              İşletme başvurunuz başarıyla sisteme kaydedildi. Ekibimiz en kısa sürede inceleyerek size dönüş yapacaktır. Başvurunuzun durumunu profil sayfanızdaki "Başvurularım" sekmesinden takip edebilirsiniz.
            </p>
            <div className="space-y-4">
              <Button onClick={() => navigate("/")} className="w-full h-14 rounded-2xl font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-none shadow-lg shadow-emerald-900/10">
                Ana Sayfaya Dön
              </Button>
              <div className="flex flex-col items-center gap-1 opacity-60">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                  Otomatik Yönlendiriliyorsunuz
                </p>
                <div className="w-24 h-1 bg-border/50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 animate-progress" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title="İşletmeni Ekle | Ücretsiz Randevu Sistemi ve Takip Programı" 
        description="Berber, kuaför veya güzellik salonunuz için ücretsiz randevu sistemi kurun. Randevunurunuzu kolayca yönetin, müşteri sadakatini artırın ve gelirinizi katlayın." 
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "İşletme Başvurusu - Randevu Dünyası",
          "description": "Berber, güzellik merkezi ve kuaförler için ücretsiz online randevu sistemi kayıt sayfası.",
          "keywords": "randevu programı, berber randevu sistemi, güzellik salonu randevu programı, kuaför randevu sistemi, ücretsiz randevu sistemi kur, işletme ekle"
        }}
      />
      <main className="flex-1 bg-background relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-24 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float-medium" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20">
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4 sm:mb-6 tracking-tight">
              {t("apply.title")}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              {t("apply.desc")}
            </p>
          </div>

          {!user && (
            <div className="bg-warning/10 border border-warning/20 backdrop-blur-sm rounded-2xl p-4 sm:p-5 mb-8 text-center animate-fade-in">
              <p className="text-sm text-foreground/90">
                {t("apply.login_required_1")}{" "}
                <Link to="/giris" className="text-accent font-bold hover:underline transition-all">{t("apply.login_required_2")}</Link>
                {" "}{t("apply.login_required_3")}{" "}
                <Link to="/kayit" className="text-accent font-bold hover:underline transition-all">{t("apply.login_required_4")}</Link>.
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-12 sm:mb-16">
            {[t("apply.feature1"), t("apply.feature2"), t("apply.feature3"), t("apply.feature4")].map((b, idx) => (
              <div key={b} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground/80 font-medium group animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center transition-colors group-hover:bg-accent/20">
                  <CheckCircle className="w-3.5 h-3.5 text-accent" />
                </div>
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            
            <form className="relative z-10 space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("apply.business_name")} *</Label>
                    <Input 
                      placeholder={t("apply.business_name_placeholder")} 
                      className="mt-2 h-12 bg-background/50 border-border/50 rounded-xl focus:ring-accent/20 transition-all text-base" 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("apply.description")}</Label>
                    <Textarea 
                      placeholder={t("apply.description_placeholder")} 
                      className="mt-2 min-h-[100px] bg-background/50 border-border/50 rounded-xl focus:ring-accent/20 transition-all text-base resize-none" 
                      value={form.description} 
                      onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("apply.category")} *</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger className="mt-2 h-12 bg-background/50 border-border/50 rounded-xl focus:ring-accent/20 transition-all text-base">
                        <SelectValue placeholder={t("apply.category_placeholder")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/50">
                        {businessTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="rounded-lg">{t(`sectors.${type.key}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("apply.phone")} *</Label>
                    <Input 
                      placeholder={t("apply.phone_placeholder")} 
                      className="mt-2 h-12 bg-background/50 border-border/50 rounded-xl focus:ring-accent/20 transition-all text-base" 
                      value={form.phone} 
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("apply.city")} *</Label>
                    <Select value={selectedIl} onValueChange={(v) => { setSelectedIl(v); setSelectedIlce(""); }}>
                      <SelectTrigger className="mt-2 h-12 bg-background/50 border-border/50 rounded-xl focus:ring-accent/20 transition-all text-base">
                        <SelectValue placeholder={t("common.select_city")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/50">
                        {turkiyeIller.map((loc) => (
                          <SelectItem key={loc.il} value={loc.il} className="rounded-lg">{loc.il}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("apply.district")}</Label>
                    <Select value={selectedIlce} onValueChange={setSelectedIlce} disabled={!selectedIl}>
                      <SelectTrigger className="mt-2 h-12 bg-background/50 border-border/50 rounded-xl focus:ring-accent/20 transition-all text-base">
                        <SelectValue placeholder={selectedIl ? t("common.select_district") : t("common.select_city_first")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/50">
                        {(turkiyeIller.find((l) => l.il === selectedIl)?.ilceler ?? []).map((ilce) => (
                          <SelectItem key={ilce} value={ilce} className="rounded-lg">{ilce}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("apply.email")}</Label>
                  <Input 
                    type="email" 
                    placeholder={t("apply.email_placeholder")} 
                    className="mt-2 h-12 bg-background/50 border-border/50 rounded-xl focus:ring-accent/20 transition-all text-base" 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("apply.address")}</Label>
                  <Textarea 
                    placeholder={t("apply.address_placeholder")} 
                    className="mt-2 min-h-[80px] bg-background/50 border-border/50 rounded-xl focus:ring-accent/20 transition-all text-base resize-none" 
                    value={form.address} 
                    onChange={(e) => setForm({ ...form, address: e.target.value })} 
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all bg-gradient-to-r from-primary to-accent border-none" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                       <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       {t("apply.submitting")}
                    </div>
                  ) : t("apply.submit")}
                </Button>

              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IsletmeBasvuruPage;
