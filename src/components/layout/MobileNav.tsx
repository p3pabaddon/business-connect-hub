import { Link, useLocation } from "react-router-dom";
import { Home, Search, Calendar, User, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/translations";

export function MobileNav() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: t("nav.home"), href: "/" },
    { icon: Compass, label: t("nav.businesses"), href: "/isletmeler" },
    { icon: Search, label: t("hero.search_btn"), href: "/harita" },
    { icon: User, label: t("common.profile"), href: "/profil" },
  ];

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border px-4 pb-safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "fill-current")} />
              <span className="text-[10px] font-medium uppercase tracking-tighter">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
