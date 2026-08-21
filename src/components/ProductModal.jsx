import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, ShoppingBag, MessageCircle, CheckCircle, Star, Plus, Minus, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { RichTextContent } from './RichTextDescription';
import { formatPrice } from '../utils/currency';

export default function ProductModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedPortionId, setSelectedPortionId] = useState(() => product?.portions?.[0]?.id ?? null);
  const { addToCart } = useCart();
  const { settings } = useTheme();
  const historyEntryRef = useRef(false);

  useEffect(() => {
    setQuantity(1);
    setSelectedPortionId(product?.portions?.[0]?.id ?? null);
  }, [product?.id]);

  const handleClose = useCallback(() => {
    if (historyEntryRef.current) {
      historyEntryRef.current = false;
      window.history.back();
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') handleClose();
    };

    const handlePopState = () => {
      if (!historyEntryRef.current) return;
      historyEntryRef.current = false;
      onClose();
    };

    window.history.pushState({ ...window.history.state, productModal: true }, '');
    historyEntryRef.current = true;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      if (historyEntryRef.current) {
        historyEntryRef.current = false;
        window.history.back();
      }
    };
  }, [handleClose, onClose]);

  if (!product) return null;

  const portions = Array.isArray(product.portions) ? product.portions : [];
  const selectedPortion = portions.find((portion) => portion.id === selectedPortionId) || null;
  const selectedPrice = selectedPortion ? Number(selectedPortion.price) : Number(product.price);
  const unitLabel = product.unit_type === 'kg' ? 'kg' : product.unit_type === 'paquete' ? 'paquete' : 'unidad';
  const selectedProduct = selectedPortion
    ? {
      ...product,
      id: `${product.id}-portion-${selectedPortion.id}`,
      name: `${product.name} - ${selectedPortion.label}`,
      price: selectedPrice,
      selected_portion: selectedPortion,
    }
    : product;

  const handleWhatsAppOrder = () => {
    const number = (settings.whatsapp_number || '+573001234567').replace(/[^0-9+]/g, '');
    const totalPrice = formatPrice(selectedPrice * quantity);
    const portionDetail = selectedPortion
      ? `*Presentacion:* ${selectedPortion.label} (${selectedPortion.amount} ${unitLabel})\n`
      : '';
    const text = `¡Hola! Me gustaría pedir el siguiente producto de *${settings.store_name}*:\n\n` +
      `📦 *Producto:* ${product.name}\n` +
      portionDetail +
      `🔢 *Cantidad:* ${quantity}\n` +
      `💰 *Precio Total:* ${totalPrice}\n\n` +
      `¿Me apuntas los datos de envío, por favor?`;

    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 drawer-backdrop transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${product.name}`}
        className="relative z-10 my-3 w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl border border-[#2a2a2a] bg-[#181818] shadow-2xl sm:my-8 sm:max-h-[calc(100dvh-4rem)]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar detalle del producto"
          className="absolute top-3 right-3 z-50 p-2.5 rounded-xl bg-[#252525] text-slate-400 transition-colors hover:bg-[#333333] hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 items-stretch md:grid-cols-2">
          {/* Left: Product Image */}
          <div className="flex h-full w-full items-center justify-center bg-[#181818] p-4 sm:p-6">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-white p-4 shadow-lg">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-contain"
              />
              {product.is_featured && (
                <span className="absolute top-4 left-4 bg-[#c88216] text-white text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider flex items-center gap-1 shadow-sm animate-badge-shimmer">
                  <Star className="w-3 h-3 fill-current animate-spin-slow" />
                  Destacado
                </span>
              )}
            </div>
          </div>

          {/* Right: Product Specs & Ordering */}
          <div className="p-6 flex flex-col justify-between bg-[#181818]">
            <div>
              {/* Category Breadcrumb */}
              <div className="text-xs text-[#d99000] font-bold uppercase tracking-wider mb-1">
                {product.category_name} {product.subcategory_name ? `• ${product.subcategory_name}` : ''}
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-white leading-tight mb-2">
                {product.name}
              </h2>

              {/* Price */}
              <div className="text-2xl font-black text-[#d99000] mb-4">
                {formatPrice(selectedPrice)}
              </div>

              {/* Description */}
              <RichTextContent
                value={product.description || 'Producto de alta calidad seleccionado especialmente para ti.'}
                className="mb-6 rounded-xl border border-[#333333] bg-[#242424] p-3 text-xs leading-relaxed text-slate-300 sm:text-sm"
              />

              {portions.length > 0 && (
                <fieldset className="mb-6">
                  <legend className="mb-2 text-xs font-medium text-slate-400">
                    Precios por porción:
                  </legend>
                  <div className="grid gap-2">
                    {portions.map((portion) => {
                      const isSelected = portion.id === selectedPortionId;
                      return (
                        <button
                          key={portion.id}
                          type="button"
                          onClick={() => setSelectedPortionId(portion.id)}
                          aria-pressed={isSelected}
                          className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs transition-colors ${
                            isSelected
                              ? 'border-[#d99000] bg-[#d99000]/10 text-white'
                              : 'border-[#333333] bg-[#242424] text-slate-300 hover:border-[#d99000]/60'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <CheckCircle className={`h-4 w-4 ${isSelected ? 'text-[#d99000]' : 'text-slate-600'}`} />
                            <span>
                              <span className="block font-semibold">{portion.label}</span>
                              <span className="text-[10px] text-slate-400">{portion.amount} {unitLabel}</span>
                            </span>
                          </span>
                          <strong className="text-[#d99000]">{formatPrice(Number(portion.price))}</strong>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {/* Quantity Counter Selector */}
              <div className="mb-6">
                <label className="text-xs text-slate-400 font-medium block mb-2">
                  Cantidad a Solicitar:
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-[#242424] border border-[#333333] rounded-xl p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 text-slate-400 hover:text-white active:scale-90 rounded-lg transition-all cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1.5 text-slate-400 hover:text-white active:scale-90 rounded-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-xs text-slate-400">
                    Subtotal: <strong className="text-[#d99000]">{formatPrice(selectedPrice * quantity)}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-[#2a2a2a]">
              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer animate-glow"
              >
                <MessageCircle className="w-5 h-5 fill-current animate-pulse" />
                <span>Pedir Directamente por WhatsApp</span>
              </button>

              <button
                onClick={handleAddToCart}
                className="w-full py-2.5 bg-[#d99000] hover:bg-[#c48200] active:scale-95 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow hover:shadow-md"
              >
                <ShoppingBag className="w-4 h-4 text-slate-950" />
                <span>Añadir a mi Cotización</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
