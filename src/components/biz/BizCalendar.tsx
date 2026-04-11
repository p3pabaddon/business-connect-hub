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
    <div className="bg-[#0f172a]/50 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-200px)] animate-in fade-in duration-500">
      {/* Calendar Header */}
      <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between bg-slate-950/20 gap-4">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div>
               <h3 className="text-lg lg:text-xl font-heading font-black text-white tracking-tight">Haftalık Randevu Çizelgesi</h3>
               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  {format(weekDays[0], 'd MMMM', { locale: tr })} - {format(weekDays[6], 'd MMMM yyyy', { locale: tr })}
               </p>
            </div>
         </div>

         <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 shadow-xl">
            <Button onClick={handlePrevWeek} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></Button>
            <Button onClick={handleToday} variant="ghost" className="px-3 h-8 text-[10px] font-bold text-white uppercase tracking-tighter hover:bg-slate-800">BU HAFTA</Button>
            <Button onClick={handleNextWeek} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white"><ChevronRight className="w-4 h-4" /></Button>
         </div>
      </div>

      {/* Grid Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
         {/* Days Header */}
         <div className="flex bg-slate-900/60 border-b border-slate-800">
            <div className="w-20 border-r border-slate-800 shrink-0" />
            <div className="flex-1 grid grid-cols-7 min-w-[700px]">
               {weekDays.map((day, i) => (
                 <div key={i} className={cn(
                    "p-4 text-center border-r border-slate-800/50 last:border-0",
                    isSameDay(day, new Date()) && "bg-primary/10 shadow-[inset_0_-2px_0_0_#3b82f6]"
                 )}>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                       {format(day, 'eeee', { locale: tr })}
                    </p>
                    <p className={cn(
                       "text-xl font-black font-heading",
                       isSameDay(day, new Date()) ? "text-primary" : "text-white"
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
                <div className="w-20 shrink-0 bg-slate-950/40 border-r border-slate-800">
                   {HOURS.map((hour, i) => (
                      <div key={hour} className="h-[100px] relative">
                         <span className="absolute -top-3 left-0 right-0 text-center text-[11px] font-mono font-black text-slate-500">
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
                         <div key={hour} className="h-[100px] border-b border-slate-800/50 last:border-0" />
                      ))}
                   </div>

                   {/* Vertical Grid Lines & Appointments */}
                   {weekDays.map((day, dayIndex) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const dayApts = appointmentsByDay[dateStr] || [];

                      return (
                         <div key={dayIndex} className="relative border-r border-slate-800/30 last:border-0 group">
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
                                    style={{ top: `${top}%`, height: '90px' }} // Slightly taller for readability
                                    onClick={() => {
                                       setSelectedApt(apt);
                                       setIsDetailsOpen(true);
                                    }}
                                    className="absolute left-1 right-1 z-10 p-3 rounded-xl bg-slate-900/90 backdrop-blur-sm border border-slate-700 shadow-xl group/apt overflow-hidden hover:z-20 hover:scale-[1.02] transition-all cursor-pointer"
                                  >
                                     <div className={cn(
                                        "absolute left-0 top-0 bottom-0 w-1.5 rounded-full",
                                        apt.status === 'confirmed' ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : 
                                        apt.status === 'completed' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-600"
                                     )} />
                                     
                                     <div className="flex flex-col h-full justify-between">
                                        <div>
                                           <h4 className="text-[10px] font-black text-white truncate leading-tight">
                                              {apt.customer_name}
                                           </h4>
                                           <p className="text-[8px] text-slate-500 truncate mt-0.5">
                                              {apt.service_name || "Servis"}
                                           </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                           <span className="text-[8px] font-mono font-bold text-primary">
                                              {apt.appointment_time}
                                           </span>
                                           <Badge variant="outline" className="h-4 px-1 text-[7px] border-slate-700 text-slate-400 ml-auto uppercase tracking-tighter">
                                              {statusMap[apt.status] || apt.status}
                                           </Badge>
                                        </div>
                                     </div>

                                     {/* Tooltip on Hover */}
                                     <div className="hidden group-hover/apt:flex absolute inset-0 bg-slate-950/98 p-3 flex-col gap-2 z-30 animate-in fade-in zoom-in-95 backdrop-blur-md">
                                        <div className="flex items-center gap-2">
                                           <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                              <User className="w-3 h-3 text-primary" />
                                           </div>
                                           <span className="text-[11px] font-black text-white truncate">{apt.customer_name}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 px-1">
                                           <div className="flex items-center gap-2">
                                              <Clock className="w-3 h-3 text-slate-500" />
                                              <span className="text-[10px] font-bold text-slate-300">{apt.appointment_time}</span>
                                           </div>
                                           <div className="flex items-center gap-2">
                                              <Scissors className="w-3 h-3 text-slate-500" />
                                              <span className="text-[10px] text-slate-400">{apt.service_name || "Hizmet Belirtilmedi"}</span>
                                           </div>
                                        </div>
                                        <div className="mt-auto pt-2 border-t border-slate-800 flex gap-2">
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
        <DialogContent className="bg-[#0f172a] border-slate-800 text-white max-w-lg rounded-[2rem]">
          {selectedApt && (
            <div className="space-y-8 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{selectedApt.customer_name}</h2>
                    <p className="text-slate-500 font-mono text-xs">{selectedApt.customer_phone}</p>
                  </div>
                </div>
                <Badge className={cn(
                  "px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest",
                  selectedApt.status === 'confirmed' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                  selectedApt.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-800 text-slate-400"
                )}>
                  {selectedApt.status === 'confirmed' ? 'Onaylandı' : 
                   selectedApt.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tarih & Saat</p>
                    <div className="flex items-center gap-2">
                       <CalendarIcon className="w-4 h-4 text-primary" />
                       <p className="font-bold text-sm lg:text-base">{selectedApt.appointment_date}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                       <Clock className="w-4 h-4 text-primary" />
                       <p className="font-black text-lg">{selectedApt.appointment_time}</p>
                    </div>
                 </div>

                 <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hizmet Detayı</p>
                    <div className="flex items-center gap-2">
                       <Scissors className="w-4 h-4 text-violet-400" />
                       <p className="font-bold text-sm lg:text-base">{selectedApt.service_name || 'Hizmet Bilgisi Yok'}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/50">
                       <p className="text-[10px] font-bold text-slate-500">Personel: <span className="text-white">{selectedApt.staff?.name || 'Atanmamış'}</span></p>
                    </div>
                 </div>
              </div>

              {selectedApt.notes && (
                <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-3xl">
                   <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 italic">Müşteri Notu</p>
                   <p className="text-sm text-slate-300 italic">"{selectedApt.notes}"</p>
                </div>
              )}

              <DialogFooter className="gap-3 sm:gap-0">
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
                    className="flex-1 border-slate-800 hover:bg-slate-800 h-12 rounded-2xl font-black text-xs uppercase"
                 >
                    KAPAT
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
