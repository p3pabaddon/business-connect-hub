import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, Clock, Users, TrendingUp, CheckCircle, XCircle,
  AlertCircle, Plus, Trash2, BarChart3, Settings, Save,
  LayoutDashboard, List
} from "lucide-react";
import { getMyBusiness, getBusinessAppointments, updateAppointmentStatus, getBusinessStats } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { ImageUpload } from "@/components/ImageUpload";
import { WeekView } from "@/components/dashboard/WeekView";
import { WaitlistManager } from "@/components/dashboard/WaitlistManager";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Onaylandı", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Tamamlandı", color: "bg-green-100 text-green-800" },
  cancelled: { label: "İptal", color: "bg-red-100 text-red-800" },
};

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [business, setBusiness] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalAppointments: 0, todayAppointments: 0, pendingAppointments: 0, totalRevenue: 0 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({ name: "", price: "", duration: "" });
  const [newStaff, setNewStaff] = useState({ name: "", role: "", user_id: "" });

  useEffect(() => {
    if (!authLoading && !user) navigate("/giris");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  useEffect(() => {
    if (business) loadAppointments();
  }, [business, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const biz = await getMyBusiness();
      if (!biz) { setLoading(false); return; }
      setBusiness(biz);

      const [statsData, servicesRes, staffRes, allAptsRes] = await Promise.all([
        getBusinessStats(biz.id),
        supabase.from("services").select("*").eq("business_id", biz.id).order("created_at"),
        supabase.from("staff").select("*").eq("business_id", biz.id),
        supabase.from("appointments").select("*").eq("business_id", biz.id).order("appointment_date", { ascending: false }),
      ]);

      setStats(statsData);
      setServices(servicesRes.data || []);
      setStaffList(staffRes.data || []);
      setAllAppointments(allAptsRes.data || []);
    } catch {
      toast({ title: "Veri yüklenemedi", variant: "destructive" });
    }
    setLoading(false);
  };

  const loadAppointments = async () => {
    if (!business) return;
    try {
      const data = await getBusinessAppointments(business.id, statusFilter);
      setAppointments(data || []);
    } catch { /* silent */ }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      toast({ title: "Randevu durumu güncellendi" });
      loadAppointments();
      if (business) {
        const statsData = await getBusinessStats(business.id);
        setStats(statsData);
      }
    } catch {
      toast({ title: "Güncelleme başarısız", variant: "destructive" });
    }
  };

  const addService = async () => {
    if (!business || !newService.name || !newService.price || !newService.duration) return;
    const { error } = await supabase.from("services").insert({
      business_id: business.id,
      name: newService.name,
      price: Number(newService.price),
      duration: Number(newService.duration),
    });
    if (error) {
      toast({ title: "Hizmet eklenemedi", variant: "destructive" });
    } else {
      toast({ title: "Hizmet eklendi" });
      setNewService({ name: "", price: "", duration: "" });
      const { data } = await supabase.from("services").select("*").eq("business_id", business.id).order("created_at");
      setServices(data || []);
    }
  };

  const deleteService = async (id: string) => {
    await supabase.from("services").delete().eq("id", id);
    setServices(services.filter((s) => s.id !== id));
    toast({ title: "Hizmet silindi" });
  };

  const addStaff = async () => {
    if (!business || !newStaff.name) return;
    const { error } = await supabase.from("staff").insert({
      business_id: business.id,
      name: newStaff.name,
      role: newStaff.role || "Personel",
      user_id: newStaff.user_id || null,
    });
    if (error) {
      toast({ title: "Personel eklenemedi", variant: "destructive" });
    } else {
      toast({ title: "Personel eklendi" });
      setNewStaff({ name: "", role: "", user_id: "" });
      const { data } = await supabase.from("staff").select("*").eq("business_id", business.id);
      setStaffList(data || []);
    }
  };

  const deleteStaff = async (id: string) => {
    await supabase.from("staff").delete().eq("id", id);
    setStaffList(staffList.filter((s) => s.id !== id));
    toast({ title: "Personel silindi" });
  };

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    
    const { error } = await supabase
      .from("businesses")
      .update({
        name: business.name,
        city: business.city,
        category: business.category,
        image_url: business.image_url,
        gallery_urls: business.gallery_urls || [],
      })
      .eq("id", business.id);

    if (error) {
      toast({ title: "Güncelleme başarısız", variant: "destructive" });
    } else {
      toast({ title: "İşletme bilgileri güncellendi" });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </main>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-surface">
          <div className="text-center">
            <h2 className="text-xl font-heading text-foreground mb-2">İşletmeniz bulunamadı</h2>
            <p className="text-muted-foreground mb-4">Henüz bir işletme kaydınız yok.</p>
            <Link to="/isletme-basvuru">
              <Button>İşletme Başvurusu Yap</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title={`${business.name} - Yönetim Paneli`} />
      <Header />
      <main className="flex-1 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-heading text-foreground">{business.name}</h1>
              <p className="text-muted-foreground">İşletme Yönetim Paneli</p>
            </div>
            <Link to={`/isletme/${business.slug}`}>
              <Button variant="outline" size="sm">İşletme Sayfasını Gör</Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-heading text-foreground">{stats.totalAppointments}</p>
                  <p className="text-xs text-muted-foreground">Toplam Randevu</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-heading text-foreground">{stats.todayAppointments}</p>
                  <p className="text-xs text-muted-foreground">Bugünkü Randevu</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-heading text-foreground">{stats.pendingAppointments}</p>
                  <p className="text-xs text-muted-foreground">Bekleyen</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-heading text-foreground">₺{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Toplam Gelir</p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="appointments" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="appointments">Randevular</TabsTrigger>
              <TabsTrigger value="waitlist">
                <Users className="w-4 h-4 mr-1" /> Bekleme Listesi
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="w-4 h-4 mr-1" /> Analiz
              </TabsTrigger>
              <TabsTrigger value="services">Hizmetler</TabsTrigger>
              <TabsTrigger value="staff">Personel</TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-1" /> Ayarlar
              </TabsTrigger>
            </TabsList>

            {/* Appointments Tab */}
            <TabsContent value="appointments">
              <div className="bg-card border border-border rounded-xl">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-foreground">Randevular</h3>
                    <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border">
                      <Button 
                        variant={viewMode === "calendar" ? "secondary" : "ghost"} 
                        size="sm" 
                        className="h-8 px-3 rounded-md"
                        onClick={() => setViewMode("calendar")}
                      >
                        <LayoutDashboard className="w-4 h-4 mr-1.5" /> Takvim
                      </Button>
                      <Button 
                        variant={viewMode === "list" ? "secondary" : "ghost"} 
                        size="sm" 
                        className="h-8 px-3 rounded-md"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="w-4 h-4 mr-1.5" /> Liste
                      </Button>
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="pending">Bekleyen</SelectItem>
                      <SelectItem value="confirmed">Onaylanan</SelectItem>
                      <SelectItem value="completed">Tamamlanan</SelectItem>
                      <SelectItem value="cancelled">İptal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {viewMode === "calendar" ? (
                  <div className="p-4">
                    <WeekView 
                      appointments={appointments} 
                      onAppointmentClick={(apt) => {
                        toast({ title: `Randevu: ${apt.customer_name}`, description: `${apt.appointment_time} - ${apt.status}` });
                      }}
                    />
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">Henüz randevu yok</div>
                ) : (
                  <div className="divide-y divide-border">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{apt.customer_name}</span>
                            <Badge className={statusMap[apt.status]?.color || ""}>
                              {statusMap[apt.status]?.label || apt.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span>{apt.appointment_date}</span>
                            <span>{apt.appointment_time}</span>
                            <span>{apt.customer_phone}</span>
                            {apt.staff?.name && <span>👤 {apt.staff.name}</span>}
                            <span className="font-medium text-foreground">₺{apt.total_price}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {apt.status === "pending" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleStatusChange(apt.id, "confirmed")}>
                                <CheckCircle className="w-4 h-4 mr-1" /> Onayla
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleStatusChange(apt.id, "cancelled")}>
                                <XCircle className="w-4 h-4 mr-1" /> İptal
                              </Button>
                            </>
                          )}
                          {apt.status === "confirmed" && (
                            <Button size="sm" onClick={() => handleStatusChange(apt.id, "completed")}>
                              <CheckCircle className="w-4 h-4 mr-1" /> Tamamla
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Waitlist Tab */}
            <TabsContent value="waitlist">
              <WaitlistManager businessId={business.id} />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <AnalyticsCharts appointments={allAppointments} totalRevenue={stats.totalRevenue} />
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services">
              <div className="bg-card border border-border rounded-xl">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground mb-4">Hizmet Ekle</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input placeholder="Hizmet adı" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
                    <Input placeholder="Fiyat (₺)" type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} className="sm:w-32" />
                    <Input placeholder="Süre (dk)" type="number" value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: e.target.value })} className="sm:w-32" />
                    <Button onClick={addService}><Plus className="w-4 h-4 mr-1" /> Ekle</Button>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {services.map((service) => (
                    <div key={service.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.duration} dk · ₺{service.price}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteService(service.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">Henüz hizmet eklenmedi</div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Staff Tab */}
            <TabsContent value="staff">
              <div className="bg-card border border-border rounded-xl">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground mb-4">Personel Ekle</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input placeholder="Ad Soyad" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} />
                    <Input placeholder="Rol (ör: Berber)" value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })} className="sm:w-48" />
                    <Input placeholder="Kullanıcı ID (Opsiyonel)" value={newStaff.user_id} onChange={(e) => setNewStaff({ ...newStaff, user_id: e.target.value })} className="sm:w-48" />
                    <Button onClick={addStaff}><Plus className="w-4 h-4 mr-1" /> Ekle</Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    * Personelin kendi dashboard'una girebilmesi için User ID alanını doldurun.
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {staffList.map((member) => (
                    <div key={member.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <span className="text-accent font-heading text-sm">
                            {member.name.split(" ").map((n: string) => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteStaff(member.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {staffList.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">Henüz personel eklenmedi</div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="bg-card border border-border rounded-xl p-6">
                <form onSubmit={handleUpdateBusiness} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="biz-name">İşletme Adı</Label>
                        <Input 
                          id="biz-name" 
                          value={business.name} 
                          onChange={(e) => setBusiness({ ...business, name: e.target.value })} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="biz-city">Şehir</Label>
                        <Input 
                          id="biz-city" 
                          value={business.city} 
                          onChange={(e) => setBusiness({ ...business, city: e.target.value })} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="biz-cat">Kategori</Label>
                        <Input 
                          id="biz-cat" 
                          value={business.category} 
                          onChange={(e) => setBusiness({ ...business, category: e.target.value })} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label>Ana Görsel</Label>
                      <ImageUpload 
                        defaultValue={business.image_url} 
                        onUpload={(url) => setBusiness({ ...business, image_url: url })} 
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-border">
                    <Label className="text-lg">İşletme Galerisi (Opsiyonel)</Label>
                    <p className="text-sm text-muted-foreground">İşletmenizin yaptığı işleri veya ortamını gösteren fotoğraflar ekleyin.</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[0, 1, 2, 3].map((idx) => (
                        <div key={idx} className="space-y-2">
                          <ImageUpload
                            bucket="gallery"
                            defaultValue={(business.gallery_urls || [])[idx]}
                            onUpload={(url) => {
                              const newGallery = [...(business.gallery_urls || [])];
                              newGallery[idx] = url;
                              setBusiness({ ...business, gallery_urls: newGallery.filter(Boolean) });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border flex justify-end">
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-1" /> Değişiklikleri Kaydet
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;