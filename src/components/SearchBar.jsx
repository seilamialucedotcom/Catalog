import React from 'react';
import { Search, X, Filter, Tag } from 'lucide-react';

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
        
        {/* Mobile Search Input */}
        <div className="md:hidden relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm rounded-xl pl-10 pr-9 py-2.5 input-glow placeholder-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

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
