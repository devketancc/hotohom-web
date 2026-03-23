import React from 'react';
import Image from 'next/image';
import { CaravanClass } from '@/types/booking';
import { Users, Dog, Bed, Star, ChevronRight } from 'lucide-react';

interface CaravanCardProps {
  caravan: CaravanClass;
  onSelect: (caravan: CaravanClass) => void;
  isSelected: boolean;
  isPopular?: boolean;
}

export const CaravanCard: React.FC<CaravanCardProps> = ({ 
  caravan, 
  onSelect, 
  isSelected,
  isPopular = false 
}) => {
  return (
    <div className={`group relative flex flex-col bg-stitch-surface rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl border ${isSelected ? 'border-stitch-primary shadow-lg shadow-stitch-primary/10' : 'border-border hover:border-stitch-primary/20'}`}>
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* Using a placeholder if image is not provided, or a generic caravan image */}
        <div className="w-full h-full bg-stitch-surface-highest/20 flex items-center justify-center">
          <img 
            src={`https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=800&auto=format&fit=crop`} 
            alt={caravan.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        
        {isPopular && (
          <div className="absolute top-4 left-4 bg-stitch-primary text-stitch-on-primary text-[10px] font-bold uppercase tracking-tighter px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
            <Star size={12} fill="currentColor" />
            Most Popular Choice
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold tracking-tight font-headline">{caravan.name}</h3>
          <div className="text-right">
            <span className="text-stitch-primary font-bold text-lg">
              ₹
              {Number.isFinite(Number(caravan.km_rate))
                ? Number(caravan.km_rate).toLocaleString('en-IN')
                : '—'}
            </span>
            <span className="text-xs text-stitch-on-surface-variant font-normal ml-1">/km</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stitch-surface-highest/50 text-[11px] font-medium text-stitch-on-surface-variant uppercase tracking-wider">
            <Users size={14} /> {caravan.full_capacity} Passengers
          </div>
          {caravan.is_pet_friendly && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stitch-surface-highest/50 text-[11px] font-medium text-stitch-on-surface-variant uppercase tracking-wider">
              <Dog size={14} /> Pet Friendly
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stitch-surface-highest/50 text-[11px] font-medium text-stitch-on-surface-variant uppercase tracking-wider">
            <Bed size={14} /> {caravan.amenities.find(a => a.toLowerCase().includes('bed')) || 'Spacious'}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <button 
            onClick={() => onSelect(caravan)}
            className={`w-full py-3 font-bold rounded-xl transition-all active:scale-95 ${isSelected ? 'bg-stitch-primary text-stitch-on-primary shadow-lg shadow-stitch-primary/20' : 'bg-stitch-primary/10 text-stitch-primary hover:bg-stitch-primary/20'}`}
          >
            {isSelected ? 'Selected' : 'Choose This Caravan'}
          </button>
          <button className="w-full py-3 border border-border text-stitch-on-background font-bold rounded-xl hover:bg-stitch-surface-highest/20 transition-all flex items-center justify-center gap-2">
            Explore Features
          </button>
        </div>
      </div>
    </div>
  );
};
