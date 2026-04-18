import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/translations";
import { Star, MapPin, Clock, CheckCircle, Phone, Calendar, MessageSquare, Gift, ArrowRight, Reply, ThumbsUp, Flag, Briefcase, Edit } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookingModal } from "@/components/BookingModal";
import { ReviewModal } from "@/components/ReviewModal";
import { ReportModal } from "@/components/ReportModal";
import { ShareButtons } from "@/components/ShareButtons";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useBusinessBySlug } from "@/hooks/useQueries";
import { getLoyaltyProgram, getCustomerLoyalty, joinLoyaltyProgram } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { SEOHead } from "@/components/SEOHead";
import { cn, getCategoryPlaceholder, toTitleCase, hexToHsl } from "@/lib/utils";
import { toast } from "sonner";
import { StampCard } from "@/components/loyalty/StampCard";
import { ReviewAISummary } from "@/components/ReviewAISummary";
import { supabase } from "@/lib/supabase";
import { MoveRight, ImageIcon, Sparkles } from "lucide-react";
import { markReviewHelpful, reportReview } from "@/lib/biz-api";
import { SocialProofWidget } from "@/components/SocialProofWidget";

interface IsletmeDetailContentProps {
  biz: any;
  loyaltyProgram?: any;
  customerLoyalty?: any;
  canReview?: boolean;
  portfolio?: any[];
  onJoinLoyalty?: () => void;
  onHelpful?: (id: string) => void;
  onReport?: (id: string) => void;
  reloadBusiness?: () => void;
  isPreview?: boolean;
}

export const IsletmeDetailContent = ({ 
  biz, 
  loyaltyProgram, 
  customerLoyalty, 
  canReview, 
  portfolio,
  onJoinLoyalty,
  onHelpful,
  onReport,
  reloadBusiness,
  isPreview = false
}: IsletmeDetailContentProps) => {
  const { user } = useAuth();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [markedHelpful, setMarkedHelpful] = useState<Set<string>>(new Set());

  const workingHours = typeof biz.working_hours === "string" 
    ? JSON.parse(biz.working_hours) 
    : (biz.working_hours || {});

  const branding = {
    primary_color: "#7c3aed",
    secondary_color: "#7c3aed",
    header_banner: "",
    header_banner_position: 50,
    ...biz.branding_config
  };

  const mockServices = [
    { id: "m1", name: "Örnek Hizmet 1", duration: 45, price: 250 },
    { id: "m2", name: "Örnek Hizmet 2", duration: 60, price: 450 },
    { id: "m3", name: "Örnek Hizmet 3", duration: 30, price: 150 },
  ];

  const mockReviews = [
    { id: "r1", customer_name: "Mert A.", rating: 5, comment: "Harika bir deneyim! Atmosfer çok şık ve hizmet kalitesi üst düzey. Herkese tavsiye ederim.", helpful_count: 12 },
    { id: "r2", customer_name: "Selin K.", rating: 5, comment: "İşini çok profesyonelce yapıyorlar. Beklediğimden çok daha iyi sonuç aldım.", helpful_count: 8 },
  ];

  const services = isPreview && (!biz.services || biz.services.length === 0) ? mockServices : (biz.services || []);
  const reviews = isPreview && (!biz.reviews || biz.reviews.length === 0) ? mockReviews : (biz.reviews || []);

  const handleHelpfulClick = (id: string) => {
    if (markedHelpful.has(id)) return;
    setMarkedHelpful(prev => new Set([...prev, id]));
    onHelpful?.(id);
  };

  const handleReportClick = (id: string) => {
    setSelectedReviewId(id);
    setReportOpen(true);
    onReport?.(id);
  };

  const wrapWithStyles = (content: React.ReactNode) => {
    if (!biz.branding_config?.custom_colors) return content;
    
    const selector = isPreview ? '.preview-scoped' : ':root';
    
    return (
      <div className={cn(isPreview && "preview-scoped h-full w-full")}>
        <style dangerouslySetInnerHTML={{ __html: `
          ${selector} {
            --primary: ${hexToHsl(branding.primary_color)};
            --accent: ${hexToHsl(branding.secondary_color)};
            --secondary: ${hexToHsl(branding.secondary_color)};
            --ring: ${hexToHsl(branding.primary_color)};
          }
        `}} />
        {content}
      </div>
    );
  };

  return wrapWithStyles(
    <main className={cn("flex-1 bg-surface pb-20", isPreview && "pb-0")}>
      {/* Hero */}
      <div 
        className={cn(
          "relative py-8 sm:py-12 transition-all duration-500",
          branding.header_banner 
            ? "min-h-[250px] sm:min-h-[300px] flex items-end" 
            : "bg-gradient-to-br from-primary/10 to-accent/10"
        )}
        style={branding.header_banner ? {
          backgroundImage: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%), url(${branding.header_banner})`,
          backgroundSize: 'cover',
          backgroundPosition: `center ${branding.header_banner_position ?? 50}%`,
        } : {}}
      >
        {branding.header_banner && (
          <div className="absolute inset-0 bg-black/20" />
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 border-b border-white/10 pb-6 mb-6">
                {biz.logo ? (
                  <div className={cn(
                    "w-20 h-20 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 shadow-2xl bg-white shrink-0 transition-transform hover:scale-105",
                    branding.header_banner ? "border-white/20" : "border-white"
                  )}>
                    <img src={biz.logo} alt={biz.name} className="w-full h-full object-contain p-2" />
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-primary/10 flex items-center justify-center shrink-0 border-4 border-white/50 shadow-lg">
                    <Briefcase className="w-10 h-10 text-primary opacity-40" />
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-white/10 text-white backdrop-blur-md border-white/20">
                      {toTitleCase(biz.category)}
                    </Badge>
                    {biz.is_verified && (
                      <Badge className="bg-accent text-white border-accent/20">
                        <CheckCircle className="w-3 h-3 mr-1" /> Onaylı
                      </Badge>
                    )}
                  </div>
                  <h1 className={cn(
                    "text-2xl sm:text-5xl font-heading font-black mb-1 tracking-tight",
                    branding.header_banner ? "text-white drop-shadow-lg" : "text-foreground"
                  )}>
                    {biz.name}
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className={cn(
                      "font-bold text-lg",
                      branding.header_banner ? "text-white" : "text-foreground"
                    )}>{biz.rating || "0.0"}</span>
                    <span className={cn(
                      "text-sm font-medium",
                      branding.header_banner ? "text-white/70" : "text-muted-foreground"
                    )}>({biz.review_count || 0} yorum)</span>
                  </div>
                </div>
              </div>
              
              <p className={cn(
                "max-w-2xl text-sm sm:text-base leading-relaxed mb-6",
                branding.header_banner ? "text-white/80" : "text-muted-foreground"
              )}>
                {biz.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className={cn(
                  "flex items-center gap-1.5",
                  branding.header_banner ? "text-white/70" : "text-muted-foreground"
                )}>
                  <MapPin className="w-4 h-4" />
                  <span>{biz.district}, {biz.city}</span>
                </div>
                {biz.phone && (
                  <div className={cn(
                    "flex items-center gap-1.5",
                    branding.header_banner ? "text-white/70" : "text-muted-foreground"
                  )}>
                    <Phone className="w-4 h-4" />
                    <span>{biz.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {!isPreview && user?.id === biz.owner_id && (
                <Link to="/isletmem">
                  <Button variant="outline" size="sm" className="rounded-xl bg-white/10 text-white border-white/20 backdrop-blur-md hover:bg-white/20 border-white/30 transition-all font-bold group px-3">
                    <Edit className="w-3 h-3 sm:mr-2 group-hover:rotate-12 transition-transform" />
                    <span className="text-[10px] sm:text-sm">Yönetim Paneli</span>
                  </Button>
                </Link>
              )}
              {!isPreview && (
                <div className="flex items-center gap-2">
                  <FavoriteButton businessId={biz.id} size="sm" />
                  <ShareButtons title={biz.name} url={window.location.href} />
                </div>
              )}
              <Button size="lg" className="flex-1 sm:flex-none rounded-xl sm:rounded-2xl shadow-xl shadow-primary/20 h-10 sm:h-12 px-4 sm:px-8 font-bold text-sm sm:text-base" onClick={() => !isPreview && setBookingOpen(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                Randevu Al
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio / Gallery */}
      {portfolio && portfolio.length > 0 && (
        <div id="portfolio" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight italic flex items-center gap-2">
                 <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-accent" /> Çalışmalarımız
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                En iyi sonuçlarımızı ve referanslarımızı inceleyin
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {portfolio.slice(0, 8).map((item: any, i: number) => (
              <div 
                key={item.id} 
                className={cn(
                  "group relative aspect-[4/5] rounded-[1.2rem] sm:rounded-[2rem] overflow-hidden border border-border bg-card shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500",
                  i % 4 === 1 && "lg:mt-8",
                  i % 4 === 3 && "lg:mt-4"
                )}
              >
                <img 
                  src={item.main_image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0">
                  <h4 className="text-white font-black uppercase tracking-tight text-sm mb-1">{item.title}</h4>
                  <p className="text-white/70 text-[10px] leading-relaxed line-clamp-2">{item.description || "Referans çalışma"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loyalty Program Section */}
      {loyaltyProgram && (
        <div className="bg-slate-900 border-y border-slate-800 py-16 mt-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="text-xs font-bold text-accent uppercase tracking-widest">Müdavim Programı</span>
                   </div>
                   <h2 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-black text-white leading-tight">
                      {biz.name} Müdavimi Olun, <br />
                      <span className="text-accent italic">{loyaltyProgram.reward_title}</span> Kazanın!
                   </h2>
                   <p className="text-slate-400 text-sm sm:text-lg leading-relaxed max-w-xl">
                      Sizi daha sık görmek istiyoruz! Bu işletmede her {loyaltyProgram.target_stamps} randevunuzda bir damga kazanırsınız. 
                   </p>
                   
                   {!customerLoyalty && (
                     <Button 
                      size="lg" 
                      onClick={() => !isPreview && onJoinLoyalty?.()}
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-heading text-foreground mb-4 font-black uppercase tracking-tight">Hizmetler</h2>
              <div className="space-y-3">
                {services.map((service: any) => (
                  <div
                    key={service.id}
                    className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-accent/30 transition-all hover:shadow-md"
                  >
                    <div>
                      <h3 className="font-bold text-foreground">{service.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary/50" /> {service.duration} dk
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-foreground text-lg">₺{service.price}</span>
                    </div>
                  </div>
                ))}
                {services.length === 0 && (
                  <p className="text-muted-foreground text-sm italic">Henüz hizmet eklenmemiş.</p>
                )}
              </div>
            </div>

            {/* Staff */}
            {biz.staff && biz.staff.length > 0 && (
              <div>
                <h2 className="text-xl font-heading text-foreground mb-4 font-black uppercase tracking-tight">Ekibimiz</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {biz.staff.map((member: any) => (
                    <div key={member.id} className="bg-card border border-border rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center shadow-sm">
                      <div className="w-20 h-20 bg-accent/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-accent/20 shadow-inner">
                        <span className="text-accent font-heading text-2xl font-black">
                          {member.name.split(" ").map((n: string) => n[0]).join("")}
                        </span>
                      </div>
                      <h3 className="font-bold text-foreground text-base tracking-tight">{member.name}</h3>
                      <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">{member.role}</p>
                      <div className="flex items-center justify-center gap-1 mt-3">
                        <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                        <span className="text-foreground font-bold text-sm">{member.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Reviews */}
            <div className="pt-12 border-t border-border mt-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Müşteri Yorumları</h2>
                  <p className="text-sm text-muted-foreground font-medium mt-1 italic">Müşterilerimizin gerçek deneyimleri</p>
                </div>
                {!isPreview && user && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      if (!canReview) {
                        toast.error("Yorum Yapılamaz", {
                          description: "Sadece bu işletmeden hizmet alıp randevusu tamamlanan müşterilerimiz yorum yapabilir."
                        });
                        return;
                      }
                      setReviewOpen(true);
                    }} 
                    className={cn("rounded-2xl h-10 px-6 font-bold", !canReview && "opacity-50")}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" /> Yorum Yap
                  </Button>
                )}
              </div>

              {reviews.length > 0 && (
                <ReviewAISummary reviews={reviews} />
              )}

              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:border-primary/30 transition-all shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/20">
                            <span className="text-primary text-sm font-black uppercase">{review.customer_name[0]}</span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground block tracking-tight">{review.customer_name}</span>
                            <div className="flex items-center gap-0.5 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} 
                                  fill={i < review.rating ? "currentColor" : "none"}
                                  className={cn(
                                    "w-3 h-3",
                                    i < review.rating ? "text-warning" : "text-muted/20"
                                  )} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-accent/20 text-accent bg-accent/5">Doğrulanmış</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed italic font-medium">"{review.comment}"</p>
                      
                      {!isPreview && (
                        <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
                          <button 
                            onClick={() => handleHelpfulClick(review.id)}
                            disabled={markedHelpful.has(review.id)}
                            className={cn(
                              "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors",
                              markedHelpful.has(review.id) ? "text-primary" : "text-muted-foreground hover:text-primary"
                            )}
                          >
                            <ThumbsUp className={cn("w-3.5 h-3.5", markedHelpful.has(review.id) && "fill-current")} />
                            Faydalı ({review.helpful_count || 0})
                          </button>
                          
                          <button 
                            onClick={() => handleReportClick(review.id)}
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-rose-500 transition-colors"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            Rapor Et
                          </button>
                        </div>
                      )}
                      
                      {review.reply && (
                        <div className="mt-4 p-4 bg-muted/30 border-l-4 border-accent rounded-r-2xl">
                          <p className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2 mb-1">
                            <Reply className="w-3 h-3" /> İŞLETME YANITI
                          </p>
                          <p className="text-xs text-muted-foreground italic font-medium leading-relaxed">
                            {review.reply}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-border">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">{t("common.no_reviews")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">

            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm">
              <h3 className="font-black text-foreground uppercase tracking-tight mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary/60" /> Mesai Saatleri
              </h3>
              <div className="space-y-3">
              {Object.entries(workingHours)
                .sort(([dayA], [dayB]) => {
                  const daysOrder = ["monday", "pazartesi", "tuesday", "salı", "wednesday", "çarşamba", "thursday", "perşembe", "friday", "cuma", "saturday", "cumartesi", "sunday", "pazar"];
                  let idxA = daysOrder.indexOf(dayA.toLowerCase());
                  let idxB = daysOrder.indexOf(dayB.toLowerCase());
                  if (idxA === -1) idxA = 999;
                  if (idxB === -1) idxB = 999;
                  return idxA - idxB;
                })
                .map(([day, hours]) => {
                  const displayHours = typeof hours === 'object' && hours !== null
                    ? `${(hours as any).start || ''}-${(hours as any).end || ''}`
                    : String(hours);
                  const isClosed = displayHours.toLowerCase().includes("kapal") || (typeof hours === 'object' && (hours as any).closed);
                  const translatedDay = t(`day.${day.toLowerCase()}`);
                  const finalDayName = translatedDay.startsWith('day.') ? day : translatedDay;
                  
                  return (
                    <div key={day} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0 pb-2">
                      <span className="text-muted-foreground font-bold capitalize">{finalDayName}</span>
                      <span className={cn(
                        "font-black tracking-tight",
                        isClosed ? "text-rose-500" : "text-foreground"
                      )}>
                        {isClosed ? "Kapalı" : displayHours}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Button className="w-full mt-8 h-14 rounded-2xl shadow-xl shadow-primary/20 font-black text-sm uppercase tracking-widest" size="lg" onClick={() => !isPreview && setBookingOpen(true)}>
                <Calendar className="w-5 h-5 mr-3" />
                Sıra / Randevu Al
              </Button>
            </div>

            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm">
              <h3 className="font-black text-foreground uppercase tracking-tight mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary/60" /> Adres & Konum
              </h3>
              <p className="text-sm font-medium text-foreground leading-relaxed">{biz.address}</p>
              <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-2 mb-6">{biz.district}, {biz.city}</p>
              
              {!isPreview && biz.city && (
                <div className="rounded-2xl overflow-hidden border border-border shadow-inner">
                  <iframe
                    title="İşletme Konumu"
                    className="w-full h-56 rounded-lg grayscale hover:grayscale-0 transition-all duration-700"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(`${biz.name} ${biz.district} ${biz.city} Türkiye`)}`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isPreview && (
        <>
          <BookingModal
            open={bookingOpen}
            onOpenChange={setBookingOpen}
            businessId={biz.id}
            businessName={biz.name}
            services={biz.services || []}
            staff={biz.staff || []}
            workingHours={workingHours}
            dynamicPricing={biz.dynamic_pricing}
          />

          <ReviewModal
            open={reviewOpen}
            onOpenChange={setReviewOpen}
            businessId={biz.id}
            businessName={biz.name}
            onReviewSubmitted={reloadBusiness}
          />

          <ReportModal 
            open={reportOpen}
            onOpenChange={setReportOpen}
            reviewId={selectedReviewId || ""}
          />
        </>
      )}
      <SocialProofWidget businessId={biz.id} />
    </main>
  );
};

const IsletmeDetailPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { data: biz, isLoading: bizLoading, refetch: reloadBusiness } = useBusinessBySlug(slug!);

  const { data: loyaltyProgram } = useQuery({
    queryKey: ["loyalty", biz?.id],
    queryFn: () => getLoyaltyProgram(biz!.id),
    enabled: !!biz?.id,
  });

  const { data: customerLoyalty, refetch: refetchCustomerLoyalty } = useQuery({
    queryKey: ["customer-loyalty", biz?.id, user?.id],
    queryFn: () => getCustomerLoyalty(biz!.id),
    enabled: !!biz?.id && !!user?.id,
  });

  const { data: canReview } = useQuery({
    queryKey: ["can-review", biz?.id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id")
        .eq("business_id", biz!.id)
        .eq("customer_id", user!.id)
        .eq("status", "completed")
        .limit(1);
      
      if (error) return false;
      return data && data.length > 0;
    },
    enabled: !!biz?.id && !!user?.id,
  });

  const { data: portfolio } = useQuery({
    queryKey: ["portfolio", biz?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_portfolios")
        .select("*")
        .eq("business_id", biz!.id)
        .order("created_at", { ascending: false });
      
      if (error) return [];
      return data;
    },
    enabled: !!biz?.id,
  });

  const handleJoinLoyalty = async () => {
    if (!user || !biz) return;
    try {
      await joinLoyaltyProgram(biz.id);
      refetchCustomerLoyalty();
      toast.success("Müdavim Kartınız Oluşturuldu! ✨");
    } catch {
      toast.error("Hata oluştu");
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (!user) return;
    try {
      await markReviewHelpful(reviewId);
      reloadBusiness();
    } catch {}
  };

  if (bizLoading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-surface py-20">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </main>
    );
  }

  if (!biz) {
    return (
      <main className="flex-1 flex items-center justify-center bg-surface py-20">
        <div className="text-center">
          <h2 className="text-xl font-heading text-foreground mb-2">İşletme bulunamadı</h2>
          <p className="text-muted-foreground">Bu işletme mevcut değil veya kaldırılmış olabilir.</p>
        </div>
      </main>
    );
  }

  const seoTitle = `${biz.name} | ${toTitleCase(biz.category)} - ${biz.district}, ${biz.city}`;
  const seoDesc = biz.description;

  return (
    <>
      <SEOHead 
        title={seoTitle}
        description={seoDesc}
        url={window.location.href}
        image={biz.image_url || biz.logo || getCategoryPlaceholder(biz.category)}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": biz.name,
          "image": biz.image_url || biz.logo,
          "description": biz.description,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": biz.address,
            "addressLocality": biz.district,
            "addressRegion": biz.city,
            "addressCountry": "TR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": biz.latitude,
            "longitude": biz.longitude
          },
          "url": window.location.href,
          "telephone": biz.phone,
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": biz.rating || "5",
            "reviewCount": biz.review_count || "1"
          }
        }}
      />
      
      <IsletmeDetailContent 
        biz={biz}
        loyaltyProgram={loyaltyProgram}
        customerLoyalty={customerLoyalty}
        canReview={canReview}
        portfolio={portfolio}
        onJoinLoyalty={handleJoinLoyalty}
        onHelpful={handleHelpful}
        reloadBusiness={reloadBusiness}
      />
    </>
  );
};

export default IsletmeDetailPage;
