import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyBusiness, useBizAnalytics, useInventory, useBizServices, useBizStaff, useBizReviews } from "@/hooks/useQueries";
import { VerificationGuard } from "@/components/VerificationGuard";
import { BizSidebar } from "@/components/biz/BizSidebar";
import { BizOverview } from "@/components/biz/BizOverview";
import { BizCRM } from "@/components/biz/BizCRM";
import { BizCalendar } from "@/components/biz/BizCalendar";
import { BizMarketing } from "@/components/biz/BizMarketing";
import { BizReviews } from "@/components/biz/BizReviews";
import { BizCatalog } from "@/components/biz/BizCatalog";
import { BizLoyaltySettings } from "@/components/biz/BizLoyaltySettings";
import { BizChurnSentinel } from "@/components/biz/BizChurnSentinel";
import { BizInventory } from "@/components/biz/BizInventory";
import { BizSettingsTab } from "@/components/biz/BizSettingsTab";
import { BizPremiumHub } from "@/components/biz/BizPremiumHub";
import { WaitlistManager } from "@/components/dashboard/WaitlistManager";
import { StaffPerformance } from "@/components/biz/StaffPerformance";
import { BizPortfolio } from "@/components/biz/BizPortfolio";
import { BizSupport } from "../components/biz/BizSupport";
import { BizAdvancedAnalytics } from "@/components/biz/BizAdvancedAnalytics";
import { BizCoupons } from "@/components/biz/BizCoupons";
import { SEOHead } from "@/components/SEOHead";
import { BizAiAdvisor } from "@/components/biz/BizAiAdvisor";
import { BizNotifications } from "@/components/biz/BizNotifications";
import { Loader2, Bell, Search, UserCircle, Settings, Menu, Building2, LayoutDashboard, LogOut, ExternalLink, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/layout/Logo";
import { supabase } from "@/lib/supabase";

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const playNotificationSound = () => {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.play().catch(() => {});
};

type BizTab = "overview" | "calendar" | "crm" | "marketing" | "performance" | "catalog" | "reviews" | "settings" | "waitlist" | "loyalty" | "inventory" | "premium" | "staff-performance" | "analytics" | "portfolio" | "support" | "coupons" | "notifications";

export default function BusinessDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<BizTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: business, isLoading: loading, refetch: reloadBusiness } = useMyBusiness();
  const { data: bizData, refetch: reloadAnalytics } = useBizAnalytics(business?.id || "");
  const { data: invData, refetch: reloadInventory } = useInventory(business?.id || "");
  
  const stats = bizData?.kpis || null;
  const customers = bizData?.customers || [];
  const appointments = bizData?.recentAppointments || [];
  const inventory = invData || [];

  const noBusiness = !loading && !business;

  useEffect(() => {
    if (!authLoading && !user) navigate("/giris");
  }, [user, authLoading]);

  // Compatibility mapping for legacy components that expect 'loadData'
  const { data: servicesFetch, refetch: reloadServices } = useBizServices(business?.id || "");
  const { data: staffFetch, refetch: reloadStaff } = useBizStaff(business?.id || "");
  const { data: reviewsFetch, refetch: reloadReviews } = useBizReviews(business?.id || "");

  const services = servicesFetch || [];
  const staff = staffFetch || [];
  const reviews = reviewsFetch || [];

  const loadData = () => {
    reloadBusiness();
    reloadAnalytics();
    reloadInventory();
    reloadServices();
    reloadStaff();
    reloadReviews();
  };

  // Unified Notification & Realtime Listener
  useEffect(() => {
    if (user?.id) {
      const channel = supabase
        .channel(`global-notifications-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const { title, message } = payload.new;
            playNotificationSound();
            toast.success(title, {
              description: message,
              duration: 10000,
            });
            loadData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Specific Appointment Listener for immediate refresh (optional if covered by notifications)
  useEffect(() => {
    if (business?.id) {
      const channel = supabase
        .channel(`biz-updates-appointments-${business.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'appointments', filter: `business_id=eq.${business.id}` },
          () => {
            loadData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [business?.id]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.2em]">Yönetici Erişimi Doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  if (noBusiness) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-heading text-foreground mb-2">İşletme Bulunamadı</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Henüz bir işletme kaydınız bulunmuyor. İşletme paneline erişmek için önce başvuru yapmanız gerekiyor.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/isletme-basvuru")} className="gap-2">
              İşletme Başvurusu Yap
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Ana Sayfa
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (business && (business.status === "pending" || !business.is_active)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
          <h2 className="text-xl font-heading text-foreground mb-2">Başvurunuz İnceleniyor</h2>
          <p className="text-muted-foreground text-sm mb-2">
            <strong>{business.name}</strong> işletmeniz onay sürecindedir.
          </p>
          <p className="text-muted-foreground text-xs mb-6">
            Başvurunuz en kısa sürede değerlendirilecek ve size bildirilecektir.
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

   return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden font-sans selection:bg-primary/30">
      <SEOHead title={`${business?.name || "İşletme"} | Yönetim Paneli`} />
      
      <BizSidebar 
        activeTab={activeTab} 
        setActiveTab={(tab: any) => setActiveTab(tab)} 
        businessName={business?.name || "İşletme"} 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Overlay for Sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Top Header */}
        <header className="h-16 lg:h-20 border-b border-border px-4 lg:px-8 flex items-center justify-between bg-background/50 backdrop-blur-md relative z-10">
           <div className="flex items-center gap-3 lg:gap-6 flex-1">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-muted rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5 text-muted-foreground" />
              </button>
               <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-muted-foreground">
                  <Logo className="h-9 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab("overview")} />
                  <div className="h-6 w-px bg-border mx-2"></div>
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className="text-muted-foreground uppercase tracking-widest font-black opacity-40 hover:opacity-100 transition-opacity"
                  >
                    İşletme Kontrol Merkezi
                  </button>
                  <span className="text-muted-foreground/30 mx-2 text-lg">/</span>
                  <span className="text-primary capitalize font-bold bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">{activeTab}</span>
               </div>
               <div className="relative flex-1 max-w-xs hidden sm:block group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-20" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {}} 
                    className="bg-muted/50 border-border pl-9 h-9 text-xs focus:ring-primary/20 transition-all relative z-10" 
                    placeholder="Hızlı ara..." 
                  />
                  
                  {/* Global Search Results Dropdown */}
                  {searchQuery.length > 1 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="p-2 border-b border-border bg-muted/30">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">Arama Sonuçları</p>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {/* Customers Section */}
                        {customers.filter((c: any) => 
                          (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.phone || "").includes(searchQuery)
                        ).slice(0, 5).map((c: any) => (
                          <div 
                            key={c.phone}
                            onClick={() => { setActiveTab("crm"); setSearchQuery(""); }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                              {(c.name || "M")[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{c.name}</p>
                              <p className="text-[9px] text-muted-foreground font-mono">{c.phone}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
               </div>
           </div>

           <div className="flex items-center gap-2 lg:gap-4">
              <ThemeToggle />
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab("notifications");
                }}
                className="relative p-2 bg-muted/50 border border-border rounded-xl hover:bg-muted transition-all duration-200 group flex items-center justify-center cursor-pointer z-[60]"
              >
                 <Bell className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
                 <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full border-2 border-background pointer-events-none"></span>
              </button>

              <div className="h-6 w-[1px] bg-border mx-1 lg:mx-2"></div>

               <button 
                 onClick={() => navigate("/")}
                 className="flex items-center gap-2 p-1 lg:p-1.5 lg:px-4 bg-muted/50 border border-border rounded-xl hover:bg-muted transition-colors group"
               >
                  <LayoutDashboard className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase hidden sm:block">Ana Sayfa</span>
               </button>

               <button 
                 onClick={async () => { await signOut(); navigate("/"); }}
                 className="flex items-center gap-2 p-1 lg:p-1.5 lg:pr-4 bg-muted/50 border border-border rounded-xl lg:rounded-2xl hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors group"
               >
                  <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 group-hover:bg-rose-500/20 group-hover:border-rose-500/20">
                     <LogOut className="w-4 h-4 lg:w-5 lg:h-5 text-primary group-hover:text-rose-500" />
                  </div>
                   <div className="text-left hidden lg:block">
                     <p className="text-[10px] font-bold text-foreground uppercase tracking-tighter leading-none group-hover:text-rose-500">Çıkış Yap</p>
                   </div>
               </button>
            </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-10 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.03),transparent_40%)]">
           <div className="max-w-[1600px] mx-auto">
              <VerificationGuard>
              {activeTab === "overview" && stats && (
                <BizOverview stats={stats} recentApts={appointments} inventory={inventory} />
              )}
              {activeTab === "calendar" && (
                <BizCalendar appointments={appointments} onRefresh={loadData} />
              )}
              {activeTab === "crm" && (
                <BizCRM businessId={business?.id} customers={customers} globalSearch={searchQuery} />
              )}
              {activeTab === "waitlist" && (
                <WaitlistManager businessId={business?.id || ""} />
              )}
              {activeTab === "marketing" && (
                <BizMarketing businessId={business?.id} onRefresh={loadData} />
              )}
              {activeTab === "reviews" && (
                <BizReviews reviews={reviews} onRefresh={loadData} />
              )}
              {activeTab === "catalog" && (
                <BizCatalog businessId={business?.id} services={services} staff={staff} personnelLimit={business?.personnel_limit || 2} onRefresh={loadData} />
              )}
              {activeTab === "loyalty" && (
                <BizLoyaltySettings businessId={business?.id} />
              )}
              {activeTab === "performance" && business && (
                <BizChurnSentinel businessId={business.id} />
              )}
              {activeTab === "inventory" && business && (
                <BizInventory businessId={business.id} />
              )}
              {activeTab === "settings" && business && (
                <BizSettingsTab businessId={business.id} />
              )}
              {activeTab === "premium" && business && (
                <BizPremiumHub business={business} onUpdate={loadData} />
              )}
              {activeTab === "staff-performance" && business && (
                <StaffPerformance businessId={business.id} appointments={appointments} staff={staff} reviews={reviews} />
              )}
              {activeTab === "portfolio" && business && (
                <BizPortfolio businessId={business.id} />
              )}
              {activeTab === "support" && business && (
                <BizSupport businessId={business.id} />
              )}
              {activeTab === "notifications" && business && (
                <BizNotifications />
              )}
              {activeTab === "analytics" && business && (
                <BizAdvancedAnalytics businessId={business.id} />
              )}
              {activeTab === "coupons" && business && (
                <BizCoupons businessId={business.id} />
              )}
              </VerificationGuard>
           </div>
        </div>
      </main>

      <BizAiAdvisor 
         businessName={business?.name || "İşletme"}
         stats={stats}
         services={services}
         staff={staff}
       />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </div>
  );
}
