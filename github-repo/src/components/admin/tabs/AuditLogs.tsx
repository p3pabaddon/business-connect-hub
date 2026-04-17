import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollText, Terminal, Info, AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditLogsProps {
  auditLogs: any[];
}

export const AuditLogs = ({ auditLogs }: AuditLogsProps) => {
  return (
    <Card className="bg-card border-border shadow-md overflow-hidden">
      <CardHeader className="bg-muted/10 border-b border-border/50">
        <CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-primary" /> Sistem Olay Göküğü
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto">
          {auditLogs.length === 0 ? (
            <div className="text-center py-24">
              <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Kayıtlı olay bulunamadı.</p>
            </div>
          ) : (
            auditLogs.map((log: any) => (
              <div key={log.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0", 
                    log.severity === 'high' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                    log.severity === 'medium' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                    "bg-blue-500/10 border-blue-500/20 text-blue-500"
                  )}>
                    {log.severity === 'high' ? <AlertTriangle className="w-4 h-4" /> : log.severity === 'medium' ? <Terminal className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground uppercase tracking-tight italic">{log.action || 'Sistem İşlemi'}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5 italic">{log.details || 'İşlem detayı yok.'}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono font-bold tracking-tighter opacity-60">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
