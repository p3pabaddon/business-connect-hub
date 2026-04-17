import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Clock,
  UserPlus,
  RefreshCw,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface WaitlistManagerProps {
  businessId: string;
}

export function WaitlistManager({ businessId }: WaitlistManagerProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWaitlist = async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: waitlistData, error: waitlistError } = await supabase
        .from("waitlist")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (waitlistError) throw waitlistError;

      // Enrich with profile data for cases where customer_name might be missing
      if (waitlistData && waitlistData.length > 0) {
        const userIds = [...new Set(waitlistData.filter(i => i.user_id).map(item => item.user_id))];

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, phone, email")
          .in("id", userIds);

        const enriched = waitlistData.map(entry => ({
          ...entry,
          user: profiles?.find(p => p.id === entry.user_id) || null
        }));

        setEntries(enriched);
      } else {
        setEntries([]);
      }
    } catch (err: any) {
      console.error("Waitlist Error:", err);
      toast.error("Liste yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWaitlist();
  }, [businessId]);

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("waitlist").delete().eq("id", id);
    if (error) {
      toast.error("Silinemedi");
    } else {
      toast.success("Kayıt silindi");
      loadWaitlist();
    }
  };

  const handleMoveToAppointment = async (entry: any) => {
    try {
      const { error: aptError } = await supabase.from("appointments").insert({
        business_id: businessId,
        customer_id: entry.user_id,
        customer_name: entry.customer_name || entry.user?.full_name || "Müşteri",
        customer_phone: entry.customer_phone || entry.user?.phone || "",
        customer_email: entry.customer_email || entry.user?.email || "",
        appointment_date: entry.desired_date || format(new Date(), "yyyy-MM-dd"),
        appointment_time: entry.desired_time || "09:00",
        status: "confirmed"
      });

      if (aptError) throw aptError;

      await supabase.from("waitlist").delete().eq("id", entry.id);

      toast.success("Müşteri randevuya başarıyla taşındı!");
      loadWaitlist();
    } catch (err: any) {
      console.error(err);
      toast.error("İşlem başarısız");
    }
  };

  if (loading && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Bekleme Listesi Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center shadow-inner">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Bekleme Listesi</h2>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-1">
              Şu an toplam <span className="text-primary font-bold">{entries.length}</span> kişi randevu için yer bekliyor.
            </p>
          </div>
        </div>
        <Button
          onClick={loadWaitlist}
          variant="outline"
          className="rounded-xl border-border hover:bg-muted font-bold text-[10px] tracking-widest uppercase gap-2 py-6 px-8"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Listeyi Yenile
        </Button>
      </div>

      {/* Grid of Entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="bg-card border border-border rounded-[2rem] p-6 hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
          >
            {/* Status Indicator */}
            <div className="absolute top-0 right-0 px-6 py-1.5 rounded-bl-[1.5rem] text-[9px] font-black uppercase tracking-widest bg-amber-500 text-white">
              BEKLİYOR
            </div>

            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center font-black text-lg text-primary/40 border border-border">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-black text-foreground uppercase tracking-tight leading-none truncate max-w-[150px]">
                    {entry.customer_name || entry.user?.full_name || "Müşteri"}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase tracking-tight opacity-60">
                    {entry.desired_time || "Belirsiz Saat"}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted opacity-100 transition-opacity">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border p-2">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 px-3">İşlemler</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleMoveToAppointment(entry)} className="rounded-xl gap-3 p-3">
                    <UserPlus className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-xs">Randevuya Taşı</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => deleteEntry(entry.id)} className="rounded-xl gap-3 p-3 text-rose-500">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span className="font-bold text-xs">Listeden Kaldır</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <p className="text-xs font-black uppercase tracking-tight">
                    {entry.desired_date || format(new Date(entry.created_at), "yyyy-MM-dd")}
                  </p>
                </div>
                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[9px] font-black uppercase">
                  {entry.desired_date ? "BEKLENEN GÜN" : "KAYIT TARİHİ"}
                </Badge>
              </div>

              {entry.desired_time && (
                <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <p className="text-xs font-black uppercase tracking-tight">
                    Saat: {entry.desired_time}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-transparent">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground">{entry.customer_phone || entry.user?.phone || "Telefon Yok"}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-transparent">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground truncate">{entry.customer_email || entry.user?.email || "E-posta Yok"}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                Kayıt: {format(new Date(entry.created_at), "d MMM, HH:mm", { locale: tr })}
              </p>
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-card border-2 border-dashed border-border rounded-[3rem]">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[300px] text-center mt-2 leading-relaxed">
              Müşterileriniz tam dolu günlerde "Beni Ara" butonuna basarak bu listeye katılırlar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
