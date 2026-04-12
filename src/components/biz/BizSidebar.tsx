import { 
  LayoutDashboard, Users, Calendar, 
  BarChart3, Settings, LogOut, 
  ShoppingBag, Star, Megaphone, 
  Menu, X, ShieldCheck, UserCircle,
  Target, Gift, MessageSquare, Package, Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type BizTab = "overview" | "calendar" | "crm" | "marketing" | "performance" | "catalog" | "reviews" | "settings" | "waitlist" | "loyalty" | "inventory" | "premium" | "staff-performance";

interface Props {
  activeTab: BizTab;
  setActiveTab: (tab: BizTab) => void;
  businessName: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function BizSidebar({ activeTab, setActiveTab, businessName, sidebarOpen, setSidebarOpen }: Props) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const navGroups = [
    {
      label: "Büyüme & CRM",
      items: [
        { id: "overview", label: "Genel Bakış", icon: LayoutDashboard },
        { id: "waitlist", label: "Bekleme Listesi", icon: Megaphone },
        { id: "crm", label: "Müşterilerim", icon: Users },
        { id: "performance", label: "Müşteri Radarı (AI)", icon: ShieldCheck },
      ]
    },
    {
      label: "Operasyon",
      items: [
        { id: "calendar", label: "Randevu Takvimi", icon: Calendar },
        { id: "catalog", label: "Hizmet & Personel", icon: ShoppingBag },
        { id: "staff-performance", label: "Personel Performansı", icon: BarChart3 },
        { id: "inventory", label: "Stok & Envanter", icon: Package },
      ]
    },
    {
      label: "Büyüme Araçları",
      items: [
         { id: "premium", label: "Avantajlar", icon: Crown },
         { id: "marketing", label: "Pazarlama Araçları", icon: Target },
         { id: "loyalty", label: "Sadakat & Ödüller", icon: Gift },
         { id: "reviews", label: "Müşteri Yorumları", icon: MessageSquare },
         { id: "settings", label: "İşletme Ayarı", icon: Settings },
      ]
    }
  ];

  return (
    <>
      <aside className={cn(
        "bg-card border-r border-border flex flex-col transition-all duration-500 relative z-50 h-screen shadow-sm",
        "fixed lg:relative inset-y-0 left-0",
        sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 w-72 lg:w-16",
        "lg:translate-x-0"
      )}>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 -right-12 p-2 bg-card border border-border rounded-xl lg:hidden text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 flex items-center justify-between">
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

      <nav className="flex-1 px-3 space-y-8 mt-6 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            {sidebarOpen && <p className="text-[10px] uppercase font-bold text-muted-foreground/60 px-4 tracking-[3px] mb-2">{group.label}</p>}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id as BizTab)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                      activeTab === item.id 
                        ? 'bg-primary/10 text-primary shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", activeTab === item.id ? 'text-primary' : '')} />
                    {sidebarOpen && <span className="font-medium text-sm tracking-tight whitespace-nowrap">{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <button 
          onClick={async () => { await signOut(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-500/5 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="text-sm">Güvenli Çıkış</span>}
        </button>
      </div>
      </aside>
    </>
  );
}
