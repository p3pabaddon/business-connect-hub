import { useMemo } from "react";
import { 
  format, 
  startOfWeek, 
  addDays, 
  addHours, 
  startOfDay, 
  isSameDay, 
  parseISO,
  eachDayOfInterval,
  endOfWeek,
  setHours,
  setMinutes
} from "date-fns";
import { tr } from "date-fns/locale";
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

  const statusMap: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
    confirmed: "bg-blue-500/20 text-blue-500 border-blue-500/50",
    completed: "bg-green-500/20 text-green-500 border-green-500/50",
    cancelled: "bg-red-500/20 text-red-500 border-red-500/50",
  };

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
              <div className="absolute inset-0 pointer-events-none">
                {appointments
                  .filter((apt) => isSameDay(parseISO(apt.appointment_date), day))
                  .map((apt) => {
                    const [h, m] = apt.appointment_time.split(":").map(Number);
                    if (h < 8 || h > 22) return null;
                    
                    const top = (h - 8) * 80 + (m / 60) * 80;
                    const durationInMinutes = apt.duration || 30; // default 30 min if not specified
                    const height = (durationInMinutes / 60) * 80;

                    return (
                      <div
                        key={apt.id}
                        onClick={() => onAppointmentClick?.(apt)}
                        className={cn(
                          "absolute left-1 right-1 rounded-md border p-1.5 cursor-pointer pointer-events-auto transition-all hover:scale-[1.02] hover:z-20 shadow-sm",
                          statusMap[apt.status] || "bg-slate-500/20 text-slate-500 border-slate-500/50"
                        )}
                        style={{ top: `${top}px`, height: `${height}px` }}
                      >
                        <div className="text-[10px] font-bold truncate">{apt.customer_name}</div>
                        <div className="text-[9px] opacity-80 leading-tight">
                          {apt.appointment_time} · {apt.services?.[0]?.name || "Servis"}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
