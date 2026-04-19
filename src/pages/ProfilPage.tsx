import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ReviewModal } from "@/components/ReviewModal";
import { FavoriteButton } from "@/components/FavoriteButton";
import { supabase } from "@/lib/supabase";
import {
  Calendar, Clock, Star, XCircle, MessageSquare, User,
  MapPin, CheckCircle, Heart, RefreshCw, Gift, Ticket, Share2, Megaphone,
  Info, Map, FileText, Phone, Settings, Shield, BellRing, Mail, Cookie
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { getMyPromoCodes, claimReferral } from "@/lib/api";
import { StampCard } from "@/components/loyalty/StampCard";
import { ReferralWidget } from "@/components/loyalty/ReferralWidget";
import { getCategoryPlaceholder } from "@/lib/utils";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Bekliyor", variant: "secondary" },
  confirmed: { label: "Onaylandı", variant: "default" },
  completed: { label: "Tamamlandı", variant: "default" },
  cancelled: { label: "İptal", variant: "destructive" },
};

const ProfilPage = () => {
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<{ open: boolean; businessId: string; businessName: string; appointmentId: string }>({
    open: false, businessId: "", businessName: "", appointmentId: ""
  });
  const [loyaltyData, setLoyaltyData] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<any[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [myBusinesses, setMyBusinesses] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/giris");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [aptsRes, reviewsRes, favsRes, loyaltyRes, promosRes, programsRes, waitlistRes, announcementsRes, myBizRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("*, businesses(name, slug, city)")
          .eq("customer_id", user.id)
          .order("appointment_date", { ascending: false }),
        supabase
          .from("reviews")
          .select("*, businesses(name, slug)")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("favorites")
          .select("*, businesses(id, name, slug, city, category, rating, review_count, image_url)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("customer_loyalty")
          .select("*, businesses(name, slug)")
          .eq("customer_id", user.id),
        getMyPromoCodes(),
        supabase
          .from("loyalty_programs")
          .select("*")
          .eq("is_active", true),
        supabase
          .from("waitlist")
          .select("*, businesses(name, slug, city, image_url)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("announcements")
          .select("*")
          .in("target", ["all", "customers"])
          .order("created_at", { ascending: false }),
        supabase
          .from("businesses")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })
      ]);
      setAppointments(aptsRes.data || []);
      setReviews(reviewsRes.data || []);
      setFavorites(favsRes.data || []);
      setLoyaltyData(loyaltyRes.data || []);
      setPromoCodes(promosRes || []);
      setLoyaltyPrograms(programsRes.data || []);
      setWaitlistEntries(waitlistRes.data || []);
      setAnnouncements(announcementsRes.data || []);
      setMyBusinesses(myBizRes.data || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Veri yüklenemedi", variant: "destructive" });
    }
    setLoading(false);
  };

  const cancelAppointment = async (id: string) => {
    // Optimistik güncelleme: Önce listeden çıkartalım ki kullanıcı anında silindiğini görsün
    const backup = [...appointments];
    setAppointments(prev => prev.filter(a => a.id !== id));
    
    // Veritabanından sil
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", id)
      .eq("customer_id", user?.id);

    if (error) {
      // Hata olursa geri al
      setAppointments(backup);
      toast({ title: "Silinemedi", variant: "destructive", description: "Bir hata oluştu, lütfen tekrar deneyin." });
    } else {
      toast({ title: "Randevu silindi" });
      // Diğer verileri sessizce güncelle (Loading true yapmadan)
      silentReload(); 
    }
  };

  const silentReload = async () => {
    if (!user) return;
    try {
      const [aptsRes, favsRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("*, businesses(name, slug, city)")
          .eq("customer_id", user.id)
          .order("appointment_date", { ascending: false }),
        supabase
          .from("favorites")
          .select("*, businesses(id, name, slug, city, category, rating, review_count, image_url)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      ]);
      setAppointments(aptsRes.data || []);
      setFavorites(favsRes.data || []);
    } catch (e) { console.error(e); }
  };

  const upcomingAppointments = appointments.filter(a => 
    ["pending", "confirmed"].includes(a.status) && a.appointment_date >= new Date().toISOString().split("T")[0]
  );
  const pastAppointments = appointments.filter(a => 
    (a.status === "completed" || a.appointment_date < new Date().toISOString().split("T")[0]) && a.status !== "cancelled"
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          <div className="h-32 bg-card/50 animate-pulse rounded-xl mb-8" />
          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-24 bg-card/50 animate-pulse rounded-full flex-shrink-0" />)}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-card/50 animate-pulse rounded-xl" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-surface text-foreground">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-heading text-foreground">
                  {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Kullanıcı"}
                </h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <div className="w-full overflow-x-auto -mx-1 px-1 no-scrollbar">
              <TabsList className="bg-card border border-border h-auto inline-flex w-max min-w-full p-1 gap-1">
                <TabsTrigger value="upcoming" className="px-4 py-2 flex-shrink-0">Yaklaşan ({upcomingAppointments.length})</TabsTrigger>
                <TabsTrigger value="applications" className="px-4 py-2 flex-shrink-0">Başvurularım ({myBusinesses.length})</TabsTrigger>
                <TabsTrigger value="notifications" className="px-4 py-2 flex-shrink-0">Bildirimler ({waitlistEntries.length + announcements.length})</TabsTrigger>
                <TabsTrigger value="past" className="px-4 py-2 flex-shrink-0">Geçmiş ({pastAppointments.length})</TabsTrigger>
                <TabsTrigger value="favorites" className="px-4 py-2 flex-shrink-0">Favoriler ({favorites.length})</TabsTrigger>
                <TabsTrigger value="reviews" className="px-4 py-2 flex-shrink-0">Yorumlarım ({reviews.length})</TabsTrigger>
                <TabsTrigger value="loyalty" className="px-4 py-2 flex-shrink-0">Ödüller</TabsTrigger>
                <TabsTrigger value="settings" className="px-4 py-2 flex-shrink-0">Ayarlar</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upcoming">
              {upcomingAppointments.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">Yaklaşan randevunuz yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div 
                      key={apt.id} 
                      className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer group"
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white group-hover:text-primary transition-colors">{apt.businesses?.name || "İşletme"}</h3>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(apt.appointment_date), "d MMMM yyyy", { locale: tr })}
                            </span>
                            <span className="flex items-center gap-1 text-primary/80 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              {apt.appointment_time?.slice(0, 5)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusMap[apt.status]?.variant || "secondary"} className="hidden sm:inline-flex">
                            {statusMap[apt.status]?.label}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10 border-destructive/20" 
                            onClick={(e) => {
                              e.stopPropagation(); // Modalı açmasın
                              cancelAppointment(apt.id);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> İptal Et
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              {announcements.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-heading text-lg flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-accent" /> Platform Duyuruları
                  </h3>
                  {announcements.map((ann) => (
                    <div key={ann.id} className="bg-accent/10 border border-accent/20 rounded-xl p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-foreground">{ann.title}</h4>
                        <span className="text-[10px] text-muted-foreground">{format(new Date(ann.created_at), "d MMM", { locale: tr })}</span>
                      </div>
                      <p className="text-sm text-foreground/80">{ann.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {waitlistEntries.length > 0 && (
                <div className="space-y-3 mt-8">
                  <h3 className="font-heading text-lg">Bekleme Listesi Durumunuz</h3>
                  {waitlistEntries.map((entry) => (
                    <div key={entry.id} className="bg-card border border-border rounded-xl p-5 mb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{entry.businesses?.name}</h3>
                          <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {entry.date || entry.desired_date}
                            </span>
                            <Badge variant={entry.is_notified ? "default" : "secondary"}>
                              {entry.is_notified ? "Müsait - Hemen Alın" : "Sırada Bekliyor"}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          variant={entry.is_notified ? "default" : "outline"} 
                          size="sm" 
                          onClick={() => navigate(`/isletme/${entry.businesses?.slug}`)}
                        >
                          {entry.is_notified ? "Şimdi Randevu Al" : "İşletmeye Git"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {waitlistEntries.length === 0 && announcements.length === 0 && (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">Yeni bildirim veya duyuru bulunmuyor.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastAppointments.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">Geçmiş randevunuz yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastAppointments.map((apt) => (
                    <div key={apt.id} className="bg-card border border-border rounded-xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{apt.businesses?.name || "İşletme"}</h3>
                          <Badge variant={statusMap[apt.status]?.variant || "secondary"}>
                            {statusMap[apt.status]?.label || apt.status}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/isletme/${apt.businesses?.slug}`)}>
                          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Tekrar Al
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites">
              {favorites.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Henüz favori işletmeniz yok</p>
                  <Button className="mt-4" onClick={() => navigate("/isletmeler")}>
                    İşletmeleri Keşfet
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map((fav) => (
                    <Link
                      key={fav.id}
                      to={`/isletme/${fav.businesses?.slug}`}
                      className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-accent/30 transition-colors"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex-shrink-0 appearance-none overflow-hidden">
                        <img 
                          src={fav.businesses?.image_url || fav.businesses?.logo || getCategoryPlaceholder(fav.businesses?.category)} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          loading="lazy" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground truncate">{fav.businesses?.name}</h3>
                        <p className="text-xs text-muted-foreground">{fav.businesses?.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-3 h-3 text-warning fill-warning" />
                          <span className="text-xs text-foreground">{fav.businesses?.rating}</span>
                          <span className="text-xs text-muted-foreground">• {fav.businesses?.city}</span>
                        </div>
                      </div>
                      <FavoriteButton businessId={fav.businesses?.id} />
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              {reviews.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Henüz yorum yapmadınız</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-card border border-border rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground text-sm">{review.businesses?.name || "İşletme"}</h3>
                        <div className="flex items-center gap-0.5">
                          {review.rating && Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-warning fill-warning" />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                      <p className="text-xs text-muted-foreground mt-2">
                         {review.created_at ? format(new Date(review.created_at), "d MMMM yyyy", { locale: tr }) : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="loyalty" className="space-y-8">
              {/* Referral Widget */}
              <ReferralWidget referralCode={user?.id.slice(0, 8).toUpperCase() || "REF123"} />

              {/* Active Promo Codes */}
              {promoCodes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-heading text-lg flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-accent" /> Hediyelerin & Kuponların
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {promoCodes.map((promo) => (
                      <div key={promo.id} className="bg-card border-2 border-dashed border-accent/20 rounded-xl p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-2 py-1 text-[10px] font-bold uppercase rounded-bl-lg">
                          Aktif
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mb-1">{promo.code}</p>
                        <h4 className="font-bold text-foreground">
                          {promo.discount_type === 'fixed' ? `₺${promo.discount_value}` : `%${promo.discount_value}`} İndirim
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {promo.business?.name ? `${promo.business.name} işletmesinde geçerli` : "Tüm işletmelerde geçerli"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-2 italic">
                          Son gün: {format(new Date(promo.expires_at), "d MMMM", { locale: tr })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loyalty Stamp Cards */}
              <div className="space-y-4">
                <h3 className="font-heading text-lg flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" /> Dijital Sadakat Kartların
                </h3>
                {loyaltyData.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Henüz bir sadakat programına katılmadınız</p>
                    <p className="text-xs text-muted-foreground mt-1">Randevularınız tamamlandıkça damgalarınız burada görünecektir.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {loyaltyData.map((loyalty) => {
                      const program = loyaltyPrograms.find(p => p.business_id === loyalty.business_id);
                      if (!program) return null;
                      
                      return (
                        <StampCard 
                          key={loyalty.id}
                          businessName={loyalty.businesses?.name}
                          currentStamps={loyalty.current_stamps}
                          targetStamps={program.target_stamps}
                          rewardTitle={program.reward_title}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="applications">
              {myBusinesses.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">İşletme başvurunuz bulunmuyor.</p>
                  <Button className="mt-4" onClick={() => navigate("/isletme-ekle")}>
                    Hemen İşletme Ekle
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-heading text-lg">İşletme Başvurularım</h3>
                  {myBusinesses.map((biz) => (
                    <div key={biz.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-foreground text-lg">{biz.name}</h4>
                        <p className="text-sm text-muted-foreground">{biz.category} • {biz.city}</p>
                      </div>
                      <Badge variant={["approved", "active"].includes(biz.status) ? "default" : biz.status === "rejected" ? "destructive" : "secondary"}>
                        {biz.status === "pending" ? "İnceleniyor" : ["approved", "active"].includes(biz.status) ? "Aktif" : "Reddedildi"}
                      </Badge>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    Not: Onaylanan işletmelerinize ait bilgileri ve yönetim araçlarını yakında erişilebilir olacak olan işletme panelinizden yönetebilirsiniz.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-heading text-foreground">Hesap ve Pazarlama Ayarları</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="marketing-consent" className="text-base font-semibold">Pazarlama İletişimi</Label>
                        <Badge variant="outline" className="text-[10px] h-4">Bülten & SMS</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        En yeni kampanya ve fırsat önerilerini almayı kabul edersiniz.
                      </p>
                    </div>
                    <Switch 
                      id="marketing-consent" 
                      checked={profile?.marketing_consent || false} 
                      onCheckedChange={async (val) => {
                        const { error } = await supabase.from('profiles').update({ marketing_consent: val }).eq('id', user?.id);
                        if (!error) {
                          toast({ title: "Pazarlama tercihi güncellendi" });
                          refreshProfile();
                        }
                      }}
                    />
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Cookie className="w-5 h-5 text-primary" />
                        <Label className="text-base font-semibold">Çerez Tercihleri</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tarayıcınızda sakladığımız çerez tercihlerini sıfırlayın.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-[10px] font-black tracking-widest uppercase h-9 rounded-xl border-primary/20 hover:bg-primary/5"
                      onClick={() => {
                        localStorage.removeItem('cookie-consent');
                        window.location.reload();
                      }}
                    >
                      Ayarları Sıfırla
                    </Button>
                  </div>

                  <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">KVKK & Gizlilik Bilgilendirmesi</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Pazarlama tercihlerinizi dilediğiniz zaman buradan değiştirebilirsiniz. 
                      İzin onaylarınız, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında 
                      güvenli bir şekilde loglanmaktadır.
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">KVKK Durumu:</span>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] tracking-widest px-3 py-1">
                        ONAYLANDI (Kayıt Esnasında)
                      </Badge>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/10" onClick={signOut}>
                    Oturumu Kapat
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      <ReviewModal
        open={reviewModal.open}
        onOpenChange={(open) => setReviewModal(prev => ({ ...prev, open }))}
        businessId={reviewModal.businessId}
        businessName={reviewModal.businessName}
        appointmentId={reviewModal.appointmentId}
        onReviewSubmitted={loadData}
      />

      {/* Randevu Detay Modalı */}
      {selectedAppointment && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity ${isDetailModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedAppointment.businesses?.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {selectedAppointment.businesses?.city || "Şehir Bilgisi Yok"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsDetailModalOpen(false)} className="rounded-full">
                  <XCircle className="w-6 h-6 text-muted-foreground" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-surface rounded-xl border border-border/50">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tarih ve Saat</p>
                    <p className="text-sm font-medium text-white">
                      {format(new Date(selectedAppointment.appointment_date), "d MMMM yyyy", { locale: tr })} • {selectedAppointment.appointment_time?.slice(0, 5)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-surface rounded-xl border border-border/50">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Durum</p>
                    <p className="text-sm font-medium text-white">{statusMap[selectedAppointment.status]?.label}</p>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div className="p-3 bg-surface rounded-xl border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Randevu Notunuz
                    </p>
                    <p className="text-sm text-foreground/90 italic">"{selectedAppointment.notes}"</p>
                  </div>
                )}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full" onClick={() => setIsDetailModalOpen(false)}>
                  Kapat
                </Button>
                <Button className="w-full bg-primary" onClick={() => navigate(`/isletme/${selectedAppointment.businesses?.slug}`)}>
                  İşletmeye Git
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilPage;
