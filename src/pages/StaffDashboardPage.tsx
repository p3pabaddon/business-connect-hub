import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import {
  Calendar as CalendarIcon, Clock, CheckCircle, XCircle,
  User, Briefcase, ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Onaylandı", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Tamamlandı", color: "bg-green-100 text-green-800" },
  cancelled: { label: "İptal", color: "bg-red-100 text-red-800" },
};

const StaffDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [staffMember, setStaffMember] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/giris");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadStaffData();
  }, [user]);

  const loadStaffData = async () => {
    setLoading(true);
    try {
      // Find the staff entry associated with the logged in user
      const { data: staff, error } = await supabase
        .from("staff")
        .select("*, business:businesses(*)")
        .eq("user_id", user?.id)
        .single();

      if (error || !staff) {
        setLoading(false);
        return;
      }
      setStaffMember(staff);

      // Load appointments for this staff member
      const { data: apts } = await supabase
        .from("appointments")
        .select("*")
        .eq("staff_id", staff.id)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      setAppointments(apts || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({ title: "Güncelleme başarısız", variant: "destructive" });
    } else {
      toast({ title: "Durum güncellendi" });
      loadStaffData();
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

  if (!staffMember) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-surface p-4">
          <div className="text-center max-w-md">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-heading text-foreground mb-2">Personel kaydı bulunamadı</h2>
            <p className="text-muted-foreground mb-4">
              Bu hesap bir personel kaydıyla eşleşmemiş. Lütfen işletme yöneticinizle iletişime geçin.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const todayApts = appointments.filter(a => a.appointment_date === today);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title={`Personel Paneli - ${staffMember.name}`} />
      <Header />
      <main className="flex-1 bg-surface">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                <span className="text-accent font-heading text-xl">
                  {staffMember.name.split(" ").map((n: string) => n[0]).join("")}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-heading text-foreground">{staffMember.name}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> {staffMember.role} @ {staffMember.business?.name}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Stats & Today */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Bugünün İşleri</h3>
                <p className="text-3xl font-heading text-foreground">{todayApts.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Toplam {appointments.length} randevu</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" /> Yaklaşanlar
                </h3>
                <div className="space-y-4">
                  {todayApts.slice(0, 3).map(apt => (
                    <div key={apt.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="font-medium">{apt.appointment_time}</span>
                      <span className="text-muted-foreground truncate">{apt.customer_name}</span>
                    </div>
                  ))}
                  {todayApts.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Bugün başka işiniz görünmüyor.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Main Column: Appointment List */}
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-lg font-heading text-foreground flex items-center gap-2 px-2">
                <CalendarIcon className="w-5 h-5 text-primary" /> Programım
              </h2>
              
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div key={apt.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{apt.customer_name}</span>
                          <Badge className={statusMap[apt.status]?.color || ""}>
                            {statusMap[apt.status]?.label || apt.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1 mt-1">
                          <Clock className="w-3.5 h-3.5" /> 
                          {format(new Date(apt.appointment_date), "d MMMM", { locale: tr })}, {apt.appointment_time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-foreground text-sm">₺{apt.total_price}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                      {apt.status === "confirmed" && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-xs" onClick={() => handleStatusUpdate(apt.id, "completed")}>
                          Tamamla
                        </Button>
                      )}
                      {apt.status === "pending" && (
                        <Button size="sm" className="h-8 text-xs" onClick={() => handleStatusUpdate(apt.id, "confirmed")}>
                          Onayla
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground ml-auto">
                        Detaylar <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {appointments.length === 0 && (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <p className="text-muted-foreground italic">Henüz size atanan bir randevu yok.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StaffDashboardPage;

// Placeholder for missing Button component in this scope
function Button({ children, className, variant, size, onClick, ...props }: any) {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-muted hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3 text-sm",
    xs: "h-7 rounded px-2 text-[10px]",
  };
  
  return (
    <button 
      className={`${base} ${(variants as any)[variant || "default"]} ${(sizes as any)[size || "default"]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
