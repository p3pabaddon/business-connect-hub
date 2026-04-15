// BUSINESS CONNECT HUB - CALENDAR ENGINE V2.1 (FIXED COLLISION)
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
   addWeeks, subWeeks, startOfToday, parseISO,
   isWithinInterval, endOfDay, startOfDay,
   addMinutes
} from "date-fns";
import { tr } from "date-fns/locale";
import { updateAppointmentStatus } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
   Dialog, DialogContent, DialogHeader,
   DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Props {
   appointments: any[];
   onRefresh?: () => void;
}

const HOURS = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`); // 8am to 9pm

export function BizCalendar({ appointments, onRefresh }: Props) {
   const [currentViewDate, setCurrentViewDate] = useState(new Date());
   const [selectedApt, setSelectedApt] = useState<any>(null);
   const [isDetailsOpen, setIsDetailsOpen] = useState(false);
   const [selectedDayOffset, setSelectedDayOffset] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1); // 0-6 index

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

   const isCurrentWeek = useMemo(() => {
      const today = startOfToday();
      const start = startOfWeek(currentViewDate, { weekStartsOn: 1 });
      const end = addDays(start, 6);
      return today >= start && today <= end;
   }, [currentViewDate]);

   // Helper to extract duration from notes or metadata
   const getDuration = (apt: any) => {
      if (apt.notes) {
         const match = apt.notes.match(/\[DURATION:(\d+)\]/);
         if (match) return parseInt(match[1]);
      }
      return 30; // Default 30 mins
   };

   // Group appointments by date and calculate overlap logic
   const appointmentsByDay = useMemo(() => {
      const map: Record<string, any[]> = {};
      
      appointments.forEach(apt => {
         const dateStr = apt.appointment_date;
         if (!map[dateStr]) map[dateStr] = [];
         
         const duration = getDuration(apt);
         const [h, m] = apt.appointment_time.split(":").map(Number);
         const startTime = h * 60 + m;
         const endTime = startTime + duration;
         
         map[dateStr].push({
            ...apt,
            duration,
            startTime,
            endTime
         });
      });

      // Calculate overlap grouping for each day
      Object.keys(map).forEach(date => {
         const dayApts = map[date].sort((a, b) => a.startTime - b.startTime);
         
         // Simple collision detection algorithm
         const columns: any[][] = [];
         dayApts.forEach(apt => {
            let placed = false;
            for (let i = 0; i < columns.length; i++) {
               const lastAptInCol = columns[i][columns[i].length - 1];
               if (apt.startTime >= lastAptInCol.endTime) {
                  columns[i].push(apt);
                  apt.col = i;
                  placed = true;
                  break;
               }
            }
            if (!placed) {
               apt.col = columns.length;
               columns.push([apt]);
            }
         });

         dayApts.forEach(apt => {
            apt.totalCols = columns.length;
         });
      });

      return map;
   }, [appointments]);

   const getPosition = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const totalMinutes = (hours - 8) * 60 + minutes;
      return totalMinutes * (100 / 60); // 100px per hour
   };

   return (
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-700 shadow-2xl relative">
         {/* Calendar Header - Hidden on Mobile, Premium on Desktop */}
         <div className="hidden lg:flex p-8 border-b border-border flex-col sm:flex-row items-center justify-between bg-muted/10 backdrop-blur-md z-30 gap-6">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-primary/10 rounded-[1.25rem] border border-primary/20 flex items-center justify-center shrink-0 shadow-lg ring-4 ring-primary/5">
                  <CalendarDays className="w-7 h-7 text-primary" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">Randevu Ajandası</h3>
                  <div className="flex items-center gap-2 mt-2">
                     <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary px-3 py-1 rounded-lg">
                        {format(weekDays[0], 'd MMMM', { locale: tr })} - {format(weekDays[6], 'd MMMM yyyy', { locale: tr })}
                     </Badge>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-2 bg-background/50 p-1.5 rounded-[1.5rem] border border-border shadow-inner ring-1 ring-border/50">
               <Button onClick={handlePrevWeek} variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-muted hover:text-primary transition-all rounded-xl"><ChevronLeft className="w-5 h-5" /></Button>
               <Button 
                  onClick={handleToday} 
                  variant={isCurrentWeek ? "secondary" : "ghost"} 
                  className={cn(
                     "px-6 h-10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                     isCurrentWeek ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground"
                  )}
               >
                  {isCurrentWeek ? "BU HAFTA" : "BUGÜNE DÖN"}
               </Button>
               <Button onClick={handleNextWeek} variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-muted hover:text-primary transition-all rounded-xl"><ChevronRight className="w-5 h-5" /></Button>
            </div>
         </div>

         {/* Mobile Navigation Strip - Minimalist */}
         <div className="flex lg:hidden items-center justify-between p-3 border-b border-border bg-muted/5">
            <div className="flex items-center gap-2">
               <Button onClick={handlePrevWeek} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-lg"><ChevronLeft className="w-4 h-4" /></Button>
               <Badge variant="outline" className="text-[7px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary px-2 py-0.5 rounded-md">
                   {format(weekDays[selectedDayOffset], 'MMMM yyyy', { locale: tr })}
               </Badge>
               <Button onClick={handleNextWeek} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-lg"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <Button onClick={handleToday} variant="ghost" className="h-8 text-[7px] font-black uppercase tracking-widest px-2 bg-muted/50 rounded-lg">BUGÜN</Button>
         </div>

         {/* Grid Area */}
         <div className="flex-1 flex flex-col overflow-hidden">
            {/* Days Header - Desktop Style */}
            <div className="hidden lg:flex bg-muted/20 border-b border-border">
               <div className="w-24 border-r border-border shrink-0 bg-muted/30" />
               <div className="flex-1 grid grid-cols-7 min-w-[1000px]">
                  {weekDays.map((day, i) => (
                     <div key={i} className={cn(
                        "p-6 text-center border-r border-border/50 last:border-0 transition-all duration-300",
                        isSameDay(day, new Date()) && "bg-primary/5 shadow-[inset_0_-4px_0_0_#3b82f6]"
                     )}>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mb-2 opacity-50">
                           {format(day, 'eeee', { locale: tr })}
                        </p>
                        <p className={cn(
                           "text-3xl font-black tracking-tighter transition-transform",
                           isSameDay(day, new Date()) ? "text-primary scale-110" : "text-foreground opacity-90"
                         )}>
                           {format(day, 'd')}
                        </p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Mobile Date Strip - Thumb Friendly Selection */}
            <div className="flex lg:hidden bg-card border-b border-border p-1 gap-1 overscroll-contain overflow-x-auto no-scrollbar scroll-smooth px-3">
              {weekDays.map((day, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDayOffset(i)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[48px] aspect-square rounded-xl transition-all duration-300",
                    selectedDayOffset === i 
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105" 
                      : "bg-muted/30 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <span className="text-[7px] font-black uppercase tracking-tighter opacity-60 mb-0.5">{format(day, 'EEE', { locale: tr })}</span>
                  <span className="text-sm font-black tracking-tighter leading-none">{format(day, 'd')}</span>
                  {isSameDay(day, new Date()) && ! (selectedDayOffset === i) && (
                    <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />
                  )}
                </button>
              ))}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-auto custom-scrollbar relative bg-grid-slate-900/[0.05] dark:bg-grid-white/[0.02]">
               <div className={cn(
                 "flex h-[1400px]",
                 "lg:min-w-[1000px] w-full"
               )}>
                  {/* Time Strip */}
                  <div className="w-12 lg:w-24 shrink-0 bg-muted/10 border-r border-border backdrop-blur-sm sticky left-0 z-20">
                     {HOURS.map((hour) => (
                        <div key={hour} className="h-[100px] relative border-b border-border/20 last:border-0">
                           <span className="absolute top-4 left-0 right-0 text-center text-[8px] lg:text-[11px] font-black text-muted-foreground/30 uppercase tracking-tighter">
                              {hour}
                           </span>
                        </div>
                     ))}
                  </div>

                  {/* Grid Columns */}
                  <div className="flex-1 grid lg:grid-cols-7 grid-cols-1 relative">
                     {/* Horizontal Grid Lines */}
                     <div className="absolute inset-0 pointer-events-none">
                        {HOURS.map((hour) => (
                           <div key={hour} className="h-[100px] border-b border-border/30 last:border-0" />
                        ))}
                     </div>

                     {/* Mobile Single Day View Logic */}
                     {weekDays.map((day, dayIndex) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayApts = appointmentsByDay[dateStr] || [];
                        const isSelectedMobile = dayIndex === selectedDayOffset;

                        return (
                           <div key={dayIndex} className={cn(
                             "relative group h-full",
                             "lg:block", 
                             isSelectedMobile ? "block" : "hidden"
                           )}>
                              {dayApts.map((apt, aptIndex) => {
                                 const top = getPosition(apt.appointment_time);
                                 const height = (apt.duration / 60) * 100;
                                 const width = 100 / apt.totalCols;
                                 const left = apt.col * width;

                                 const statusColors: any = {
                                    pending: "border-amber-500/30 bg-amber-500/5",
                                    confirmed: "border-blue-500/30 bg-blue-500/5 shadow-blue-500/10",
                                    completed: "border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/10",
                                    cancelled: "border-rose-500/30 bg-rose-500/5"
                                 };

                                 return (
                                    <div
                                       key={apt.id || aptIndex}
                                       style={{ 
                                          top: `${top}px`, 
                                          height: `${height}px`,
                                          left: `${left}%`,
                                          width: `${width}%`
                                       }}
                                       onClick={() => {
                                          setSelectedApt(apt);
                                          setIsDetailsOpen(true);
                                       }}
                                       className={cn(
                                          "absolute z-10 px-2 lg:px-3 py-2 rounded-2xl border backdrop-blur-md transition-all duration-300",
                                          "cursor-pointer hover:z-30 hover:scale-[1.02] hover:shadow-2xl ring-1 ring-white/5",
                                          statusColors[apt.status] || "border-border bg-card",
                                          apt.status === 'confirmed' && "animate-in fade-in zoom-in duration-500"
                                       )}
                                    >
                                       {/* Status Indicator Bar */}
                                       <div className={cn(
                                          "absolute top-0 bottom-0 left-0 w-1 lg:w-1.5 rounded-l-2xl",
                                          apt.status === 'confirmed' ? "bg-blue-500" :
                                          apt.status === 'completed' ? "bg-emerald-500" :
                                          apt.status === 'cancelled' ? "bg-rose-500" : "bg-amber-500"
                                       )} />

                                       <div className="flex flex-col h-full overflow-hidden">
                                          <div className="flex items-center justify-between gap-1 mb-1">
                                             <span className="text-[8px] lg:text-[9px] font-black text-foreground uppercase truncate tracking-tight">
                                                {apt.customer_name}
                                             </span>
                                             <span className="text-[8px] lg:text-[9px] font-mono font-bold text-primary shrink-0">
                                                {apt.appointment_time}
                                             </span>
                                          </div>
                                          
                                          {height >= 40 && (
                                             <div className="space-y-1">
                                                <p className="text-[7px] lg:text-[8px] text-muted-foreground font-black uppercase truncate tracking-widest opacity-70">
                                                   {apt.service_name || "Servis"}
                                                </p>
                                             </div>
                                          )}
                                       </div>

                                       {/* Overlap Badge */}
                                       {apt.totalCols > 1 && (
                                          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" title="Çakışma var" />
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>
            
            {/* Legend / Status Footer */}
            <div className="p-4 border-t border-border bg-muted/10 flex items-center gap-6 justify-center">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Bekliyor</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Onaylandı</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tamamlandı</span>
               </div>
            </div>

            {/* Appointment Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
               <DialogContent className="bg-card border-border text-foreground max-w-lg rounded-[2.5rem] shadow-2xl p-0 overflow-hidden">
                  <DialogHeader className="p-8 pb-4">
                     <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Randevu Detayları</DialogTitle>
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
                                 <p className="text-muted-foreground font-black text-[11px] mt-2 uppercase tracking-widest opacity-60">
                                    {selectedApt.customer_phone} 
                                    <span className="mx-2 opacity-30">|</span> 
                                    {selectedApt.duration} DK
                                 </p>
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
                           <div className="bg-muted/30 border border-border p-6 rounded-[2rem] space-y-2 relative overflow-hidden group">
                              <div className="absolute -right-4 -top-4 w-12 h-12 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Zamanlama</p>
                              <div className="flex items-center gap-2">
                                 <CalendarIcon className="w-4 h-4 text-primary" />
                                 <p className="font-black text-sm uppercase">{selectedApt.appointment_date}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                 <Clock className="w-4 h-4 text-primary" />
                                 <p className="font-black text-xl">{selectedApt.appointment_time}</p>
                              </div>
                           </div>

                           <div className="bg-muted/30 border border-border p-6 rounded-[2rem] space-y-2 relative overflow-hidden group">
                              <div className="absolute -right-4 -top-4 w-12 h-12 bg-violet-500/5 rounded-full blur-xl group-hover:bg-violet-500/10 transition-colors" />
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Hizmet & Personel</p>
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
                           <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[2.5rem]">
                              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 italic underline underline-offset-4">Müşteri Notu</p>
                              <p className="text-sm text-foreground/80 font-medium italic leading-relaxed">"{selectedApt.notes.replace(/\[DURATION:\d+\]/, '').trim() || 'Not bırakılmadı'}"</p>
                           </div>
                        )}

                        <DialogFooter className="gap-4">
                           {selectedApt.status === 'pending' && (
                              <Button
                                 onClick={() => {
                                    handleStatusUpdate(selectedApt.id, 'confirmed');
                                    setIsDetailsOpen(false);
                                 }}
                                 className="flex-1 bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-black text-xs uppercase shadow-lg shadow-blue-500/20"
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
                                 className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-14 rounded-2xl font-black text-xs uppercase shadow-lg shadow-emerald-500/20"
                              >
                                 HİZMET TAMAMLANDI
                              </Button>
                           )}
                           <Button
                              variant="outline"
                              onClick={() => setIsDetailsOpen(false)}
                              className="flex-1 border-border hover:bg-muted h-14 rounded-2xl font-black text-xs uppercase"
                           >
                              KAPAT
                           </Button>
                           <Button 
                              variant="ghost" 
                              onClick={async () => {
                                 if (confirm("Bu randevuyu iptal edip silmek üzeresiniz. Emin misiniz?")) {
                                    const { error } = await supabase.from('appointments').delete().eq('id', selectedApt.id);
                                    if (error) toast.error("Hata oluştu");
                                    else {
                                       toast.success("Randevu iptal edildi");
                                       setIsDetailsOpen(false);
                                       onRefresh?.();
                                    }
                                 }
                              }}
                              className="flex-1 text-rose-500 hover:bg-rose-500/10 h-14 rounded-2xl font-black text-xs uppercase"
                           >
                              İPTAL ET
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
