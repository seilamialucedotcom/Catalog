import React from 'react';
import { Layers } from 'lucide-react';

export default function CategorySlider({
  categories = [],
  activeCategory,
  onSelectCategory,
}) {
  return (
    <section className="w-full py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs sm:text-sm font-bold text-[#a38c6d] tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d99000]"></span>
            EXPLORAR POR CATEGORÍA
          </h2>
          {activeCategory !== null && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs text-[#d99000] hover:underline font-bold cursor-pointer"
            >
              Ver todas ({categories.length})
            </button>
          )}
        </div>

        {/* Circular Categories Track */}
        <div className="flex items-center gap-5 sm:gap-7 overflow-x-auto pb-4 pt-2 scrollbar-none no-scrollbar snap-x">
          
          {/* 'All Categories' Circular Option */}
          <div
            onClick={() => onSelectCategory(null)}
            className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 group snap-start active:scale-95 transition-transform"
          >
            <div
              className={`w-20 h-20 rounded-full p-1 transition-all duration-300 ${
                activeCategory === null
                  ? 'ring-2 ring-[#d99000] shadow-lg shadow-[#d99000]/20 scale-105 animate-pulse-scale'
                  : 'hover:ring-2 hover:ring-[#d99000]/60 hover:scale-105'
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-[#d99000] flex items-center justify-center text-white p-1">
                <div className="w-full h-full rounded-full bg-amber-100 flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <Layers className="w-8 h-8 text-[#d99000]" />
                </div>
              </div>
            </div>
            <span
              className={`text-xs font-bold text-center transition-colors max-w-[90px] truncate ${
                activeCategory === null ? 'text-[#d99000]' : 'text-slate-800 group-hover:text-[#d99000]'
              }`}
            >
              Todas
            </span>
          </div>

          {/* Dynamic Circular Categories */}
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 group snap-start active:scale-95 transition-transform"
              >
                <div
                  className={`w-20 h-20 rounded-full p-1 transition-all duration-300 ${
                    isActive
                      ? 'ring-2 ring-[#d99000] shadow-lg shadow-[#d99000]/20 scale-105 animate-pulse-scale'
                      : 'hover:ring-2 hover:ring-[#d99000]/60 hover:scale-105'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-200 shadow-inner">
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold text-center transition-colors max-w-[95px] truncate ${
                    isActive ? 'text-[#d99000] font-bold' : 'text-slate-800 group-hover:text-[#d99000]'
                  }`}
                  title={cat.name}
                >
                  {cat.name}
                </span>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
