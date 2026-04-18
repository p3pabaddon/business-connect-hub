import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { checkRateLimit, getRateLimitMessage } from "@/lib/rate-limiter";
import { registerSchema } from "@/lib/validations";
import { z } from "zod";

const KayitPage = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
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
    
    // Zod Validation
    try {
      registerSchema.parse(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ 
          title: "Doğrulama Hatası", 
          description: error.errors[0].message, 
          variant: "destructive" 
        });
      }
      return;
    }

    if (!checkRateLimit("register")) {
      toast({ title: "Hata", description: getRateLimitMessage(), variant: "destructive" });
      return;
    }
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

  const handleGoogleSignUp = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast({ title: "Google Kayıt Hatası", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead title="Kayıt Ol" description="RandevuDunyasi'na ücretsiz kayıt olun. Randevu almaya hemen başlayın." />
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
          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl text-sm font-medium border-border hover:bg-muted/50 transition-all duration-300 mb-6"
            onClick={handleGoogleSignUp}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google ile Kayıt Ol
          </Button>

          <div className="relative mb-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              veya
            </span>
          </div>

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
