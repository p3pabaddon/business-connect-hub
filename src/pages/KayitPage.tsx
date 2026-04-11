import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const KayitPage = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("pending_referral", ref);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(form.email, form.password, {
      full_name: form.name,
      phone: form.phone,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Kayıt Hatası", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Kayıt başarılı!", description: "E-posta adresinizi doğrulayın." });
      navigate("/giris");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-heading text-xl">R</span>
          </div>
          <span className="font-heading text-2xl text-foreground">
            Randevu<span className="text-accent">Dunyasi</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl font-heading text-foreground">{t("auth.register_title")}</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {t("auth.have_account")}{" "}
          <Link to="/giris" className="text-accent hover:underline font-medium">{t("auth.login_btn")}</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-card">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">{t("auth.full_name")}</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("auth.full_name_placeholder")} className="mt-1.5" required />
            </div>
            <div>
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ornek@email.com" className="mt-1.5" required />
            </div>
            <div>
              <Label htmlFor="phone">{t("auth.phone")}</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="05XX XXX XX XX" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="mt-1.5" required />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? t("auth.registering") : t("auth.register_btn")}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              {t("auth.register_agree_1")}{" "}
              <Link to="#" className="text-accent hover:underline">{t("footer.terms")}</Link>
              {" "}{t("auth.register_agree_2")}{" "}
              <Link to="#" className="text-accent hover:underline">{t("footer.privacy")}</Link>
              {" "}{t("auth.register_agree_3")}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KayitPage;
