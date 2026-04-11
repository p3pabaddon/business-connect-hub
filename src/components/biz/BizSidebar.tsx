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

type BizTab = "overview" | "calendar" | "crm" | "marketing" | "performance" | "catalog" | "reviews" | "settings" | "waitlist" | "loyalty" | "inventory" | "premium";

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
        "bg-[#0f172a]/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col transition-all duration-500 relative z-50 h-screen",
        "fixed lg:relative inset-y-0 left-0",
        sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 w-72 lg:w-16",
        "lg:translate-x-0"
      )}>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 -right-12 p-2 bg-slate-900 border border-slate-800 rounded-xl lg:hidden text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 shrink-0">
            <UserCircle className="w-6 h-6 text-primary" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <span className="font-heading font-black text-white text-base tracking-tighter block whitespace-nowrap">{businessName.toUpperCase()}</span>
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mt-1 block">Yönetim Paneli</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-8 mt-6 overflow-y-auto">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            {sidebarOpen && <p className="text-[10px] uppercase font-bold text-slate-600 px-4 tracking-[3px] opacity-70 mb-2">{group.label}</p>}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id as BizTab)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                      activeTab === item.id 
                        ? 'bg-primary/10 text-primary border border-primary/10 shadow-[inset_0_0_10px_rgba(var(--primary),0.05)]' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
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

      <div className="p-4 border-t border-slate-800/50 mt-auto">
        <button 
          onClick={async () => { await signOut(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-rose-500 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="text-sm">Güvenli Çıkış</span>}
        </button>
      </div>
      </aside>
    </>
  );
}
