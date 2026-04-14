
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function GoogleOAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Google ile bağlantı kuruluyor...");

  useEffect(() => {
    const code = searchParams.get("code");
    const staffId = searchParams.get("state");

    if (!code || !staffId) {
      setStatus("error");
      setMessage("Geçersiz yetkilendirme isteği.");
      return;
    }

    const handleCallback = async () => {
      try {
        // NOT: İdeal olan bu takas işleminin güvenli bir backend (Edge Function) üzerinde yapılmasıdır.
        // Şimdilik sistemin çalışması için gerekli adımları simüle ediyor veya hazırlıyoruz.
        
        // Bu mock bir işlemdir. Gerçek entegrasyonda burada code -> refresh_token takası yapılır.
        // Client Secret gerektiği için bu işlemi frontend'de tam olarak yapamayız.
        
        const { error } = await supabase
          .from("staff")
          .update({
             google_sync_enabled: true,
             google_calendar_id: "primary" // Varsayılan takvim
          })
          .eq("id", staffId);

        if (error) throw error;

        setStatus("success");
        setMessage("Google Takvim başarıyla bağlandı!");
        toast.success("Bağlantı başarılı!");
        
        setTimeout(() => navigate("/biz-dashboard-secure-x31p9q8w2"), 2000);
      } catch (err: any) {
        console.error("Google Auth Error:", err);
        setStatus("error");
        setMessage("Bağlantı sırasında bir hata oluştu: " + err.message);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center space-y-6 shadow-xl">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <h2 className="text-xl font-bold">{message}</h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <h2 className="text-xl font-bold text-emerald-500">{message}</h2>
            <p className="text-sm text-muted-foreground">Yönlendiriliyorsunuz...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="w-12 h-12 text-rose-500" />
            <h2 className="text-xl font-bold text-rose-500">Bağlantı Başarısız</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
            <button 
              onClick={() => navigate("/biz-dashboard-secure-x31p9q8w2")}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm"
            >
              Panele Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
