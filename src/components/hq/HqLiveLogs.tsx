import { useState, useEffect } from "react";
import { getLiveLogs, LiveLog } from "@/lib/hq-api";
import { Terminal, Globe, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export function HqLiveLogs() {
  const [logs, setLogs] = useState<LiveLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await getLiveLogs(15);
      setLogs(data);
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Pulse every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0f172a]/50 backdrop-blur-md border border-slate-800/50 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/30">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" /> Live Traffic Stream
        </h3>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 uppercase font-mono tracking-widest">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
          Live Feed
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 border-l-2 border-slate-800 pl-3 hover:border-primary/50 transition-colors py-1 group">
            <div className="text-slate-500 whitespace-nowrap">
              {format(new Date(log.created_at), "HH:mm:ss")}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-slate-300 mb-0.5">
                <Globe className="w-3 h-3 text-slate-500" />
                <span className="text-primary/90">{log.path}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <User className="w-3 h-3" />
                <span>{log.user_email || "Anonymous Guest"}</span>
              </div>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-600 italic">
            Waiting for incoming traffic...
          </div>
        )}
      </div>
    </div>
  );
}
