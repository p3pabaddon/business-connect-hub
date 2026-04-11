import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
      is_active: true,
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
      toast({ title: "Başvurunuz alındı!", description: "İşletmeniz oluşturuldu. Dashboard'a yönlendiriliyorsunuz." });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-surface">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-heading text-foreground mb-4">
              {t("apply.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("apply.desc")}
            </p>
          </div>

          {!user && (
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-foreground">
                {t("apply.login_required_1")}{" "}
                <Link to="/giris" className="text-accent font-medium hover:underline">{t("apply.login_required_2")}</Link>
                {" "}{t("apply.login_required_3")}{" "}
                <Link to="/kayit" className="text-accent font-medium hover:underline">{t("apply.login_required_4")}</Link>.
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[t("apply.feature1"), t("apply.feature2"), t("apply.feature3"), t("apply.feature4")].map((b) => (
              <div key={b} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-card">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Label>{t("apply.business_name")} *</Label>
                <Input placeholder={t("apply.business_name_placeholder")} className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label>{t("apply.description")}</Label>
                <Textarea placeholder={t("apply.description_placeholder")} className="mt-1.5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>{t("apply.category")} *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={t("apply.category_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{t(`sectors.${type.key}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t("apply.city")} *</Label>
                  <Select value={selectedIl} onValueChange={(v) => { setSelectedIl(v); setSelectedIlce(""); }}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={t("common.select_city")} />
                    </SelectTrigger>
                    <SelectContent>
                      {turkiyeIller.map((loc) => (
                        <SelectItem key={loc.il} value={loc.il}>{loc.il}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("apply.district")}</Label>
                  <Select value={selectedIlce} onValueChange={setSelectedIlce} disabled={!selectedIl}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={selectedIl ? t("common.select_district") : t("common.select_city_first")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(turkiyeIller.find((l) => l.il === selectedIl)?.ilceler ?? []).map((ilce) => (
                        <SelectItem key={ilce} value={ilce}>{ilce}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{t("apply.phone")} *</Label>
                <Input placeholder={t("apply.phone_placeholder")} className="mt-1.5" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div>
                <Label>{t("apply.email")}</Label>
                <Input type="email" placeholder={t("apply.email_placeholder")} className="mt-1.5" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>{t("apply.address")}</Label>
                <Textarea placeholder={t("apply.address_placeholder")} className="mt-1.5" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? t("apply.submitting") : t("apply.submit")}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IsletmeBasvuruPage;
