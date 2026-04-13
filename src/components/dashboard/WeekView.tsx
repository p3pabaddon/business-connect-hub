import { useMemo } from "react";
import { 
  format, 
  startOfWeek, 
  eachDayOfInterval,
  endOfWeek,
  setHours,
  setMinutes,
  isSameDay,
  parseISO
} from "date-fns";
import { tr } from "date-fns/locale";
import { isSlotOccupied, calculateOverlaps } from "@/lib/booking-utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WeekViewProps {
  appointments: any[];
  onAppointmentClick?: (apt: any) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00

export function WeekView({ appointments, onAppointmentClick }: WeekViewProps) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  
  const days = useMemo(() => 
    eachDayOfInterval({ start: weekStart, end: weekEnd }),
    [weekStart, weekEnd]
  );

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-[800px]">
      {/* Header */}
      <div className="grid grid-cols-8 border-b border-border bg-muted/30">
        <div className="p-3 border-r border-border text-xs font-medium text-muted-foreground flex items-center justify-center">
          Saat
        </div>
        {days.map((day) => (
          <div key={day.toString()} className={cn(
            "p-3 text-center border-r border-border last:border-r-0",
            isSameDay(day, today) && "bg-primary/5"
          )}>
            <div className="text-xs font-semibold text-muted-foreground uppercase">
              {format(day, "eee", { locale: tr })}
            </div>
            <div className={cn(
              "text-lg font-bold",
              isSameDay(day, today) ? "text-primary" : "text-foreground"
            )}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="grid grid-cols-8">
          {/* Time Labels */}
          <div className="col-span-1 border-r border-border">
            {HOURS.map((hour) => (
              <div key={hour} className="h-20 border-b border-border/50 p-2 text-[10px] text-muted-foreground text-right relative">
                <span className="absolute top-0 right-2 -translate-y-1/2 bg-card px-1 italic">
                  {format(setHours(setMinutes(new Date(), 0), hour), "HH:mm")}
                </span>
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {days.map((day) => (
            <div key={day.toString()} className="col-span-1 border-r border-border last:border-r-0 relative group">
              {HOURS.map((hour) => (
                <div key={hour} className="h-20 border-b border-border/10 group-hover:bg-primary/[0.01] transition-colors" />
              ))}

              {/* Appointments Overflow layer */}
              <div className="flex-1 relative min-h-[1280px]">
                {/* Visual grid lines */}
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="absolute w-full h-px bg-border/40" style={{ top: `${i * 80}px` }} />
                ))}

                {(() => {
                  const dayApts = appointments.filter((apt) => isSameDay(parseISO(apt.appointment_date), day));
                  const overlapGroups = calculateOverlaps(dayApts);

                  return overlapGroups.map((column, colIndex, allCols) => {
                    const width = 100 / allCols.length;
                    const left = colIndex * width;

                    return column.map((apt) => {
                      const [h, m] = apt.appointment_time.split(":").map(Number);
                      const top = (h - 8) * 80 + (m / 60) * 80;
                      
                      const notesStr = apt.notes || "";
                      const durMatch = notesStr.match(/\[DURATION:(\d+)\]/);
                      const durationInMinutes = durMatch ? parseInt(durMatch[1], 10) : (apt.total_duration || apt.duration || 30);
                      const height = Math.max((durationInMinutes / 60) * 80, 25);

                      return (
                        <div
                          key={apt.id}
                          onClick={() => onAppointmentClick?.(apt)}
                          className={`absolute p-2 rounded-lg border shadow-sm transition-all hover:scale-[1.02] hover:z-20 overflow-hidden cursor-pointer ${
                            apt.status === "completed" 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" 
                              : apt.status === "cancelled"
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                              : "bg-primary/10 border-primary/30 text-primary"
                          }`}
                          style={{ 
                            top: `${top}px`, 
                            height: `${height}px`,
                            left: `${left}%`,
                            width: `${width}%`
                          }}
                        >
                          <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between gap-1 overflow-hidden">
                              <p className="text-[10px] font-bold truncate leading-tight">{apt.customer_name}</p>
                              <p className="text-[9px] font-mono opacity-70 flex-shrink-0">{apt.appointment_time}</p>
                            </div>
                            {height > 40 && (
                              <p className="text-[9px] mt-1 opacity-80 line-clamp-2 leading-tight">
                                {apt.service_name || "Hizmet belirtilmedi"}
                              </p>
                            )}
                            {height > 60 && apt.staff?.name && (
                              <div className="mt-auto pt-1 border-t border-current/10 flex items-center justify-between">
                                <p className="text-[8px] font-bold uppercase tracking-wider truncate">
                                  {apt.staff.name}
                                </p>
                                <span className={`text-[8px] px-1 rounded-sm border border-current/20 ${
                                  apt.status === 'confirmed' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                                }`}>
                                  {apt.status === 'confirmed' ? 'ONAYLI' : 'BEKLİYOR'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  });
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
