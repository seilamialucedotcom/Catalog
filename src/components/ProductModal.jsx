import React, { useState } from 'react';
import { X, ShoppingBag, MessageCircle, CheckCircle, Star, Plus, Minus, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function ProductModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { settings } = useTheme();

  if (!product) return null;

  const handleWhatsAppOrder = () => {
    const number = (settings.whatsapp_number || '+573001234567').replace(/[^0-9+]/g, '');
    const totalPrice = (product.price * quantity).toFixed(2);
    const text = `¡Hola! Me gustaría pedir el siguiente producto de *${settings.store_name}*:\n\n` +
      `📦 *Producto:* ${product.name}\n` +
      `🔢 *Cantidad:* ${quantity}\n` +
      `💰 *Precio Total:* $${totalPrice}\n\n` +
      `¿Me apuntas los datos de envío, por favor?`;

    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 drawer-backdrop transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-[#181818] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-[#252525] hover:bg-[#333333] text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Image */}
          <div className="relative aspect-square bg-[#111111] flex items-center justify-center overflow-hidden p-4 group">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
            />
            {product.is_featured && (
              <span className="absolute top-4 left-4 bg-[#c88216] text-white text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider flex items-center gap-1 shadow-sm animate-badge-shimmer">
                <Star className="w-3 h-3 fill-current animate-spin-slow" />
                Destacado
              </span>
            )}
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
                ${parseFloat(product.price).toFixed(2)}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 bg-[#242424] p-3 rounded-xl border border-[#333333]">
                {product.description || 'Producto de alta calidad seleccionado especialmente para ti.'}
              </p>

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
                    Subtotal: <strong className="text-[#d99000]">${(product.price * quantity).toFixed(2)}</strong>
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
