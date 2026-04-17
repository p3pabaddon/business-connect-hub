import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Search, X, Sparkles, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function QuickBookWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  if (location.pathname !== "/") {
    return null;
  }

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-8 right-4 sm:right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, rotate: 2 }}
            className="bg-card/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-3xl p-5 sm:p-6 w-[280px] sm:w-[320px] mb-2 relative overflow-hidden pointer-events-auto"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary fill-primary/20" />
                </div>
                <h3 className="font-heading font-black text-base sm:text-lg text-foreground tracking-tight italic">HIZLI RANDEVU</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full h-8 w-8 hover:bg-muted">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground mb-6 font-medium leading-relaxed">
              Hemen size en yakın işletmeyi bulun ve saniyeler içinde randevu alın.
            </p>

            <div className="space-y-4">
              <Button 
                onClick={() => { navigate("/isletmeler"); setIsOpen(false); }}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl py-5 sm:py-6 flex items-center justify-center gap-3 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm sm:text-base h-auto"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" /> İşletmeleri Keşfet
              </Button>
              
              <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-muted-foreground justify-center uppercase tracking-[0.2em] font-black">
                <MapPin className="w-3 h-3 text-primary" /> TÜM TÜRKİYE'DE HİZMETTE
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        layout
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05, rotate: 2 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "h-12 w-12 sm:h-16 sm:w-auto flex items-center justify-center sm:px-6 rounded-full shadow-2xl transition-all duration-300 pointer-events-auto",
          isOpen 
            ? "bg-foreground text-background" 
            : "bg-primary text-white hover:shadow-primary/40"
        )}
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
        )}
        <span className="font-black uppercase tracking-widest text-xs sm:text-sm hidden sm:inline ml-2">
          {isOpen ? "Kapat" : "Hızlı Randevu"}
        </span>
      </motion.button>
    </div>
  );
}
