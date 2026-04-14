import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FAQ_RESPONSES: Record<string, string> = {
  "randevu": "Randevu almak için İşletmeler sayfasından istediğiniz işletmeyi seçin, tarih ve saat belirleyip randevunuzu oluşturun. SMS doğrulaması ile randevunuz onaylanır.",
  "iptal": "Randevunuzu, randevu saatinden en az 30 dakika önce profil sayfanızdan iptal edebilirsiniz. İptal işlemi anında gerçekleşir.",
  "ücret": "Müşteriler için randevu almak tamamen ücretsizdir. İşletmeler için Ücretsiz ve Premium olmak üzere iki paket bulunmaktadır.",
  "fiyat": "Müşteriler için randevu almak tamamen ücretsizdir. İşletmeler için Ücretsiz ve Premium olmak üzere iki paket bulunmaktadır.",
  "kayıt": "Ana sayfadaki 'Kayıt Ol' butonuna tıklayarak e-posta adresiniz ve şifrenizle hesap oluşturabilirsiniz. Google ile de giriş yapabilirsiniz.",
  "işletme": "İşletmenizi kaydetmek için 'İşletme Başvurusu' sayfasından başvuru yapabilirsiniz. Ekibimiz başvurunuzu inceleyerek onaylayacaktır.",
  "sms": "Randevu alırken telefon numaranıza 6 haneli bir doğrulama kodu gönderilir. Bu kodu girerek randevunuzu güvenle onaylarsınız.",
  "güvenlik": "Tüm kişisel verileriniz KVKK uyumlu sistemlerde güvenle saklanır. SMS doğrulaması ve şifreli iletişim ile güvenliğiniz sağlanır.",
  "iletişim": "destek@randevudunyasi.com adresine e-posta gönderebilir veya İletişim sayfamızdan bize ulaşabilirsiniz.",
  "destek": "destek@randevudunyasi.com adresine e-posta gönderebilir veya İletişim sayfamızdan bize ulaşabilirsiniz.",
  "premium": "Premium plan aylık ₺499'dır. Sınırsız randevu, detaylı raporlama, AI müşteri analizi, envanter takibi ve dijital sadakat sistemi içerir.",
  "sadakat": "Dijital Sadakat Sistemi ile müşterilerinize damga kartı sunabilirsiniz. Belirli sayıda randevu sonrası ödüller kazanırlar.",
  "yorum": "Tamamlanan randevular sonrası yorum yapabilirsiniz. Profil sayfanızdan geçmiş randevularınıza yorum bırakabilirsiniz.",
  "merhaba": "Merhaba! 👋 Size nasıl yardımcı olabilirim? Randevu, kayıt, fiyatlandırma veya herhangi bir konuda sorularınızı sorabilirsiniz.",
  "selam": "Selam! 👋 RandevuDunyasi asistanıyım. Size nasıl yardımcı olabilirim?",
};

function findAnswer(input: string): string {
  const lower = input.toLowerCase().replace(/[?!.,]/g, "");
  
  for (const [keyword, response] of Object.entries(FAQ_RESPONSES)) {
    if (lower.includes(keyword)) return response;
  }
  
  return "Bu konuda size yardımcı olabilmem için daha fazla detay verir misiniz? Randevu, kayıt, fiyatlandırma veya işletme başvurusu gibi konularda sorularınızı sorabilirsiniz. Detaylı destek için destek@randevudunyasi.com adresine yazabilirsiniz.";
}

import { useLocation } from "react-router-dom";

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Merhaba! 👋 RandevuDunyasi asistanıyım. Size nasıl yardımcı olabilirim?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHiddenPage = location.pathname.startsWith("/biz-dashboard-secure") || 
                       location.pathname.startsWith("/admin-secure-panel") ||
                       location.pathname.startsWith("/hq-") ||
                       location.pathname === "/giris" || 
                       location.pathname === "/kayit" ||
                       location.pathname === "/isletme-basvuru";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isHiddenPage) return null;

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));
    
    const answer = findAnswer(userMessage);
    setMessages(prev => [...prev, { role: "assistant", content: answer }]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 sm:bottom-6 right-6 z-50 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center group"
          aria-label="Yardım asistanını aç"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-accent text-accent-foreground">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <p className="text-sm font-semibold">RandevuDunyasi Asistan</p>
                <p className="text-[10px] opacity-80">Çevrimiçi · Anında yanıt</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-white/10 transition-colors" aria-label="Kapat">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-accent" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-accent text-accent-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                )}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {["Randevu nasıl alınır?", "Fiyatlar nedir?", "İptal nasıl yapılır?"].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="px-3 py-1.5 bg-muted rounded-full text-xs text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mesajınızı yazın..."
              className="flex-1 h-10 rounded-xl"
              disabled={isTyping}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="h-10 w-10 rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
