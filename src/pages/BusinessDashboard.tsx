import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getMyBusiness, getBusinessAppointments } from "@/lib/api";
import { getBizAnalytics, BizStats } from "@/lib/biz-api";
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
import { SEOHead } from "@/components/SEOHead";
import { Loader2, Bell, Search, UserCircle, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type BizTab = "overview" | "calendar" | "crm" | "marketing" | "performance" | "catalog" | "reviews" | "settings" | "waitlist" | "loyalty" | "inventory" | "premium";

export default function BusinessDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BizTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  
  const [business, setBusiness] = useState<any>(null);
  const [stats, setStats] = useState<BizStats | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/giris");
    if (user) loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const biz = await getMyBusiness();
      if (!biz) {
        navigate("/isletme-basvuru");
        return;
      }
      setBusiness(biz);

      const [bizData, servicesRes, staffRes, reviewsRes] = await Promise.all([
        getBizAnalytics(biz.id),
        supabase.from("services").select("*").eq("business_id", biz.id),
        supabase.from("staff").select("*").eq("business_id", biz.id),
        supabase.from("reviews").select("*").eq("business_id", biz.id).order("created_at", { ascending: false }),
        supabase.from("inventory").select("*").eq("business_id", biz.id)
      ]);

      if (bizData) {
        setStats(bizData.kpis);
        setCustomers(bizData.customers);
        setAppointments(bizData.recentAppointments);
      }
      setServices(servicesRes.data || []);
      setStaff(staffRes.data || []);
      setReviews(reviewsRes.data || []);
      
      const { data: invData } = await supabase.from("inventory").select("*").eq("business_id", biz.id);
      setInventory(invData || []);

    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">Yönetici Erişimi Doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex overflow-hidden font-sans selection:bg-primary/30">
      <SEOHead title={`${business?.name || "İşletme"} | Yönetim Paneli`} />
      
      <BizSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
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
        <header className="h-16 lg:h-20 border-b border-slate-800/10 px-4 lg:px-8 flex items-center justify-between bg-[#020617]/50 backdrop-blur-md relative z-10">
           <div className="flex items-center gap-3 lg:gap-6 flex-1">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5 text-slate-500" />
              </button>
              <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500">
                 <span className="text-slate-600">Yönetim Paneli</span>
                 <span className="text-slate-700">/</span>
                 <span className="text-primary capitalize">{activeTab}</span>
              </div>
              <div className="relative flex-1 max-w-xs hidden sm:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <Input className="bg-slate-900/30 border-slate-800/50 pl-9 h-9 text-xs" placeholder="Hızlı ara..." />
              </div>
           </div>

           <div className="flex items-center gap-2 lg:gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-3 py-1 rounded-full">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Sistem Aktif</span>
              </div>
              
              <button className="relative p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors group">
                 <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400 group-hover:text-primary transition-colors" />
                 <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full border-2 border-[#020617]"></span>
              </button>

              <div className="h-6 w-[1px] bg-slate-800 mx-1 lg:mx-2"></div>

              <button className="flex items-center gap-2 p-1 lg:p-1.5 lg:pr-4 bg-slate-900 border border-slate-800 rounded-xl lg:rounded-2xl hover:bg-slate-800 transition-colors group">
                 <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                    <UserCircle className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                 </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-[10px] font-bold text-white uppercase tracking-tighter leading-none">Yönetim</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-1">Premium İşletme</p>
                  </div>
              </button>
           </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-10 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.03),transparent_40%)]">
           <div className="max-w-[1600px] mx-auto">
              
              {/* Tab Rendering */}
              {activeTab === "overview" && stats && (
                <BizOverview 
                  stats={stats} 
                  recentApts={appointments} 
                  inventory={inventory}
                />
              )}
              
              {activeTab === "calendar" && (
                <BizCalendar 
                  appointments={appointments} 
                  onRefresh={loadData}
                />
              )}

              {activeTab === "crm" && (
                <BizCRM 
                  businessId={business?.id}
                  customers={customers} 
                />
              )}

              {activeTab === "marketing" && (
                <BizMarketing 
                  businessId={business?.id}
                  onRefresh={loadData}
                />
              )}

              {activeTab === "reviews" && (
                <BizReviews 
                  reviews={reviews} 
                  onRefresh={loadData} 
                />
              )}

              {activeTab === "catalog" && (
                <BizCatalog 
                  businessId={business?.id}
                  services={services} 
                  staff={staff} 
                  personnelLimit={business?.personnel_limit || 2}                  onRefresh={loadData}
                />
              )}

              {activeTab === "loyalty" && (
                <BizLoyaltySettings 
                  businessId={business?.id}
                />
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

           </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}} />
    </div>
  );
}
