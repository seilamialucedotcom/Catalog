import React from 'react';
import { CircleCheck, CircleX, Eye, Star, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/currency';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { settings } = useTheme();
  const stock = product.stock === null || product.stock === undefined || product.stock === ''
    ? null
    : Number(product.stock);
  const isOutOfStock = stock === 0;
  const brandName = product.brand?.name || product.brand_name || '';

  const handleWhatsAppDirect = (e) => {
    e.stopPropagation();
    const number = (settings.whatsapp_number || '+573001234567').replace(/[^0-9+]/g, '');
    const text = `¡Hola! Me interesa solicitar información sobre el producto *${product.name}* (Precio: ${formatPrice(product.price)}). ¿Tienen disponibilidad?`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="bg-white border border-slate-200/90 rounded-none sm:rounded-sm shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group"
    >
      {/* Top Image Container & Badges */}
      <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-white sm:h-56">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-contain"
          loading="lazy"
        />

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="px-3 py-1.5 bg-white text-slate-900 text-xs font-bold rounded shadow-md flex items-center gap-1 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#d99000]" />
            <span>Vista Rápida</span>
          </button>
          <button
            onClick={handleWhatsAppDirect}
            className="p-1.5 bg-emerald-600 text-white rounded shadow-md hover:bg-emerald-500 active:scale-95 transition-all cursor-pointer animate-pulse-scale"
            title="Consultar por WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Stacked Badges Top Left as in reference image */}
        <div className="absolute left-1.5 top-1.5 z-10 flex flex-col items-start gap-1 sm:left-2.5 sm:top-2.5">
          {product.category_name && (
            <span className="bg-[#181818] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-sm sm:px-2 sm:text-[11px]">
              {product.category_name}
            </span>
          )}
          {product.is_featured && (
            <span className="flex items-center gap-1 bg-[#c88216] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm animate-badge-shimmer sm:px-2 sm:text-[11px]">
              <Star className="h-2.5 w-2.5 fill-current animate-spin-slow sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">DESTACADO</span>
            </span>
          )}
        </div>
      </div>

      {/* Product Content Info */}
      <div className="flex flex-1 flex-col justify-between bg-white p-2.5 sm:p-4">
        <div>
          {brandName && (
            <p className="mb-1 truncate text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:text-[10px] sm:tracking-[0.14em]">
              {brandName}
            </p>
          )}
          <h3 className="line-clamp-2 text-xs font-bold leading-snug text-[#181818] transition-colors duration-200 group-hover:text-[#d99000] sm:text-base">
            {product.name}
          </h3>
          <p className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold leading-tight text-black sm:mt-2 sm:gap-1.5 sm:text-xs">
            {isOutOfStock ? (
              <CircleX className="h-3 w-3 shrink-0 text-red-600 sm:h-4 sm:w-4" aria-hidden="true" />
            ) : (
              <CircleCheck className="h-3 w-3 shrink-0 text-emerald-600 sm:h-4 sm:w-4" aria-hidden="true" />
            )}
            <span>
              {isOutOfStock
                ? 'Agotado'
                : stock === null
                  ? 'En stock'
                  : `Disponibilidad: ${stock} ${stock === 1 ? 'unidad' : 'unidades'}`}
            </span>
            <span className="sr-only" aria-hidden="true">
            {isOutOfStock
              ? '✖ Agotado'
              : stock === null
                ? '✔ En stock'
                : `✔ Disponibilidad: ${stock} ${stock === 1 ? 'unidad' : 'unidades'}`}
            </span>
          </p>
        </div>

        {/* Price & Solid Gold 'Agregar' Button */}
        <div className="mt-2.5 flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2 sm:mt-4 sm:gap-2 sm:border-0 sm:pt-3">
          <span className="origin-left text-sm font-black text-[#ca8a04] transition-transform duration-200 group-hover:scale-105 sm:text-xl">
            {formatPrice(product.price)}
          </span>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              if (isOutOfStock) return;
              addToCart(product);
            }}
            className="cursor-pointer rounded bg-[#ca8a04] px-2 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b47703] hover:shadow-md active:scale-90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:transform-none sm:px-4 sm:text-xs"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
