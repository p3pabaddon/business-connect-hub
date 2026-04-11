import { Link, useNavigate } from "react-router-dom";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { SEOHead } from "@/components/SEOHead";
import { checkRateLimit, getRateLimitMessage } from "@/lib/rate-limiter";

const GirisPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkRateLimit("login")) {
      toast({ title: "Hata", description: getRateLimitMessage(), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Giriş Hatası", description: "E-posta veya şifre hatalı.", variant: "destructive" });
    } else {
      toast({ title: "Hoş geldiniz!" });
      navigate("/");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast({ title: "Google Giriş Hatası", description: error.message, variant: "destructive" });
    }
  };

  const bgImage = "/login_bg_luxury_1775820781424.png";

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <SEOHead title="Giriş Yap" description="RandevuDunyasi hesabınıza giriş yapın. Randevularınızı yönetin." />
      {/* Premium Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-background/95 via-background/80 to-background/40 backdrop-blur-[2px]" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <span className="text-primary-foreground font-heading text-2xl">R</span>
          </div>
          <span className="font-heading text-3xl text-foreground tracking-tight">
            Randevu<span className="text-accent">Dunyasi</span>
          </span>
        </Link>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-heading text-foreground font-bold tracking-tight">{t("auth.login_title")}</h2>
          <p className="text-sm text-muted-foreground font-medium">
            {t("auth.no_account")}{" "}
            <Link to="/kayit" className="text-accent hover:underline decoration-2 underline-offset-4 transition-all">{t("auth.register_btn")}</Link>
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl">
          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-14 rounded-2xl text-base font-medium border-border/50 hover:bg-muted/50 transition-all duration-300 mb-6"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google ile Giriş Yap
          </Button>

          <div className="relative mb-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/60 dark:bg-slate-900/60 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              veya
            </span>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("auth.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" className="h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-accent focus:border-accent transition-all" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("auth.password")}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-accent focus:border-accent transition-all" required />
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl hover:shadow-accent/20 transition-all duration-300" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  {t("auth.logging_in")}
                </div>
              ) : t("auth.login_btn")}
            </Button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-xs text-muted-foreground/60 font-medium">
          © 2024 RandevuDunyasi. Güvenliğiniz bizim için teknik mükemmeliyet ve şeffaflık demektir.
        </p>
      </div>
    </div>
  );
};

export default GirisPage;
