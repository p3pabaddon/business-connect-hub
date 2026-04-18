import React from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Star, MapPin, Heart, X, Info } from 'lucide-react';

interface SalonCardProps {
  salon: any;
  onSwipe: (direction: 'left' | 'right') => void;
}

export const SalonCard: React.FC<SalonCardProps> = ({ salon, onSwipe }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full max-w-sm aspect-[3/4] cursor-grab active:cursor-grabbing"
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl glass-dark border border-white/10 group">
        {/* Main Image */}
        <img
          src={salon.main_image || '/placeholder.svg'}
          alt={salon.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* Top Info Badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          {salon.is_open && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              Açık
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md text-amber-400 text-xs font-semibold border border-amber-500/30 flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            {salon.rating || '4.8'}
          </span>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
          <h2 className="text-2xl font-bold text-white font-heading">{salon.name}</h2>
          
          <div className="flex items-center gap-1 text-white/70 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{salon.district}, {salon.city}</span>
            <span className="mx-1">•</span>
            <span>{salon.distance ? `${(salon.distance / 1000).toFixed(1)} km` : 'Yakında'}</span>
          </div>

          <div className="flex gap-2 pt-4">
            <button 
              onClick={() => onSwipe('left')}
              className="flex-1 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white flex justify-center items-center gap-2 hover:bg-red-500/20 transition-colors"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>
            <button 
              onClick={() => onSwipe('right')}
              className="flex-[2] py-3 rounded-xl bg-primary text-white font-semibold flex justify-center items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <Heart className="w-5 h-5" />
              Favoriye Ekle
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
