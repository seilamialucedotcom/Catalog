import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatPrice } from '../utils/currency';

const CartContext = createContext();

export const CartProvider = ({ children, whatsappNumber, storeName }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('catalog_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('catalog_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => setCartItems([]);

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Generate WhatsApp Order URL
  const getWhatsAppUrl = (customNote = '') => {
    const number = (whatsappNumber || '+573001234567').replace(/[^0-9+]/g, '');
    let text = `¡Hola! Me interesa solicitar información o realizar un pedido en *${storeName || 'Catálogo Digital'}*:\n\n`;

    cartItems.forEach((item, index) => {
      text += `${index + 1}. *${item.name}* x${item.quantity} - ${formatPrice(item.price * item.quantity)}\n`;
    });

    text += `\n💰 *Total Estimado:* ${formatPrice(totalAmount)}`;

    if (customNote.trim()) {
      text += `\n\n📝 *Nota:* ${customNote.trim()}`;
    }

    text += `\n\nQuedo atento a su respuesta. ¡Muchas gracias!`;

    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        totalAmount,
        totalItemsCount,
        getWhatsAppUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
