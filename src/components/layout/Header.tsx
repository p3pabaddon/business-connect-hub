import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, LayoutDashboard, Shield } from "lucide-react";
import { t } from "@/lib/translations";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { NotificationBell } from "@/components/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut, isAdmin, isBusinessOwner } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group px-2 py-1 rounded-xl hover:bg-white/5 transition-all">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 bg-transparent rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
              <img 
                src="/logo.png" 
                alt="Randevu Dünyası" 
                className="max-h-full max-w-full object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-foreground leading-none">
                Randevu <span className="text-accent">Dünyası</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all rounded-lg">
              {t("nav.home")}
            </Link>
            <Link to="/nasil-calisir" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all rounded-lg">
              Nasıl Çalışır?
            </Link>
            <Link to="/kesfet" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all rounded-lg flex items-center gap-1">
              Keşfet <span className="bg-amber-500 text-white text-[8px] px-1 rounded-sm font-bold animate-pulse">YENİ</span>
            </Link>
            <Link to="/isletmeler" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all rounded-lg flex items-center gap-1">
              İşletmeler <span className="bg-primary text-white text-[8px] px-1 rounded-sm font-bold">YENİ</span>
            </Link>
            <Link to="/stil-danismani" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all rounded-lg flex items-center gap-1">
              Stil Danışmanı <span className="bg-accent text-white text-[8px] px-1 rounded-sm font-bold">AI</span>
            </Link>

            {/* Dropdown for secondary links - Blog & Contact */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all rounded-lg flex items-center gap-1 group">
                  <Menu className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                  <span>Daha Fazla</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/10 shadow-2xl">
                <DropdownMenuItem onClick={() => navigate("/blog")} className="cursor-pointer">
                  Blog
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/iletisim")} className="cursor-pointer">
                  {t("nav.contact")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/hakkimizda")} className="cursor-pointer">
                  {t("nav.about")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/sss")} className="cursor-pointer">
                  {t("nav.faq")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-1.5 mr-2 pr-2 border-r border-border/50">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/isletmeler-icin" className="text-sm font-semibold text-muted-foreground hover:text-accent dark:hover:text-white transition-colors">
                {t("nav.for_business")}
              </Link>
              
              <Link to="/isletme-basvuru">
                <Button variant="ghost" size="sm" className="text-accent hover:text-accent-foreground hover:bg-accent font-bold tracking-tight px-3 transition-all rounded-lg">
                  {t("nav.business_apply")}
                </Button>
              </Link>
            </div>

            <div className="w-[1px] h-4 bg-border/50 mx-1 hidden lg:block" />
            {user ? (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 border-accent/20 hover:border-accent/50 transition-colors">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="max-w-[120px] truncate">
                        {user.user_metadata?.full_name || user.email?.split("@")[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 backdrop-blur-xl">
                    <DropdownMenuItem onClick={() => navigate("/profil")}>
                      <User className="w-4 h-4 mr-2" /> {t("common.profile")}
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin-secure-panel-v5-x89j2k1m4n5")} className="text-primary font-semibold bg-primary/5">
                        <Shield className="w-4 h-4 mr-2" /> {t("common.admin_panel")}
                      </DropdownMenuItem>
                    )}
                    {isBusinessOwner && (
                      <DropdownMenuItem onClick={() => navigate("/biz-dashboard-secure-x31p9q8w2")}>
                        <LayoutDashboard className="w-4 h-4 mr-2" /> {t("common.dashboard")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" /> {t("common.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/giris">
                  <Button variant="outline" size="sm">{t("nav.login")}</Button>
                </Link>
                <Link to="/kayit">
                  <Button size="sm" className="shadow-lg shadow-primary/20">{t("nav.register")}</Button>
                </Link>
              </div>
            )}
            <NotificationBell />
          </div>

          <div className="flex md:hidden items-center gap-2">
            <NotificationBell />
            <button
              className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-all active:scale-95 bg-muted/50"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border py-6 px-4 space-y-4 bg-background/95 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            {[
              { href: "/", label: t("nav.home") },
              { href: "/nasil-calisir", label: "Nasıl Çalışır?" },
              { href: "/kesfet", label: "Keşfet" },
              { href: "/isletmeler", label: "İşletmeler" },
              { href: "/stil-danismani", label: "Stil Danışmanı" },
              { href: "/blog", label: "Blog" },
              { href: "/iletisim", label: t("nav.contact") },
              { href: "/hakkimizda", label: t("nav.about") },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-4 py-3 text-base font-semibold text-foreground hover:text-accent rounded-2xl hover:bg-accent/5 transition-all border border-transparent hover:border-accent/10"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/isletmeler-icin"
              className="block px-3 py-2 text-sm font-bold text-accent hover:bg-accent/5 rounded-md"
              onClick={() => setMobileOpen(false)}
            >
              {t("nav.for_business")}
            </Link>
            <Link
              to="/isletme-basvuru"
              className="block px-3 py-2 text-sm font-bold text-accent hover:bg-accent/5 rounded-md"
              onClick={() => setMobileOpen(false)}
            >
              {t("nav.business_apply")}
            </Link>
            {user && (
              <>
                <Link
                  to="/profil"
                  className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("common.profile")}
                </Link>
                  {isBusinessOwner && (
                    <Link
                      to="/biz-dashboard-secure-x31p9q8w2"
                      className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("common.dashboard")}
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin-secure-panel-v5-x89j2k1m4n5"
                      className="block px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-md"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Shield className="w-4 h-4 inline mr-2" /> {t("common.admin_panel")}
                    </Link>
                  )}
              </>
            )}
            <div className="flex items-center gap-2 pt-3 px-3">
              <LanguageToggle />
              <ThemeToggle />
              <NotificationBell />
              {user ? (
                <Button variant="outline" size="sm" className="flex-1" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-1" /> {t("common.logout")}
                </Button>
              ) : (
                <>
                  <Link to="/giris" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">{t("nav.login")}</Button>
                  </Link>
                  <Link to="/kayit" className="flex-1">
                    <Button size="sm" className="w-full">{t("nav.register")}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
