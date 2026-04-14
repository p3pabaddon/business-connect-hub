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

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/isletmeler", label: t("nav.businesses") },
    { href: "/hakkimizda", label: t("nav.about") },
    { href: "/iletisim", label: t("nav.contact") },
    { href: "/sss", label: t("nav.faq") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-white/70 dark:bg-black/70 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative p-1.5 bg-white rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:scale-105">
              <img 
                src="/logo.png" 
                alt="Randevu Dünyası" 
                className="h-10 sm:h-12 w-auto object-contain" 
              />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 dark:text-zinc-400 dark:hover:text-white transition-all rounded-lg"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-1.5 mr-2 pr-2 border-r border-border/50">
              <LanguageToggle />
              <ThemeToggle />
              <NotificationBell />
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

            <div className="w-[1px] h-4 bg-border/50 mx-1" />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="max-w-[120px] truncate">
                      {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/profil")}>
                    <User className="w-4 h-4 mr-2" /> {t("common.profile")}
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/rd-secure-gateway-v4-9f82d1b7a5e4b2d8c9f0a1b2c3d4e5f6a7b8c9d0")} className="text-primary font-semibold bg-primary/5">
                      <Shield className="w-4 h-4 mr-2" /> {t("common.admin_panel")}
                    </DropdownMenuItem>
                  )}
                  {isBusinessOwner && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <LayoutDashboard className="w-4 h-4 mr-2" /> {t("common.dashboard")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> {t("common.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/giris">
                  <Button variant="outline" size="sm">{t("nav.login")}</Button>
                </Link>
                <Link to="/kayit">
                  <Button size="sm">{t("nav.register")}</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
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
                      to="/dashboard"
                      className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("common.dashboard")}
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/rd-secure-gateway-v4-9f82d1b7a5e4b2d8c9f0a1b2c3d4e5f6a7b8c9d0"
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
