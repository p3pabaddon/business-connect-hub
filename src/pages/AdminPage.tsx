import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/lib/supabase";
import { getAdminSystemStats } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/layout/Logo";
import {
  Building2, Users, Calendar, TrendingUp,
  FileText, LayoutDashboard,
  Bell, LogOut, Menu, X, ScrollText, Settings,
  Search, RefreshCw, Wallet, Ban, Megaphone, LifeBuoy
} from "lucide-react";

// Admin Tab Components
import { AdminOverview } from "@/components/admin/tabs/AdminOverview";
import { ModerationList } from "@/components/admin/tabs/ModerationList";
import { BusinessManager } from "@/components/admin/tabs/BusinessManager";
import { CustomerManager } from "@/components/admin/tabs/CustomerManager";
import { BanList } from "@/components/admin/tabs/BanList";
import { AppointmentList } from "@/components/admin/tabs/AppointmentList";
import { AnnouncementManager } from "@/components/admin/tabs/AnnouncementManager";
import { FinancePanel } from "@/components/admin/tabs/FinancePanel";
import { SystemHealth } from "@/components/admin/tabs/SystemHealth";
import { AuditLogs } from "@/components/admin/tabs/AuditLogs";
import { SystemSettings } from "@/components/admin/tabs/SystemSettings";
import { AdminSupport } from "@/components/admin/AdminSupport";

const navigation = [
  { name: "Dashboard", id: "overview", icon: LayoutDashboard },
  { name: "Başvurular", id: "moderation", icon: FileText, badge: true },
  { name: "İşletmeler", id: "businesses", icon: Building2 },
  { name: "Müşteriler", id: "customers", icon: Users },
  { name: "Kara Liste", id: "banlist", icon: Ban },
  { name: "Randevular", id: "appointments", icon: Calendar },
  { name: "Duyurular", id: "announcements", icon: Megaphone },
  { name: "Finans", id: "finans", icon: Wallet },
  { name: "Sistem Sağlığı", id: "system", icon: TrendingUp },
  { name: "Destek Talepleri", id: "support", icon: LifeBuoy, badge: true },
  { name: "Loglar", id: "logs", icon: ScrollText },
  { name: "Ayarlar", id: "settings", icon: Settings },
];

const AdminPage = () => {
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [supportCount, setSupportCount] = useState(0);

  // Data States
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalBusinesses: 0,
    totalUsers: 0,
    totalAppointments: 0,
    totalRevenue: 0,
  });

  // Settings State
  const [settingsPlatformName, setSettingsPlatformName] = useState("RandevuDunyasi");
  const [settingsSupportEmail, setSettingsSupportEmail] = useState("info@randevudunyasi.com");
  const [settingsNoShowLimit, setSettingsNoShowLimit] = useState(3);
  const [settingsMfa, setSettingsMfa] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Moderation State
  const [selectedPending, setSelectedPending] = useState<Set<string>>(new Set());

  // Ban State
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  const [banPhone, setBanPhone] = useState("");
  const [banReason, setBanReason] = useState("");

  // Announcements State
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [announcementTarget, setAnnouncementTarget] = useState<"all" | "businesses" | "customers">("all");
  const [announcementHistory, setAnnouncementHistory] = useState<any[]>([]);
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  // AI Trust Score State
  const [aiScores, setAiScores] = useState<Record<string, { score: number; reasons: string[] }>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  // Onboarding State
  const [onboardingSending, setOnboardingSending] = useState<string | null>(null);

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminData();
    }
  }, [user, isAdmin, authLoading]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const stats = await getAdminSystemStats();
      setSystemStats(stats);

      const { data: bData } = await supabase
        .from("businesses")
        .select("*, appointments(count)")
        .order("created_at", { ascending: false })
        .limit(100);
      
      const { data: aData } = await supabase
        .from("appointments")
        .select("*, business:businesses(name)")
        .order("appointment_date", { ascending: false })
        .limit(100);

      const { data: logs, error: logError } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      setAuditLogs(logError ? [] : (logs || []));
      setBusinesses(bData || []);
      setAppointments(aData || []);

      const { data: bans } = await supabase.from("banned_users").select("*").order("created_at", { ascending: false }).limit(100);
      setBannedUsers(bans || []);

      const { data: anns } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(50);
      setAnnouncementHistory(anns || []);

      const { data: sData } = await supabase.from("system_settings").select("*").limit(1).single();
      if (sData) {
        setSettingsPlatformName(sData.platform_name || "RandevuDunyasi");
        setSettingsSupportEmail(sData.support_email || "info@randevudunyasi.com");
        setSettingsNoShowLimit(sData.no_show_limit ?? 3);
        setSettingsMfa(sData.mfa_required ?? true);
      }

      const { data: pData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setProfiles(pData || []);

      const { count: sCount } = await supabase.from("support_tickets").select("*", { count: 'exact', head: true }).eq("status", "open");
      setSupportCount(sCount || 0);

    } catch (err) {
      console.error("Admin data load error:", err);
      toast({ title: "Veriler yüklenemedi", variant: "destructive" });
    }
    setLoading(false);
  };

  const updateBusinessStatus = async (bizId: string, info: { status?: string, is_active?: boolean }) => {
    const { error } = await supabase
      .from("businesses")
      .update(info)
      .eq("id", bizId);
    
    if (error) {
      toast({ title: "İşlem başarısız", variant: "destructive" });
    } else {
      toast({ title: "Başarıyla güncellendi" });
      loadAdminData();
    }
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    const { error } = await supabase.from("system_settings").upsert({
      id: "global",
      platform_name: settingsPlatformName,
      support_email: settingsSupportEmail,
      no_show_limit: settingsNoShowLimit,
      mfa_required: settingsMfa,
      updated_at: new Date().toISOString(),
    });
    setSettingsSaving(false);
    toast({ title: error ? "Ayarlar kaydedilemedi" : "Ayarlar başarıyla kaydedildi", variant: error ? "destructive" : undefined });
  };

  const togglePendingSelect = (id: string) => {
    setSelectedPending(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkAction = async (action: "approve" | "reject") => {
    const info = action === "approve" ? { status: "active", is_active: true } : { status: "rejected", is_active: false };
    for (const id of selectedPending) {
      await supabase.from("businesses").update(info).eq("id", id);
    }
    setSelectedPending(new Set());
    toast({ title: `${selectedPending.size} işletme ${action === "approve" ? "onaylandı" : "reddedildi"}` });
    loadAdminData();
  };

  const banUser = async () => {
    if (!banPhone.trim()) return;
    const { error } = await supabase.from("banned_users").insert({
      phone: banPhone.trim(),
      reason: banReason.trim() || "Belirtilmedi",
      banned_by: user?.email,
    });
    if (!error) {
      setBanPhone(""); 
      setBanReason("");
      toast({ title: "Kullanıcı kara listeye eklendi" });
      loadAdminData();
    } else {
      toast({ title: "Eklenemedi", variant: "destructive" });
    }
  };

  const unbanUser = async (id: string) => {
    await supabase.from("banned_users").delete().eq("id", id);
    toast({ title: "Kara listeden kaldırıldı" });
    loadAdminData();
  };

  const sendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementBody.trim()) return;
    setSendingAnnouncement(true);
    const { error } = await supabase.from("announcements").insert({
      title: announcementTitle,
      body: announcementBody,
      target: announcementTarget,
      sent_by: user?.email,
    });
    setSendingAnnouncement(false);
    if (!error) {
      setAnnouncementTitle(""); 
      setAnnouncementBody("");
      toast({ title: "Duyuru başarıyla gönderildi" });
      loadAdminData();
    } else {
      toast({ title: "Gönderilemedi", variant: "destructive" });
    }
  };

  const calculateAiScore = (biz: any) => {
    setAiLoading(biz.id);
    setTimeout(() => {
      let score = 50;
      const reasons: string[] = [];
      if (biz.email && biz.email.includes("@")) { score += 10; reasons.push("Geçerli e-posta formatı"); }
      else { score -= 10; reasons.push("E-posta eksik veya geçersiz"); }
      if (biz.phone && biz.phone.length >= 10) { score += 10; reasons.push("Telefon numarası mevcut"); }
      else { score -= 5; reasons.push("Telefon numarası eksik"); }
      if (biz.address && biz.address.length > 10) { score += 10; reasons.push("Adres detaylı"); }
      else { reasons.push("Adres kısa veya eksik"); }
      if (biz.description && biz.description.length > 30) { score += 10; reasons.push("Açıklama yeterli"); }
      else { score -= 5; reasons.push("Açıklama yetersiz"); }
      if (biz.city) { score += 5; reasons.push("Şehir belirtilmiş"); }
      if (biz.category) { score += 5; reasons.push("Kategori seçilmiş"); }
      score = Math.max(0, Math.min(100, score));
      setAiScores(prev => ({ ...prev, [biz.id]: { score, reasons } }));
      setAiLoading(null);
    }, 800);
  };

  const sendOnboardingLink = async (biz: any) => {
    setOnboardingSending(biz.id);
    const { error } = await supabase.from("audit_logs").insert({
      action: "Onboarding daveti gönderildi",
      details: `${biz.name} işletmesine (${biz.email}) hoş geldin davetiyesi tetiklendi.`,
      performed_by: user?.email,
    });
    setTimeout(() => {
      setOnboardingSending(null);
      toast({ title: `${biz.name} için davetiye gönderildi!` });
      loadAdminData();
    }, 1000);
  };

  const combinedCustomerData = useMemo(() => {
    return profiles.map(profile => {
      const userApps = appointments.filter(a => a.customer_phone === profile.phone || a.customer_email === profile.email);
      const totalSpent = userApps.reduce((acc, app) => acc + (Number(app.total_price) || 0), 0);
      const noShows = userApps.filter(a => a.status === 'no_show').length;

      return {
        ...profile,
        appointmentsCount: userApps.length,
        noShows,
        totalSpent
      };
    });
  }, [profiles, appointments]);

  const filteredCustomers = combinedCustomerData.filter(c => 
    (c.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.phone?.includes(searchTerm)) || 
    (c.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingCount = businesses.filter(b => b.status === "pending" || !b.status).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">Sistem Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEOHead title="Admin Dashboard | RandevuDunyasi" />
      
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transition-transform duration-300 lg:static lg:translate-x-0",
          !sidebarOpen && "-translate-x-full"
        )}>
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center px-6 border-b border-border">
              <Logo className="flex-1" />
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 p-4 overflow-y-auto scrollbar-hide">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl",
                    activeTab === item.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 italic" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                  {item.badge && item.id === "moderation" && pendingCount > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full ring-2 ring-card">{pendingCount}</span>
                  )}
                  {item.badge && item.id === "support" && supportCount > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full ring-2 ring-card">{supportCount}</span>
                  )}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-border">
              <Button 
                variant="ghost" 
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-rose-500 rounded-xl"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" /> ÇIKIŞ YAP
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/20">
          <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-card border-b border-border/50 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="hidden sm:flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                <h1 className="text-sm font-black uppercase tracking-widest italic text-foreground">Sistem Kontrol Paneli</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Hızlı arama..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 bg-muted/50 border-border group-focus-within:bg-card transition-all h-9 rounded-xl pl-9 text-xs" 
                />
              </div>
              <ThemeToggle />
              <div className="h-8 w-[1px] bg-border/50" />
              <div className="flex items-center gap-3 pl-2">
                <div className="hidden lg:block text-right">
                  <p className="text-[10px] font-black uppercase text-foreground leading-none">{user?.email?.split('@')[0]}</p>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-tighter mt-1">Super Admin</p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20 p-0.5 rounded-xl">
                  <AvatarFallback className="bg-primary/10 text-primary font-black text-xs rounded-lg uppercase">SA</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">
              {activeTab === "overview" && (
                <AdminOverview systemStats={systemStats} businesses={businesses} pendingCount={pendingCount} />
              )}

              {activeTab === "moderation" && (
                <ModerationList 
                  businesses={businesses} 
                  selectedPending={selectedPending}
                  togglePendingSelect={togglePendingSelect}
                  bulkAction={bulkAction}
                  updateBusinessStatus={updateBusinessStatus}
                  calculateAiScore={calculateAiScore}
                  sendOnboardingLink={sendOnboardingLink}
                  aiScores={aiScores}
                  aiLoading={aiLoading}
                  onboardingSending={onboardingSending}
                />
              )}

              {activeTab === "businesses" && (
                <BusinessManager businesses={businesses} searchTerm={searchTerm} updateBusinessStatus={updateBusinessStatus} />
              )}

              {activeTab === "customers" && (
                <CustomerManager customers={filteredCustomers} />
              )}

              {activeTab === "banlist" && (
                <BanList 
                  banPhone={banPhone}
                  setBanPhone={setBanPhone}
                  banReason={banReason}
                  setBanReason={setBanReason}
                  banUser={banUser}
                  bannedUsers={bannedUsers}
                  unbanUser={unbanUser}
                />
              )}

              {activeTab === "appointments" && (
                <AppointmentList appointments={appointments} />
              )}

              {activeTab === "announcements" && (
                <AnnouncementManager 
                  announcementTitle={announcementTitle}
                  setAnnouncementTitle={setAnnouncementTitle}
                  announcementBody={announcementBody}
                  setAnnouncementBody={setAnnouncementBody}
                  announcementTarget={announcementTarget}
                  setAnnouncementTarget={setAnnouncementTarget}
                  sendAnnouncement={sendAnnouncement}
                  sendingAnnouncement={sendingAnnouncement}
                  announcementHistory={announcementHistory}
                />
              )}

              {activeTab === "finans" && (
                <FinancePanel systemStats={systemStats} businesses={businesses} />
              )}

              {activeTab === "system" && (
                <SystemHealth />
              )}

              {activeTab === "settings" && (
                <SystemSettings 
                  settingsPlatformName={settingsPlatformName}
                  setSettingsPlatformName={setSettingsPlatformName}
                  settingsSupportEmail={settingsSupportEmail}
                  setSettingsSupportEmail={setSettingsSupportEmail}
                  settingsNoShowLimit={settingsNoShowLimit}
                  setSettingsNoShowLimit={setSettingsNoShowLimit}
                  settingsMfa={settingsMfa}
                  setSettingsMfa={setSettingsMfa}
                  saveSettings={saveSettings}
                  settingsSaving={settingsSaving}
                />
              )}

              {activeTab === "logs" && (
                <AuditLogs auditLogs={auditLogs} />
              )}

              {activeTab === "support" && (
                <AdminSupport />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
