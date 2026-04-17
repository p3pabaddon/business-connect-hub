import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function VerificationGuard({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [resending, setResending] = useState(false);

  // If user is not logged in, or is already verified, show content
  // Note: Supabase user.email_confirmed_at is the source of truth
  if (!user || user.email_confirmed_at) {
    return <>{children}</>;
  }

  const handleResend = async () => {
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email!,
    });
    setResending(false);
    
    if (error) {
      toast.error("Doğrulama e-postası gönderilemedi: " + error.message);
    } else {
      toast.success("Doğrulama e-postası tekrar gönderildi. Lütfen kutunuzu kontrol edin.");
    }
  };

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] text-center animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-6 border border-amber-500/20">
        <Mail className="w-10 h-10 text-amber-500" />
      </div>
      <h2 className="text-2xl font-black text-white tracking-tight mb-3">E-posta Doğrulaması Gerekli</h2>
      <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
        Hesabınızı tam olarak kullanabilmek için <strong>{user.email}</strong> adresine gönderdiğimiz bağlantıya tıklamanız gerekmektedir.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Button 
          onClick={handleResend} 
          disabled={resending}
          className="rounded-2xl h-12 flex-1 gap-2 bg-amber-600 hover:bg-amber-500"
        >
          <Send className="w-4 h-4" />
          {resending ? "Gönderiliyor..." : "Tekrar Gönder"}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="rounded-2xl h-12 flex-1 border-slate-800"
        >
          Doğruladım
        </Button>
      </div>
    </div>
  );
}
