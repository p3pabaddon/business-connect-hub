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
  MapPin, CheckCircle, Heart, RefreshCw, Gift, Ticket, Share2
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { getMyPromoCodes, claimReferral } from "@/lib/api";
import { StampCard } from "@/components/loyalty/StampCard";
import { ReferralWidget } from "@/components/loyalty/ReferralWidget";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Bekliyor", variant: "secondary" },
  confirmed: { label: "Onaylandı", variant: "default" },
  completed: { label: "Tamamlandı", variant: "default" },
  cancelled: { label: "İptal", variant: "destructive" },
};

const ProfilPage = () => {
  const { user, loading: authLoading, signOut } = useAuth();
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
      const [aptsRes, reviewsRes, favsRes, loyaltyRes, promosRes, programsRes] = await Promise.all([
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
          .eq("is_active", true)
      ]);
      setAppointments(aptsRes.data || []);
      setReviews(reviewsRes.data || []);
      setFavorites(favsRes.data || []);
      setLoyaltyData(loyaltyRes.data || []);
      setPromoCodes(promosRes || []);
      setLoyaltyPrograms(programsRes.data || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Veri yüklenemedi", variant: "destructive" });
    }
    setLoading(false);
  };

  const cancelAppointment = async (id: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("customer_id", user?.id);

    if (error) {
      toast({ title: "İptal edilemedi", variant: "destructive" });
    } else {
      toast({ title: "Randevu iptal edildi" });
      loadData();
    }
  };

  const upcomingAppointments = appointments.filter(a => 
    ["pending", "confirmed"].includes(a.status) && a.appointment_date >= new Date().toISOString().split("T")[0]
  );
  const pastAppointments = appointments.filter(a => 
    a.status === "completed" || a.status === "cancelled" || a.appointment_date < new Date().toISOString().split("T")[0]
  );

  const hasReviewed = (appointmentId: string) => 
    reviews.some(r => r.appointment_id === appointmentId);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Yükleniyor...</p></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-surface">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
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
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{appointments.length} randevu</span>
                  <span>{reviews.length} yorum</span>
                  <span>{favorites.length} favori</span>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="upcoming">
                Yaklaşan ({upcomingAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Geçmiş ({pastAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Heart className="w-3.5 h-3.5 mr-1" /> Favoriler ({favorites.length})
              </TabsTrigger>
              <TabsTrigger value="reviews">
                Yorumlarım ({reviews.length})
              </TabsTrigger>
              <TabsTrigger value="loyalty" className="text-accent font-bold">
                <Gift className="w-3.5 h-3.5 mr-1" /> Ödüller & Davet
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingAppointments.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Yaklaşan randevunuz yok</p>
                  <Button className="mt-4" onClick={() => navigate("/isletmeler")}>
                    İşletmeleri Keşfet
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="bg-card border border-border rounded-xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{apt.businesses?.name || "İşletme"}</h3>
                            <Badge variant={statusMap[apt.status]?.variant || "secondary"}>
                              {statusMap[apt.status]?.label || apt.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(apt.appointment_date), "d MMMM yyyy", { locale: tr })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {apt.appointment_time?.slice(0, 5)}
                            </span>
                            {apt.businesses?.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {apt.businesses.city}
                              </span>
                            )}
                            {apt.total_price && (
                              <span className="font-medium text-foreground">₺{apt.total_price}</span>
                            )}
                          </div>
                          {apt.notes && <p className="text-xs text-muted-foreground mt-1">{apt.notes}</p>}
                        </div>
                        {["pending", "confirmed"].includes(apt.status) && (
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => cancelAppointment(apt.id)}>
                            <XCircle className="w-4 h-4 mr-1" /> İptal Et
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastAppointments.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Geçmiş randevunuz yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastAppointments.map((apt) => (
                    <div key={apt.id} className="bg-card border border-border rounded-xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{apt.businesses?.name || "İşletme"}</h3>
                            <Badge variant={statusMap[apt.status]?.variant || "secondary"}>
                              {statusMap[apt.status]?.label || apt.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(apt.appointment_date), "d MMMM yyyy", { locale: tr })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {apt.appointment_time?.slice(0, 5)}
                            </span>
                            {apt.total_price && (
                              <span className="font-medium text-foreground">₺{apt.total_price}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/isletme/${apt.businesses?.slug}`)}>
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Tekrar Al
                          </Button>
                          {apt.status === "completed" && !hasReviewed(apt.id) && (
                            <Button variant="outline" size="sm" onClick={() => setReviewModal({
                              open: true,
                              businessId: apt.business_id,
                              businessName: apt.businesses?.name || "İşletme",
                              appointmentId: apt.id,
                            })}>
                              <Star className="w-4 h-4 mr-1" /> Değerlendir
                            </Button>
                          )}
                          {hasReviewed(apt.id) && (
                            <Badge variant="outline" className="text-accent">
                              <CheckCircle className="w-3 h-3 mr-1" /> Değerlendirildi
                            </Badge>
                          )}
                        </div>
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
                      <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex-shrink-0 overflow-hidden">
                        {fav.businesses?.image_url && (
                          <img src={fav.businesses.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        )}
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
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-warning fill-warning" />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(review.created_at), "d MMMM yyyy", { locale: tr })}
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
    </div>
  );
};

export default ProfilPage;
