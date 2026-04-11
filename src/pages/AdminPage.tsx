
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
import {
  Building2, Users, Calendar, TrendingUp, AlertTriangle,
  FileText, CheckCircle, Clock, ArrowRight, Wallet,
  Shield, Search, RefreshCw, XCircle, LayoutDashboard,
  Bell, LogOut, Menu, X, ScrollText, Settings, HelpCircle,
  Eye, Edit, Power, Star, Receipt, CreditCard, Save, Globe, Palette
} from "lucide-react";

const ADMIN_EMAILS = ["asrinaltan04@gmail.com", "admin@admin.com", "testadmin@rendezvous.com"];

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
    if (!authLoading && !user) {
      navigate("/giris");
      return;
    }
    if (user) {
      const admin = ADMIN_EMAILS.includes(user.email || "");
      setIsAdmin(admin);
      if (!admin) {
        toast({ title: "Yetkisiz erişim", variant: "destructive" });
        navigate("/");
        return;
      }
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
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const pendingCount = businesses.filter(b => b.status === "pending" || !b.status).length;
  const filteredBusinesses = businesses.filter(b => b.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCustomers = aggregatedCustomers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm));

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200">
      <SEOHead title="Admin Dashboard | RandevuDunyasi" />
      {/* Sidebar & Topbar Implementation */}
      <div className="flex">
        {/* Mobile Backdrop */}
        {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 lg:translate-x-0 overflow-y-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 h-16 px-6 border-b border-slate-700">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-heading font-bold text-lg text-white">Sistem Admin</span>
            </div>
            <nav className="flex-1 py-6 px-4">
               <ul className="space-y-1">
                 {navigation.map((item) => (
                   <li key={item.id}>
                     <button
                       onClick={() => { setActiveTab(item.id); setSidebarOpen(false); setSearchTerm(""); }}
                       className={cn(
                         "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
                         activeTab === item.id ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-100"
                       )}
                     >
                       <div className="flex items-center gap-3">
                         <item.icon className="w-5 h-5" />
                         {item.name}
                       </div>
                       {item.badge && item.id === "moderation" && pendingCount > 0 && (
                         <Badge className="bg-red-500 text-[10px] h-5 px-1">{pendingCount}</Badge>
                       )}
                     </button>
                   </li>
                 ))}
               </ul>
            </nav>
            <div className="p-4 border-t border-slate-700">
              <button onClick={() => signOut()} className="flex items-center gap-3 w-full p-2 text-slate-400 hover:text-red-400 transition-colors">
                 <LogOut className="w-4 h-4" /> <span className="text-sm">Çıkış Yap</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <Link to="/">
                <Button variant="outline" size="sm" className="hidden sm:flex border-slate-700 text-slate-300 hover:bg-slate-700">
                  Siteyi Görüntüle <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
              <Avatar className="h-8 w-8 border border-slate-700"><AvatarFallback className="bg-slate-800 text-xs">AD</AvatarFallback></Avatar>
            </div>
          </header>

          <main className="p-6 lg:p-10 transition-all duration-300">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                 <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
                   {navigation.find(n => n.id === activeTab)?.name}
                 </h1>
                 <p className="text-sm text-slate-400">Platform yönetim ve denetim araçları.</p>
              </div>
              {['businesses', 'customers', 'appointments'].includes(activeTab) && (
                <div className="relative w-full sm:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <Input 
                     placeholder="Ara..." 
                     className="bg-slate-800 border-slate-700 pl-10 h-10 text-sm" 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
              )}
            </div>

            <Tabs value={activeTab} className="w-full">
              {/* DASHBOARD TAB */}
              <TabsContent value="overview" className="mt-0 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Toplam İşletme" value={systemStats.totalBusinesses} icon={Building2} color="text-primary" />
                  <StatCard title="Aktif Kullanıcı" value={systemStats.totalUsers} icon={Users} color="text-blue-400" />
                  <StatCard title="Toplam Randevu" value={systemStats.totalAppointments} icon={Calendar} color="text-emerald-400" />
                  <StatCard title="Brüt Hacim" value={`₺${(systemStats.totalRevenue/1000).toFixed(1)}K`} icon={Wallet} color="text-amber-400" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2 bg-slate-800/40 border-slate-700">
                    <CardHeader className="py-4 border-b border-slate-700/50">
                      <CardTitle className="text-white text-base">Son Kayıtlı İşletmeler</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-700/50">
                        {businesses.slice(0, 5).map(biz => (
                          <div key={biz.id} className="p-4 flex items-center justify-between hover:bg-slate-900/40 transition-colors">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-[10px] font-bold">{biz.name?.[0]}</div>
                               <div>
                                 <p className="text-sm font-medium text-white">{biz.name}</p>
                                 <p className="text-[10px] text-slate-500">{biz.city} • {biz.category}</p>
                               </div>
                            </div>
                            <Badge variant={biz.status === 'active' ? 'secondary' : 'outline'} className="text-[10px]">{biz.status || 'pending'}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/40 border-slate-700">
                    <CardHeader className="py-4 border-b border-slate-700/50"><CardTitle className="text-white text-base">Sistem Uyarıları</CardTitle></CardHeader>
                    <CardContent className="p-4 space-y-3">
                       <AlertItem msg={`${pendingCount} başvuru onay bekliyor`} type="warning" />
                       <AlertItem msg="No-show oranları %3.2 civarında" type="info" />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* MODERATION TAB */}
              <TabsContent value="moderation" className="mt-0 space-y-6">
                 {businesses.filter(b => b.status === 'pending' || !b.status).length === 0 ? (
                   <div className="text-center py-20 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700 text-slate-500">Bekleyen başvuru bulunmuyor.</div>
                 ) : (
                   businesses.filter(b => b.status === 'pending' || !b.status).map(biz => (
                     <Card key={biz.id} className="bg-slate-800/30 border-slate-700 p-6 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-primary text-xl font-bold">{biz.name?.[0]}</div>
                           <div>
                              <h3 className="font-bold text-white text-lg">{biz.name}</h3>
                              <p className="text-xs text-slate-400">{biz.city} • {biz.category} • {new Date(biz.created_at).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <div className="flex gap-3">
                           <Button onClick={() => updateBusinessStatus(biz.id, { status: "active", is_active: true })} className="bg-emerald-600 hover:bg-emerald-700 h-9">Onayla</Button>
                           <Button onClick={() => updateBusinessStatus(biz.id, { status: "rejected", is_active: false })} variant="destructive" className="h-9">Reddet</Button>
                        </div>
                     </Card>
                   ))
                 )}
              </TabsContent>

              {/* BUSINESSES TAB */}
              <TabsContent value="businesses" className="mt-0 space-y-4">
                 {filteredBusinesses.map(biz => (
                   <Card key={biz.id} className="bg-slate-800/30 border-slate-700 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center text-white font-bold">{biz.name?.[0]}</div>
                         <div>
                            <p className="font-semibold text-white">{biz.name}</p>
                            <p className="text-xs text-slate-500">{biz.city} • {biz.category} • {biz.appointments?.[0]?.count || 0} randevu</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <Button size="sm" variant="outline" className="border-slate-700 text-xs">Detaylar</Button>
                         <Button 
                           size="sm" 
                           onClick={() => updateBusinessStatus(biz.id, { is_active: !biz.is_active })}
                           className={biz.is_active ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/20" : "bg-red-600/10 text-red-400 border border-red-500/30"}
                         >
                           {biz.is_active ? "Aktif" : "Pasif"}
                         </Button>
                      </div>
                   </Card>
                 ))}
              </TabsContent>

              {/* CUSTOMERS TAB */}
              <TabsContent value="customers" className="mt-0 space-y-3">
                 {filteredCustomers.map((cust, idx) => (
                   <Card key={idx} className="bg-slate-800/30 border-slate-700 p-4 flex items-center justify-between hover:bg-slate-800/50 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-primary font-bold">{cust.name?.[0]}</div>
                         <div>
                            <p className="font-medium text-white">{cust.name}</p>
                            <p className="text-xs text-slate-500">{cust.phone} • {cust.email}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-8 text-xs">
                         <div className="text-center"><p className="text-slate-500">Randevu</p><p className="font-bold text-white">{cust.appointments}</p></div>
                         <div className="text-center"><p className="text-slate-500">No-Show</p><p className={cn("font-bold", cust.noShows > 0 ? "text-red-400" : "text-white")}>{cust.noShows}</p></div>
                         <div className="text-center"><p className="text-slate-500">Harcama</p><p className="font-bold text-emerald-400">₺{cust.totalSpent.toLocaleString()}</p></div>
                      </div>
                   </Card>
                 ))}
              </TabsContent>

              {/* APPOINTMENTS TAB */}
              <TabsContent value="appointments" className="mt-0 space-y-3">
                 {appointments.slice(0, 50).map(app => (
                   <div key={app.id} className="p-4 bg-slate-800/30 border border-slate-700 rounded-xl flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center"><User className="w-4 h-4 text-slate-500" /></div>
                         <div className="space-y-0.5">
                            <p className="font-medium text-white">{app.customer_name}</p>
                            <p className="text-[10px] text-slate-500">{app.business?.name}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6 text-slate-400 text-xs">
                         <span>{app.appointment_date}</span>
                         <span>{app.appointment_time}</span>
                         <Badge variant={app.status === 'confirmed' || app.status === 'completed' ? 'secondary' : 'destructive'} className="text-[10px] px-2 h-5">{app.status}</Badge>
                      </div>
                   </div>
                 ))}
              </TabsContent>

              {/* FINANS TAB */}
              <TabsContent value="finans" className="mt-0 space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <FinanceCard title="Abonelik Geliri" value={`₺${(systemStats.totalRevenue * 0.8).toLocaleString()}`} icon={CreditCard} color="blue" />
                    <FinanceCard title="Kayıt Ücretleri" value={`₺${(systemStats.totalRevenue * 0.15).toLocaleString()}`} icon={Receipt} color="emerald" />
                    <FinanceCard title="Boost Gelirleri" value={`₺${(systemStats.totalRevenue * 0.05).toLocaleString()}`} icon={TrendingUp} color="amber" />
                 </div>
                 <Card className="bg-slate-800/40 border-slate-700">
                    <CardHeader><CardTitle className="text-white text-base">Son Ödemeler</CardTitle></CardHeader>
                    <CardContent className="p-0 border-t border-slate-700/50">
                       <div className="divide-y divide-slate-700/50">
                          {businesses.slice(0, 5).map((biz, idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between text-sm">
                               <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-slate-500" /><span className="text-slate-200">{biz.name}</span></div>
                               <div className="flex items-center gap-4">
                                  <span className="text-slate-400 text-xs">12.01.2024</span>
                                  <span className="font-bold text-white">₺{Math.floor(Math.random() * 1000 + 500)}</span>
                                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0 h-5 text-[10px]">Ödendi</Badge>
                               </div>
                            </div>
                          ))}
                       </div>
                    </CardContent>
                 </Card>
              </TabsContent>

              {/* SYSTEM HEALTH TAB */}
              <TabsContent value="system" className="mt-0 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MetricRow label="Servis Yanıt Süresi" value="92ms" percentage={85} />
                    <MetricRow label="Database CPU Yükü" value="14%" percentage={14} />
                    <MetricRow label="SSL Sertifikası" value="Geçerli" percentage={100} />
                    <MetricRow label="No-Show Oranı" value="3.2%" percentage={3} />
                 </div>
              </TabsContent>

              {/* LOGS TAB */}
              <TabsContent value="logs" className="mt-0 space-y-3">
                 {[1,2,3,4,5,6,7,8].map(i => (
                   <div key={i} className="p-4 bg-slate-800/20 border border-slate-700 rounded-lg flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <ScrollText className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors" />
                         <div>
                            <p className="text-sm text-white">İşletme Ayarları Güncellendi</p>
                            <p className="text-[10px] text-slate-500">Admin tarafından "Modern Barber" için yapıldı.</p>
                         </div>
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono">2024-01-15 14:32:45</span>
                   </div>
                 ))}
              </TabsContent>

              {/* SETTINGS TAB */}
              <TabsContent value="settings" className="mt-0 grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card className="bg-slate-800/40 border-slate-700">
                    <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Genel Yapılandırma</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                       <div className="space-y-1.5"><Label className="text-xs text-slate-400">Platform Adı</Label><Input defaultValue="RandevuDunyasi" className="bg-slate-900 border-slate-700 h-9" /></div>
                       <div className="space-y-1.5"><Label className="text-xs text-slate-400">Destek E-postası</Label><Input defaultValue="info@randevudunyasi.com" className="bg-slate-900 border-slate-700 h-9" /></div>
                       <Button className="w-full bg-primary hover:bg-primary/80 h-9">Ayarları Kaydet</Button>
                    </CardContent>
                 </Card>
                 <Card className="bg-slate-800/40 border-slate-700">
                    <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Güvenlik Eşik Değerleri</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                       <div className="space-y-1.5"><Label className="text-xs text-slate-400">No-Show Bloklama Sınırı</Label><Input type="number" defaultValue="3" className="bg-slate-900 border-slate-700 h-9" /></div>
                       <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-700">
                          <span className="text-xs text-slate-400">2FA Admin Girişi Zorunlu</span>
                          <input type="checkbox" defaultChecked className="accent-primary" />
                       </div>
                    </CardContent>
                 </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
};

/* Helper Components */
function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="bg-slate-800/40 border-slate-700/50">
      <CardContent className="p-6 flex items-center justify-between">
        <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{title}</p><h3 className="text-2xl font-bold text-white">{value}</h3></div>
        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700"><Icon className={cn("w-5 h-5", color)} /></div>
      </CardContent>
    </Card>
  );
}

function AlertItem({ msg, type }: any) {
  return (
    <div className={cn("p-2.5 rounded-lg border text-[10px] flex items-center gap-2", 
      type === 'warning' ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-blue-500/10 border-blue-500/30 text-blue-400")}>
       <div className={cn("w-1 h-1 rounded-full", type === 'warning' ? "bg-amber-500" : "bg-blue-500")} /> {msg}
    </div>
  );
}

function FinanceCard({ title, value, icon: Icon, color }: any) {
   const colors: any = { blue: "text-blue-400 bg-blue-500/10", emerald: "text-emerald-400 bg-emerald-500/10", amber: "text-amber-400 bg-amber-500/10" };
   return (
     <Card className="bg-slate-800/40 border-slate-700">
       <CardContent className="p-6 text-center space-y-3">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mx-auto", colors[color])}><Icon className="w-5 h-5" /></div>
          <div><p className="text-xs text-slate-500 font-medium">{title}</p><p className="text-xl font-bold text-white">{value}</p></div>
       </CardContent>
     </Card>
   );
}

function MetricRow({ label, value, percentage }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium"><span className="text-slate-400">{label}</span><span className="text-white">{value}</span></div>
      <div className="h-1 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${percentage}%` }} /></div>
    </div>
  );
}

export default AdminPage;
