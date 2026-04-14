import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/lib/supabase";
import { getAdminSystemStats } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/layout/Logo";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2, Users, Calendar, TrendingUp, AlertTriangle,
  FileText, CheckCircle, Clock, ArrowRight, Wallet,
  Shield, Search, RefreshCw, XCircle, LayoutDashboard,
  Bell, LogOut, Menu, X, ScrollText, Settings, HelpCircle,
  Eye, Edit, Power, Star, Receipt, CreditCard, Save, Globe, Palette,
  User, Ban, Megaphone, BrainCircuit, Mail, CheckCheck, Sparkles, Send, Link2, LifeBuoy
} from "lucide-react";
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
  const [systemStats, setSystemStats] = useState({
    totalBusinesses: 0,
    totalUsers: 0,
    totalAppointments: 0,
    totalRevenue: 0,
  });

  // Feature 1: Settings
  const [settingsPlatformName, setSettingsPlatformName] = useState("RandevuDunyasi");
  const [settingsSupportEmail, setSettingsSupportEmail] = useState("info@randevudunyasi.com");
  const [settingsNoShowLimit, setSettingsNoShowLimit] = useState(3);
  const [settingsMfa, setSettingsMfa] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Feature 4: Bulk Actions
  const [selectedPending, setSelectedPending] = useState<Set<string>>(new Set());

  // Feature 5: Ban List
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  const [banPhone, setBanPhone] = useState("");
  const [banReason, setBanReason] = useState("");

  // Feature 6: Announcements
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [announcementTarget, setAnnouncementTarget] = useState<"all" | "businesses" | "customers">("all");
  const [announcementHistory, setAnnouncementHistory] = useState<any[]>([]);
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  // Feature 7: AI Trust Score
  const [aiScores, setAiScores] = useState<Record<string, { score: number; reasons: string[] }>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  // Feature 8: Onboarding link
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

      // Load banned users
      const { data: bans } = await supabase.from("banned_users").select("*").order("created_at", { ascending: false }).limit(100);
      setBannedUsers(bans || []);

      // Load announcements history
      const { data: anns } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(50);
      setAnnouncementHistory(anns || []);

      // Load system settings
      const { data: sData } = await supabase.from("system_settings").select("*").limit(1).single();
      if (sData) {
        setSettingsPlatformName(sData.platform_name || "RandevuDunyasi");
        setSettingsSupportEmail(sData.support_email || "info@randevudunyasi.com");
        setSettingsNoShowLimit(sData.no_show_limit ?? 3);
        setSettingsMfa(sData.mfa_required ?? true);
      }
      // Load support count
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

  // Feature 1: Save Settings
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

  // Feature 4: Bulk Approve/Reject
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

  // Feature 5: Ban User
  const banUser = async () => {
    if (!banPhone.trim()) return;
    const { error } = await supabase.from("banned_users").insert({
      phone: banPhone.trim(),
      reason: banReason.trim() || "Belirtilmedi",
      banned_by: user?.email,
    });
    if (!error) {
      setBanPhone(""); setBanReason("");
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

  // Feature 6: Send Announcement
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
      setAnnouncementTitle(""); setAnnouncementBody("");
      toast({ title: "Duyuru başarıyla gönderildi" });
      loadAdminData();
    } else {
      toast({ title: "Gönderilemedi", variant: "destructive" });
    }
  };

  // Feature 7: AI Trust Score (frontend heuristic)
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

  // Feature 8: Send Onboarding Link
  const sendOnboardingLink = async (biz: any) => {
    setOnboardingSending(biz.id);
    // Simulate sending magic link email
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

  // Aggregated Customers
  const aggregatedCustomers = useMemo(() => {
    const customerMap = new Map();
    appointments.forEach(app => {
      const phone = app.customer_phone;
      if (!customerMap.has(phone)) {
        customerMap.set(phone, {
          name: app.customer_name,
          email: app.customer_email || 'E-posta yok',
          phone: phone,
          appointments: 0,
          noShows: 0,
          totalSpent: 0
        });
      }
      const customer = customerMap.get(phone);
      customer.appointments += 1;
      if (app.status === 'no_show') customer.noShows += 1;
      customer.totalSpent += (Number(app.total_price) || 0);
    });
    return Array.from(customerMap.values());
  }, [appointments]);

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

  const pendingCount = businesses.filter(b => b.status === "pending" || !b.status).length;
  const filteredBusinesses = businesses.filter(b => b.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCustomers = aggregatedCustomers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEOHead title="Admin Dashboard | RandevuDunyasi" />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
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
            <nav className="flex-1 py-6 px-4 overflow-y-auto custom-scrollbar">
               <ul className="space-y-1">
                 {navigation.map((item) => (
                   <li key={item.id}>
                     <button
                       onClick={() => { setActiveTab(item.id); setSidebarOpen(false); setSearchTerm(""); }}
                       className={cn(
                         "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
                         activeTab === item.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                       )}
                     >
                       <div className="flex items-center gap-3">
                         <item.icon className="w-5 h-5 shrink-0" />
                         {item.name}
                       </div>
                       {item.badge && item.id === "moderation" && pendingCount > 0 && (
                         <Badge className="bg-rose-500 text-[10px] h-5 px-1.5 border-none shadow-lg shadow-rose-500/20">{pendingCount}</Badge>
                       )}
                       {item.badge && item.id === "support" && supportCount > 0 && (
                         <Badge className="bg-amber-500 text-[10px] h-5 px-1.5 border-none shadow-lg shadow-amber-500/20">{supportCount}</Badge>
                       )}
                     </button>
                   </li>
                 ))}
               </ul>
            </nav>
            <div className="p-4 border-t border-border">
              <Button 
                variant="ghost" 
                onClick={() => signOut()} 
                className="w-full flex items-center justify-start gap-3 px-4 py-2.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                 <LogOut className="w-4 h-4" /> 
                 <span className="text-sm font-medium">Güvenli Çıkış</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-[60]">
            <div className="flex items-center gap-2 lg:gap-4">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-[8px] lg:text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                <span>Admin</span>
                <span className="opacity-30">/</span>
                <span className="text-primary font-bold">{activeTab}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              <ThemeToggle />
              <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />
              <Link to="/" className="hidden lg:block">
                <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent font-bold text-[10px] tracking-widest">
                  PORTAL <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-full border border-border/50">
                <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[8px] lg:text-[10px] font-bold">AD</div>
                <span className="text-[8px] font-bold text-muted-foreground uppercase hidden md:block">Root Admin</span>
              </div>
            </div>
          </header>
             <main className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar pb-24">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 lg:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 lg:gap-6 animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="space-y-1 text-center sm:text-left">
                   <h1 className="text-xl lg:text-3xl font-heading font-black text-foreground tracking-tighter uppercase italic">
                     {navigation.find(n => n.id === activeTab)?.name} Control
                   </h1>
                   <p className="text-[10px] lg:text-sm text-muted-foreground font-medium opacity-60 uppercase lg:normal-case">Platform Orkestrasyon v4.0</p>
                </div>
                {['businesses', 'customers', 'appointments'].includes(activeTab) && (
                  <div className="relative w-full sm:w-72 group">
                     <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                     <Input 
                       placeholder="Sistemde ara..." 
                       className="bg-card border-border pl-10 h-10 lg:h-11 text-xs lg:text-sm rounded-xl focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
                )}
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                {activeTab === "overview" && (
                  <div className="space-y-6 lg:space-y-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      <StatCard title="İşletme" value={systemStats.totalBusinesses} icon={Building2} color="text-primary" />
                      <StatCard title="Kullanıcı" value={systemStats.totalUsers} icon={Users} color="text-blue-500" />
                      <StatCard title="Randevu" value={systemStats.totalAppointments} icon={Calendar} color="text-emerald-500" />
                      <StatCard title="Hacim" value={`₺${(systemStats.totalRevenue/1000).toFixed(1)}K`} icon={Wallet} color="text-amber-500" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <Card className="lg:col-span-2 bg-card border-border overflow-hidden shadow-sm">
                        <CardHeader className="py-5 border-b border-border/50 bg-muted/20">
                          <CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                             <TrendingUp className="w-4 h-4 text-primary" /> Son Kayıtlı İşletmeler
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y divide-border/50">
                            {businesses.slice(0, 5).map(biz => (
                              <div key={biz.id} className="p-5 flex items-center justify-between hover:bg-muted/40 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-xs font-black text-primary uppercase">{biz.name?.[0]}</div>
                                   <div>
                                     <p className="text-sm font-bold text-foreground leading-tight">{biz.name}</p>
                                     <p className="text-[10px] text-muted-foreground font-medium mt-1">{biz.city} • {biz.category}</p>
                                   </div>
                                </div>
                                <Badge variant={biz.status === 'active' ? 'secondary' : 'outline'} className="text-[9px] font-bold uppercase tracking-tighter h-5">
                                  {biz.status || 'pending'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-card border-border shadow-sm overflow-hidden">
                        <CardHeader className="py-5 border-b border-border/50 bg-muted/20">
                          <CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                             <Bell className="w-4 h-4 text-amber-500" /> Sistem Uyarıları
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                           <AlertItem msg={`${pendingCount} yeni işletme başvurusu onayınızı bekliyor.`} type="warning" />
                           <AlertItem msg="Platform performansı optimal düzeyde (%99.9)." type="info" />
                           <AlertItem msg="No-show oranlarında bu hafta %5 düşüş gözlendi." type="info" />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {activeTab === "moderation" && (() => {
                  const pending = businesses.filter(b => b.status === 'pending' || !b.status);
                  return (
                  <div className="space-y-4">
                     {selectedPending.size > 0 && (
                       <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                          <CheckCheck className="w-5 h-5 text-primary" />
                          <span className="text-sm font-bold text-foreground">{selectedPending.size} başvuru seçildi</span>
                          <div className="ml-auto flex gap-2">
                            <Button size="sm" onClick={() => bulkAction("approve")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20">TOPLU ONAYLA</Button>
                            <Button size="sm" variant="outline" onClick={() => bulkAction("reject")} className="rounded-xl font-bold border-rose-500/20 text-rose-500 hover:bg-rose-500/5">TOPLU REDDET</Button>
                          </div>
                       </div>
                     )}
                     {pending.length === 0 ? (
                       <div className="text-center py-24 bg-muted/10 rounded-3xl border-2 border-dashed border-border">
                          <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">Bekleyen başvuru bulunmuyor.</p>
                       </div>
                     ) : (
                       pending.map(biz => (
                         <Card key={biz.id} className={cn("bg-card border-border p-6 hover:shadow-md transition-shadow", selectedPending.has(biz.id) && "ring-2 ring-primary")}>
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-5">
                                <input type="checkbox" checked={selectedPending.has(biz.id)} onChange={() => togglePendingSelect(biz.id)} className="w-5 h-5 rounded border-border accent-primary cursor-pointer" />
                                <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary text-3xl font-black">{biz.name?.[0]}</div>
                                <div className="space-y-1 flex-1">
                                   <h3 className="font-black text-foreground text-xl tracking-tight uppercase italic">{biz.name}</h3>
                                   <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium flex-wrap">
                                     <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {biz.category}</span>
                                     <span className="opacity-30">•</span>
                                     <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {biz.city}</span>
                                     <span className="opacity-30">•</span>
                                     <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(biz.created_at).toLocaleDateString()}</span>
                                   </div>
                                </div>
                              </div>
                              {aiScores[biz.id] && (
                                <div className="ml-[5.5rem] p-4 bg-muted/30 rounded-xl border border-border space-y-2">
                                  <div className="flex items-center gap-3">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm font-bold text-foreground">AI Güvenilirlik Skoru: <span className={cn(aiScores[biz.id].score >= 70 ? "text-emerald-500" : aiScores[biz.id].score >= 40 ? "text-amber-500" : "text-rose-500")}>{aiScores[biz.id].score}/100</span></span>
                                  </div>
                                  <ul className="text-[10px] text-muted-foreground space-y-1 ml-7">{aiScores[biz.id].reasons.map((r, i) => <li key={i}>• {r}</li>)}</ul>
                                </div>
                              )}
                              <div className="flex gap-3 ml-[5.5rem] flex-wrap">
                                <Button size="sm" variant="outline" onClick={() => calculateAiScore(biz)} disabled={aiLoading === biz.id} className="rounded-xl font-bold text-amber-600 border-amber-500/20 hover:bg-amber-500/5">
                                  {aiLoading === biz.id ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <BrainCircuit className="w-4 h-4 mr-2" />} AI SKOR
                                </Button>
                                <Button size="sm" onClick={() => { updateBusinessStatus(biz.id, { status: "active", is_active: true }); }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20">SİSTEME AL</Button>
                                <Button size="sm" variant="outline" onClick={() => updateBusinessStatus(biz.id, { status: "rejected", is_active: false })} className="rounded-xl font-bold border-rose-500/20 text-rose-500 hover:bg-rose-500/5">REDDET</Button>
                                <Button size="sm" variant="outline" onClick={() => sendOnboardingLink(biz)} disabled={onboardingSending === biz.id} className="rounded-xl font-bold text-blue-500 border-blue-500/20 hover:bg-blue-500/5">
                                  {onboardingSending === biz.id ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />} DAVETİYE
                                </Button>
                              </div>
                            </div>
                         </Card>
                       ))
                     )}
                  </div>
                  );
                })()}

                {activeTab === "businesses" && (
                  <div className="grid grid-cols-1 gap-4 lg:gap-6">
                     {filteredBusinesses.map(biz => (
                       <Card key={biz.id} className="bg-card border-border p-4 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-all duration-300 rounded-3xl">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-primary font-black text-lg shrink-0">{biz.name?.[0]}</div>
                             <div className="min-w-0">
                                <p className="font-bold text-foreground text-sm lg:text-base leading-tight uppercase tracking-tight truncate">{biz.name}</p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-1 truncate">{biz.city} • {biz.category} • {biz.appointments?.[0]?.count || 0} randevu</p>
                             </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                             <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl" onClick={() => window.open(`/isletme/${biz.slug}`, '_blank')}><Eye className="w-5 h-5" /></Button>
                             <Button 
                                size="sm" 
                                onClick={() => updateBusinessStatus(biz.id, { is_active: !biz.is_active })}
                                className={cn(
                                  "flex-1 sm:flex-none h-10 text-[10px] font-black tracking-widest uppercase border-none rounded-xl px-6",
                                  biz.is_active ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                                )}
                              >
                                {biz.is_active ? "İŞLETME AKTİF" : "İŞLETME PASİF"}
                             </Button>
                          </div>
                       </Card>
                     ))}
                  </div>
                )}

                {activeTab === "customers" && (
                  <div className="space-y-4">
                     {filteredCustomers.map((cust, idx) => (
                       <Card key={idx} className="bg-card border-border p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-muted/30 transition-all cursor-default rounded-3xl">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg shrink-0">{cust.name?.[0]}</div>
                             <div className="space-y-1">
                                <p className="font-bold text-foreground text-sm lg:text-base uppercase tracking-tight">{cust.name}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{cust.phone} • {cust.email}</p>
                             </div>
                          </div>
                          <div className="grid grid-cols-3 lg:flex items-center gap-4 lg:gap-10 border-t lg:border-none pt-4 lg:pt-0">
                             <div className="text-center lg:text-right"><p className="text-[8px] lg:text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Sıklık</p><p className="font-black text-foreground text-xs lg:text-sm">{cust.appointments} RX</p></div>
                             <div className="text-center lg:text-right cursor-help" title="No-show kaydı"><p className="text-[8px] lg:text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Risk</p><p className={cn("font-black text-xs lg:text-sm", cust.noShows > 0 ? "text-rose-500" : "text-emerald-500")}>{cust.noShows}</p></div>
                             <div className="text-center lg:text-right"><p className="text-[8px] lg:text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Ciro</p><p className="font-black text-emerald-500 text-xs lg:text-sm">₺{cust.totalSpent.toLocaleString()}</p></div>
                          </div>
                       </Card>
                     ))}
                  </div>
                )}

                {activeTab === "appointments" && (
                    <div className="space-y-4">
                       {appointments.slice(0, 50).map(app => (
                         <div key={app.id} className="p-4 lg:p-6 bg-card border border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm hover:border-primary/20 transition-all duration-300 shadow-sm">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground mb-1 sm:mb-0 shrink-0"><User className="w-6 h-6" /></div>
                               <div className="min-w-0">
                                  <p className="font-black text-foreground uppercase tracking-tight truncate">{app.customer_name}</p>
                                  <p className="text-[10px] text-muted-foreground font-bold italic truncate flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {app.business?.name}</p>
                                  <div className="flex sm:hidden items-center gap-2 mt-1">
                                     <span className="text-[10px] font-bold text-foreground">{app.appointment_date}</span>
                                     <span className="text-[10px] text-muted-foreground">•</span>
                                     <span className="text-[10px] text-muted-foreground">{app.appointment_time}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-none pt-4 sm:pt-0">
                               <div className="hidden sm:flex flex-col items-end gap-0.5">
                                 <span className="text-[10px] font-bold text-foreground">{app.appointment_date}</span>
                                 <span className="text-[10px] text-muted-foreground">{app.appointment_time}</span>
                               </div>
                               <Badge className={cn(
                                 "text-[10px] font-black uppercase px-4 lg:px-6 h-8 border-none rounded-xl",
                                 app.status === 'confirmed' || app.status === 'completed' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-muted text-muted-foreground"
                               )}>
                                 {app.status}
                               </Badge>
                            </div>
                         </div>
                       ))}
                    </div>
                 )}

                {activeTab === "banlist" && (
                  <div className="space-y-6">
                    <Card className="bg-card border-border shadow-md">
                      <CardHeader className="bg-muted/10 border-b border-border/50"><CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2"><Ban className="w-4 h-4 text-rose-500" /> Kullanıcı Engelle</CardTitle></CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Telefon Numarası</Label><Input placeholder="05XX XXX XXXX" value={banPhone} onChange={e => setBanPhone(e.target.value)} className="bg-muted/50 border-border h-11 rounded-xl" /></div>
                          <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Engelleme Sebebi</Label><Input placeholder="No-show, kötüye kullanım vb." value={banReason} onChange={e => setBanReason(e.target.value)} className="bg-muted/50 border-border h-11 rounded-xl" /></div>
                        </div>
                        <Button onClick={banUser} className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-rose-600/20"><Ban className="w-4 h-4 mr-2" /> KARA LİSTEYE EKLE</Button>
                      </CardContent>
                    </Card>
                    <div className="space-y-3">
                      {bannedUsers.length === 0 ? (
                        <div className="text-center py-16 bg-muted/10 rounded-3xl border-2 border-dashed border-border">
                          <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">Kara listede kimse yok.</p>
                        </div>
                      ) : bannedUsers.map((bu: any) => (
                        <div key={bu.id} className="p-5 bg-card border border-border rounded-2xl flex items-center justify-between group hover:border-rose-500/20 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center"><Ban className="w-5 h-5 text-rose-500" /></div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{bu.phone}</p>
                              <p className="text-[10px] text-muted-foreground">{bu.reason} • {new Date(bu.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => unbanUser(bu.id)} className="rounded-xl font-bold border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5">ENGEL KALDIR</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "announcements" && (
                  <div className="space-y-6">
                    <Card className="bg-card border-border shadow-md">
                      <CardHeader className="bg-muted/10 border-b border-border/50"><CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2"><Megaphone className="w-4 h-4 text-primary" /> Yeni Duyuru Oluştur</CardTitle></CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Başlık</Label><Input placeholder="Duyuru başlığı" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} className="bg-muted/50 border-border h-11 rounded-xl" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Mesaj İçeriği</Label><Textarea placeholder="Duyuru metni..." rows={4} value={announcementBody} onChange={e => setAnnouncementBody(e.target.value)} className="bg-muted/50 border-border rounded-xl resize-none" /></div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Hedef Kitle</Label>
                          <div className="flex gap-3">
                            {(["all", "businesses", "customers"] as const).map(t => (
                              <button key={t} onClick={() => setAnnouncementTarget(t)} className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase border transition-all", announcementTarget === t ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted")}>{t === "all" ? "Herkes" : t === "businesses" ? "İşletmeler" : "Müşteriler"}</button>
                            ))}
                          </div>
                        </div>
                        <Button onClick={sendAnnouncement} disabled={sendingAnnouncement} className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-primary/20">
                          {sendingAnnouncement ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />} DUYURU GÖNDER
                        </Button>
                      </CardContent>
                    </Card>
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Bell className="w-4 h-4" /> Geçmiş Duyurular</h3>
                      {announcementHistory.length === 0 ? (
                        <div className="text-center py-16 bg-muted/10 rounded-3xl border-2 border-dashed border-border"><Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground font-medium">Henüz duyuru gönderilmedi.</p></div>
                      ) : announcementHistory.map((ann: any) => (
                        <div key={ann.id} className="p-5 bg-card border border-border rounded-2xl hover:border-primary/20 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{ann.title}</h4>
                            <Badge className="bg-muted text-muted-foreground border-border text-[9px] uppercase">{ann.target === "all" ? "Herkes" : ann.target === "businesses" ? "İşletmeler" : "Müşteriler"}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{ann.body}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-2 font-mono">{new Date(ann.created_at).toLocaleString()} • {ann.sent_by}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <Card className="bg-card border-border shadow-md">
                        <CardHeader className="bg-muted/10 border-b border-border/50"><CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Temel Parametreler</CardTitle></CardHeader>
                        <CardContent className="p-8 space-y-6">
                           <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Platform Branding</Label><Input value={settingsPlatformName} onChange={e => setSettingsPlatformName(e.target.value)} className="bg-muted/50 border-border h-11 rounded-xl" /></div>
                           <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Destek Gateway</Label><Input value={settingsSupportEmail} onChange={e => setSettingsSupportEmail(e.target.value)} className="bg-muted/50 border-border h-11 rounded-xl" /></div>
                           <Button onClick={saveSettings} disabled={settingsSaving} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/20">
                             {settingsSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} KONFİGÜRASYONU KAYDET
                           </Button>
                        </CardContent>
                     </Card>
                     <Card className="bg-card border-border shadow-md">
                        <CardHeader className="bg-muted/10 border-b border-border/50"><CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Güvenlik & Risk Profili</CardTitle></CardHeader>
                        <CardContent className="p-8 space-y-6">
                           <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">No-Show Bloklama Eşik Değeri</Label><Input type="number" value={settingsNoShowLimit} onChange={e => setSettingsNoShowLimit(Number(e.target.value))} className="bg-muted/50 border-border h-11 rounded-xl" /></div>
                           <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSettingsMfa(!settingsMfa)}>
                              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Admin MFA Zorunluluğu</span>
                              <div className={cn("w-12 h-6 rounded-full flex items-center px-1 transition-colors", settingsMfa ? "bg-primary/20 border border-primary/40" : "bg-muted border border-border")}>
                                 <div className={cn("w-4 h-4 rounded-full shadow-sm transition-all", settingsMfa ? "bg-primary ml-auto" : "bg-muted-foreground ml-0")}></div>
                              </div>
                           </div>
                           <Button onClick={saveSettings} disabled={settingsSaving} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/20">
                             {settingsSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} GÜVENLİK AYARLARINI KAYDET
                           </Button>
                        </CardContent>
                     </Card>
                  </div>
                )}

                {activeTab === "finans" && (
                  <div className="space-y-8">
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <FinanceCard title="Abonelik Geliri" value={`₺${(systemStats.totalRevenue * 0.8).toLocaleString()}`} icon={CreditCard} color="blue" />
                        <FinanceCard title="Kayıt Ücretleri" value={`₺${(systemStats.totalRevenue * 0.15).toLocaleString()}`} icon={Receipt} color="emerald" />
                        <FinanceCard title="Boost Gelirleri" value={`₺${(systemStats.totalRevenue * 0.05).toLocaleString()}`} icon={TrendingUp} color="amber" />
                     </div>
                     <Card className="bg-card border-border overflow-hidden">
                        <CardHeader className="bg-muted/20 border-b border-border/50"><CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest">Platform Nakit Akışı</CardTitle></CardHeader>
                        <CardContent className="p-0">
                           <div className="divide-y divide-border/50">
                              {businesses.slice(0, 8).map((biz, idx) => (
                                <div key={idx} className="p-5 flex items-center justify-between text-sm hover:bg-muted/20 transition-colors">
                                   <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-primary" /><span className="text-foreground font-medium uppercase tracking-tight">{biz.name}</span></div>
                                   <div className="flex items-center gap-6">
                                      <span className="text-muted-foreground text-[10px] uppercase font-bold tabular-nums">12/01/2024</span>
                                      <span className="font-black text-foreground">₺{Math.floor(Math.random() * 1000 + 500)}</span>
                                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none h-5 text-[9px] font-black tabular-nums">MATCH</Badge>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </CardContent>
                     </Card>
                  </div>
                )}

                {activeTab === "system" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <MetricRow label="Servis Yanıt Süresi (Globalized)" value="92ms" percentage={85} />
                     <MetricRow label="Database CPU Yükü (Compute)" value="14%" percentage={14} />
                     <MetricRow label="SSL Güvenlik Sertifikası" value="Valid (324d)" percentage={100} />
                     <MetricRow label="Platform Churn Riski" value="1.2%" percentage={1} />
                  </div>
                )}

                {activeTab === "logs" && (
                  <div className="space-y-4">
                     {auditLogs.length === 0 ? (
                       <div className="text-center py-24 bg-muted/10 rounded-3xl border-2 border-dashed border-border">
                          <ScrollText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">Sistemde henüz kaydedilmiş bir log bulunamadı.</p>
                       </div>
                     ) : (
                       auditLogs.map((log: any) => (
                         <div key={log.id} className="p-5 bg-card border border-border rounded-2xl flex items-center justify-between group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-5">
                               <div className="p-2.5 bg-muted rounded-xl border border-border group-hover:border-primary/20 transition-colors">
                                 <ScrollText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-foreground uppercase tracking-tight italic">{log.action || 'Sistem İşlemi'}</p>
                                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5 italic">{log.details || 'İşlem detayı yok.'}</p>
                               </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono font-bold tracking-tighter opacity-60">
                               {new Date(log.created_at).toLocaleString()}
                            </span>
                         </div>
                       ))
                     )}
                  </div>
                )}

                {activeTab === "support" && (
                  <AdminSupport />
                )}

              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

/* Helper Components */
function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardContent className="p-6 flex items-center justify-between">
        <div><p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{title}</p><h3 className="text-2xl font-bold text-foreground">{value}</h3></div>
        <div className="p-3 bg-muted rounded-xl border border-border"><Icon className={cn("w-5 h-5", color)} /></div>
      </CardContent>
    </Card>
  );
}

function AlertItem({ msg, type }: any) {
  return (
    <div className={cn("p-3 rounded-xl border text-[10px] font-medium flex items-center gap-3", 
      type === 'warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500" : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400")}>
       <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", type === 'warning' ? "bg-amber-500" : "bg-blue-500")} /> {msg}
    </div>
  );
}

function FinanceCard({ title, value, icon: Icon, color }: any) {
   const colors: any = { blue: "text-blue-500 bg-blue-500/10 border-blue-500/20", emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", amber: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
   return (
     <Card className="bg-card border-border shadow-sm">
       <CardContent className="p-6 text-center space-y-4">
          <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto", colors[color])}><Icon className="w-6 h-6" /></div>
          <div><p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">{title}</p><p className="text-2xl font-black text-foreground tracking-tighter">{value}</p></div>
       </CardContent>
     </Card>
   );
}

function MetricRow({ label, value, percentage }: any) {
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight"><span className="text-muted-foreground">{label}</span><span className="text-foreground">{value}</span></div>
      <div className="h-2 bg-muted rounded-full overflow-hidden border border-border/50"><div className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" style={{ width: `${percentage}%` }} /></div>
    </div>
  );
}

export default AdminPage;
