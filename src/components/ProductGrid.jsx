import React, { useEffect, useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import { PackageX, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const PRODUCTS_PER_PAGE = 12;

export default function ProductGrid({
  products = [],
  onQuickView,
  activeCategoryName,
}) {
  const [sortOption, setSortOption] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);

  const sortedProducts = useMemo(() => [...products].sort((a, b) => {
    if (sortOption === 'price-asc') return a.price - b.price;
    if (sortOption === 'price-desc') return b.price - a.price;
    if (sortOption === 'name') return a.name.localeCompare(b.name);
    return 0;
  }), [products, sortOption]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE));
  const pageStart = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(pageStart, pageStart + PRODUCTS_PER_PAGE);
  const paginationItems = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

    const pages = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push('start-ellipsis');
    for (let page = start; page <= end; page += 1) pages.push(page);
    if (end < totalPages - 1) pages.push('end-ellipsis');
    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    if (nextPage === currentPage) return;

    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [products, sortOption]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {paginatedProducts.map((product) => (
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

        {sortedProducts.length > PRODUCTS_PER_PAGE && (
          <nav className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-300/60 pt-5 sm:flex-row" aria-label="Paginación de productos">
            <p className="text-xs text-slate-600">
              Mostrando {pageStart + 1}-{Math.min(pageStart + PRODUCTS_PER_PAGE, sortedProducts.length)} de {sortedProducts.length} productos
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-[#d99000] hover:text-[#d99000] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <div className="flex items-center gap-1" aria-label="Páginas">
                {paginationItems.map((item) => (
                  typeof item === 'number' ? (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handlePageChange(item)}
                      aria-label={`Ir a la página ${item}`}
                      aria-current={currentPage === item ? 'page' : undefined}
                      className={`h-8 min-w-8 rounded-md px-2 text-xs font-bold transition-colors ${
                        currentPage === item
                          ? 'bg-[#181818] text-white'
                          : 'border border-slate-300 bg-white text-slate-700 hover:border-[#d99000] hover:text-[#d99000]'
                      }`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={item} className="px-1 text-xs font-bold text-slate-500" aria-hidden="true">
                      …
                    </span>
                  )
                ))}
              </div>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-[#d99000] hover:text-[#d99000] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </nav>
        )}

      </div>
    </section>
  );
}
