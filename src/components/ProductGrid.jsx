import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { PackageX, ArrowUpDown } from 'lucide-react';

export default function ProductGrid({
  products = [],
  onQuickView,
  activeCategoryName,
}) {
  const [sortOption, setSortOption] = useState('default');

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === 'price-asc') return a.price - b.price;
    if (sortOption === 'price-desc') return b.price - a.price;
    if (sortOption === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <section className="w-full pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Controls Bar: Category Title & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-300/60">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#181818] tracking-tight">
              {activeCategoryName || 'Todos los Productos'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Mostrando <span className="text-[#d99000] font-bold">{sortedProducts.length}</span> items disponibles
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="p-2 bg-white rounded-md border border-slate-200 text-slate-600">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-md px-3 py-2 cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-[#d99000]"
            >
              <option value="default">Orden Por Defecto</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name">Nombre: A - Z</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 px-4 text-center glass-card max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <PackageX className="w-8 h-8 text-[#d99000]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              No se encontraron productos
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Intenta cambiar tus términos de búsqueda o seleccionar otra categoría para explorar más opciones.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
