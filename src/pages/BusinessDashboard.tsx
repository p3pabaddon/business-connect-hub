import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { BizPageEditor } from "@/components/biz/BizPageEditor";
import { Loader2, Bell, Search, UserCircle, Settings, Menu, Building2, LayoutDashboard, LogOut, ExternalLink, MessageSquare, Calendar, ShoppingBag, Users, LifeBuoy, Home } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/layout/Logo";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const playNotificationSound = () => {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.play().catch(() => {});
};

type BizTab = "overview" | "calendar" | "crm" | "marketing" | "performance" | "catalog" | "reviews" | "settings" | "waitlist" | "loyalty" | "inventory" | "premium" | "staff-performance" | "analytics" | "portfolio" | "support" | "coupons" | "notifications" | "page-editor";

export default function BusinessDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as BizTab;
  const dateParam = searchParams.get('date');
  const aptIdParam = searchParams.get('aptId');
  
  const [activeTab, setActiveTab] = useState<BizTab>(tabParam || "overview");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [searchQuery, setSearchQuery] = useState("");

  const premiumTabs = [
    "waitlist", "performance", "staff-performance", "analytics", 
    "inventory", "coupons", "loyalty", "marketing", 
    "portfolio", "page-editor", "notifications"
  ];

  const { data: business, isLoading: loading, refetch: reloadBusiness } = useMyBusiness();

  useEffect(() => {
    if (business && !business.is_premium && premiumTabs.includes(activeTab)) {
      setActiveTab("premium");
      toast.info("Bu özellik Premium pakete dahildir. Avantajlar sayfasından yükseltme yapabilirsiniz.");
    }
  }, [activeTab, business]);

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam, activeTab]);
  
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

  const globalNotifChannelRef = useRef<any>(null);
  const bizAptChannelRef = useRef<any>(null);

  useEffect(() => {
    if (user?.id) {
      if (globalNotifChannelRef.current) {
        supabase.removeChannel(globalNotifChannelRef.current);
      }

      const chanId = `gl-notif-${user.id}-${Math.random().toString(36).slice(2, 10)}`;
      globalNotifChannelRef.current = supabase
        .channel(chanId)
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
        if (globalNotifChannelRef.current) {
          supabase.removeChannel(globalNotifChannelRef.current);
          globalNotifChannelRef.current = null;
        }
      };
    }
  }, [user?.id]);

  useEffect(() => {
    if (business?.id) {
      if (bizAptChannelRef.current) {
        supabase.removeChannel(bizAptChannelRef.current);
      }

      const chanId = `biz-apt-${business.id}-${Math.random().toString(36).slice(2, 10)}`;
      bizAptChannelRef.current = supabase
        .channel(chanId)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'appointments', filter: `business_id=eq.${business.id}` },
          () => {
            loadData();
          }
        )
        .subscribe();

      return () => {
        if (bizAptChannelRef.current) {
          supabase.removeChannel(bizAptChannelRef.current);
          bizAptChannelRef.current = null;
        }
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
          
          {window.location.hostname === "localhost" && (
            <div className="mt-8 pt-8 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-4">
                Test Modu: Geliştirici Seçenekleri
              </p>
              <Button 
                variant="secondary" 
                className="w-full bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                onClick={async () => {
                  try {
                    await supabase.from("businesses").update({ status: 'approved', is_active: true }).eq("id", business.id);
                    toast.success("İşletme anında onaylandı! (Test Modu)");
                    reloadBusiness();
                  } catch (e) {
                    toast.error("Hata oluştu");
                  }
                }}
              >
                İşletmeyi Anında Onayla
              </Button>
            </div>
          )}
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
        isPremium={business?.is_premium}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <header className="sticky top-0 h-16 md:h-20 border-b border-border px-4 md:px-8 flex items-center justify-between bg-background/80 backdrop-blur-xl z-30 transition-all duration-300">
         <div className="flex items-center gap-3 md:gap-6 flex-1">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 bg-muted/50 hover:bg-muted border border-border rounded-xl transition-all lg:hidden active:scale-95 shadow-sm"
            >
              <Menu className="w-4 h-4 text-foreground" />
            </button>
            <button 
              onClick={() => navigate("/")}
              className="p-2.5 bg-muted/50 hover:bg-muted border border-border rounded-xl transition-all lg:hidden active:scale-95 shadow-sm"
              title="Ana Sayfaya Dön"
            >
              <Home className="w-4 h-4 text-foreground" />
            </button>
             <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-muted-foreground">
                <Logo className="h-9 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab("overview")} />
                <div className="h-6 w-px bg-border mx-2"></div>
                <button 
                  onClick={() => setActiveTab("overview")}
                  className="text-muted-foreground uppercase tracking-widest font-black opacity-40 hover:opacity-100 transition-opacity"
                >
                  Kontrol Merkezi
                </button>
                <span className="text-muted-foreground/30 mx-2 text-lg">/</span>
                <span className="text-primary capitalize font-bold bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">{activeTab}</span>
             </div>
             <div className="relative flex-1 max-w-[120px] sm:max-w-xs group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors z-20" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-muted/50 border-border pl-9 h-10 text-[10px] md:h-11 md:text-xs focus:ring-primary/20 transition-all relative z-10 rounded-xl" 
                  placeholder="Ara..." 
                />
                  
                  {searchQuery.length > 1 && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="p-3 border-b border-border bg-muted/30">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Arama Sonuçları</p>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {customers.filter((c: any) => 
                          (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.phone || "").includes(searchQuery)
                        ).slice(0, 5).map((c: any) => (
                          <div 
                            key={c.phone}
                            onClick={() => { setActiveTab("crm"); setSearchQuery(""); }}
                            className="w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors text-left group cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase border border-primary/20">
                              {(c.name || "M")[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{c.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono opacity-60 font-bold">{c.phone}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
               </div>
           </div>

           <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab("notifications");
                }}
                className="relative p-2.5 bg-muted/50 border border-border rounded-xl hover:bg-muted transition-all duration-200 group flex items-center justify-center cursor-pointer z-[60]"
              >
                 <Bell className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background pointer-events-none shadow-sm"></span>
              </button>

              <div className="hidden md:block h-6 w-[1px] bg-border mx-2"></div>

               <button 
                 onClick={() => navigate("/")}
                 className="hidden md:flex items-center gap-2 p-1.5 px-3 bg-muted/50 border border-border rounded-xl hover:bg-muted transition-colors group"
               >
                  <LayoutDashboard className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Panel</span>
               </button>

                <button 
                  onClick={async () => { await signOut(); navigate("/"); }}
                  className="hidden md:flex items-center gap-2 p-1 bg-muted/50 border border-border rounded-xl hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20 group-hover:bg-rose-500/20 group-hover:border-rose-500/20 shadow-sm">
                     <LogOut className="w-4 h-4 text-primary group-hover:text-rose-500" />
                  </div>
                </button>
             </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-10 pb-10 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.03),transparent_40%)]">
           <div className="max-w-[1600px] mx-auto">
              <VerificationGuard>
              {activeTab === "overview" && stats && (
                 <BizOverview stats={stats} recentApts={appointments} inventory={inventory} isPremium={business?.is_premium} />
              )}
              {activeTab === "calendar" && (
                 <BizCalendar 
                   appointments={appointments} 
                   staff={staff} 
                   onRefresh={loadData}
                   initialDate={dateParam || undefined}
                   initialAptId={aptIdParam || undefined}
                 />
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
                 <BizCatalog 
                   businessId={business?.id} 
                   services={services} 
                   staff={staff} 
                   personnelLimit={business?.is_premium ? 999 : (business?.personnel_limit || 2)} 
                   onRefresh={loadData} 
                 />
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
                 <BizPortfolio businessId={business.id} businessSlug={business.slug} />
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
              {activeTab === "page-editor" && business && (
                 <BizPageEditor business={business} onUpdate={loadData} />
              )}
              </VerificationGuard>
           </div>
        </div>
      </main>

      {business?.is_premium && (
        <BizAiAdvisor 
          businessName={business?.name || "İşletme"}
          stats={stats}
          services={services}
          staff={staff}
        />
      )}

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
