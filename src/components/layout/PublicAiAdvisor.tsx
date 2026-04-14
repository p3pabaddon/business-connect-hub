
import { useState, useRef, useEffect } from "react";
import { 
  Bot, X, Send, Sparkles, 
  Search, Minimize2, 
  Maximize2, Loader2, MessageSquareText,
  Compass, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { askPublicAiAdvisor } from "@/lib/ai-service";
import { useBusinesses } from "@/hooks/useQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function PublicAiAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Merhaba! Ben Business Connect Hub'ın akıllı keşif asistanıyım. Aradığın bir hizmet veya işletme varsa sana yardımcı olabilirim. Ne aramıştın?" 
    }
  ]);

  const { data: businesses } = useBusinesses();
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const aiMessages = [...messages, userMessage].map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));

      const categories = ["Berber", "Kuaför", "Güzellik Merkezi", "Spor Salonu", "Klinik", "Diyetisyen"];
      
      const response = await askPublicAiAdvisor(aiMessages, {
        businesses: businesses || [],
        categories,
      });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error: any) {
      toast.error("Bağlantı Hatası", { description: "Şu an cevap veremiyorum, lütfen tekrar dene." });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "En iyi kuaförler hangileri?",
    "Pazar günü açık bir yer var mı?",
    "Nasıl randevu alırım?",
    "Üyelik sistemi nasıl çalışıyor?"
  ];

  return (
    <div className="fixed bottom-36 sm:bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, scaleY: 0.5 }}
            animate={{ scale: 1, scaleY: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="group relative h-14 lg:h-16 px-4 lg:px-6 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.6)] hover:-translate-y-1 transition-all duration-300 ring-4 ring-white/10"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
               <Bot className="w-5 h-5 text-white animate-bounce" />
            </div>
            <span className="text-sm font-black text-white uppercase tracking-widest hidden lg:inline">ASİSTAN'A SOR</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9, rotate: 2 }}
            animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotate: 0,
                height: isMinimized ? "70px" : "550px"
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={cn(
              "w-[calc(100vw-48px)] sm:w-[380px] bg-card/90 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col transition-all duration-500",
              isMinimized ? "rounded-full" : ""
            )}
          >
            <div className="p-5 border-b border-border bg-gradient-to-r from-primary/20 via-accent/10 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg relative">
                  <Bot className="w-5 h-5 text-white" />
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl" />
                </div>
                <div>
                   <h3 className="text-sm font-black text-foreground uppercase tracking-tight leading-none">Keşif Asistanı</h3>
                   <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Sana Yardım Etmeye Hazır</span>
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
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-muted/5"
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
                          : "bg-muted/80 backdrop-blur-sm border border-border text-foreground rounded-bl-none"
                      )}>
                         {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                       <div className="bg-muted/50 border border-border p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-[11px] font-black uppercase tracking-widest opacity-60">Düşünüyorum...</span>
                       </div>
                    </div>
                  )}
                </div>

                <div className="px-5 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                   {suggestions.map(s => (
                     <button
                      key={s}
                      onClick={() => { setInput(s); }}
                      className="whitespace-nowrap px-4 py-2 bg-muted/50 border border-border rounded-xl text-[10px] font-black text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all uppercase tracking-tighter"
                     >
                       {s}
                     </button>
                   ))}
                </div>

                <div className="p-5 pt-2">
                  <div className="relative group">
                     <Input 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Bir şey sor mesela: Pendik'teki kuaförler..."
                      className="bg-muted/50 border-border h-14 pr-14 rounded-2xl text-xs font-semibold focus-visible:ring-primary/20 focus-visible:bg-card transition-all"
                     />
                     <button 
                      onClick={handleSend}
                      disabled={loading || !input.trim()}
                      className="absolute right-2 top-2 bottom-2 px-3 bg-primary hover:bg-accent text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-0 active:scale-90"
                     >
                        <Send className="w-4 h-4" />
                     </button>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-4 opacity-30 grayscale">
                      <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em]">
                         <MapPin className="w-2.5 h-2.5" /> Konum Duyarlı
                      </div>
                      <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em]">
                         <Sparkles className="w-2.5 h-2.5" /> GPT-4o Online
                      </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
