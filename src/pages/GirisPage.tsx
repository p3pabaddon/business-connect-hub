import { Link, useNavigate } from "react-router-dom";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const GirisPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const bgImage = "/login_bg_luxury_1775820781424.png";

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Premium Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 z-1 bg-gradient-to-br from-background/95 via-background/80 to-background/40 backdrop-blur-[2px]" />

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
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("auth.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" className="h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-accent focus:border-accent transition-all" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" title={t("auth.password")} className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("auth.password")}</Label>
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
