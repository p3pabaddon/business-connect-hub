
import { useState, useRef, useEffect } from "react";
import { 
  Bot, X, Send, Sparkles, Brain, 
  TrendingUp, BarChart3, Minimize2, 
  Maximize2, Loader2, MessageSquareText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { askAiAdvisor } from "@/lib/ai-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { checkRateLimit, getRateLimitMessage } from "@/lib/rate-limiter";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface BizAiAdvisorProps {
  businessName: string;
  stats?: any;
  services?: any[];
  staff?: any[];
}

export function BizAiAdvisor({ businessName, stats, services, staff }: BizAiAdvisorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: `Merhaba! Ben senin akıllı işletme danışmanıyım. ${businessName} işletmen için verileri analiz ettim. Bugün kazancını artırmak için ne yapabileceğimizi konuşalım mı?` 
    }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!checkRateLimit("ai_chat")) {
      toast.error("Sakin ol şampiyon!", { description: getRateLimitMessage() });
      return;
    }

    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Map messages for AI service
      const aiMessages = [...messages, userMessage].map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));

      const response = await askAiAdvisor(aiMessages, {
        businessName,
        stats,
        services,
        staff
      });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error: any) {
      toast.error("AI Bağlantı Hatası", { description: error.message });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Kazancımı nasıl artırırım?",
    "Hangi hizmet popüler?",
    "Personel analizi yap",
    "Pazarlama tavsiyesi ver"
  ];

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            onClick={() => setIsOpen(true)}
            className="group relative w-12 h-12 lg:w-16 lg:h-16 bg-primary rounded-xl lg:rounded-2xl flex items-center justify-center shadow-[0_15px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.6)] hover:-translate-y-1 transition-all duration-300 ring-2 ring-primary/20"
          >
            <Bot className="w-6 h-6 lg:w-8 lg:h-8 text-white group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
            <div className="absolute right-full mr-4 bg-card border border-border px-4 py-2 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <p className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" /> Yapay Zeka Danışmanı
              </p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                height: isMinimized ? "70px" : "550px"
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={cn(
              "w-[92vw] sm:w-[380px] bg-card/80 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col transition-all duration-500",
              isMinimized ? "rounded-full" : ""
            )}
          >
            {/* Header */}
            <div className="p-5 border-b border-border bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                   <h3 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none">AI Business Advisor</h3>
                   <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                      <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Çevrimiçi & Analiz Ediyor</span>
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                 <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                   {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                 </button>
                 <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-full transition-colors"
                >
                   <X className="w-4 h-4" />
                 </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Chat Area */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar"
                >
                  {messages.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}>
                      <div className={cn(
                        "max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                        msg.role === 'user' 
                          ? "bg-primary text-primary-foreground rounded-br-none" 
                          : "bg-muted/50 border border-border text-foreground rounded-bl-none"
                      )}>
                         {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                       <div className="bg-muted/50 border border-border p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-[11px] font-black uppercase tracking-widest opacity-60">Analiz Yapılıyor...</span>
                       </div>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                <div className="px-5 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                   {suggestions.map(s => (
                     <button
                      key={s}
                      onClick={() => { setInput(s); }}
                      className="whitespace-nowrap px-3 py-1.5 bg-muted/30 border border-border rounded-lg text-[10px] font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors uppercase tracking-tight"
                     >
                       {s}
                     </button>
                   ))}
                </div>

                {/* Input Area */}
                <div className="p-5 pt-2">
                  <div className="relative group">
                     <Input 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="İşletmen hakkında bir soru sor..."
                      className="bg-muted/50 border-border h-12 pr-12 rounded-2xl text-xs font-medium focus-visible:ring-primary/20 transition-all"
                     />
                     <button 
                      onClick={handleSend}
                      disabled={loading || !input.trim()}
                      className="absolute right-1 top-1 w-10 h-10 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-0"
                     >
                        <Send className="w-4 h-4" />
                     </button>
                  </div>
                  <p className="text-center text-[8px] text-muted-foreground mt-3 font-medium uppercase tracking-widest opacity-40">
                    GPT-4o AI Tarafından Güçlendirilmiştir
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
