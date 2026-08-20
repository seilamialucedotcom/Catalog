import React from 'react';
import { Filter, Tag } from 'lucide-react';

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  subcategories = [],
  activeSubcategory,
  onSelectSubcategory,
  onClearFilters,
  totalResultsCount,
}) {
  return (
    <div className="w-full mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        
        {/* Subcategories Pills Navigation */}
        {subcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 flex-shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#d99000]" />
              Subcategorías:
            </span>

            <button
              onClick={() => onSelectSubcategory(null)}
              className={`filter-pill ${activeSubcategory === null ? 'active' : ''}`}
            >
              Todas
            </button>

            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onSelectSubcategory(sub.id)}
                className={`filter-pill ${activeSubcategory === sub.id ? 'active' : ''}`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Search Results / Active Filters Header Bar */}
        {(searchTerm || activeSubcategory) && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Tag className="w-4 h-4 text-[#d99000]" />
              <span>
                Resultados encontrados: <strong className="text-white">{totalResultsCount}</strong>
              </span>
              {searchTerm && (
                <span className="bg-[#242424] text-[#d99000] px-2.5 py-0.5 rounded-full border border-[#d99000]/40">
                  búsqueda: "{searchTerm}"
                </span>
              )}
            </div>

            <button
              onClick={onClearFilters}
              className="text-[#d99000] hover:underline font-medium"
            >
              Restablecer Filtros
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
