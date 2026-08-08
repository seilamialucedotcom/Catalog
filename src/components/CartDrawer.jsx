import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function CartDrawer() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    closeCart,
    totalAmount,
    totalItemsCount,
    getWhatsAppUrl,
  } = useCart();

  const { settings } = useTheme();
  const [customerNote, setCustomerNote] = useState('');

  if (!isCartOpen) return null;

  const handleCheckoutWhatsApp = () => {
    const url = getWhatsAppUrl(customerNote);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 drawer-backdrop transition-opacity animate-fadeIn"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-[#181818] border-l border-[#2a2a2a] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-[#2a2a2a] flex items-center justify-between bg-[#181818]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#d99000]" />
              <div>
                <h2 className="text-base font-bold text-white">Mi Cotización / Pedido</h2>
                <p className="text-xs text-slate-400">
                  {totalItemsCount} {totalItemsCount === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#252525] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#242424] border border-[#333333] hover:border-[#444444] transition-all"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover bg-[#181818] border border-[#333333] flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                      {item.name}
                    </h4>
                    <span className="text-xs text-[#d99000] font-extrabold block mt-0.5">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-[#181818] border border-[#333333] rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar de la lista"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <ShoppingBag className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-300">Tu cotización está vacía</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Explora el catálogo y añade productos para enviar tu solicitud personalizada por WhatsApp.
                </p>
              </div>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-[#2a2a2a] bg-[#181818] space-y-3">
              {/* Note Field */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Nota adicional para el vendedor (opcional):
                </label>
                <input
                  type="text"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Ej. Requiero factura, ciudad de entrega, etc..."
                  className="w-full bg-[#242424] border border-[#333333] text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-[#d99000] focus:outline-none"
                />
              </div>

              {/* Total Calculation */}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 font-medium">Total Estimado:</span>
                <span className="text-xl font-extrabold text-[#d99000]">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleCheckoutWhatsApp}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer animate-glow"
              >
                <MessageCircle className="w-5 h-5 fill-current animate-pulse" />
                <span>Enviar Pedido por WhatsApp</span>
                <ArrowRight className="w-4 h-4 ml-1 animate-float" />
              </button>

              <button
                onClick={clearCart}
                className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-300 text-center block transition-colors"
              >
                Vaciar Lista
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
