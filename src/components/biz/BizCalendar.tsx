import { useState, useMemo } from "react";
import {
   ChevronLeft, ChevronRight, Calendar as CalendarIcon,
   Clock, CheckCircle, XCircle, MoreVertical,
   CalendarDays, User, Scissors, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
   startOfWeek, addDays, format, isSameDay,
   addWeeks, subWeeks, startOfToday
} from "date-fns";
import { tr } from "date-fns/locale";
import { updateAppointmentStatus } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
   Dialog, DialogContent, DialogHeader,
   DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { format as formatFns } from "date-fns";
import { toast } from "sonner";

interface Props {
   appointments: any[];
   onRefresh?: () => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => `${i + 9}:00`);

export function BizCalendar({ appointments, onRefresh }: Props) {
   const [currentViewDate, setCurrentViewDate] = useState(new Date());
   const [selectedApt, setSelectedApt] = useState<any>(null);
   const [isDetailsOpen, setIsDetailsOpen] = useState(false);

   const handleStatusUpdate = async (id: string, status: any) => {
      try {
         await updateAppointmentStatus(id, status);
         toast.success(status === 'completed' ? "Randevu tamamlandı ve loyalty işlendi!" : "Durum güncellendi");
         onRefresh?.();
      } catch (err) {
         toast.error("İşlem başarısız");
      }
   };

   const weekDays = useMemo(() => {
      const start = startOfWeek(currentViewDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
   }, [currentViewDate]);

   const handlePrevWeek = () => setCurrentViewDate(subWeeks(currentViewDate, 1));
   const handleNextWeek = () => setCurrentViewDate(addWeeks(currentViewDate, 1));
   const handleToday = () => setCurrentViewDate(new Date());

   // Group appointments by date
   const appointmentsByDay = useMemo(() => {
      const map: Record<string, any[]> = {};
      appointments.forEach(apt => {
         const dateStr = apt.appointment_date;
         if (!map[dateStr]) map[dateStr] = [];
         map[dateStr].push(apt);
      });
      return map;
   }, [appointments]);

   // Helper to calculate top position
   const getAppointmentPosition = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const totalMinutes = (hours - 9) * 60 + minutes;
      return (totalMinutes / (12 * 60)) * 100; // Relative to 12 hour span (9am - 9pm)
   };

   return (
      <div className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-200px)] animate-in fade-in duration-500 shadow-sm">
         {/* Calendar Header */}
         <div className="p-6 border-b border-border flex flex-col sm:flex-row items-center justify-between bg-muted/20 gap-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center shrink-0 shadow-inner">
                  <CalendarDays className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight uppercase">Randevu Çizelgesi</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">
                     {format(weekDays[0], 'd MMMM', { locale: tr })} - {format(weekDays[6], 'd MMMM yyyy', { locale: tr })}
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-2xl border border-border">
               <Button onClick={handlePrevWeek} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-card hover:text-primary transition-all"><ChevronLeft className="w-5 h-5" /></Button>
               <Button onClick={handleToday} variant="ghost" className="px-5 h-9 text-[10px] font-black text-foreground uppercase tracking-widest hover:bg-card hover:text-primary transition-all">BU HAFTA</Button>
               <Button onClick={handleNextWeek} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-card hover:text-primary transition-all"><ChevronRight className="w-5 h-5" /></Button>
            </div>
         </div>

         {/* Grid Area */}
         <div className="flex-1 flex flex-col overflow-hidden">
            {/* Days Header */}
            <div className="flex bg-muted/30 border-b border-border">
               <div className="w-20 border-r border-border shrink-0" />
               <div className="flex-1 grid grid-cols-7 min-w-[700px]">
                  {weekDays.map((day, i) => (
                     <div key={i} className={cn(
                        "p-5 text-center border-r border-border/50 last:border-0 transition-colors",
                        isSameDay(day, new Date()) && "bg-primary/5 shadow-[inset_0_-3px_0_0_#3b82f6]"
                     )}>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-60">
                           {format(day, 'eeee', { locale: tr })}
                        </p>
                        <p className={cn(
                           "text-2xl font-black tracking-tighter",
                           isSameDay(day, new Date()) ? "text-primary" : "text-foreground"
                        )}>
                           {format(day, 'd')}
                        </p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
               <div className="flex min-w-[700px] h-[1200px]">
                  {/* Time Strip */}
                  <div className="w-20 shrink-0 bg-muted/20 border-r border-border shadow-inner">
                     {HOURS.map((hour, i) => (
                        <div key={hour} className="h-[100px] relative">
                           <span className="absolute -top-3 left-0 right-0 text-center text-[11px] font-black text-muted-foreground/40 uppercase tracking-tighter">
                              {hour}
                           </span>
                        </div>
                     ))}
                  </div>

                  {/* Grid Columns */}
                  <div className="flex-1 grid grid-cols-7 relative">
                     {/* Horizontal Grid Lines */}
                     <div className="absolute inset-0 pointer-events-none">
                        {HOURS.map((hour) => (
                           <div key={hour} className="h-[100px] border-b border-border/50 last:border-0" />
                        ))}
                     </div>

                     {/* Vertical Grid Lines & Appointments */}
                     {weekDays.map((day, dayIndex) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayApts = appointmentsByDay[dateStr] || [];

                        return (
                           <div key={dayIndex} className="relative border-r border-border/30 last:border-0 group">
                              {dayApts.map((apt, aptIndex) => {
                                 const top = getAppointmentPosition(apt.appointment_time);
                                 const statusMap: any = {
                                    pending: "Bekliyor",
                                    confirmed: "Onaylandı",
                                    completed: "Tamamlandı",
                                    cancelled: "İptal"
                                 };

                                 return (
                                    <div
                                       key={aptIndex}
                                       style={{ top: `${top}%`, height: '90px' }}
                                       onClick={() => {
                                          setSelectedApt(apt);
                                          setIsDetailsOpen(true);
                                       }}
                                       className="absolute left-1 right-1 z-10 p-4 rounded-2xl bg-card border border-border shadow-lg group/apt overflow-hidden hover:z-20 hover:scale-[1.02] transition-all cursor-pointer ring-1 ring-border/50"
                                    >
                                       <div className={cn(
                                          "absolute left-0 top-0 bottom-0 w-2",
                                          apt.status === 'confirmed' ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" :
                                             apt.status === 'completed' ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/30"
                                       )} />

                                       <div className="flex flex-col h-full justify-between">
                                          <div>
                                             <h4 className="text-xs font-black text-foreground uppercase tracking-tight leading-none mb-1">
                                                {apt.customer_name}
                                             </h4>
                                             <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight opacity-60">
                                                {apt.service_name || "Servis"}
                                             </p>
                                          </div>
                                          <div className="flex items-center justify-between">
                                             <span className="text-[10px] font-black text-primary">
                                                {apt.appointment_time}
                                             </span>
                                             <Badge variant="outline" className="h-5 px-1.5 text-[8px] border-border text-muted-foreground ml-auto uppercase font-black tracking-tighter shadow-sm">
                                                {statusMap[apt.status] || apt.status}
                                             </Badge>
                                          </div>
                                       </div>

                                       {/* Tooltip on Hover */}
                                       <div className="hidden group-hover/apt:flex absolute inset-0 bg-background/95 p-4 flex-col gap-3 z-30 animate-in fade-in zoom-in-95 backdrop-blur-sm">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                                <User className="w-4 h-4 text-primary" />
                                             </div>
                                             <span className="text-xs font-black text-foreground uppercase tracking-tight">{apt.customer_name}</span>
                                          </div>
                                          <div className="flex flex-col gap-2 px-1">
                                             <div className="flex items-center gap-3">
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-[11px] font-black">{apt.appointment_time}</span>
                                             </div>
                                             <div className="flex items-center gap-3">
                                                <Scissors className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-[11px] text-foreground font-medium">{apt.service_name || "Hizmet Belirtilmedi"}</span>
                                             </div>
                                          </div>
                                          <div className="mt-auto pt-3 border-t border-border flex gap-2">
                                             {apt.status === 'pending' && (
                                                <Button
                                                   onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                                                   size="sm"
                                                   className="h-7 w-full bg-blue-600 hover:bg-blue-700 text-[9px] font-bold tracking-tighter"
                                                >
                                                   ONAYLA
                                                </Button>
                                             )}
                                             {apt.status === 'confirmed' && (
                                                <Button
                                                   onClick={() => handleStatusUpdate(apt.id, 'completed')}
                                                   size="sm"
                                                   className="h-7 w-full bg-emerald-600 hover:bg-emerald-700 text-[9px] font-bold tracking-tighter"
                                                >
                                                   BİTTİ
                                                </Button>
                                             )}
                                             <Button variant="outline" size="icon" className="h-7 w-7 border-slate-800 shrink-0">
                                                <MoreVertical className="w-3 h-3" />
                                             </Button>
                                          </div>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>
            {/* Appointment Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
               <DialogContent className="bg-card border-border text-foreground max-w-lg rounded-[2.5rem] shadow-2xl p-0 overflow-hidden">
                  <DialogHeader className="p-8 pb-4">
                     <DialogTitle className="text-2xl font-black uppercase tracking-tight">Randevu Bilgileri</DialogTitle>
                  </DialogHeader>
                  {selectedApt && (
                     <div className="p-8 pt-0 space-y-8">
                        <div className="flex items-start justify-between">
                           <div className="flex items-center gap-5">
                              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                 <User className="w-8 h-8 text-primary" />
                              </div>
                              <div>
                                 <h2 className="text-2xl font-black tracking-tight uppercase leading-none">{selectedApt.customer_name}</h2>
                                 <p className="text-muted-foreground font-black text-[11px] mt-2 uppercase tracking-widest opacity-60">{selectedApt.customer_phone}</p>
                              </div>
                           </div>
                           <Badge className={cn(
                              "px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm",
                              selectedApt.status === 'confirmed' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                 selectedApt.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted border-border text-muted-foreground"
                           )}>
                              {selectedApt.status === 'confirmed' ? 'Onaylandı' :
                                 selectedApt.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                           </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="bg-muted/30 border border-border p-6 rounded-[2rem] space-y-2">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Tarih & Saat</p>
                              <div className="flex items-center gap-2">
                                 <CalendarIcon className="w-4 h-4 text-primary" />
                                 <p className="font-black text-sm uppercase">{selectedApt.appointment_date}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                 <Clock className="w-4 h-4 text-primary" />
                                 <p className="font-black text-lg">{selectedApt.appointment_time}</p>
                              </div>
                           </div>

                           <div className="bg-muted/30 border border-border p-6 rounded-[2rem] space-y-2">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Hizmet Detayı</p>
                              <div className="flex items-center gap-2">
                                 <Scissors className="w-4 h-4 text-violet-400" />
                                 <p className="font-black text-sm uppercase">{selectedApt.service_name || 'Servis'}</p>
                              </div>
                              <div className="mt-2 pt-2 border-t border-border/50">
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Personel: <span className="text-foreground">{selectedApt.staff?.name || 'Atanmamış'}</span></p>
                              </div>
                           </div>
                        </div>

                        {selectedApt.notes && (
                           <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[2rem]">
                              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 italic">Müşteri Notu</p>
                              <p className="text-sm text-foreground/80 font-medium italic leading-relaxed">"{selectedApt.notes}"</p>
                           </div>
                        )}

                        <DialogFooter className="gap-4">
                           {selectedApt.status === 'pending' && (
                              <Button
                                 onClick={() => {
                                    handleStatusUpdate(selectedApt.id, 'confirmed');
                                    setIsDetailsOpen(false);
                                 }}
                                 className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 rounded-2xl font-black text-xs uppercase"
                              >
                                 RANDEVUYU ONAYLA
                              </Button>
                           )}
                           {selectedApt.status === 'confirmed' && (
                              <Button
                                 onClick={() => {
                                    handleStatusUpdate(selectedApt.id, 'completed');
                                    setIsDetailsOpen(false);
                                 }}
                                 className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-12 rounded-2xl font-black text-xs uppercase"
                              >
                                 HİZMET TAMAMLANDI
                              </Button>
                           )}
                           <Button
                              variant="outline"
                              onClick={() => setIsDetailsOpen(false)}
                              className="flex-1 border-border hover:bg-muted h-12 rounded-2xl font-black text-xs uppercase"
                           >
                              KAPAT
                           </Button>
                           <Button 
                              variant="ghost" 
                              onClick={async () => {
                                 if (confirm("Bu randevuyu tamamen iptal etmek ve silmek istediğinize emin misiniz?")) {
                                    const { error } = await supabase.from('appointments').delete().eq('id', selectedApt.id);
                                    if (error) toast.error("Hata oluştu");
                                    else {
                                       toast.success("Randevu iptal edildi ve silindi");
                                       setIsDetailsOpen(false);
                                       onRefresh?.();
                                    }
                                 }
                              }}
                              className="flex-1 text-rose-500 hover:bg-rose-500/10 h-12 rounded-2xl font-black text-xs uppercase"
                           >
                              İPTAL ET & SİL
                           </Button>
                        </DialogFooter>
                     </div>
                  )}
               </DialogContent>
            </Dialog>
         </div>
      </div>
   );
}
