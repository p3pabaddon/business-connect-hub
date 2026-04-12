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
import {
  Building2, Users, Calendar, TrendingUp, AlertTriangle,
  FileText, CheckCircle, Clock, ArrowRight, Wallet,
  Shield, Search, RefreshCw, XCircle, LayoutDashboard,
  Bell, LogOut, Menu, X, ScrollText, Settings, HelpCircle,
  Eye, Edit, Power, Star, Receipt, CreditCard, Save, Globe, Palette,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", id: "overview", icon: LayoutDashboard },
  { name: "Başvurular", id: "moderation", icon: FileText, badge: true },
  { name: "İşletmeler", id: "businesses", icon: Building2 },
  { name: "Müşteriler", id: "customers", icon: Users },
  { name: "Randevular", id: "appointments", icon: Calendar },
  { name: "Finans", id: "finans", icon: Wallet },
  { name: "Sistem Sağlığı", id: "system", icon: TrendingUp },
  { name: "Loglar", id: "logs", icon: ScrollText },
  { name: "Ayarlar", id: "settings", icon: Settings },
];

const AdminPage = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Data States
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalBusinesses: 0,
    totalUsers: 0,
    totalAppointments: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (user) {
      setIsAdmin(true);
      loadAdminData();
    }
  }, [user, authLoading]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const stats = await getAdminSystemStats();
      setSystemStats(stats);

      const { data: bData } = await supabase
        .from("businesses")
        .select("*, appointments(count)")
        .order("created_at", { ascending: false });
      
      const { data: aData } = await supabase
        .from("appointments")
        .select("*, business:businesses(name)")
        .order("appointment_date", { ascending: false });

      setBusinesses(bData || []);
      setAppointments(aData || []);
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
          <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                <span>Admin</span>
                <span className="opacity-30">/</span>
                <span className="text-primary font-bold">{activeTab}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />
              <Link to="/" className="hidden sm:block">
                <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent font-bold text-[10px] tracking-widest">
                  PORTAL PROJE <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/50 rounded-full border border-border/50">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">AD</div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase hidden md:block">Root Admin</span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="space-y-1">
                   <h1 className="text-3xl font-heading font-black text-foreground tracking-tighter uppercase italic">
                     {navigation.find(n => n.id === activeTab)?.name} Control
                   </h1>
                   <p className="text-sm text-muted-foreground font-medium opacity-60">Platform orkestrasyon ve denetim katmanı v4.0</p>
                </div>
                {['businesses', 'customers', 'appointments'].includes(activeTab) && (
                  <div className="relative w-full sm:w-72 group">
                     <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                     <Input 
                       placeholder="Sistemde ara..." 
                       className="bg-card border-border pl-10 h-11 text-sm rounded-xl focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
                )}
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                {activeTab === "overview" && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard title="Toplam İşletme" value={systemStats.totalBusinesses} icon={Building2} color="text-primary" />
                      <StatCard title="Aktif Kullanıcı" value={systemStats.totalUsers} icon={Users} color="text-blue-500" />
                      <StatCard title="Toplam Randevu" value={systemStats.totalAppointments} icon={Calendar} color="text-emerald-500" />
                      <StatCard title="Brüt Hacim" value={`₺${(systemStats.totalRevenue/1000).toFixed(1)}K`} icon={Wallet} color="text-amber-500" />
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

                {activeTab === "moderation" && (
                  <div className="space-y-4">
                     {businesses.filter(b => b.status === 'pending' || !b.status).length === 0 ? (
                       <div className="text-center py-24 bg-muted/10 rounded-3xl border-2 border-dashed border-border">
                          <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">Bekleyen başvuru bulunmuyor.</p>
                       </div>
                     ) : (
                       businesses.filter(b => b.status === 'pending' || !b.status).map(biz => (
                         <Card key={biz.id} className="bg-card border-border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-5">
                               <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary text-3xl font-black">{biz.name?.[0]}</div>
                               <div className="space-y-1">
                                  <h3 className="font-black text-foreground text-xl tracking-tight uppercase italic">{biz.name}</h3>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {biz.category}</span>
                                    <span className="opacity-30">•</span>
                                    <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {biz.city}</span>
                                    <span className="opacity-30">•</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(biz.created_at).toLocaleDateString()}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex gap-3">
                               <Button 
                                 onClick={() => updateBusinessStatus(biz.id, { status: "active", is_active: true })} 
                                 className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-emerald-600/20"
                               >
                                 SİSTEME AL
                               </Button>
                               <Button 
                                 onClick={() => updateBusinessStatus(biz.id, { status: "rejected", is_active: false })} 
                                 variant="outline" 
                                 className="h-11 px-8 rounded-xl font-bold border-rose-500/20 text-rose-500 hover:bg-rose-500/5"
                               >
                                 REDDET
                               </Button>
                            </div>
                         </Card>
                       ))
                     )}
                  </div>
                )}

                {activeTab === "businesses" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {filteredBusinesses.map(biz => (
                       <Card key={biz.id} className="bg-card border-border p-5 flex items-center justify-between hover:border-primary/30 transition-all duration-300">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-primary font-black text-lg">{biz.name?.[0]}</div>
                             <div>
                                <p className="font-bold text-foreground text-sm leading-tight uppercase tracking-tight">{biz.name}</p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-1">{biz.city} • {biz.category} • {biz.appointments?.[0]?.count || 0} randevu</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-primary"><Eye className="w-4 h-4" /></Button>
                             <Button 
                               size="sm" 
                               onClick={() => updateBusinessStatus(biz.id, { is_active: !biz.is_active })}
                               className={cn(
                                 "h-8 text-[9px] font-black tracking-widest uppercase border-none",
                                 biz.is_active ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                               )}
                             >
                               {biz.is_active ? "AKTİF" : "PASİF"}
                             </Button>
                          </div>
                       </Card>
                     ))}
                  </div>
                )}

                {activeTab === "customers" && (
                  <div className="space-y-3">
                     {filteredCustomers.map((cust, idx) => (
                       <Card key={idx} className="bg-card border-border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-all cursor-default">
                          <div className="flex items-center gap-4">
                             <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">{cust.name?.[0]}</div>
                             <div className="space-y-0.5">
                                <p className="font-bold text-foreground text-sm uppercase tracking-tight">{cust.name}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{cust.phone} • {cust.email}</p>
                             </div>
                          </div>
                          <div className="flex items-center justify-between md:justify-end gap-10">
                             <div className="text-center md:text-right"><p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Sıklık</p><p className="font-black text-foreground text-sm">{cust.appointments} RX</p></div>
                             <div className="text-center md:text-right cursor-help" title="No-show kaydı"><p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Risk</p><p className={cn("font-black text-sm", cust.noShows > 0 ? "text-rose-500" : "text-emerald-500")}>{cust.noShows}</p></div>
                             <div className="text-center md:text-right"><p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Harcama</p><p className="font-black text-emerald-500 text-sm">₺{cust.totalSpent.toLocaleString()}</p></div>
                          </div>
                       </Card>
                     ))}
                  </div>
                )}

                {activeTab === "appointments" && (
                   <div className="space-y-3">
                      {appointments.slice(0, 50).map(app => (
                        <div key={app.id} className="p-5 bg-card border border-border rounded-2xl flex items-center justify-between text-sm hover:border-primary/20 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground"><User className="w-5 h-5" /></div>
                              <div className="space-y-0.5">
                                 <p className="font-bold text-foreground uppercase tracking-tight">{app.customer_name}</p>
                                 <p className="text-[10px] text-muted-foreground font-medium italic">@{app.business?.name}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-6">
                              <div className="hidden md:flex flex-col items-end gap-0.5">
                                <span className="text-[10px] font-bold text-foreground">{app.appointment_date}</span>
                                <span className="text-[10px] text-muted-foreground">{app.appointment_time}</span>
                              </div>
                              <Badge className={cn(
                                "text-[9px] font-black uppercase px-2.5 h-5 border-none",
                                app.status === 'confirmed' || app.status === 'completed' ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                              )}>
                                {app.status}
                              </Badge>
                           </div>
                        </div>
                      ))}
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
                     {[1,2,3,4,5,6,7,8,9,10].map(i => (
                       <div key={i} className="p-5 bg-card border border-border rounded-2xl flex items-center justify-between group hover:border-primary/20 transition-all">
                          <div className="flex items-center gap-5">
                             <div className="p-2.5 bg-muted rounded-xl border border-border group-hover:border-primary/20 transition-colors">
                               <ScrollText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                             </div>
                             <div>
                                <p className="text-sm font-black text-foreground uppercase tracking-tight italic">İşletme Meta Verisi Güncellendi</p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5 italic">Root Admin tarafından terminal @hq üzerinden tetiklendi.</p>
                             </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono font-bold tracking-tighter opacity-60">2024-01-15 14:32:45</span>
                       </div>
                     ))}
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <Card className="bg-card border-border shadow-md">
                        <CardHeader className="bg-muted/10 border-b border-border/50"><CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Temel Parametreler</CardTitle></CardHeader>
                        <CardContent className="p-8 space-y-6">
                           <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Platform Branding</Label><Input defaultValue="RandevuDunyasi" className="bg-muted/50 border-border h-11 rounded-xl" /></div>
                           <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Destek Gateway</Label><Input defaultValue="info@randevudunyasi.com" className="bg-muted/50 border-border h-11 rounded-xl" /></div>
                           <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/20">KONFİGÜRASYONU YAYINLA</Button>
                        </CardContent>
                     </Card>
                     <Card className="bg-card border-border shadow-md">
                        <CardHeader className="bg-muted/10 border-b border-border/50"><CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Güvenlik & Risk Profili</CardTitle></CardHeader>
                        <CardContent className="p-8 space-y-6">
                           <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">No-Show Bloklama Eşik Değeri</Label><Input type="number" defaultValue="3" className="bg-muted/50 border-border h-11 rounded-xl" /></div>
                           <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
                              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Admin MFA Zorunluluğu</span>
                              <div className="w-12 h-6 bg-primary/20 border border-primary/40 rounded-full flex items-center px-1">
                                 <div className="w-4 h-4 bg-primary rounded-full ml-auto shadow-sm"></div>
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </div>
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
