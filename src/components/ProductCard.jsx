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
      <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden flex items-center justify-center">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
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
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1 z-10">
          {product.category_name && (
            <span className="bg-[#181818] text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-sm tracking-wide shadow-sm">
              {product.category_name}
            </span>
          )}
          {product.is_featured && (
            <span className="bg-[#c88216] text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1 shadow-sm animate-badge-shimmer">
              <Star className="w-3 h-3 fill-current animate-spin-slow" />
              DESTACADO
            </span>
          )}
        </div>
      </div>

      {/* Product Content Info */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          {brandName && (
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {brandName}
            </p>
          )}
          <h3 className="text-sm sm:text-base font-bold text-[#181818] group-hover:text-[#d99000] transition-colors duration-200 line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-black">
            {isOutOfStock ? (
              <CircleX className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
            ) : (
              <CircleCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
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
        <div className="mt-4 pt-3 flex items-center justify-between gap-2">
          <span className="text-lg sm:text-xl font-black text-[#ca8a04] group-hover:scale-105 origin-left transition-transform duration-200">
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
            className="bg-[#ca8a04] hover:bg-[#b47703] active:scale-90 text-white text-xs font-bold px-4 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:transform-none"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
