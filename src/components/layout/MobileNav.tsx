import { Link, useLocation } from "react-router-dom";
import { Home, Search, Calendar, User, Compass, MapPin, LayoutDashboard, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/translations";
import { useAuth } from "@/contexts/AuthContext";

export function MobileNav() {
  const location = useLocation();
  const { isBusinessOwner } = useAuth();

  const navItems = [
    { icon: Home, label: t("nav.home"), href: "/" },
    { icon: Sparkles, label: t("nav.stylist"), href: "/stil-danismani" },
    { icon: Search, label: t("nav.businesses"), href: "/isletmeler" },
  ];

  if (isBusinessOwner) {
    navItems.push({ icon: LayoutDashboard, label: t("common.dashboard"), href: "/biz-dashboard-secure-x31p9q8w2" });
  } else {
    navItems.push({ icon: MapPin, label: t("nav.how_it_works"), href: "/nasil-calisir" });
  }

  navItems.push({ icon: User, label: t("common.profile"), href: "/profil" });

  const excludedRoutes = [
    "/biz-dashboard-secure-x31p9q8w2",
    "/admin-secure-panel-v5-x89j2k1m4n5",
    "/hq-intelligence-vault-v8-m2n5b4v1",
    "/personel-paneli"
  ];

  if (excludedRoutes.some(route => location.pathname.startsWith(route))) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-11 p-2 left-4 right-4 z-50 bg-background/80 backdrop-blur-lg border border-white/5 shadow-2xl rounded-full px-4">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[50px] transition-colors",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-all", isActive && "text-primary")} />
              <span className={cn("text-[9px] font-medium tracking-tighter truncate max-w-[60px]", isActive ? "text-primary" : "text-muted-foreground/60")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
