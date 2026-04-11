import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, Fingerprint, Terminal, AlertCircle } from "lucide-react";
import { t } from "@/lib/translations";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function HqLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [securityCheck, setSecurityCheck] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleHqLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;

      // Check if user is admin
      const adminEmails = ["asrinaltan04@gmail.com", "admin@admin.com", "testadmin@rendezvous.com"];
      if (!adminEmails.includes(email)) {
        toast.error("Access Denied: Level 4 Security Clearance Required");
        return;
      }

      setSecurityCheck(true);
      setTimeout(() => {
        navigate("/hq");
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Credential verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 transition-all duration-500">
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl overflow-hidden relative">
          {/* Animated Security Scanner Bar */}
          {loading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.5)]"></div>
          )}

          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 group">
              <Shield className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-white mb-2 tracking-tight">
              Management HQ
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Lock className="w-3 h-3" /> Secure Node Access
            </p>
          </div>

          {!securityCheck ? (
            <form onSubmit={handleHqLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white pl-10 focus:ring-primary/20 h-12"
                    required
                  />
                  <Terminal className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                </div>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Security Token"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white pl-10 focus:ring-primary/20 h-12"
                    required
                  />
                  <Fingerprint className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                ) : (
                  <>Establish Link</>
                )}
              </Button>
            </form>
          ) : (
            <div className="py-12 flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-10 h-10 text-green-500 animate-pulse" />
              </div>
              <p className="text-xl font-heading text-white">Access Granted</p>
              <p className="text-slate-400 text-sm mt-2 font-mono">Redirecting to Main Command...</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 font-mono">
            <span>Node ID: RX-992</span>
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Encrypted Session
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
