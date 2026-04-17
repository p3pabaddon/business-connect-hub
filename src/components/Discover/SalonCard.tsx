import React from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Star, MapPin, Heart, X, Info, Sparkles, MoveRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryPlaceholder, toTitleCase } from '@/lib/utils';

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

  // Ensure image shows something nice
  const displayImage = salon.image_url || salon.logo || getCategoryPlaceholder(salon.category);

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full max-w-sm h-[520px] cursor-grab active:cursor-grabbing"
    >
      <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl glass-dark border border-white/10 group">
        {/* Detail Link Wrapper */}
        <Link to={`/isletme/${salon.slug}`} className="absolute inset-0 z-20" />

        {/* Main Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={displayImage}
            alt={salon.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Animated Glow on Hover */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

        {/* Top Info Badge */}
        <div className="absolute top-6 left-6 flex gap-2 z-30 pointer-events-none">
          {salon.is_verified && (
            <div className="px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-xl text-primary text-[10px] font-black uppercase tracking-widest border border-primary/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Onaylı
            </div>
          )}
          <div className="px-3 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-xl text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/30 flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            {salon.rating || '4.8'}
          </div>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4 z-30">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white font-heading tracking-tight drop-shadow-lg leading-tight">
              {salon.name}
            </h2>
            
            <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{salon.district}, {salon.city}</span>
              <span className="opacity-30">•</span>
              <span className="text-primary font-bold">
                {salon.distance ? `${(salon.distance / 1000).toFixed(1)} km` : 'Yakında'}
              </span>
            </div>
          </div>

          {/* Service Tags Preview */}
          <div className="flex flex-wrap gap-2 pointer-events-none">
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-wider">
              {toTitleCase(salon.category)}
            </span>
            {salon.tags && salon.tags.slice(0, 2).map((tag: string) => (
              <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 relative z-40">
            <button 
              onClick={(e) => {
                e.preventDefault();
                onSwipe('left');
              }}
              className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white flex justify-center items-center group/btn hover:bg-rose-500/20 transition-all active:scale-95"
            >
              <X className="w-6 h-6 text-rose-400 group-hover/btn:rotate-90 transition-transform" />
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                onSwipe('right');
              }}
              className="flex-1 h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs flex justify-center items-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 group/fav"
            >
              <Heart className="w-5 h-5 group-hover/fav:fill-current transition-all" />
              Favoriye Ekle
            </button>
          </div>

          {/* Detail Trigger Helper */}
          <div className="flex justify-center pt-2">
             <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase font-black tracking-widest group-hover:text-primary/50 transition-colors">
               Detayları Gör <MoveRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

