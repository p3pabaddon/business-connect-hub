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
import { User as UserIcon } from "lucide-react";

const AppointmentBlock = ({ apt, top, height, width, left, onClick, isCompact = false }: any) => {
   const statusColors: any = {
      pending: "border-amber-500/30 bg-amber-500/5",
      confirmed: "border-blue-500/30 bg-blue-500/5 shadow-blue-500/10",
      completed: "border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/10",
      cancelled: "border-rose-500/30 bg-rose-500/5"
   };

   return (
      <div
         style={{ 
            top: `${top}px`, 
            height: `${height}px`,
            left: `${left}%`,
            width: `${width}%`
         }}
         onClick={onClick}
         className={cn(
            "absolute z-10 px-2 lg:px-3 py-2 rounded-2xl border backdrop-blur-md transition-all duration-300",
            "cursor-pointer hover:z-30 hover:scale-[1.02] hover:shadow-2xl ring-1 ring-white/5",
            statusColors[apt.status] || "border-border bg-card",
            apt.status === 'confirmed' && "animate-in fade-in zoom-in duration-500"
         )}
      >
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
            
            {!isCompact && height >= 40 && (
               <div className="space-y-1">
                  <p className="text-[7px] lg:text-[8px] text-muted-foreground font-black uppercase truncate tracking-widest opacity-70">
                     {apt.service_name || "Servis"}
                  </p>
                  <p className="text-[7px] text-primary/60 font-bold uppercase truncate">
                     {apt.staff?.name || "Personel"}
                  </p>
               </div>
            )}
         </div>
         {apt.totalCols > 1 && !isCompact && (
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" title="Çakışma var" />
         )}
      </div>
   );
};

interface Props {
   appointments: any[];
   staff: any[];
   onRefresh?: () => void;
}

const HOURS = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`); // 8am to 9pm

export function BizCalendar({ appointments, staff, onRefresh }: Props) {
   const [currentViewDate, setCurrentViewDate] = useState(new Date());
   const [selectedApt, setSelectedApt] = useState<any>(null);
   const [isDetailsOpen, setIsDetailsOpen] = useState(false);
   const [selectedDayOffset, setSelectedDayOffset] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1); // 0-6 index
   const [viewMode, setViewMode] = useState<'weekly' | 'staff'>('staff');
   const [focusedStaffId, setFocusedStaffId] = useState<string | null>(null);

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
      
      const filteredAppointments = focusedStaffId 
         ? appointments.filter(a => {
            const aptStaffId = typeof a.staff_id === 'object' ? a.staff_id?.id : a.staff_id;
            return aptStaffId === focusedStaffId;
         })
         : appointments;

      filteredAppointments.forEach(apt => {
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
         
         if (viewMode === 'weekly' || focusedStaffId) {
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
         } else {
            dayApts.forEach(apt => {
               const aptStaffId = typeof apt.staff_id === 'object' ? apt.staff_id?.id : apt.staff_id;
               const staffIndex = staff.findIndex(s => s.id === aptStaffId);
               apt.col = staffIndex >= 0 ? staffIndex : -1; // -1 means don't show or show in a special way
               apt.totalCols = staff.length || 1;
            });
         }
      });

      return map;
   }, [appointments, staff, viewMode, focusedStaffId]);

   const getPosition = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const totalMinutes = (hours - 8) * 60 + minutes;
      return totalMinutes * (100 / 60); // 100px per hour
   };

   const selectedDay = weekDays[selectedDayOffset];
   const focusedStaff = staff.find(s => s.id === focusedStaffId);

   return (
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-700 shadow-2xl relative">
         
         {/* Desktop Header */}
         <div className="hidden lg:flex p-6 border-b border-border items-center justify-between bg-muted/10 backdrop-blur-md z-30">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                  <CalendarIcon className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tight leading-none mb-1">Takvim</h2>
                  <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                         {format(currentViewDate, 'MMMM yyyy', { locale: tr })}
                      </p>
                      <Badge variant="outline" className="text-[8px] font-black border-primary/20 bg-primary/5 text-primary">
                         {focusedStaffId ? `${focusedStaff?.name} - Haftalık` : (viewMode === 'staff' ? 'Tüm Ekip' : 'Genel Haftalık')}
                      </Badge>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-2xl border border-border/50">
               <Button 
                  onClick={() => { setViewMode('staff'); setFocusedStaffId(null); }}
                  variant={viewMode === 'staff' && !focusedStaffId ? 'default' : 'ghost'}
                  className={cn(
                     "h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                     viewMode === 'staff' && !focusedStaffId && "shadow-lg shadow-primary/20"
                  )}
               >
                  Personel
               </Button>
               <Button 
                  onClick={() => { setViewMode('weekly'); setFocusedStaffId(null); }}
                  variant={viewMode === 'weekly' && !focusedStaffId ? 'default' : 'ghost'}
                  className={cn(
                     "h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                     viewMode === 'weekly' && !focusedStaffId && "shadow-lg shadow-primary/20"
                  )}
               >
                  Haftalık
               </Button>
               {focusedStaffId && (
                  <Button 
                     variant="default"
                     className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 bg-primary"
                  >
                     {focusedStaff?.name}
                  </Button>
               )}
            </div>

            <div className="flex items-center gap-2">
               <Button onClick={handlePrevWeek} variant="outline" size="icon" className="h-10 w-10 border-border bg-card hover:bg-muted transition-all rounded-xl shadow-sm"><ChevronLeft className="w-5 h-5" /></Button>
               <Button 
                  onClick={handleToday} 
                  variant="outline" 
                  className={cn(
                     "h-10 px-6 font-black uppercase tracking-widest text-[10px] border-border bg-card transition-all rounded-xl shadow-sm",
                     isCurrentWeek && "border-primary text-primary bg-primary/5"
                  )}
               >
                  {isCurrentWeek ? "BU HAFTA" : "BUGÜNE DÖN"}
               </Button>
               <Button onClick={handleNextWeek} variant="outline" size="icon" className="h-10 w-10 border-border bg-card hover:bg-muted transition-all rounded-xl shadow-sm"><ChevronRight className="w-5 h-5" /></Button>
            </div>
         </div>

         {/* Mobile Navigation Strip */}
         <div className="flex lg:hidden items-center justify-between p-3 border-b border-border bg-muted/5">
            <div className="flex items-center gap-2">
               <Button onClick={handlePrevWeek} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-lg"><ChevronLeft className="w-4 h-4" /></Button>
               <Badge variant="outline" className="text-[7px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary px-2 py-0.5 rounded-md">
                   {format(currentViewDate, 'MMMM yyyy', { locale: tr })}
               </Badge>
               <Button onClick={handleNextWeek} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-lg"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <div className="flex items-center gap-2">
               {focusedStaffId && (
                  <Button variant="ghost" onClick={() => setFocusedStaffId(null)} className="h-8 text-[7px] font-black uppercase tracking-widest px-2 bg-rose-500/10 text-rose-500 rounded-lg border border-rose-500/20">KALDIR</Button>
               )}
               <Button 
                 onClick={() => { setViewMode(viewMode === 'staff' ? 'weekly' : 'staff'); setFocusedStaffId(null); }}
                 variant="ghost" 
                 className="h-8 text-[7px] font-black uppercase tracking-widest px-2 bg-primary/10 text-primary rounded-lg border border-primary/20"
               >
                 {focusedStaffId ? focusedStaff?.name : (viewMode === 'staff' ? 'EKİP' : 'HAFTALIK')}
               </Button>
               <Button onClick={handleToday} variant="ghost" className="h-8 text-[7px] font-black uppercase tracking-widest px-2 bg-muted/50 rounded-lg">BUGÜN</Button>
            </div>
         </div>

         {/* Grid Area */}
         <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header Section (Weekdays or Staff) */}
            <div className="bg-card border-b border-border shadow-sm relative z-20">
               <div className="flex">
                  <div className="w-12 lg:w-24 border-r border-border shrink-0 bg-muted/5 flex items-center justify-center">
                     <Clock className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                  <div className={cn(
                     "flex-1 grid transition-all duration-500 overflow-x-auto no-scrollbar",
                     (viewMode === 'weekly' || focusedStaffId) ? "lg:grid-cols-7 grid-cols-1" : `grid-cols-${staff.length || 1} min-w-[${(staff.length || 1) * 150}px]`
                  )}>
                     {(viewMode === 'weekly' || focusedStaffId) ? weekDays.map((day, i) => (
                        <div key={i} className={cn(
                           "py-3 lg:py-6 text-center border-r border-border/50 last:border-0 transition-all duration-300",
                           isSameDay(day, new Date()) && "bg-primary/5 shadow-[inset_0_-3px_0_0_#3b82f6]",
                           "lg:block",
                           i === selectedDayOffset ? "block" : "hidden"
                        )}>
                           <p className="text-[8px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-50">
                              {format(day, 'eeee', { locale: tr })}
                           </p>
                           <p className={cn(
                              "text-xl lg:text-3xl font-black tracking-tighter",
                              isSameDay(day, new Date()) ? "text-primary" : "text-foreground opacity-90"
                            )}>
                              {format(day, 'd')}
                           </p>
                        </div>
                     )) : staff.map((s, i) => (
                        <div 
                           key={s.id} 
                           onClick={() => { setFocusedStaffId(s.id); setViewMode('weekly'); }}
                           className="py-3 lg:py-4 px-2 text-center border-r border-border/50 last:border-0 bg-muted/5 flex flex-col items-center justify-center gap-1 min-w-[150px] cursor-pointer hover:bg-primary/5 transition-colors group"
                        >
                           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:border-primary">
                              <UserIcon className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                           </div>
                           <div className="overflow-hidden w-full">
                              <p className="text-[9px] lg:text-[11px] font-black text-foreground uppercase tracking-tight truncate group-hover:text-primary transition-colors">{s.name}</p>
                              <p className="text-[7px] lg:text-[8px] text-muted-foreground font-black uppercase opacity-40 tracking-widest truncate">{s.role || "Personel"}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Mobile View Day Selector */}
            <div className="flex lg:hidden bg-card border-b border-border p-1 gap-1 overscroll-contain overflow-x-auto no-scrollbar scroll-smooth px-3">
              {weekDays.map((day, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDayOffset(i)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[48px] h-12 rounded-xl transition-all duration-300",
                    selectedDayOffset === i 
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105" 
                      : "bg-muted/30 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <span className="text-[7px] font-black uppercase tracking-tighter opacity-60 mb-0.5">{format(day, 'EEE', { locale: tr })}</span>
                  <span className="text-xs font-black tracking-tighter leading-none">{format(day, 'd')}</span>
                </button>
              ))}
            </div>

            {/* Scrollable Grid Body */}
            <div className="flex-1 overflow-auto custom-scrollbar relative bg-grid-slate-900/[0.05] dark:bg-grid-white/[0.02]">
               <div className={cn(
                 "flex h-[1400px]",
                 viewMode === 'staff' && !focusedStaffId ? `min-w-[${(staff.length || 1) * 150 + 96}px]` : "lg:min-w-[1000px] w-full"
               )}>
                  {/* Time Column */}
                  <div className="w-12 lg:w-24 shrink-0 bg-muted/5 border-r border-border backdrop-blur-sm sticky left-0 z-20">
                     {HOURS.map((hour) => (
                        <div key={hour} className="h-[100px] relative border-b border-border/10 last:border-0">
                           <span className="absolute top-4 left-0 right-0 text-center text-[8px] lg:text-[11px] font-black text-muted-foreground/30 uppercase tracking-tighter">
                              {hour}
                           </span>
                        </div>
                     ))}
                  </div>

                  {/* Appointment Grid */}
                  <div className={cn(
                      "flex-1 grid relative",
                      (viewMode === 'weekly' || focusedStaffId) ? "lg:grid-cols-7 grid-cols-1" : `grid-cols-${staff.length || 1}`
                   )}>
                     {/* Grid Horizontal Help Lines */}
                     <div className="absolute inset-0 pointer-events-none">
                        {HOURS.map((hour) => (
                           <div key={hour} className="h-[100px] border-b border-border/30 last:border-0" />
                        ))}
                     </div>

                     {(viewMode === 'weekly' || focusedStaffId) ? weekDays.map((day, dayIndex) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayApts = appointmentsByDay[dateStr] || [];
                        const isSelectedMobile = dayIndex === selectedDayOffset;

                        return (
                           <div key={dayIndex} className={cn(
                             "relative group h-full border-r border-border/20 last:border-0",
                             "lg:block", 
                             isSelectedMobile ? "block" : "hidden"
                           )}>
                              {dayApts.map((apt, aptIndex) => {
                                 const top = getPosition(apt.appointment_time);
                                 const height = (apt.duration / 60) * 100;
                                 const width = 100 / apt.totalCols;
                                 const left = apt.col * width;

                                 return (
                                    <AppointmentBlock 
                                       key={apt.id || aptIndex}
                                       apt={apt}
                                       top={top}
                                       height={height}
                                       width={width}
                                       left={left}
                                       onClick={() => {
                                          setSelectedApt(apt);
                                          setIsDetailsOpen(true);
                                       }}
                                    />
                                 );
                              })}
                           </div>
                        );
                     }) : staff.map((s, staffIdx) => {
                         const dateStr = format(weekDays[selectedDayOffset], 'yyyy-MM-dd');
                         const dayApts = (appointmentsByDay[dateStr] || []).filter(a => a.staff_id === s.id);

                         return (
                           <div key={s.id} className="relative group h-full border-r border-border/20 last:border-0 bg-muted/5 min-w-[150px]">
                              {dayApts.map((apt, aptIndex) => {
                                 const top = getPosition(apt.appointment_time);
                                 const height = (apt.duration / 60) * 100;
                                 return (
                                    <AppointmentBlock 
                                       key={apt.id || aptIndex}
                                       apt={apt}
                                       top={top}
                                       height={height}
                                       width={100}
                                       left={0}
                                       onClick={() => {
                                          setSelectedApt(apt);
                                          setIsDetailsOpen(true);
                                       }}
                                       isCompact={staff.length > 5}
                                    />
                                 );
                              })}
                           </div>
                         );
                     })}
                  </div>
               </div>
            </div>
            
            {/* Legend Footer */}
            <div className="p-4 border-t border-border bg-muted/10 flex flex-wrap items-center gap-6 justify-center">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Bekliyor</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Onaylandı</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tamamlandı</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">İptal Edildi</span>
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
                                 <UserIcon className="w-8 h-8 text-primary" />
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
                                 selectedApt.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                                 selectedApt.status === 'cancelled' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-muted border-border text-muted-foreground"
                           )}>
                              {selectedApt.status === 'confirmed' ? 'Onaylandı' :
                                 selectedApt.status === 'completed' ? 'Tamamlandı' : 
                                 selectedApt.status === 'cancelled' ? 'İptal Edildi' : 'Bekliyor'}
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
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Personel: <span className="text-foreground">{selectedApt.staff_name || selectedApt.staff?.name || 'Atanmamış'}</span></p>
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
