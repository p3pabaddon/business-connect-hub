import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LifeBuoy, Send, MessageSquare, Loader2, Clock, CheckCircle2, Search, User, Building2 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  business_id: string;
  owner_id: string;
  business?: { name: string };
}

interface Message {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  profiles?: {
    role: string;
    full_name: string;
  };
}

export function AdminSupport() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [senderRoles, setSenderRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
      
      const channel = supabase
        .channel(`admin-chat-${selectedTicket.id}`)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'support_messages', 
            filter: `ticket_id=eq.${selectedTicket.id}` 
          },
          (payload) => {
            console.log("Anlık mesaj geldi:", payload.new);
            setMessages(prev => {
              if (prev.find(m => m.id === payload.new.id)) return prev;
              return [...prev, payload.new as Message];
            });
          }
        )
        .subscribe((status) => {
          console.log("Realtime durumu:", status);
        });
      
      return () => { supabase.removeChannel(channel); };
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*, business:businesses(name), owner_id")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      toast.error("Talepler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId: string) => {
    const { data, error } = await supabase
      .from("support_messages")
      .select(`
        *,
        profiles:sender_id (
          full_name,
          role
        )
      `)
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    
    if (!error) setMessages(data || []);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !user) return;
    
    const messageText = newMessage.trim();
    setNewMessage(""); // Hızlı temizleme
    setSending(true);
    
    try {
      const { error } = await supabase
        .from("support_messages")
        .insert({
          ticket_id: selectedTicket.id,
          sender_id: user.id,
          message: messageText
        });

      if (error) {
        setNewMessage(messageText); // Hata varsa geri getir
        throw error;
      }
    } catch (err: any) {
      toast.error("Mesaj gönderilemedi: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    const { error } = await supabase
      .from("support_tickets")
      .update({ status: 'closed' })
      .eq("id", ticketId);
    
    if (!error) {
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'closed' } : t));
      if (selectedTicket?.id === ticketId) setSelectedTicket({ ...selectedTicket, status: 'closed' });
      toast.success("Talep kapatıldı");
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.business?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-hidden">
        {/* Ticket Sidebar */}
        <div className="lg:col-span-4 flex flex-col bg-card border border-border rounded-[2.5rem] overflow-hidden">
           <div className="p-6 border-b border-border bg-muted/20">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <Input 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="İşletme veya konu ara..." 
                   className="pl-10 h-10 text-sm bg-background rounded-xl"
                 />
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {loading ? (
                  <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : filteredTickets.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground p-10">Talep bulunamadı.</p>
              ) : (
                filteredTickets.map(ticket => (
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
                          ticket.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                       }`}>
                          {ticket.status === 'open' ? 'Aktif' : 'Kapalı'}
                       </span>
                       <span className="text-[9px] font-mono text-muted-foreground">
                          {format(new Date(ticket.created_at), "d MMM HH:mm", { locale: tr })}
                       </span>
                    </div>
                    <p className="text-sm font-bold text-foreground mb-1">{ticket.subject}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                       <Building2 className="w-3 h-3" /> {ticket.business?.name || "Bilinmeyen İşletme"}
                    </div>
                  </button>
                ))
              )}
           </div>
        </div>

        {/* Chat Main */}
        <div className="lg:col-span-8 flex flex-col bg-card border border-border rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-primary/5">
           {selectedTicket ? (
             <>
               <div className="p-6 border-b border-border flex items-center justify-between bg-muted/10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                        <MessageSquare className="w-6 h-6 text-primary" />
                     </div>
                     <div>
                        <h4 className="font-black text-foreground uppercase tracking-tight italic">{selectedTicket.subject}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] text-muted-foreground font-bold uppercase">{selectedTicket.business?.name}</span>
                           <span className="text-[10px] text-muted-foreground/30">•</span>
                           <span className="text-[10px] text-primary font-mono">{selectedTicket.id}</span>
                        </div>
                     </div>
                  </div>
                  {selectedTicket.status === 'open' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCloseTicket(selectedTicket.id)}
                      className="rounded-xl font-bold text-rose-500 border-rose-500/20 hover:bg-rose-500/5"
                    >
                       TALEBİ KAPAT
                    </Button>
                  )}
               </div>
                                 {messages.map(msg => {
                     const isMe = msg.sender_id === user?.id;
                     const senderRole = msg.profiles?.role;
                     const isAdmin = senderRole === 'admin';
                     const senderName = msg.profiles?.full_name || 'İşletme Sahibi';
                     
                     return (
                       <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
                             isMe 
                             ? 'bg-primary text-white rounded-tr-none' 
                             : 'bg-muted/80 text-foreground rounded-tl-none border border-border'
                          }`}>
                             {msg.message}
                             <div className={`text-[10px] mt-3 font-bold opacity-60 flex items-center gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span className="uppercase tracking-widest italic">
                                  {isMe ? 'SİZ (YÖNETİCİ)' : senderName}
                                </span>
                                <span>•</span>
                                {format(new Date(msg.created_at), "HH:mm")}
                             </div>
                          </div>
                       </div>
                     );
                   })}

               <div className="p-6 border-t border-border bg-background/50 backdrop-blur-md">
                  <div className="relative group">
                    <input 
                      disabled={selectedTicket.status === 'closed'}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={selectedTicket.status === 'closed' ? "Bu talep kapatıldığı için mesaj gönderilemez." : "Cevabınızı buraya yazın..."}
                      className="w-full bg-muted/40 border border-border rounded-2xl py-5 pl-8 pr-16 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim() || selectedTicket.status === 'closed'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl h-12 w-12 p-0 shadow-lg shadow-primary/20"
                    >
                       <Send className="w-5 h-5" />
                    </Button>
                  </div>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-10 text-center">
                <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-8 border border-primary/10">
                   <LifeBuoy className="w-10 h-10 text-primary opacity-40" />
                </div>
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic">Destek Operasyon Merkezi</h3>
                <p className="text-sm max-w-sm mt-3 font-medium opacity-60 italic">İletişime geçmek için aktif bir talep seçin. Tüm yazışmalar kayıt altındadır.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
