import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Search, X, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function QuickBookWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on dashboard or during login/register
  const isHiddenPage = location.pathname.startsWith("/dashboard") || 
                       location.pathname.startsWith("/hq") ||
                       location.pathname === "/giris" || 
                       location.pathname === "/kayit";

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000); // Show after 2s
    return () => clearTimeout(timer);
  }, []);

  if (isHiddenPage || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-6 w-80 mb-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl -z-10" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                <h3 className="font-heading text-lg text-foreground">Hızlı Randevu</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Hemen size en yakın işletmeyi bulun ve saniyeler içinde randevu alın.
            </p>

            <div className="space-y-3">
              <Button 
                onClick={() => { navigate("/isletmeler"); setIsOpen(false); }}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Search className="w-4 h-4" /> İşletmeleri Keşfet
              </Button>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground justify-center uppercase tracking-widest font-bold">
                <MapPin className="w-3 h-3" /> Popüler: İstanbul, Ankara, İzmir
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        layout
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "h-16 flex items-center gap-3 px-6 rounded-full shadow-lg transition-all duration-300",
          isOpen 
            ? "bg-accent text-white" 
            : "bg-primary text-white hover:bg-primary/90"
        )}
      >
        <Calendar className="w-6 h-6" />
        <span className="font-semibold whitespace-nowrap">Randevu Al</span>
      </motion.button>
    </div>
  );
}
