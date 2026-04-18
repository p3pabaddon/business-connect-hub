import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Info, CheckCircle2, Scissors, Camera, BrainCircuit, ShieldCheck, ArrowLeft, ShieldAlert, Zap, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { analyzeImageStyle } from '@/lib/ai-service';
import { SEOHead } from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';

const StyleAdvisor = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(true);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasConsent) {
      setShowConsentModal(true);
      return;
    }
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setPreview(compressed);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    setAnalyzing(true);
    setResult(null);
    
    try {
      const data = await analyzeImageStyle(preview);
      
      if (data.error) {
        toast.error(data.error);
        setResult(null);
      } else {
        setResult(data);
        toast.success('Analiz başarıyla tamamlandı!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Analiz sırasında bir hata oluştu.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConsent = () => {
    setHasConsent(true);
    setShowConsentModal(false);
    toast.success('Kullanım onayı alındı. Analize başlayabilirsiniz.');
  };

  const handleDecline = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-12 px-4 relative overflow-hidden">
      <Dialog open={showConsentModal} onOpenChange={(open) => {
        if (!open && !hasConsent) handleDecline();
      }}>
        <DialogContent className="sm:max-w-[540px] bg-[#0c0d14] border-white/5 text-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden p-0 border-t-0">
          <div className="h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 w-full" />
          
          <div className="p-6 sm:p-10">
            <DialogHeader className="flex flex-col items-center justify-center text-center px-4 sm:px-0">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="relative mb-8"
              >
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center border border-primary/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative z-10 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  <ShieldCheck className="w-12 h-12 text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
              </motion.div>

              <DialogTitle className="text-3xl sm:text-4xl font-black font-heading tracking-tight leading-[1.1] mb-5">
                Veri Güvenliği & <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Analiz Onayı</span>
              </DialogTitle>
              
              <DialogDescription className="text-gray-400 text-lg leading-relaxed max-w-sm mx-auto font-medium">
                Size özel analiz için verilerinizi en yüksek güvenlik standartlarında işliyoruz.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-10 space-y-6">
              {/* Privacy Feature Card */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6 transition-all duration-300 group-hover:bg-white/[0.05]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0 border border-primary/20">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">Uçtan Uca Gizlilik</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Fotoğrafınız sunucularımızda **asla saklanmaz**. Analiz biter bitmez sistemden kalıcı olarak silinir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Features */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, label: "Anlık Analiz", sub: "Milisaniyelik hız" },
                  { icon: CheckCircle2, label: "%100 Güvenli", sub: "Şifreli iletim" }
                ].map((item, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center hover:bg-white/[0.05] transition-colors group">
                    <item.icon className="w-6 h-6 text-primary mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <span className="block text-white text-sm font-bold">{item.label}</span>
                    <span className="block text-gray-500 text-[10px] uppercase tracking-widest mt-0.5">{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:grid sm:grid-cols-2 gap-4 mt-10">
              <Button 
                onClick={handleDecline} 
                variant="ghost" 
                className="py-7 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all h-auto text-base font-semibold border border-transparent hover:border-white/10"
              >
                Vazgeç
              </Button>
              <Button 
                onClick={handleConsent} 
                className="py-7 text-black font-black text-lg bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 rounded-2xl transition-all h-auto shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-t border-white/20 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                <span className="relative z-10">Onaylıyorum</span>
                <ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <SEOHead 
        title="AI Stil Danışmanı | Yüz Şekline Göre Saç & Sakal Analizi"
        description="Yapay zeka ile yüz hattı analizi yaptırın. Size en uygun saç kesimi ve sakal modellerini profesyonel AI önerileriyle saniyeler içinde keşfedin."
        type="website"
      />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold mb-6"
          >
            <BrainCircuit className="w-5 h-5" />
            Yeni: AI Stil Danışmanı
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-heading">
            Mükemmel Görünüme <span className="text-gradient">Yapay Zeka</span> İle Ulaş
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Yüz hatlarını analiz edelim, sana en uygun saç, sakal ve stil önerilerini saniyeler içinde sunalım.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="glass-dark rounded-[2.5rem] p-4 sm:p-8 border border-white/5 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
              
              <div className="relative z-10 flex flex-col items-center justify-center py-10 sm:py-16 border-2 border-dashed border-white/10 rounded-[2rem] group-hover:border-primary/40 transition-all bg-white/[0.01]">
                {preview ? (
                  <div className="relative group/preview">
                    <img src={preview} alt="Preview" className="w-full max-w-[280px] aspect-square object-cover rounded-2xl shadow-2xl transition-transform duration-500 group-hover/preview:scale-[1.02]" />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover/preview:ring-primary/30 transition-all" />
                  </div>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-white/[0.03] rounded-3xl flex items-center justify-center mb-8 border border-white/5 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all duration-500">
                      <Camera className="w-10 h-10 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xl font-bold mb-3 text-center tracking-tight">Fotoğraf Yükle</p>
                    <p className="text-sm text-gray-500 text-center px-8 leading-relaxed max-w-sm">
                      Analiz için net bir selfie yükleyin. <br className="hidden sm:block" /> Gelişmiş AI yüz hattınızı tanıyacaktır.
                    </p>
                  </>
                )}
              </div>
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={!file || analyzing} 
              className="w-full py-9 text-xl font-extrabold bg-primary hover:bg-primary/90 text-black rounded-[1.5rem] shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn disabled:opacity-50 disabled:shadow-none"
            >
              {analyzing ? (
                <>
                  <Wand2 className="w-7 h-7 animate-spin" />
                  <span>Stilin Analiz Ediliyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-7 h-7 group-hover:scale-110 transition-transform" />
                  <span>Ücretsiz Analizi Başlat</span>
                </>
              )}
            </Button>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-sm text-gray-400 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Info className="w-4 h-4 text-amber-500" />
              </div>
              <p className="leading-relaxed font-medium">Gizliliğiniz önceliğimizdir. Fotoğraflarınız analiz sonrası kalıcı olarak silinir.</p>
            </div>
          </motion.div>

          <div className="relative min-h-[500px] lg:mt-0 mt-8">
            <AnimatePresence mode="wait">
              {analyzing ? (
                <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="h-28 w-full bg-white/[0.02] animate-pulse rounded-[2rem] border border-white/5" />
                  <div className="h-80 w-full bg-white/[0.02] animate-pulse rounded-[2rem] border border-white/5" />
                  <div className="h-48 w-full bg-white/[0.02] animate-pulse rounded-[2rem] border border-white/5" />
                </motion.div>
              ) : result ? (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                  <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shrink-0">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black font-heading tracking-tight">Analiz Tamamlandı</h3>
                      <p className="text-gray-400">Yüz Tipiniz: <span className="text-emerald-400 font-bold uppercase tracking-widest text-sm ml-1">{result.faceShape}</span></p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold font-heading px-2">Size Özel Stil Önerileri</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {result.suggestions.map((s: any, i: number) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, y: 20 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          transition={{ delay: i * 0.15 }} 
                          className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-300 group relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start mb-3 relative z-10">
                            <h4 className="text-xl font-bold flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Scissors className="w-4 h-4 text-primary" />
                              </div>
                              {s.title}
                            </h4>
                            <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                              <span className="text-primary font-mono text-xs font-bold leading-none tracking-tight uppercase">%{s.matchScore} Uyum</span>
                            </div>
                          </div>
                          <p className="text-gray-400 text-[0.95rem] leading-relaxed relative z-10">{s.description}</p>
                          <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] translate-x-12 translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles className="w-16 h-16 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3 font-heading">
                      <Wand2 className="w-5 h-5 text-amber-500" />
                      Profesyonel Bakım İpuçları
                    </h3>
                    <ul className="grid grid-cols-1 gap-4">
                      {result.tips.map((tip: string, i: number) => (
                        <li key={i} className="flex items-start gap-4 text-gray-400 text-sm leading-relaxed group/tip">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0 group-hover/tip:scale-150 transition-transform" />
                          <span className="group-hover/tip:text-gray-300 transition-colors">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[500px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-[3rem] text-gray-700 bg-white/[0.01]">
                  <div className="w-24 h-24 bg-white/[0.02] rounded-[2rem] flex items-center justify-center mb-6 border border-white/5">
                    <Wand2 className="w-12 h-12 opacity-20" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-500 mb-2">Analiz Bekleniyor</h4>
                  <p className="text-gray-600 max-w-xs">Fotoğrafınızı yükledikten sonra detaylı stil analizi burada görünecek.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleAdvisor;
