'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Cookie, X, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-8 md:max-w-md"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-xl dark:bg-slate-900/80">
            {/* Background Accent */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-2xl" />
            
            <div className="relative flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-400">
                    <Cookie className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                    Çerez Tercihleri
                  </h3>
                </div>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Deneyiminizi geliştirmek ve trafiği analiz etmek için çerezleri kullanıyoruz. 
                Daha fazla bilgi için <Link to="/cerez-politikasi" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">Çerez Politikamızı</Link> inceleyebilirsiniz.
              </p>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button 
                  onClick={handleAccept}
                  className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Tümünü Kabul Et
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleDecline}
                  className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Reddet
                </Button>
              </div>

              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-400">
                <ShieldCheck className="h-3 w-3" />
                <span>KVKK UYUMLU GÜVENLİ DENEYİM</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
