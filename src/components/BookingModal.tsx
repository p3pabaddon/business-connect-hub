import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Star, Zap, ThumbsUp, TrendingUp, Sparkles, ShieldCheck, Clock, User, Mail, Loader2, CreditCard, RefreshCw, CheckCircle, MapPin, MessageSquare, ChevronRight, ChevronLeft, Check, Ticket, X } from "lucide-react";
import { createAppointment, getOccupiedSlots, joinWaitlist } from "@/lib/api";
import { toast } from "sonner";
import { checkRateLimit, getRateLimitMessage, checkOtpAbuse } from "@/lib/rate-limiter";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { calculateSmartPrice, generateTimeSlots, getWorkingHoursForDay, isSlotOccupied } from "@/lib/booking-utils";
import { supabase } from "@/lib/supabase";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  businessName: string;
  services: Service[];
  staff: StaffMember[];
  workingHours: any;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function BookingModal({ open, onOpenChange, businessId, businessName, services, staff, workingHours }: BookingModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [inWaitlist, setInWaitlist] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [occupiedSlots, setOccupiedSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isKvkkAccepted, setIsKvkkAccepted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (selectedDate) {
      fetchOccupiedSlots();
    }
  }, [selectedDate, selectedStaff]);

  const fetchOccupiedSlots = async () => {
    if (!selectedDate || loadingSlots) return; // Prevent double trigger
    
    setLoadingSlots(true);
    const safetyTimeout = setTimeout(() => setLoadingSlots(false), 8000); // Emergency stop
    
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      console.log("Fetching slots for:", businessId, dateStr);
      const data = await getOccupiedSlots(businessId, dateStr, selectedStaff || undefined);
      setOccupiedSlots(data || []);
    } catch (err) {
      console.error("Müsaitlik hatası:", err);
      setOccupiedSlots([]);
    } finally {
      clearTimeout(safetyTimeout);
      setLoadingSlots(false);
    }
  };

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const chosenServices = services.filter((s) => selectedServices.includes(s.id));
  const totalPrice = chosenServices.reduce((sum, s) => sum + Number(s.price), 0);
  const totalDuration = chosenServices.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);

  const handleJoinWaitlist = async () => {
    if (!user || !selectedDate) {
      toast.error("Lütfen önce giriş yapın.");
      return;
    }

    // Bilgiler eksikse step 4'e yönlendir (Bilgi Girişi) ama bekleme listesi için özelleştir
    if (!customerName || !customerPhone) {
      toast.info("İletişim Bilgileri Eksik", { description: "Lütfen önce bilgilerinizi girin, böylece size ulaşabiliriz." });
      setStep(4);
      return;
    }

    setWaitlistLoading(true);
    try {
      await joinWaitlist({
        business_id: businessId,
        user_id: user.id,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime || undefined,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail
      });
      setInWaitlist(true);
      toast.success("Sıraya eklendiniz!", { description: "Yer açıldığında size bildirim ve e-posta göndereceğiz." });
      
      // 2 saniye sonra otomatik kapat
      setTimeout(() => {
        handleClose(false);
      }, 2000);
    } catch (error: any) {
      console.error("Waitlist Error:", error);
      toast.error("İşlem başarısız", { description: error?.message || "Bilinmeyen bir hata oluştu." });
    }
    setWaitlistLoading(false);
  };

  const handleSendCode = async () => {
    if (!customerEmail) return;

    // Rate limit check (token bucket)
    if (!checkRateLimit("otp_send")) {
      toast.error("Çok fazla istek", { description: getRateLimitMessage() });
      return;
    }

    // Persistent abuse check (survives refresh, 5 per 15 min)
    const otpCheck = checkOtpAbuse();
    if (!otpCheck.allowed) {
      toast.error("Güvenlik Limiti", { description: "15 dakika içinde çok fazla doğrulama kodu istediniz. Lütfen daha sonra tekrar deneyin." });
      return;
    }

    setSendingCode(true);

    const code = generateOTP();
    setGeneratedCode(code);

    setTimeout(() => {
      setCodeSent(true);
      setSendingCode(false);
      setCountdown(120);
      toast.info("Doğrulama kodu gönderildi", {
        description: `${customerEmail} adresine doğrulama kodu gönderildi. (Demo kod: ${code}) | Kalan hak: ${otpCheck.remaining}`,
      });
    }, 1000);
  };

  const handleVerifyCode = () => {
    if (verificationCode === generatedCode) {
      setCodeVerified(true);
      toast.success("Doğrulandı!", { description: "E-posta adresiniz başarıyla doğrulandı." });
      // Otomatik ilerle
      setTimeout(() => {
        if (totalPrice > 0) {
          setStep(6);
        } else {
          handleSubmit();
        }
      }, 1500);
    } else {
      toast.error("Hatalı kod", { description: "Girdiğiniz kod hatalı. Lütfen tekrar deneyin." });
    }
  };

  const handleVerifyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .eq("business_id", businessId)
        .single();

      if (error || !data) {
        setCouponError("Geçersiz kupon kodu");
        setAppliedCoupon(null);
      } else {
        // Check expiry
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setCouponError("Kupon süresi dolmuş");
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(data);
          toast.success("Kupon Uygulandı! ✨");
        }
      }
    } catch (err) {
      setCouponError("Kupon kontrol edilirken hata oluştu");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !codeVerified) return;
    setSubmitting(true);

    try {
      await createAppointment({
        business_id: businessId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        appointment_time: selectedTime,
        staff_id: selectedStaff || undefined,
        status: "pending",
        total_price: totalPrice,
        total_duration: totalDuration,
        service_name: chosenServices.map(s => s.name).join(", "),
        notes: customerNotes || null,
      });
      setSuccess(true);
    } catch (error: any) {
      console.error("Randevu hatası:", error);
      toast.error("Hata", { description: error?.message || "Randevu oluşturulamadı. Lütfen tekrar deneyin." });
    }

    setSubmitting(false);
  };

  const reset = () => {
    setStep(1);
    setSelectedServices([]);
    setSelectedStaff(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerNotes("");
    setVerificationCode("");
    setGeneratedCode("");
    setCodeSent(false);
    setCodeVerified(false);
    setPaymentSuccess(false);
    setSendingCode(false);
    setCountdown(0);
    setSuccess(false);
    setIsKvkkAccepted(false);
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const totalSteps = totalPrice > 0 ? 6 : 5;

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-heading text-foreground mb-2">Randevunuz Alındı!</h3>
            <p className="text-muted-foreground mb-1">{businessName}</p>
            <p className="text-sm text-muted-foreground">
              {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: tr })} - {selectedTime}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Toplam: ₺{totalPrice}</p>
            <p className="text-xs text-muted-foreground mt-4">
              İşletme onayı sonrası e-posta ile bilgilendirileceksiniz.
            </p>
            <Button className="mt-6" onClick={() => handleClose(false)}>Tamam</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {step === 1 && "Hizmet Seçin"}
            {step === 2 && "Personel Seçin"}
            {step === 3 && "Tarih & Saat Seçin"}
            {step === 4 && "Bilgilerinizi Girin"}
            {step === 5 && "E-posta Doğrulama"}
            {step === 6 && "Güvenli Ödeme"}
          </DialogTitle>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-accent" : "bg-muted"}`} />
            ))}
          </div>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-3 mt-4">
            {services.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-foreground font-medium mb-1">Henüz hizmet eklenmemiş</p>
                <p className="text-sm text-muted-foreground">İşletme sahibi yakında hizmetlerini ekleyecektir. Lütfen daha sonra tekrar deneyin.</p>
              </div>
            ) : (
              services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    selectedServices.includes(service.id)
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/30"
                  }`}
                >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{service.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="w-3.5 h-3.5" /> {service.duration} dk
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-accent">
                      {calculateSmartPrice(service.price, selectedDate || new Date()).price} TL
                    </div>
                    {calculateSmartPrice(service.price, selectedDate || new Date()).multiplier !== 1 && (
                      <div className="text-xs text-accent/80 font-medium">
                        {calculateSmartPrice(service.price, selectedDate || new Date()).label}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )))}
            {selectedServices.length > 0 && (
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  {chosenServices.length} hizmet · {totalDuration} dk
                </span>
                <span className="font-semibold text-foreground">₺{totalPrice}</span>
              </div>
            )}
            <Button className="w-full" disabled={selectedServices.length === 0} onClick={() => setStep(2)}>
              Devam Et
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 mt-4">
            <button
              onClick={() => setSelectedStaff(null)}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                selectedStaff === null ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"
              }`}
            >
              <p className="font-medium text-foreground">Fark etmez</p>
              <p className="text-sm text-muted-foreground">Müsait herhangi bir personel</p>
            </button>
            {staff.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedStaff(member.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  selectedStaff === member.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              </button>
            ))}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Geri</Button>
              <Button className="flex-1" onClick={() => setStep(3)}>Devam Et</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 mt-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedTime(null);
              }}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date < today) return true;
                
                // Final safety check: if workingHours is empty or malformed, 
                // we treat the business as 'Always Open' for the UI to prevent total lock-out
                if (!workingHours || Object.keys(workingHours).length === 0) return false;
                
                return !getWorkingHoursForDay(workingHours, date);
              }}
              className="rounded-xl border border-border mx-auto"
            />
            {selectedDate && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2 flex items-center justify-between">
                  Saat Seçin
                  {loadingSlots && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
                </p>
                {loadingSlots ? (
                  <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin text-accent" /></div>
                ) : (() => {
                  try {
                    const dayHours = getWorkingHoursForDay(workingHours, selectedDate);
                    if (!dayHours) return <p className="text-center text-sm text-destructive">Bugün kapalı.</p>;
                    
                    const slots = generateTimeSlots(dayHours.start, dayHours.end, 30, dayHours.breakStart, dayHours.breakEnd) || [];
                    const sList = staff || [];
                    const isToday = selectedDate && format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"); 
                    const nowTime = format(new Date(), "HH:mm");

                    const validSlots = slots.filter(time => {
                      // Eğer bugünse ve slot saati şu anki saatten küçükse gösterme
                      if (isToday && time <= nowTime) return false;
                      return true;
                    });
                    
                    if (validSlots.length > 0) {
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 gap-2">
                            {validSlots.map((time) => {
                              const isOccupied = isSlotOccupied(time, occupiedSlots || [], selectedStaff, sList.length, totalDuration);
                              
                              return (
                                <button
                                  key={time}
                                  onClick={() => setSelectedTime(time)}
                                  className={`py-2 text-sm rounded-lg border transition-colors ${
                                    isOccupied
                                      ? selectedTime === time
                                        ? "border-yellow-500 bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50"
                                        : "border-muted bg-muted/30 text-muted-foreground opacity-50 line-through decoration-accent/50"
                                      : selectedTime === time
                                        ? "border-accent bg-accent text-accent-foreground"
                                        : "border-border hover:border-accent/30 text-foreground"
                                  }`}
                                >
                                  {time}
                                </button>
                              );
                            })}
                          </div>
                          
                          <div className="pt-4 border-t border-border/50 text-center">
                             <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2">İstediğiniz saat dolu mu?</p>
                             <p className="text-xs text-muted-foreground">Üzeri çizili saatlere tıklayarak o saate özel bekleme listesine katılabilirsiniz.</p>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="text-center p-6 border border-dashed rounded-xl space-y-3">
                        <p className="text-sm text-muted-foreground">Bu tarihte müsait saat bulunamadı.</p>
                        {inWaitlist ? (
                          <Badge variant="outline" className="text-green-600">Sıradan Haber Bekleniyor ✅</Badge>
                        ) : (
                          <Button variant="outline" size="sm" onClick={handleJoinWaitlist} disabled={waitlistLoading}>
                            {waitlistLoading ? "Ekleniyor..." : "Beni Waitlist'e Ekle"}
                          </Button>
                        )}
                      </div>
                    );
                  } catch (err) {
                    console.error("Render error in slots:", err);
                    return <p className="text-center text-sm text-muted-foreground">Müsaitlik bilgisi hesaplanırken bir hata oluştu.</p>;
                  }
                })()}
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Geri</Button>
              {(() => {
                const sList = staff || [];
                const isSelectedOccupied = selectedTime ? isSlotOccupied(selectedTime, occupiedSlots || [], selectedStaff, sList.length, totalDuration) : false;

                if (isSelectedOccupied) {
                   return (
                     <Button 
                       className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white" 
                       disabled={!selectedDate || !selectedTime || loadingSlots || waitlistLoading || inWaitlist} 
                       onClick={handleJoinWaitlist}
                     >
                       {inWaitlist ? "Sıraya Girdiniz ✅" : waitlistLoading ? "Ekleniyor..." : "Bekleme Listesine Katıl"}
                     </Button>
                   );
                }

                return (
                  <Button className="flex-1" disabled={!selectedDate || !selectedTime || loadingSlots} onClick={() => setStep(4)}>
                    Devam Et
                  </Button>
                );
              })()}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 mt-4">
            <div className="bg-muted/50 rounded-xl p-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hizmetler</span>
                <span className="text-foreground">{chosenServices.map((s) => s.name).join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tarih</span>
                <span className="text-foreground">
                  {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: tr })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saat</span>
                <span className="text-foreground">{selectedTime}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-muted-foreground">Toplam</span>
                <span className="text-foreground">₺{totalPrice}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="booking-name">Ad Soyad *</Label>
                <Input id="booking-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Adınız Soyadınız" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="booking-phone">Telefon *</Label>
                <Input id="booking-phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="05XX XXX XX XX" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="booking-email">E-posta *</Label>
                <Input id="booking-email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="ornek@email.com" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="booking-notes">Randevu Notu (Opsiyonel)</Label>
                <textarea 
                  id="booking-notes" 
                  value={customerNotes} 
                  onChange={(e) => setCustomerNotes(e.target.value)} 
                  placeholder="İşletmeye iletmek istediğiniz özel bir not var mı?"
                  className="w-full mt-1 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Coupon Code Section */}
              <div className="pt-4 mt-4 border-t border-border">
                <Label htmlFor="coupon-code" className="flex items-center gap-2 mb-2 text-xs uppercase tracking-widest font-black text-muted-foreground">
                  <Ticket className="w-3 h-3" /> İndirim Kuponu
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      id="coupon-code" 
                      value={couponCode} 
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                      placeholder="KODUNUZ" 
                      className={`uppercase tracking-widest font-mono text-sm ${
                        appliedCoupon ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 focus-visible:ring-emerald-500" : 
                        couponError ? "bg-destructive/10 border-destructive text-destructive focus-visible:ring-destructive" : ""
                      }`}
                      disabled={appliedCoupon}
                    />
                    {appliedCoupon && (
                      <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                    {couponError && (
                      <X className="w-4 h-4 text-destructive absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {!appliedCoupon ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleVerifyCoupon} 
                      disabled={couponLoading || !couponCode}
                      className="shrink-0"
                    >
                      {couponLoading ? "..." : "Uygula"}
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode("");
                        setCouponError(null);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {couponError && <p className="text-[10px] text-destructive mt-1 font-medium">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-[10px] text-emerald-500 mt-1 font-medium italic">
                    {appliedCoupon.discount_type === "percent" ? `%${appliedCoupon.value}` : `${appliedCoupon.value} TL`} indirim uygulandı! 🎉
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-accent/5 border border-accent/20 rounded-xl mt-4">
              <input 
                type="checkbox" 
                id="kvkk-check" 
                checked={isKvkkAccepted}
                onChange={(e) => setIsKvkkAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent accent-accent cursor-pointer"
              />
              <label htmlFor="kvkk-check" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="text-accent font-bold hover:underline">KVKK Aydınlatma Metni</a>'ni okudum, kişisel verilerimin işlenmesini ve randevu süreçlerinde kullanılmasını onaylıyorum.
              </label>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>Geri</Button>
              {(() => {
                const sList = staff || [];
                const isSelectedOccupied = selectedTime ? isSlotOccupied(selectedTime, occupiedSlots || [], selectedStaff, sList.length, totalDuration) : false;
                
                // Eğer seçilen saat doluysa, bekleme listesine katılım butonu göster
                if (isSelectedOccupied) {
                  return (
                    <Button
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                      disabled={
                        !isKvkkAccepted ||
                        waitlistLoading || 
                        inWaitlist || 
                        customerName.trim().length < 3 || 
                        !/^05\d{9}$/.test(customerPhone.replace(/[\s-]/g, ""))
                      }
                      onClick={handleJoinWaitlist}
                    >
                      {inWaitlist ? "Sıraya Katıldınız ✅" : waitlistLoading ? "Ekleniyor..." : "Sıraya Kaydol"}
                    </Button>
                  );
                }

                // Normal randevu akışı
                return (
                  <Button
                    className="flex-1"
                    disabled={
                      !isKvkkAccepted ||
                      !customerName.trim().includes(" ") || 
                      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) || 
                      !/^05\d{9}$/.test(customerPhone.replace(/[\s-]/g, ""))
                    }
                    onClick={async () => {
                      // Admin kara liste kontrolü (erken kontrol)
                      if (customerPhone) {
                        const { data: banRecord } = await supabase
                          .from("banned_users")
                          .select("id")
                          .eq("phone", customerPhone)
                          .limit(1)
                          .maybeSingle();

                        if (banRecord) {
                          toast.error("İşlem Reddedildi", { description: "Bu telefon numarası kuralları ihlal ettiği için randevu sisteminden süresiz uzaklaştırılmıştır." });
                          return;
                        }
                      }

                      setStep(5);
                      if (!codeSent) handleSendCode();
                    }}
                  >
                    Doğrula ve Devam Et
                  </Button>
                );
              })()}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 mt-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {codeVerified ? (
                  <ShieldCheck className="w-8 h-8 text-accent" />
                ) : (
                  <Mail className="w-8 h-8 text-accent" />
                )}
              </div>
              {codeVerified ? (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">E-posta Doğrulandı!</h3>
                  <p className="text-sm text-muted-foreground">Şimdi randevunuzu tamamlayabilirsiniz.</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">E-posta Doğrulama</h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{customerEmail}</span> adresine
                    gönderilen 6 haneli kodu girin.
                  </p>
                </div>
              )}
            </div>

            {!codeVerified && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={setVerificationCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  className="w-full"
                  disabled={verificationCode.length !== 6}
                  onClick={handleVerifyCode}
                >
                  Doğrula
                </Button>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Yeni kod göndermek için {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')} bekleyin
                    </p>
                  ) : (
                    <Button variant="link" className="text-sm" onClick={handleSendCode} disabled={sendingCode}>
                      {sendingCode ? "Gönderiliyor..." : "Kodu tekrar gönder"}
                    </Button>
                  )}
                </div>

              </div>
            )}
            
            {codeVerified && (
              <div className="pt-4 border-t border-border mt-4">
                <Button
                  className="w-full"
                  onClick={() => {
                    if (totalPrice > 0) {
                      setStep(6);
                    } else {
                      handleSubmit();
                    }
                  }}
                >
                  {totalPrice > 0 ? "Ödeme Adımına Geç" : "Randevuyu Tamamla"}
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 mt-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Güvenli Ödeme</h3>
              <p className="text-sm text-muted-foreground">
                Randevu için ₺{totalPrice} tutarında kapora ödemesi gerekmektedir.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium">Ödenecek Tutar</span>
                  <span className="text-lg font-bold">₺{totalPrice}</span>
                </div>
                <div className="space-y-3">
                  <div className="h-10 w-full bg-background border border-border rounded-md px-3 flex items-center text-sm text-muted-foreground">
                    **** **** **** 4242
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-10 bg-background border border-border rounded-md px-3 flex items-center text-sm text-muted-foreground">MM/YY</div>
                    <div className="h-10 bg-background border border-border rounded-md px-3 flex items-center text-sm text-muted-foreground">CVC</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(5)}>Geri</Button>
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    setPaymentSuccess(true);
                    handleSubmit();
                  }}
                  disabled={submitting}
                >
                  {submitting ? "İşleniyor..." : "Şimdi Öde ve Onayla"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}