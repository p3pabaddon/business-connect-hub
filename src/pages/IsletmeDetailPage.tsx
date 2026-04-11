import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/translations";
import { Star, MapPin, Clock, CheckCircle, Phone, Calendar, MessageSquare, Gift, ArrowRight, Reply } from "lucide-react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { BookingModal } from "@/components/BookingModal";
import { ReviewModal } from "@/components/ReviewModal";
import { ShareButtons } from "@/components/ShareButtons";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getBusinessBySlug, getLoyaltyProgram, getCustomerLoyalty, joinLoyaltyProgram } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { SEOHead } from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StampCard } from "@/components/loyalty/StampCard";
import { ReviewAISummary } from "@/components/ReviewAISummary";

const IsletmeDetailPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [biz, setBiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [loyaltyProgram, setLoyaltyProgram] = useState<any>(null);
  const [customerLoyalty, setCustomerLoyalty] = useState<any>(null);
  const [joining, setJoining] = useState(false);

  const reloadBusiness = () => {
    if (slug) getBusinessBySlug(slug).then(setBiz).catch(() => {});
  };

  const handleJoinLoyalty = async () => {
    if (!user) {
      toast.error("Lütfen önce giriş yapın", {
        description: "Sadakat programına katılmak için bir hesabınız olmalı."
      });
      return;
    }

    setJoining(true);
    try {
      const data = await joinLoyaltyProgram(biz.id);
      setCustomerLoyalty(data);
      toast.success("Müdavim Kartınız Oluşturuldu! ✨", {
        description: `Artık ${biz.name} işletmesinde randevu aldıkça damga kazanacaksınız.`
      });
    } catch (err: any) {
      console.error("Loyalty join error:", err);
      toast.error("Hata oluştu", {
        description: "Kart oluşturulurken bir sorun yaşandı."
      });
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    if (slug) {
      getBusinessBySlug(slug)
        .then(async (data) => {
          console.log("Business Data Loaded:", data);
          console.log("Working Hours:", data?.working_hours);
          console.log("Reviews:", data?.reviews);
          setBiz(data);
          if (data?.reviews) console.log("Reviews found:", data.reviews.length);
          if (data?.id) {
            try {
              const prog = await getLoyaltyProgram(data.id);
              setLoyaltyProgram(prog);
              
              if (user) {
                const custLog = await getCustomerLoyalty(data.id);
                setCustomerLoyalty(custLog);
              }
            } catch (err) {
              console.warn("Loyalty system ignored due to sync error:", err);
            }
          }
        })
        .catch(() => setBiz(null))
        .finally(() => setLoading(false));
    }
  }, [slug, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-surface">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!biz) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-surface">
          <div className="text-center">
            <h2 className="text-xl font-heading text-foreground mb-2">İşletme bulunamadı</h2>
            <p className="text-muted-foreground">Bu işletme mevcut değil veya kaldırılmış olabilir.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const workingHours = typeof biz.working_hours === "string" 
    ? JSON.parse(biz.working_hours) 
    : (biz.working_hours || {});

  const seoTitle = `${biz.name} - ${biz.category} | ${biz.city}`;
  const seoDesc = `${biz.city} konumundaki ${biz.name} için randevunuzu hemen alın. ${biz.category} alanında uzman kadrosuyla hizmetinizde.`;

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title={seoTitle}
        description={seoDesc}
        url={window.location.href}
        image={biz.image_url || "/placeholder.jpg"}
      />
      <Header />
      <main className="flex-1 bg-surface">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{biz.category}</Badge>
                  {biz.is_verified && (
                    <Badge className="bg-accent/10 text-accent border-accent/20">
                      <CheckCircle className="w-3 h-3 mr-1" /> Onaylı
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-heading text-foreground mb-2">{biz.name}</h1>
                <p className="text-muted-foreground mb-3">{biz.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="font-medium text-foreground">{biz.rating}</span>
                    <span>({biz.review_count} yorum)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{biz.district}, {biz.city}</span>
                  </div>
                  {biz.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{biz.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FavoriteButton businessId={biz.id} size="sm" />
                <ShareButtons title={biz.name} />
                <Button size="lg" onClick={() => setBookingOpen(true)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Randevu Al
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio / Gallery */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-heading text-foreground">Çalışmalarımız</h2>
              <p className="text-muted-foreground">
                {biz.gallery_urls && biz.gallery_urls.length > 0 
                  ? "İşletmemizde gerçekleştirilen bazı örnek hizmetler" 
                  : "Yakında burada en iyi çalışmalarımızı göreceksiniz"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(biz.gallery_urls && biz.gallery_urls.length > 0 
              ? biz.gallery_urls 
              : Array.from({ length: 4 }).map((_, i) => `/placeholder-portfolio-${(i % 2) + 1}.jpg`)).map((url: string, i: number) => (
              <div 
                key={i} 
                className={cn(
                  "group relative aspect-[4/5] rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-500",
                  i % 3 === 0 && "md:col-span-1 md:row-span-1",
                  i % 4 === 1 && "md:mt-8",
                  (!biz.gallery_urls || biz.gallery_urls.length === 0) && "opacity-40 grayscale hover:grayscale-0 hover:opacity-100"
                )}
              >
                <img 
                  src={url.startsWith('/') ? `https://images.unsplash.com/photo-${i === 0 ? '1562322140-8baeececf3df' : i === 1 ? '1620331311520-246422ff83f9' : i === 2 ? '1521590832167-7bcbfaa6381f' : '1560066984-138dadb4c035'}?auto=format&fit=crop&q=80&w=800` : url} 
                  alt={`${biz.name} galeri ${i+1}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                  <p className="text-white text-xs font-medium">Örnek Uygulama</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loyalty Program Section */}
        {loyaltyProgram && (
          <div className="bg-slate-900 border-y border-slate-800 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Müdavim Programı</span>
                     </div>
                     <h2 className="text-3xl lg:text-5xl font-heading font-black text-white leading-tight">
                        {biz.name} Müdavimi Olun, <br />
                        <span className="text-primary italic">{loyaltyProgram.reward_title}</span> Kazanın!
                     </h2>
                     <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                        Sizi daha sık görmek istiyoruz! Bu işletmede her {loyaltyProgram.target_stamps} randevunuzda bir damga kazanırsınız. 
                        Hedefe ulaştığınızda özel ödülünüz kapınıza (veya koltuğunuza) gelsin.
                     </p>
                     
                     <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                           <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-primary" />
                           </div>
                           <div>
                              <p className="text-white font-bold text-sm">Katılım Ücretsiz</p>
                              <p className="text-slate-500 text-xs">Tek tıkla hemen başlayın</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                           <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                              <Gift className="w-5 h-5 text-violet-400" />
                           </div>
                           <div>
                              <p className="text-white font-bold text-sm">Dijital Damga</p>
                              <p className="text-slate-500 text-xs">Kart taşıma derdi yok</p>
                           </div>
                        </div>
                     </div>

                     {!customerLoyalty && (
                       <Button 
                        size="lg" 
                        onClick={handleJoinLoyalty}
                        disabled={joining}
                        className="h-14 px-8 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-primary/20 group animate-in fade-in slide-in-from-left duration-700"
                       >
                          {joining ? "OLUŞTURULUYOR..." : "MÜDAVİM KARTI OLUŞTUR"}
                          {!joining && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                       </Button>
                     )}
                  </div>

                  <div className="flex justify-center lg:justify-end">
                     <StampCard 
                        businessName={biz.name}
                        currentStamps={customerLoyalty?.current_stamps || 0}
                        targetStamps={loyaltyProgram.target_stamps}
                        rewardTitle={loyaltyProgram.reward_title}
                        isGuest={!user}
                        className="w-full max-w-[400px] rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl scale-110"
                     />
                  </div>
               </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Services */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-heading text-foreground mb-4">Hizmetler</h2>
                <div className="space-y-3">
                  {(biz.services || []).map((service: any) => (
                    <div
                      key={service.id}
                      className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-accent/30 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-foreground">{service.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {service.duration} dk
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-foreground">₺{service.price}</span>
                      </div>
                    </div>
                  ))}
                  {(!biz.services || biz.services.length === 0) && (
                    <p className="text-muted-foreground text-sm">Henüz hizmet eklenmemiş.</p>
                  )}
                </div>
              </div>

              {/* Staff */}
              {biz.staff && biz.staff.length > 0 && (
                <div>
                  <h2 className="text-xl font-heading text-foreground mb-4">Ekip</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {biz.staff.map((member: any) => (
                      <div key={member.id} className="bg-card border border-border rounded-xl p-4 text-center">
                        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-accent font-heading text-xl">
                            {member.name.split(" ").map((n: string) => n[0]).join("")}
                          </span>
                        </div>
                        <h3 className="font-medium text-foreground text-sm">{member.name}</h3>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                        <div className="flex items-center justify-center gap-1 mt-2 text-xs">
                          <Star className="w-3 h-3 text-warning fill-warning" />
                          <span className="text-foreground">{member.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-heading text-foreground">{t("common.reviews")}</h2>
                    <p className="text-sm text-muted-foreground">Müşterilerimizin deneyimleri</p>
                  </div>
                  {user && (
                    <Button variant="outline" size="sm" onClick={() => setReviewOpen(true)} className="rounded-full">
                      <MessageSquare className="w-4 h-4 mr-2" /> Yorum Yap
                    </Button>
                  )}
                </div>

                {biz.reviews && biz.reviews.length > 0 && (
                  <ReviewAISummary reviews={biz.reviews} />
                )}

                {biz.reviews && biz.reviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {biz.reviews.map((review: any) => (
                      <div key={review.id} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-accent/40 transition-colors shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center border border-border">
                              <span className="text-primary text-sm font-bold uppercase">{review.customer_name[0]}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-foreground block">{review.customer_name}</span>
                              <div className="flex items-center gap-0.5 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={cn(
                                    "w-3 h-3",
                                    i < review.rating ? "text-warning fill-warning" : "text-muted/30"
                                  )} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Doğrulanmış Müşteri</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
                        
                        {review.reply && (
                          <div className="mt-4 p-4 bg-primary/5 border-l-2 border-primary rounded-r-xl space-y-1">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                              <Reply className="w-3 h-3" /> İŞLETME SAHİBİ YANITI
                            </p>
                            <p className="text-xs text-muted-foreground italic leading-relaxed">
                              {review.reply}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                    <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                    <p className="text-muted-foreground text-sm">{t("common.no_reviews")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              <div className="bg-card border border-border rounded-xl p-6 shadow-card sticky top-20">
                <h3 className="font-semibold text-foreground mb-4">{t("common.working_hours")}</h3>
                <div className="space-y-2">
                {Object.entries(workingHours).map(([day, hours]) => {
                    const displayHours = typeof hours === 'object' && hours !== null
                      ? `${(hours as any).start || ''}-${(hours as any).end || ''}`
                      : String(hours);
                    return (
                      <div key={day} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{t(`day.${day.toLowerCase()}`)}</span>
                        <span className={`font-medium ${displayHours.toLowerCase().includes("kapal") ? "text-destructive" : "text-foreground"}`}>
                          {displayHours}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Button className="w-full mt-6" size="lg" onClick={() => setBookingOpen(true)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Randevu Al
                </Button>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="font-semibold text-foreground mb-3">{t("common.address")}</h3>
                <p className="text-sm text-muted-foreground">{biz.address}</p>
                <p className="text-sm text-muted-foreground mb-4">{biz.district}, {biz.city}</p>
                {biz.city && (
                  <iframe
                    title="İşletme Konumu"
                    className="w-full h-48 rounded-lg border border-border"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(`${biz.name} ${biz.district} ${biz.city} Türkiye`)}`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {biz.services && biz.services.length > 0 && (
        <BookingModal
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          businessId={biz.id}
          businessName={biz.name}
          services={biz.services}
          staff={biz.staff || []}
          workingHours={workingHours}
        />
      )}

      <ReviewModal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        businessId={biz.id}
        businessName={biz.name}
        onReviewSubmitted={reloadBusiness}
      />
    </div>
  );
};

export default IsletmeDetailPage;
