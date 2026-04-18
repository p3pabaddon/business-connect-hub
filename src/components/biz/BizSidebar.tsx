import { 
  LayoutDashboard, Users, Calendar, 
  BarChart3, Settings, LogOut, 
  ShoppingBag, Star, Megaphone, 
  Menu, X, ShieldCheck, UserCircle, Bell,
  Target, Gift, MessageSquare, Package, Crown, PieChart, Image as ImageIcon, LifeBuoy, Sparkles, Ticket, Heart, Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export type BizTab = 
  | "overview" | "calendar" | "crm" | "marketing" | "performance" | "catalog" 
  | "reviews" | "settings" | "waitlist" | "loyalty" | "inventory" | "premium" 
  | "staff-performance" | "analytics" | "portfolio" | "support" | "appointments" 
  | "services" | "staff" | "gallery" | "coupons" | "security" | "finance" | "notifications" | "page-editor";

interface Props {
  activeTab: BizTab;
  setActiveTab: (tab: BizTab) => void;
  businessName: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isPremium?: boolean;
}

export function BizSidebar({ activeTab, setActiveTab, businessName, sidebarOpen, setSidebarOpen, isPremium = false }: Props) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const navGroups = [
    {
      label: "Büyüme & CRM",
      items: [
        { id: "overview", label: "Genel Bakış", icon: LayoutDashboard },
        { id: "waitlist", label: "Bekleme Listesi", icon: Megaphone, premium: true },
        { id: "crm", label: "Müşterilerim", icon: Users },
        { id: "performance", label: "Müşteri Radarı (AI)", icon: ShieldCheck, premium: true },
      ]
    },
    {
      label: "Operasyon",
      items: [
        { id: "calendar", label: "Randevu Takvimi", icon: Calendar },
        { id: "catalog", label: "Hizmet & Personel", icon: ShoppingBag },
        { id: "staff-performance", label: "Personel Performansı", icon: BarChart3, premium: true },
        { id: "analytics", label: "Gelişmiş Analytics", icon: PieChart, premium: true },
        { id: "inventory", label: "Stok & Envanter", icon: Package, premium: true },
      ]
    },
    {
      label: "Zeka & Büyüme",
      items: [
        { id: "analytics", label: "AI Analitik", icon: Sparkles, premium: true },
        { id: "coupons", label: "Kuponlar", icon: Ticket, premium: true },
        { id: "loyalty", label: "Sadakat Programı", icon: Heart, premium: true },
      ]
    },
    {
      label: "Büyüme Araçları",
      items: [
         { id: "premium", label: "Avantajlar", icon: Crown },
         { id: "notifications", label: "Bildirimler", icon: Bell, premium: true },
         { id: "marketing", label: "Pazarlama Araçları", icon: Target, premium: true },
         { id: "portfolio", label: "Çalışmalarımız", icon: ImageIcon, premium: true },
         { id: "page-editor", label: "İşletme Sayfası", icon: Palette, premium: true },
         { id: "reviews", label: "Müşteri Yorumları", icon: MessageSquare },
         { id: "support", label: "Destek Merkezi", icon: LifeBuoy },
         { id: "settings", label: "İşletme Ayarı", icon: Settings },
      ]
    }
  ];

  return (
    <>
      <aside className={cn(
        "bg-card border-r border-border flex flex-col transition-[width,transform] duration-500 relative z-50 h-screen shadow-sm",
        "fixed lg:relative inset-y-0 left-0",
        sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 w-72 lg:w-16",
        "lg:translate-x-0"
      )}>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="absolute top-6 right-6 p-2 lg:hidden text-foreground hover:bg-muted rounded-xl transition-all z-[60]"
        >
          <X className="w-6 h-6" />
        </button>

        <div className={cn("p-6 flex items-center", !sidebarOpen && "px-3")}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
              <UserCircle className="w-6 h-6 text-primary" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <span className="font-heading font-black text-foreground text-base tracking-tighter block whitespace-nowrap">{businessName.toUpperCase()}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mt-1 block">Yönetim Paneli</span>
              </div>
            )}
          </div>
        </div>

      <nav className={cn(
        "flex-1 space-y-8 mt-6 overflow-y-auto custom-scrollbar",
        sidebarOpen ? "px-3" : "px-0"
      )}>
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            {sidebarOpen && <p className="text-[10px] uppercase font-bold text-muted-foreground/60 px-4 tracking-[3px] mb-2">{group.label}</p>}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isLocked = item.premium && !isPremium;
                return (
                  <li key={`${item.id}-${idx}`}>
                    <button
                      onClick={() => {
                        if (isLocked) {
                          setActiveTab("premium");
                        } else {
                          setActiveTab(item.id as BizTab);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center rounded-xl transition-all duration-200 group relative",
                        sidebarOpen ? "gap-3 px-4 py-3 justify-start" : "px-0 py-3 justify-center",
                        activeTab === item.id 
                          ? 'bg-primary/10 text-primary shadow-sm' 
                          : isLocked 
                            ? 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 cursor-pointer'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", activeTab === item.id ? 'text-primary' : '')} />
                      {sidebarOpen && (
                        <div className="flex items-center gap-2 flex-1 overflow-hidden">
                          <span className="font-medium text-sm tracking-tight whitespace-nowrap">{item.label}</span>
                          {isLocked && (
                            <div className="bg-amber-500/10 p-1 rounded-md ml-auto">
                              <Crown className="w-3 h-3 text-amber-500" />
                            </div>
                          )}
                        </div>
                      )}
                      {!sidebarOpen && isLocked && (
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full border border-background"></div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={cn("p-4 border-t border-border mt-auto", !sidebarOpen && "p-0 py-4 flex justify-center")}>
        <button 
          onClick={async () => { await signOut(); navigate("/"); }}
          className={cn(
            "flex items-center rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-500/5 transition-all font-medium",
            sidebarOpen ? "w-full gap-3 px-4 py-3" : "p-3"
          )}
          title={!sidebarOpen ? "Güvenli Çıkış" : undefined}
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="text-sm">Güvenli Çıkış</span>}
        </button>
      </div>
      </aside>
    </>
  );
}

