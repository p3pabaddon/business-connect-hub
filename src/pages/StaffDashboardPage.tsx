
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getStaffProfile } from "@/lib/biz-api";
import { 
  Calendar, Clock, CheckCircle, 
  User, LogOut, ChevronRight, 
  Star, Briefcase, Phone, MessageSquare,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { SEOHead } from "@/components/SEOHead";

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const playNotificationSound = () => {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.play().catch(() => {});
};

export default function StaffDashboardPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/giris");
      return;
    }

    if (user) {
      loadStaffData();
    }
  }, [user, authLoading]);

  async function loadStaffData() {
    try {
      const staff = await getStaffProfile(user!.id);
      if (!staff) {
        setLoading(false);
        return;
      }
      setStaffInfo(staff);

      // Load today's appointments for this staff
      const today = new Date().toISOString().split("T")[0];
      const { data: apts } = await supabase
        .from("appointments")
        .select("*")
        .eq("staff_id", staff.id)
        .eq("appointment_date", today)
        .order("appointment_time", { ascending: true });
      
      setAppointments(apts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleComplete = async (aptId: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: 'completed' })
        .eq("id", aptId);
      
      if (error) throw error;
      
      setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: 'completed' } : a));
      toast.success("Randevu tamamlandı!");
    } catch (err) {
      toast.error("İşlem başarısız");
    }
  };

  useEffect(() => {
    if (staffInfo?.id) {
       const channel = supabase
         .channel(`staff-updates-${staffInfo.id}`)
         .on(
           'postgres_changes',
           { event: 'INSERT', schema: 'public', table: 'appointments', filter: `staff_id=eq.${staffInfo.id}` },
           () => {
             playNotificationSound();
             toast.success("YENİ RANDEVU SİZE ATANDI!", {
               description: "Bugünkü programınıza yeni bir iş eklendi.",
               duration: 10000,
             });
             loadStaffData();
           }
         )
         .subscribe();
 
       return () => {
         supabase.removeChannel(channel);
       };
    }
  }, [staffInfo?.id]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-black text-xs uppercase tracking-widest opacity-50">Personel Verileri Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!staffInfo) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/10">
             <User className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Personel Yetkisi Gerekli</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Bu hesap bir personel kaydıyla eşleşmemiş. Eğer işletme personeliyseniz lütfen yöneticinizle iletişive geçin.
          </p>
          <div className="flex flex-col gap-3">
             <Button onClick={() => navigate("/")} className="h-12 rounded-2xl font-black uppercase tracking-widest text-xs">ANA SAYFAYA DÖN</Button>
             <Button variant="ghost" onClick={() => signOut()} className="text-slate-500 hover:text-white">Farklı Hesapla Giriş Yap</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-primary/30">
      <SEOHead title={`Personel Portalı - ${staffInfo.name}`} />
      
      <header className="p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight">{staffInfo.name}</h1>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{staffInfo.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={() => navigate("/")}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                title="Ana Site"
            >
                <LayoutDashboard className="w-5 h-5 text-slate-400" />
            </button>
            <button 
                onClick={() => signOut()}
                className="p-3 bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"
                title="Çıkış Yap"
            >
                <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-slate-900 border border-white/5 rounded-[2rem] shadow-sm">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Bugünkü İş</p>
             <p className="text-3xl font-black">{appointments.length}</p>
          </div>
          <div className="p-6 bg-slate-900 border border-white/5 rounded-[2rem] shadow-sm">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Puanın</p>
             <div className="flex items-center gap-2">
                <p className="text-3xl font-black">4.9</p>
                <Star className="w-5 h-5 text-warning fill-warning" />
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Bugünkü Programım</h2>
              <Badge variant="outline" className="text-[10px] border-white/10 text-slate-500">
                {format(new Date(), 'd MMMM yyyy', { locale: tr })}
              </Badge>
           </div>

           <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((apt) => (
                  <div 
                    key={apt.id} 
                    className={cn(
                      "p-6 bg-slate-900/50 border border-white/5 rounded-[2.5rem] hover:bg-slate-900 transition-all group",
                      apt.status === 'completed' && "opacity-50 grayscale"
                    )}
                  >
                    <div className="flex items-start justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                             <Clock className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-xl font-black tracking-tighter">{apt.appointment_time}</p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Başlangıç Saati</p>
                          </div>
                       </div>
                       <Badge className={cn(
                         "bg-white/5 text-[9px] font-black uppercase px-3 py-1 border-none",
                         apt.status === 'confirmed' ? "text-blue-400 bg-blue-400/10" : 
                         apt.status === 'completed' ? "text-emerald-400 bg-emerald-400/10" : "text-slate-500"
                       )}>
                         {apt.status === 'confirmed' ? 'SIRADAKİ' : apt.status === 'completed' ? 'BİTTİ' : 'BEKLİYOR'}
                       </Badge>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-sm uppercase">
                            {apt.customer_name[0]}
                          </div>
                          <div>
                             <p className="text-sm font-black uppercase">{apt.customer_name}</p>
                             <div className="flex items-center gap-3 mt-1">
                                <a href={`tel:${apt.customer_phone}`} className="text-[10px] text-slate-500 hover:text-primary flex items-center gap-1 transition-colors">
                                   <Phone className="w-3 h-3" /> {apt.customer_phone}
                                </a>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                             <Briefcase className="w-4 h-4 text-slate-500" />
                             <span className="text-xs font-bold text-slate-300 uppercase">{apt.service_name || "Servis"}</span>
                          </div>
                          <span className="text-sm font-black text-primary">₺{apt.total_price}</span>
                       </div>

                       {apt.notes && (
                         <div className="p-4 bg-amber-500/5 border-l-2 border-amber-500 rounded-r-xl">
                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Müşteri Notu</p>
                            <p className="text-xs text-slate-400 italic">"{apt.notes}"</p>
                         </div>
                       )}

                       {apt.status !== 'completed' && (
                         <Button 
                          onClick={() => handleComplete(apt.id)}
                          className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/20 group"
                         >
                            HİZMETİ TAMAMLA
                            <CheckCircle className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                         </Button>
                       )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
                   <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                   <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Bugün için randevun yok.</p>
                   <p className="text-xs text-slate-600 mt-2">Dinlenmek için iyi bir gün!</p>
                </div>
              )}
           </div>
        </div>
      </main>

      <footer className="p-10 text-center opacity-20">
         <p className="text-[8px] font-black uppercase tracking-[0.4em]">{staffInfo?.businesses?.name} PERSONEL PORTALI</p>
      </footer>
    </div>
  );
}
