import { Badge } from "@/components/ui/badge";
import { User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppointmentListProps {
  appointments: any[];
}

export const AppointmentList = ({ appointments }: AppointmentListProps) => {
  return (
    <div className="space-y-4">
      {appointments.slice(0, 50).map(app => (
        <div key={app.id} className="p-4 lg:p-6 bg-card border border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm hover:border-primary/20 transition-all duration-300 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-foreground uppercase tracking-tight truncate">{app.customer_name}</p>
              <p className="text-[10px] text-muted-foreground font-bold italic truncate flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {app.business?.name}</p>
              <div className="flex sm:hidden items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-foreground">{app.appointment_date}</span>
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-[10px] text-muted-foreground">{app.appointment_time}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-none pt-4 sm:pt-0">
            <div className="hidden sm:flex flex-col items-end gap-0.5">
              <span className="text-[10px] font-bold text-foreground">{app.appointment_date}</span>
              <span className="text-[10px] text-muted-foreground">{app.appointment_time}</span>
            </div>
            <Badge className={cn(
              "text-[10px] font-black uppercase px-4 lg:px-6 h-8 border-none rounded-xl",
              app.status === 'confirmed' || app.status === 'completed' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-muted text-muted-foreground"
            )}>
              {app.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};
