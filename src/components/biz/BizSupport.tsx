import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LifeBuoy, Send, MessageSquare, Loader2, Clock, CheckCircle2, ChevronRight, Lock, Plus } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  business_id: string;
  owner_id: string;
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3";

const playNotificationSound = () => {
  const audio = new Audio(NOTIFICATION_SOUND);
  audio.play().catch(() => {});
};

export function BizSupport({ businessId }: { businessId: string }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadTickets();
  }, [user]);

  const loadMessages = useCallback(async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      toast.error("Mesajlar yüklenemedi: " + err.message);
    }
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
      
      const channel = supabase
        .channel(`ticket-${selectedTicket.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${selectedTicket.id}` },
          (payload: any) => {
            // Sadece başkasından gelen mesajlar için ses çal
            if (payload.new && payload.new.sender_id !== user?.id) {
              playNotificationSound();
            }
            loadMessages(selectedTicket.id);
          }
        )
        .subscribe((status) => {
          console.log("Realtime status:", status);
        });
      
      return () => { supabase.removeChannel(channel); };
    }
  }, [selectedTicket, loadMessages]);

  const loadTickets = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("id, subject, status, created_at, business_id, owner_id")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      toast.error("Talepler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newSubject || !user || !businessId) return;
    setSending(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          owner_id: user.id,
          business_id: businessId,
          subject: newSubject,
          status: "open"
        })
        .select()
        .single();

      if (error) throw error;
      
      setTickets(prev => [data, ...prev]);
      setSelectedTicket(data);
      setNewSubject("");
      toast.success("Destek talebi açıldı!");
    } catch (err: any) {
      toast.error("Talep oluşturulamadı: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage || !selectedTicket || !user) return;
    setSending(true);
    try {
      const { error } = await supabase
        .from("support_messages")
        .insert({
          ticket_id: selectedTicket.id,
          sender_id: user.id,
          message: newMessage
        });

      if (error) throw error;
      setNewMessage("");
    } catch (err) {
      toast.error("Mesaj gönderilemedi");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-heading text-foreground uppercase tracking-tight flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-primary" /> Destek Merkezi
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Platform uzmanlarımızla doğrudan iletişim kurun.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
           <Lock className="w-3.5 h-3.5 text-emerald-500" />
           <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Şifreli Uçtan Uca Destek</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
        <div className="lg:col-span-4 bg-card border border-border rounded-[2.5rem] flex flex-col overflow-hidden">
           <div className="p-6 border-b border-border bg-muted/20">
              <Label className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground mb-3 block">Yeni Destek Talebi</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Konu başlığı..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !sending && newSubject) {
                        handleCreateTicket();
                      }
                    }}
                    className="bg-white/5 border-white/10 rounded-xl h-12"
                  />
                  <Button 
                    size="icon" 
                    onClick={handleCreateTicket} 
                    disabled={sending} 
                    className="rounded-xl shrink-0 bg-primary hover:bg-primary/90 transition-all text-white"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </Button>
                </div>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {loading ? (
                  <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : tickets.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground p-10">Henüz bir talebiniz yok.</p>
              ) : (
                tickets.map(ticket => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedTicket?.id === ticket.id 
                      ? "bg-primary/10 border-primary/30 shadow-sm" 
                      : "bg-muted/10 border-border hover:bg-muted/30"
                    }`}
                  >
                     <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                           ticket.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' : 
                           ticket.status === 'in_review' ? 'bg-amber-500/20 text-amber-400' :
                           ticket.status === 'queued' ? 'bg-blue-500/20 text-blue-400' :
                           ticket.status === 'waiting_reply' ? 'bg-violet-500/20 text-violet-400' :
                           'bg-white/5 text-slate-500'
                        }`}>
                           {ticket.status === 'open' ? 'Aktif' : 
                            ticket.status === 'in_review' ? 'İnceleniyor' :
                            ticket.status === 'queued' ? 'Sırada' :
                            ticket.status === 'waiting_reply' ? 'Cevap' : 'Kapalı'}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                           {format(new Date(ticket.created_at), "d MMM HH:mm", { locale: tr })}
                        </span>
                     </div>
                    <p className="text-sm font-semibold text-foreground truncate">{ticket.subject}</p>
                  </button>
                ))
              )}
           </div>
        </div>

        <div className="lg:col-span-8 bg-card border border-border rounded-[2.5rem] flex flex-col overflow-hidden relative shadow-2xl shadow-primary/5">
           {selectedTicket ? (
             <>
               <div className="p-6 border-b border-border flex items-center justify-between bg-muted/10">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                        <h4 className="font-bold text-foreground">{selectedTicket.subject}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Talep ID: {selectedTicket.id.slice(0,8)}</p>
                     </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">Talebi Kapat</Button>
               </div>
               
               <div 
                  className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.02),transparent_40%)]"
                  ref={scrollRef}
               >
                     {messages.map((msg) => {
                       // BİZ (İşletme sahibi) bu paneli kullanan kişi:
                       // Kendi mesajımız mı kontrol et: sender_id === talebi oluşturan işletmenin ID'si
                       const isMe = msg.sender_id === selectedTicket?.owner_id;
                       
                       // Eğer mesaj bize ait değilse, admin/platform destek yazmış demektir
                       // (Bu panel sadece işletme paneli olduğu için buraya sadece
                       // işletme sahibi ve admin mesajları gelir)
                       
                       return (
                         <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[70%] p-4 rounded-2xl text-sm transition-all hover:shadow-md ${
                               isMe 
                               ? 'bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/20' 
                               : 'bg-muted text-foreground rounded-tl-none border border-border'
                            }`}>
                               {msg.message}
                               <div className={`text-[9px] mt-2 opacity-50 flex items-center gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <span className="font-bold uppercase tracking-tighter">
                                    {isMe ? 'BEN (İŞLETME)' : 'PLATFORM DESTEK'}
                                  </span>
                                  <span>•</span>
                                  {msg.created_at ? format(new Date(msg.created_at), "HH:mm") : '...'}
                               </div>
                            </div>
                         </div>
                       );
                     })}
                </div>

               <div className="p-6 border-t border-border bg-background/50 backdrop-blur-sm">
                  <div className="relative">
                    <input 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Mesajınızı yazın..."
                      className="w-full bg-muted/30 border border-border rounded-2xl py-4 pl-6 pr-14 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl h-10 w-10 p-0"
                    >
                       <Send className="w-4 h-4" />
                    </Button>
                  </div>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-10 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 opacity-30">
                   <LifeBuoy className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Yardım Almaya Hazır mısınız?</h3>
                <p className="text-sm max-w-xs mt-2">Sol taraftan bir talep seçin veya yeni bir konu açarak bizimle iletişime geçin.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
