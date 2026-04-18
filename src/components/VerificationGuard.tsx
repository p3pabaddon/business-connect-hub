import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Mail, Send, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function VerificationGuard({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If user is not logged in, or is already verified, show content
  if (!user || user.email_confirmed_at) {
    return <>{children}</>;
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Lütfen 6 haneli kodu eksiksiz girin.");
      return;
    }

    setVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: user.email!,
        token: code,
        type: 'signup'
      });

      if (error) throw error;

      toast.success("Hesabınız başarıyla doğrulandı!");
      // reload to update auth state in context
      window.location.reload();
    } catch (error: any) {
      toast.error("Doğrulama başarısız: " + (error.message || "Kod hatalı veya süresi dolmuş."));
    } finally {
      setVerifying(false);
    }
  };

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
      toast.success("Yeni kod mail adresinize gönderildi.");
    }
  };

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center p-6 sm:p-12 bg-slate-950/40 border border-white/5 rounded-[3rem] text-center backdrop-blur-xl animate-in fade-in zoom-in duration-700 relative overflow-hidden group">
      {/* Background Decorative Rings */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all duration-1000" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/20 transition-all duration-1000" />

      <div className="relative z-10">
        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[2rem] flex items-center justify-center mb-8 mx-auto border border-white/10 shadow-2xl relative">
          <Mail className="w-10 h-10 text-white animate-pulse" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-4 border-slate-950">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Hesabınızı Doğrulayın
        </h2>
        
        <p className="text-slate-400 max-w-sm mb-10 leading-relaxed mx-auto text-sm">
          <strong>{user.email}</strong> adresine 6 haneli bir doğrulama kodu gönderdik. Lütfen kutunuzu kontrol edin.
        </p>

        {/* OTP Input Field */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-10">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-10 h-14 sm:w-14 sm:h-20 text-center text-2xl font-black bg-white/5 border border-white/10 rounded-2xl text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          ))}
        </div>
        
        <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
          <Button 
            onClick={handleVerify} 
            disabled={verifying || otp.join("").length !== 6}
            className="rounded-2xl h-14 w-full gap-3 bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {verifying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Kod Doğrula
              </>
            )}
          </Button>

          <div className="flex items-center justify-between px-2 pt-4 border-t border-white/5 mt-4">
             <button 
                onClick={handleResend} 
                disabled={resending}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 group/btn"
             >
                <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center ${resending ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`}>
                  <Send className="w-3 h-3" />
                </div>
                {resending ? "Gönderiliyor..." : "Yeni Kod Gönder"}
             </button>

             <button 
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
             >
                Doğruladım <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
